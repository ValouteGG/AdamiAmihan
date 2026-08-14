import { useState, useEffect, useRef } from 'react'
import '../styles/pages.css'
import ThemeToggle from '../components/ThemeToggle'
import ProtectedRoute from '../components/ProtectedRoute'
import webrtcClient from '../utils/webrtc'

export default function Messages() {
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
  
  // Mock conversations data
  const [conversations] = useState([
    { 
      id: 1, 
      name: 'Alice Johnson', 
      avatar: 'A', 
      lastMessage: 'Hey! Are you coming to the study session?', 
      time: '2 min ago', 
      unread: 2,
      online: true 
    },
    { 
      id: 2, 
      name: 'Bob Smith', 
      avatar: 'B', 
      lastMessage: 'Thanks for sharing the notes!', 
      time: '1 hour ago', 
      unread: 0,
      online: false 
    },
    { 
      id: 3, 
      name: 'Carol Davis', 
      avatar: 'C', 
      lastMessage: 'Let me know when you\'re free to discuss the project', 
      time: '3 hours ago', 
      unread: 0,
      online: true 
    },
    { 
      id: 4, 
      name: 'Study Group Chat', 
      avatar: '👥', 
      lastMessage: 'David: I\'ll bring the snacks!', 
      time: '1 day ago', 
      unread: 5,
      online: false,
      isGroup: true 
    },
  ])

  // Mock messages for active conversation
  const [messages, setMessages] = useState([
    { id: 1, sender: 'Alice Johnson', text: 'Hey! How\'s the calculus study going?', time: '10:30 AM', isMine: false },
    { id: 2, sender: 'You', text: 'Pretty good! Just finished chapter 5', time: '10:32 AM', isMine: true },
    { id: 3, sender: 'Alice Johnson', text: 'Nice! Are you coming to the study session today?', time: '10:33 AM', isMine: false },
  ])

  const handleSendMessage = async () => {
    if (!message.trim() || !activeConversation) return

    const newMessage = {
      id: messages.length + 1,
      sender: 'You',
      text: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMine: true
    }

    setMessages(prev => [...prev, newMessage])
    setMessage('')
    
    console.log('Message sent:', newMessage)
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
  const [currentUserId, setCurrentUserId] = useState('user-1')
  const [selectedUser, setSelectedUser] = useState('user-1')

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
      
      // Call the selected user from the dropdown
      const targetUser = selectedUser === 'user-1' ? 'user-2' : 'user-1'
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
      
      // Call the selected user from the dropdown
      const targetUser = selectedUser === 'user-1' ? 'user-2' : 'user-1'
      console.log(`Calling ${targetUser} from ${currentUserId}`)
      await webrtcClient.startCall(targetUser, 'video')
    } catch (error) {
      console.error('Video call failed:', error)
      setIsInCall(false)
      alert('Failed to start video call. Please check camera/microphone permissions.')
    }
  }

  const handleUserIdChange = (newUserId) => {
    setCurrentUserId(newUserId)
    setSelectedUser(newUserId)
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
            <button className="btn btn-sm btn-primary">+ New</button>
          </div>
          <div className="conversations-list">
            {conversations.map(conv => (
              <div
                key={conv.id}
                className={`conversation-item ${activeConversation?.id === conv.id ? 'conversation-item-active' : ''}`}
                onClick={() => setActiveConversation(conv)}
              >
                <div className="conversation-avatar">
                  {conv.avatar}
                  {conv.online && <span className="conversation-status-online"></span>}
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
            ))}
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
                      {selectedConversation.online ? 'Online' : 'Offline'}
                    </div>
                  </div>
                </div>
                <div className="messages-chat-actions">
                  <button className="btn btn-sm btn-ghost" onClick={handleVoiceCall} title="Voice Call">📞</button>
                  <button className="btn btn-sm btn-ghost" onClick={handleVideoCall} title="Video Call">📹</button>
                  <button className="btn btn-sm btn-ghost" title="More options">⋮</button>
                </div>
                <div className="user-id-debug">
                  <div className="user-selector">
                    <label>I am:</label>
                    <select 
                      value={currentUserId} 
                      onChange={(e) => handleUserIdChange(e.target.value)}
                      className="user-select"
                    >
                      <option value="user-1">User 1</option>
                      <option value="user-2">User 2</option>
                    </select>
                  </div>
                  <div className="user-display">
                    Current User ID: <strong>{currentUserId}</strong>
                  </div>
                  <div className="user-info">
                    Will call: <strong>{currentUserId === 'user-1' ? 'user-2' : 'user-1'}</strong>
                  </div>
                </div>
              </div>

              <div className="messages-chat-messages">
                {messages.map(msg => (
                  <div key={msg.id} className={`chat-message ${msg.isMine ? 'chat-message-mine' : ''}`}>
                    <div className="chat-message-header">
                      <span className="chat-message-sender">{msg.sender}</span>
                      <span className="chat-message-time">{msg.time}</span>
                    </div>
                    <div className="chat-message-text">{msg.text}</div>
                  </div>
                ))}
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
                  />
                  <button className="btn btn-sm btn-ghost">😊</button>
                  <button
                    className="btn btn-primary"
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                  >
                    Send
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
    </div>
    </ProtectedRoute>
  )
}
