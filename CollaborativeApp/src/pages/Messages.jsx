import { useState, useEffect, useRef } from 'react'
import { supabase } from '../config/supabase'
import '../styles/pages.css'
import ThemeToggle from '../components/ThemeToggle'
import ProtectedRoute from '../components/ProtectedRoute'
import webrtcClient from '../utils/webrtc'
import chatSocketClient from '../utils/chatSocket'
import { useAuth } from '../context/AuthContext'

export default function Messages() {
  const { user } = useAuth()
  const [activeConversation, setActiveConversation] = useState(null)
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  
  // Call state
  const [localStream, setLocalStream] = useState(null)
  const [remoteStream, setRemoteStream] = useState(null)
  const [isInCall, setIsInCall] = useState(false)
  const [callType, setCallType] = useState(null)
  const [incomingCall, setIncomingCall] = useState(null)
  const [callDuration, setCallDuration] = useState(0)
  
  // Refs for video elements
  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)
  const callTimerRef = useRef(null)
  
  // Real data from backend
  const [conversations, setConversations] = useState([])
  const [messages, setMessages] = useState([])
  const [conversationsLoading, setConversationsLoading] = useState(true)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [friends, setFriends] = useState([])
  const [friendsLoading, setFriendsLoading] = useState(true)
  
  // Add friend state
  const [showAddFriend, setShowAddFriend] = useState(false)
  const [friendEmail, setFriendEmail] = useState('')
  const [addingFriend, setAddingFriend] = useState(false)
  
  // Real-time chat state
  const [typingUsers, setTypingUsers] = useState(new Map())
  const typingTimeoutRef = useRef(null)
  
  // Helper function to format time
  const formatTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    
    return date.toLocaleDateString()
  }

  // Renders an avatar value that may be a URL or a plain initial letter.
  // Rendering item.avatar directly as JSX text (the old behavior) prints
  // the raw URL as overflowing text when it's a Google/avatar photo URL
  // instead of showing an image.
  const AvatarDisplay = ({ value }) => {
    if (value && (value.startsWith('http') || value.startsWith('/'))) {
      return <img src={value} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
    }
    return <>{value}</>
  }

  // Helper function to get display avatar (name initial or email initial)
  const getDisplayAvatar = (item) => {
    // If it's a valid image URL, use it
    if (item.avatar && (item.avatar.startsWith('http') || item.avatar.startsWith('/'))) {
      return item.avatar
    }
    // Otherwise use first letter of name
    if (item.name) {
      return item.name.charAt(0).toUpperCase()
    }
    // If no name, use first letter of email if available
    if (item.email) {
      return item.email.charAt(0).toUpperCase()
    }
    // Fallback
    return '?'
  }

  // Combine conversations and friends for the sidebar
  const combinedChatList = () => {
    // Get set of user IDs that already have conversations
    const userIdsWithConversations = new Set()
    conversations.forEach(conv => {
      // The conversation object should have participant info embedded
      // We need to extract the other participant's user ID
      // For now, we'll use the conversation's participant info if available
      if (conv.participantId) {
        userIdsWithConversations.add(conv.participantId)
      }
    })
    
    // Process existing conversations to ensure proper avatar display
    const processedConversations = conversations.map(conv => ({
      ...conv,
      avatar: getDisplayAvatar(conv)
    }))
    
    // Add friends who don't have conversations yet
    const friendsWithoutConversations = friends.filter(friend => 
      !userIdsWithConversations.has(friend.id)
    ).map(friend => ({
      id: friend.id,
      name: friend.name,
      avatar: getDisplayAvatar(friend),
      email: friend.email,
      lastMessage: 'Start a conversation',
      time: '',
      unread: 0,
      online: friend.online,
      isGroup: false,
      isFriendOnly: true
    }))
    
    return [...processedConversations, ...friendsWithoutConversations]
  }

  const handleAddFriend = async () => {
    if (!friendEmail.trim()) {
      alert('Please enter an email address')
      return
    }

    try {
      setAddingFriend(true)
      
      // Get Supabase session for auth token
      const { data: { session } } = await supabase.auth.getSession()
      
      const headers = {
        'Content-Type': 'application/json',
      }
      
      // Add auth token if available
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }
      
      const response = await fetch('http://localhost:4002/api/friends/add', {
        method: 'POST',
        headers,
        body: JSON.stringify({ email: friendEmail })
      })

      const data = await response.json()

      if (response.ok) {
        // Refresh conversations to get the new conversation
        const convResponse = await fetch('http://localhost:4002/api/messages/conversations', {
          headers
        })
        const convData = await convResponse.json()
        
        if (convResponse.ok) {
          // Process conversations to ensure proper avatar display
          const processedConversations = (convData.conversations || []).map(conv => ({
            ...conv,
            avatar: getDisplayAvatar(conv)
          }))
          setConversations(processedConversations)
          // Auto-select the new conversation
          const newConv = processedConversations?.find(c => c.id === data.friend.id)
          if (newConv) {
            setActiveConversation(newConv)
          }
        }
        
        // Refresh friends list
        fetchFriends()
        
        // Reset form
        setFriendEmail('')
        setShowAddFriend(false)
        alert(data.message || 'Friend added successfully!')
      } else {
        alert(data.error || 'Failed to add friend')
      }
    } catch (error) {
      console.error('Error adding friend:', error)
      alert('Failed to add friend')
    } finally {
      setAddingFriend(false)
    }
  }

  // Fetch friends from backend
  const fetchFriends = async () => {
    try {
      setFriendsLoading(true)
      
      // Get Supabase session for auth token
      const { data: { session } } = await supabase.auth.getSession()
      
      const headers = {
        'Content-Type': 'application/json',
      }
      
      // Add auth token if available
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }
      
      const response = await fetch('http://localhost:4002/api/friends', {
        headers
      })
      const data = await response.json()
      
      if (response.ok) {
        setFriends(data.friends || [])
      } else {
        console.error('Failed to fetch friends:', data.error)
      }
    } catch (error) {
      console.error('Error fetching friends:', error)
    } finally {
      setFriendsLoading(false)
    }
  }

  // Start conversation with a friend
  const handleStartConversation = async (friend) => {
    try {
      // Get Supabase session for auth token
      const { data: { session } } = await supabase.auth.getSession()
      
      const headers = {
        'Content-Type': 'application/json',
      }
      
      // Add auth token if available
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }
      
      // Create conversation with the friend
      const response = await fetch('http://localhost:4002/api/friends/add', {
        method: 'POST',
        headers,
        body: JSON.stringify({ userId: friend.id })
      })

      const data = await response.json()

      // Refresh conversations to get the updated list
      const convResponse = await fetch('http://localhost:4002/api/messages/conversations', {
        headers
      })
      const convData = await convResponse.json()
      
      if (convResponse.ok) {
        // Process conversations to ensure proper avatar display
        const processedConversations = (convData.conversations || []).map(conv => ({
          ...conv,
          avatar: getDisplayAvatar(conv)
        }))
        setConversations(processedConversations)
        
        // Find and select the conversation with this friend
        const friendConv = processedConversations?.find(c => 
          c.name === friend.name && !c.isGroup
        )
        
        if (friendConv) {
          setActiveConversation(friendConv)
        } else {
          alert('Could not find or create conversation with this friend')
        }
      } else {
        alert('Failed to create conversation: ' + (convData.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error starting conversation:', error)
      alert('Failed to start conversation: ' + error.message)
    }
  }

  // Fetch conversations from backend
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setConversationsLoading(true)
        
        // Get Supabase session for auth token
        const { data: { session } } = await supabase.auth.getSession()
        
        const headers = {
          'Content-Type': 'application/json',
        }
        
        // Add auth token if available
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`
        }
        
        const response = await fetch('http://localhost:4002/api/messages/conversations', {
          headers
        })
        const data = await response.json()
        
        if (response.ok) {
          // Process conversations to ensure proper avatar display
          const processedConversations = (data.conversations || []).map(conv => ({
            ...conv,
            avatar: getDisplayAvatar(conv)
          }))
          setConversations(processedConversations)
          // Auto-select first conversation if none selected
          if (!activeConversation && processedConversations?.length > 0) {
            setActiveConversation(processedConversations[0])
          }
        } else {
          console.error('Failed to fetch conversations:', data.error)
        }
      } catch (error) {
        console.error('Error fetching conversations:', error)
      } finally {
        setConversationsLoading(false)
      }
    }

    fetchConversations()
    fetchFriends()
  }, [])

  // Pick up a "message this friend" handoff coming from the Friends page.
  // When the user clicks "Message" on a friend card there, we stash the
  // friend's id in localStorage and navigate here. Once friends/conversations
  // have loaded, open the existing conversation with them, or start a new one.
  useEffect(() => {
    const pendingFriendId = localStorage.getItem('openConversationWithUserId')
    if (!pendingFriendId) return
    if (friendsLoading || conversationsLoading) return

    localStorage.removeItem('openConversationWithUserId')

    const existingConv = conversations.find(c => c.id === pendingFriendId)
    if (existingConv) {
      setActiveConversation(existingConv)
      return
    }

    const friend = friends.find(f => f.id === pendingFriendId)
    if (friend) {
      handleStartConversation(friend)
    }
  }, [friends, conversations, friendsLoading, conversationsLoading])

  // Fetch messages when conversation changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeConversation) return
      
      try {
        setMessagesLoading(true)
        
        // Get Supabase session for auth token
        const { data: { session } } = await supabase.auth.getSession()
        
        const headers = {
          'Content-Type': 'application/json',
        }
        
        // Add auth token if available
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`
        }
        
        const response = await fetch(`http://localhost:4002/api/messages/${activeConversation.id}`, {
          headers
        })
        const data = await response.json()
        
        if (response.ok) {
          setMessages(data.messages || [])
        } else {
          console.error('Failed to fetch messages:', data.error)
        }
      } catch (error) {
        console.error('Error fetching messages:', error)
      } finally {
        setMessagesLoading(false)
      }
    }

    fetchMessages()
  }, [activeConversation])

  // Initialize chat socket client
  useEffect(() => {
    if (user?.id) {
      chatSocketClient.initialize(user.id)
      
      // Set up real-time message handling
      chatSocketClient.onMessageReceived = (data) => {
        console.log('Real-time message received:', data)
        if (data.conversationId === activeConversation?.id) {
          setMessages(prev => [...prev, {
            id: Date.now(),
            sender: data.senderName,
            senderId: data.senderId,
            text: data.message,
            time: formatTime(new Date(data.timestamp)),
            isMine: data.senderId === user.id
          }])
        }
      }
      
      // Set up typing indicators
      chatSocketClient.onUserTyping = (data) => {
        if (data.conversationId === activeConversation?.id && data.userId !== user.id) {
          setTypingUsers(prev => new Map(prev).set(data.userId, data.userName))
        }
      }
      
      chatSocketClient.onUserStoppedTyping = (data) => {
        if (data.conversationId === activeConversation?.id) {
          setTypingUsers(prev => {
            const newMap = new Map(prev)
            newMap.delete(data.userId)
            return newMap
          })
        }
      }
      
      // Set up online status updates
      chatSocketClient.onUserOnline = (data) => {
        console.log('User came online:', data.userId)
        setConversations(prev => prev.map(conv => {
          if (conv.id === data.userId) {
            return { ...conv, online: true }
          }
          return conv
        }))
      }
      
      chatSocketClient.onUserOffline = (data) => {
        console.log('User went offline:', data.userId)
        setConversations(prev => prev.map(conv => {
          if (conv.id === data.userId) {
            return { ...conv, online: false }
          }
          return conv
        }))
      }
      
      return () => {
        chatSocketClient.disconnect()
      }
    }
  }, [user?.id])

  // Join/leave conversation rooms
  useEffect(() => {
    if (activeConversation?.id && user?.id) {
      chatSocketClient.joinConversation(activeConversation.id)
      
      return () => {
        chatSocketClient.leaveConversation(activeConversation.id)
      }
    }
  }, [activeConversation?.id, user?.id])

  const handleSendMessage = async () => {
    if (!message.trim() || !activeConversation) return

    try {
      setIsLoading(true)
      
      // Get user name for real-time message
      const userName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'You'
      
      // If this is a temporary conversation, don't allow sending yet
      if (activeConversation.isTemporary) {
        alert('Please start a proper conversation first by selecting an existing conversation')
        setMessage('')
        setIsLoading(false)
        return
      }
      
      const conversationId = activeConversation.id
      
      // Send via Socket.IO for real-time delivery
      chatSocketClient.sendMessage(conversationId, message, userName)
      
      // Save to database via API
      const { data: { session } } = await supabase.auth.getSession()
      
      const headers = {
        'Content-Type': 'application/json',
      }
      
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }
      
      const response = await fetch('http://localhost:4002/api/messages', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          conversationId: conversationId,
          text: message
        })
      })

      const data = await response.json()

      if (response.ok) {
        // Add the message locally (will also be received via Socket.IO)
        setMessages(prev => [...prev, data.message])
        setMessage('')
        setIsTyping(false)
      } else {
        console.error('Failed to save message to database:', data.error)
        alert('Failed to send message: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleInputChange = (e) => {
    setMessage(e.target.value)
    
    // Send typing indicator via Socket.IO
    if (activeConversation && user) {
      const userName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'User'
      
      if (e.target.value.length > 0) {
        chatSocketClient.startTyping(activeConversation.id, userName)
        
        // Clear previous timeout
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current)
        }
        
        // Auto-stop typing after 2 seconds of no input
        typingTimeoutRef.current = setTimeout(() => {
          chatSocketClient.stopTyping(activeConversation.id)
        }, 2000)
      } else {
        chatSocketClient.stopTyping(activeConversation.id)
      }
    }
  }

  const selectedConversation = activeConversation || conversations[0]
  const displayAvatar = selectedConversation ? getDisplayAvatar(selectedConversation) : '?'
  const [currentUserId, setCurrentUserId] = useState(user?.id || 'user-1')
  const [selectedUser, setSelectedUser] = useState(user?.id || 'user-1')

  // Initialize WebRTC client
  useEffect(() => {
    console.log('Using user ID:', currentUserId)
    webrtcClient.initialize(currentUserId)
    
    // Set up WebRTC callbacks
    webrtcClient.onLocalStream = (stream) => {
      console.log('Local stream received')
      setLocalStream(stream)
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }
    }
    
    webrtcClient.onRemoteStream = (stream) => {
      console.log('Remote stream received')
      setRemoteStream(stream)
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream
      }
    }
    
    webrtcClient.onIncomingCall = ({ callerId, callerSocketId, offer, callType }) => {
      console.log('Incoming call received')
      setIncomingCall({ callerId, callerSocketId, offer, callType })
    }
    
    webrtcClient.onCallEnded = () => {
      console.log('Call ended')
      setIsInCall(false)
      setLocalStream(null)
      setRemoteStream(null)
      setCallType(null)
      setCallDuration(0)
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current)
      }
    }
    
    webrtcClient.onCallRejected = () => {
      console.log('Call rejected')
      setIsInCall(false)
      setIncomingCall(null)
      alert('Call was rejected')
    }
    
    webrtcClient.onCallError = (error) => {
      console.error('Call error:', error)
      alert(`Call error: ${error}`)
      setIsInCall(false)
    }

    return () => {
      webrtcClient.endCall()
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current)
      }
    }
  }, [currentUserId])

  // Update video elements when streams change
  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream
    }
  }, [localStream])

  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream
    }
  }, [remoteStream])

  // Call timer
  useEffect(() => {
    if (isInCall) {
      callTimerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1)
      }, 1000)
    }
    
    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current)
      }
    }
  }, [isInCall])

  const formatCallDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleVoiceCall = async () => {
    if (!selectedConversation) return
    
    try {
      setIsInCall(true)
      setCallType('audio')
      
      // Use conversation ID as target for now (in real app, would use actual user ID)
      const targetUser = `conv-${selectedConversation.id}`
      console.log(`Calling ${targetUser} from ${currentUserId}`)
      await webrtcClient.startCall(targetUser, 'audio')
    } catch (error) {
      console.error('Voice call failed:', error)
      setIsInCall(false)
      alert('Failed to start voice call. Please check camera/microphone permissions.')
    }
  }

  const handleVideoCall = async () => {
    if (!selectedConversation) return
    
    try {
      setIsInCall(true)
      setCallType('video')
      
      // Use conversation ID as target for now (in real app, would use actual user ID)
      const targetUser = `conv-${selectedConversation.id}`
      console.log(`Calling ${targetUser} from ${currentUserId}`)
      await webrtcClient.startCall(targetUser, 'video')
    } catch (error) {
      console.error('Video call failed:', error)
      setIsInCall(false)
      alert('Failed to start video call. Please check camera/microphone permissions.')
    }
  }

  const handleAnswerCall = () => {
    if (incomingCall) {
      webrtcClient.answerCall(
        incomingCall.callerId,
        incomingCall.callerSocketId,
        incomingCall.offer,
        incomingCall.callType
      )
      setIsInCall(true)
      setCallType(incomingCall.callType)
      setIncomingCall(null)
    }
  }

  const handleRejectCall = () => {
    if (incomingCall) {
      webrtcClient.rejectCall(incomingCall.callerSocketId)
      setIncomingCall(null)
    }
  }

  const handleEndCall = () => {
    webrtcClient.endCall(selectedConversation?.id.toString())
    setIsInCall(false)
    setLocalStream(null)
    setRemoteStream(null)
    setCallType(null)
    setCallDuration(0)
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current)
    }
  }

  const handleToggleAudio = () => {
    const audioTrack = localStream?.getAudioTracks()[0]
    if (audioTrack) {
      webrtcClient.toggleAudio(!audioTrack.enabled)
    }
  }

  const handleToggleVideo = () => {
    const videoTrack = localStream?.getVideoTracks()[0]
    if (videoTrack) {
      webrtcClient.toggleVideo(!videoTrack.enabled)
    }
  }

  return (
    <ProtectedRoute>
      <div className="page-root">
        <header className="page-header page-header-compact">
          <div className="page-header-brand">
            <a href="#/" className="page-header-logo">📚</a>
            <a href="#/" className="page-header-title">Messages</a>
          </div>
          <nav className="page-header-nav">
            <a href="#/" className="btn btn-ghost btn-sm">Dashboard</a>
            <a href="#/browse" className="btn btn-ghost btn-sm">Browse Rooms</a>
            <ThemeToggle />
            <a href="#/profile" className="btn btn-ghost btn-sm">Profile</a>
          </nav>
        </header>

      <div className="messages-container">
        {/* Conversations List */}
        <div className="messages-sidebar">
          <div className="messages-sidebar-header">
            <h2>Conversations</h2>
            <button 
              className="btn btn-sm btn-primary" 
              onClick={() => setShowAddFriend(true)}
            >
              + Add Friend
            </button>
          </div>
          <div className="conversations-list">
            {conversationsLoading || friendsLoading ? (
              <div className="conversations-loading">
                <div className="loading-spinner">Loading conversations...</div>
              </div>
            ) : combinedChatList().length === 0 ? (
              <div className="conversations-empty">
                <div className="conversations-empty-icon">💬</div>
                <h3>No conversations yet</h3>
                <p>Add friends to start messaging</p>
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={() => setShowAddFriend(true)}
                >
                  Add Your First Friend
                </button>
              </div>
            ) : (
              combinedChatList().map(item => (
                <div
                  key={item.id}
                  className={`conversation-item ${activeConversation?.id === item.id ? 'conversation-item-active' : ''} ${item.isFriendOnly ? 'conversation-item-friend' : ''}`}
                  onClick={() => item.isFriendOnly ? handleStartConversation(item) : setActiveConversation(item)}
                >
                  <div className="conversation-avatar">
                    {item.isGroup ? '👥' : <AvatarDisplay value={item.avatar} />}
                    {item.online && !item.isGroup && <span className="conversation-status-online"></span>}
                  </div>
                  <div className="conversation-info">
                    <div className="conversation-header">
                      <span className="conversation-name">{item.name}</span>
                      <span className="conversation-time">{item.time}</span>
                    </div>
                    <div className="conversation-preview">
                      <span className="conversation-message">{item.lastMessage}</span>
                      {item.unread > 0 && (
                        <span className="conversation-unread">{item.unread}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="messages-main">
          {selectedConversation ? (
            <>
              <div className="messages-chat-header">
                <div className="messages-chat-info">
                  <div className="messages-chat-avatar">
                    <AvatarDisplay value={displayAvatar} />
                    {selectedConversation.online && <span className="messages-chat-status-online"></span>}
                  </div>
                  <div>
                    <div className="messages-chat-name">{selectedConversation.name}</div>
                    <div className="messages-chat-status">
                      {selectedConversation.isGroup ? 'Group Chat' : (selectedConversation.online ? 'Online' : 'Offline')}
                    </div>
                  </div>
                </div>
                <div className="messages-chat-actions">
                  <button className="btn btn-sm btn-ghost" onClick={handleVoiceCall} title="Voice Call">📞</button>
                  <button className="btn btn-sm btn-ghost" onClick={handleVideoCall} title="Video Call">📹</button>
                  <button className="btn btn-sm btn-ghost" title="More options">⋮</button>
                </div>
              </div>

              <div className="messages-chat-messages">
                {messagesLoading ? (
                  <div className="messages-loading">
                    <div className="loading-spinner">Loading messages...</div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="messages-empty-messages">
                    <div className="messages-empty-icon">💬</div>
                    <h3>No messages yet</h3>
                    <p>Start the conversation by sending a message</p>
                  </div>
                ) : (
                  messages.map(msg => (
                    <div key={msg.id} className={`chat-message ${msg.isMine ? 'chat-message-mine' : ''}`}>
                      <div className="chat-message-header">
                        <span className="chat-message-sender">{msg.sender}</span>
                        <span className="chat-message-time">{msg.time}</span>
                      </div>
                      <div className="chat-message-text">{msg.text}</div>
                    </div>
                  ))
                )}
                {typingUsers.size > 0 && (
                  <div className="chat-message typing-indicator">
                    <div className="typing-text">
                      {Array.from(typingUsers.values()).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
                    </div>
                    <div className="typing-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                )}
              </div>

              <div className="messages-chat-input">
                <div className="messages-input-wrapper">
                  <button className="btn btn-sm btn-ghost">📎</button>
                  <textarea
                    className="messages-input"
                    placeholder="Type a message..."
                    value={message}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    rows={1}
                    disabled={isLoading}
                  />
                  <button className="btn btn-sm btn-ghost">😊</button>
                  <button
                    className="btn btn-primary"
                    onClick={handleSendMessage}
                    disabled={!message.trim() || isLoading}
                  >
                    {isLoading ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="messages-empty">
              <div className="messages-empty-icon">💬</div>
              <h3>Select a conversation</h3>
              <p>Choose a conversation from the list to start messaging</p>
            </div>
          )}
        </div>
      </div>

      {/* Incoming Call Modal */}
      {incomingCall && (
        <div className="call-modal-overlay">
          <div className="call-modal">
            <div className="call-modal-icon">
              {incomingCall.callType === 'video' ? '📹' : '📞'}
            </div>
            <h2>Incoming {incomingCall.callType} Call</h2>
            <p>{selectedConversation?.name || 'Unknown'}</p>
            <div className="call-modal-actions">
              <button className="btn btn-danger" onClick={handleRejectCall}>
                Decline
              </button>
              <button className="btn btn-primary" onClick={handleAnswerCall}>
                Accept
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Call Overlay */}
      {isInCall && (
        <div className="call-overlay">
          <div className="call-container">
            {callType === 'video' ? (
              <>
                <video 
                  ref={remoteVideoRef}
                  autoPlay 
                  className="remote-video"
                />
                <video 
                  ref={localVideoRef}
                  autoPlay 
                  muted 
                  className="local-video"
                />
              </>
            ) : (
              <div className="audio-call-container">
                <div className="audio-call-avatar">
                  <AvatarDisplay value={displayAvatar} />
                </div>
                <h2>{selectedConversation?.name}</h2>
                <p className="call-duration">{formatCallDuration(callDuration)}</p>
                <div className="call-status">
                  {remoteStream ? 'Connected' : 'Connecting...'}
                </div>
              </div>
            )}
            
            <div className="call-info-bar">
              <span className="call-timer">{formatCallDuration(callDuration)}</span>
              <span className="call-type-label">
                {callType === 'video' ? 'Video Call' : 'Voice Call'}
              </span>
            </div>

            <div className="call-controls">
              <button 
                className="call-control-btn" 
                onClick={handleToggleAudio}
                title="Toggle microphone"
              >
                🎤
              </button>
              {callType === 'video' && (
                <button 
                  className="call-control-btn" 
                  onClick={handleToggleVideo}
                  title="Toggle camera"
                >
                  📹
                </button>
              )}
              <button 
                className="call-control-btn end-call" 
                onClick={handleEndCall}
                title="End call"
              >
                📞
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Friend Modal */}
      {showAddFriend && (
        <div className="modal-overlay" onClick={() => setShowAddFriend(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Friend</h2>
              <button 
                className="btn btn-sm btn-ghost" 
                onClick={() => setShowAddFriend(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="form-label">
                <span className="form-label-text">Friend's Email</span>
                <input
                  type="email"
                  className="form-input"
                  placeholder="friend@example.com"
                  value={friendEmail}
                  onChange={(e) => setFriendEmail(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddFriend()
                    }
                  }}
                  disabled={addingFriend}
                />
              </div>
              <p className="form-help-text">
                Enter the email address of a registered user to add them as a friend. They'll need to accept your friend request before you can message them.
              </p>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-ghost" 
                onClick={() => setShowAddFriend(false)}
                disabled={addingFriend}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleAddFriend}
                disabled={addingFriend || !friendEmail.trim()}
              >
                {addingFriend ? 'Adding...' : 'Add Friend'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </ProtectedRoute>
  )
}