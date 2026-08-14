import { useState, useEffect, useRef } from 'react'
import { supabase } from '../config/supabase'
import '../styles/pages.css'
import ThemeToggle from '../components/ThemeToggle'
import ProtectedRoute from '../components/ProtectedRoute'
import webrtcClient from '../utils/webrtc'
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
  
  // Add friend state
  const [showAddFriend, setShowAddFriend] = useState(false)
  const [friendEmail, setFriendEmail] = useState('')
  const [addingFriend, setAddingFriend] = useState(false)

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
          setConversations(convData.conversations || [])
          // Auto-select the new conversation
          const newConv = convData.conversations?.find(c => c.id === data.friend.id)
          if (newConv) {
            setActiveConversation(newConv)
          }
        }
        
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
          setConversations(data.conversations || [])
          // Auto-select first conversation if none selected
          if (!activeConversation && data.conversations?.length > 0) {
            setActiveConversation(data.conversations[0])
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
  }, [])

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

  const handleSendMessage = async () => {
    if (!message.trim() || !activeConversation) return

    try {
      setIsLoading(true)
      
      // Get Supabase session for auth token
      const { data: { session } } = await supabase.auth.getSession()
      
      const headers = {
        'Content-Type': 'application/json',
      }
      
      // Add auth token if available
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }
      
      const response = await fetch('http://localhost:4002/api/messages', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          conversationId: activeConversation.id,
          text: message
        })
      })

      const data = await response.json()

      if (response.ok) {
        setMessages(prev => [...prev, data.message])
        setMessage('')
        setIsTyping(false)
      } else {
        console.error('Failed to send message:', data.error)
        alert('Failed to send message')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message')
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
    
    // Simulate typing indicator for demo
    if (!isTyping && e.target.value.length > 0) {
      setIsTyping(true)
      setTimeout(() => setIsTyping(false), 2000)
    }
  }

  const selectedConversation = activeConversation || conversations[0]
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
            {conversationsLoading ? (
              <div className="conversations-loading">
                <div className="loading-spinner">Loading conversations...</div>
              </div>
            ) : conversations.length === 0 ? (
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
              conversations.map(conv => (
                <div
                  key={conv.id}
                  className={`conversation-item ${activeConversation?.id === conv.id ? 'conversation-item-active' : ''}`}
                  onClick={() => setActiveConversation(conv)}
                >
                  <div className="conversation-avatar">
                    {conv.isGroup ? '👥' : conv.avatar}
                    {conv.online && !conv.isGroup && <span className="conversation-status-online"></span>}
                  </div>
                  <div className="conversation-info">
                    <div className="conversation-header">
                      <span className="conversation-name">{conv.name}</span>
                      <span className="conversation-time">{conv.time}</span>
                    </div>
                    <div className="conversation-preview">
                      <span className="conversation-message">{conv.lastMessage}</span>
                      {conv.unread > 0 && (
                        <span className="conversation-unread">{conv.unread}</span>
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
                    {selectedConversation.avatar}
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
                {isTyping && (
                  <div className="chat-message typing-indicator">
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
                  {selectedConversation?.avatar}
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
