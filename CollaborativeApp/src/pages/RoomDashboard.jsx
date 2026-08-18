import { useState, useEffect } from 'react'
import '../styles/pages.css'
import ThemeToggle from '../components/ThemeToggle'
import ProtectedRoute from '../components/ProtectedRoute'
import { supabase } from '../config/supabase'

export default function RoomDashboard() {
  const [activeTab, setActiveTab] = useState('chat')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [leavingRoom, setLeavingRoom] = useState(false)
  const [deletingRoom, setDeletingRoom] = useState(false)
  const [participants, setParticipants] = useState([])
  const [participantsLoading, setParticipantsLoading] = useState(true)
  const [isOwner, setIsOwner] = useState(false)
  const [room, setRoom] = useState(null)
  const [roomLoading, setRoomLoading] = useState(true)
  
  // Get room ID from URL hash
  const getRoomIdFromHash = () => {
    const hash = window.location.hash
    const match = hash.match(/\/room\/?([a-f0-9-]+)/)
    return match ? match[1] : null
  }

  // Fetch room details
  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        setRoomLoading(true)
        const roomId = getRoomIdFromHash()
        
        if (!roomId) {
          console.error('No room ID found in URL')
          setRoomLoading(false)
          return
        }

        console.log('Fetching room with ID:', roomId)

        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session?.access_token) {
          console.error('No session found')
          setRoomLoading(false)
          return
        }

        // Fetch room details directly by ID
        const response = await fetch(`http://localhost:4002/api/rooms/${roomId}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          console.log('Room data:', data.room)
          setRoom(data.room)
        } else {
          const errorData = await response.json()
          console.error('Failed to fetch room:', response.status, errorData)
          setRoom(null)
        }
      } catch (error) {
        console.error('Error fetching room details:', error)
        setRoom(null)
      } finally {
        setRoomLoading(false)
      }
    }

    fetchRoomDetails()
  }, [])

  // Fetch participants
  useEffect(() => {
    const fetchParticipants = async () => {
      if (!room) return
      
      try {
        setParticipantsLoading(true)
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session?.access_token) {
          return
        }

        const response = await fetch(`http://localhost:4002/api/rooms/${room.id}/participants`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          setParticipants(data.participants || [])
          // Check if current user is owner
          const { data: { user } } = await supabase.auth.getUser()
          const currentUser = data.participants?.find(p => p.id === user?.id)
          setIsOwner(currentUser?.role === 'owner')
        }
      } catch (error) {
        console.error('Error fetching participants:', error)
      } finally {
        setParticipantsLoading(false)
      }
    }

    fetchParticipants()
  }, [room])

  const [messages, setMessages] = useState([])

  const handleSendMessage = async () => {
    if (!message.trim()) return

    const newMessage = {
      id: messages.length + 1,
      user: 'You',
      text: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMine: true
    }

    setMessages(prev => [...prev, newMessage])
    setMessage('')

    // ============================================
    // BACKEND INTEGRATION PLACEHOLDER
    // ============================================
    // Replace this with actual WebSocket or API call
    // Example:
    // websocket.send(JSON.stringify({
    //   type: 'message',
    //   roomId: room.id,
    //   message: message
    // }))
    
    console.log('Message sent:', newMessage)
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (file) {
      // ============================================
      // BACKEND INTEGRATION PLACEHOLDER
      // ============================================
      // Replace this with actual file upload logic
      // Example:
      // const formData = new FormData()
      // formData.append('file', file)
      // formData.append('roomId', room.id)
      // const response = await fetch('/api/rooms/resources', {
      //   method: 'POST',
      //   body: formData
      // })
      
      console.log('File upload:', file.name)
      alert('File upload requires backend integration')
    }
  }

  const handleLeaveRoom = async () => {
    if (window.confirm('Are you sure you want to leave this room?')) {
      try {
        setLeavingRoom(true)
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session?.access_token) {
          alert('You must be logged in to leave a room')
          return
        }

        const response = await fetch(`http://localhost:4002/api/rooms/${room.id}/leave`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          }
        })

        const data = await response.json()

        if (response.ok) {
          window.location.hash = '#/dashboard'
        } else {
          alert(data.error || 'Failed to leave room')
        }
      } catch (err) {
        console.error('Error leaving room:', err)
        alert('Failed to leave room. Please try again.')
      } finally {
        setLeavingRoom(false)
      }
    }
  }

  const handleDeleteRoom = async () => {
    if (window.confirm(`Are you sure you want to delete "${room.name}"? This action cannot be undone and will remove all participants, sessions, and data.`)) {
      try {
        setDeletingRoom(true)
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session?.access_token) {
          alert('You must be logged in to delete a room')
          return
        }

        const response = await fetch(`http://localhost:4002/api/rooms/${room.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          }
        })

        const data = await response.json()

        if (response.ok) {
          window.location.hash = '#/dashboard'
        } else {
          alert(data.error || 'Failed to delete room')
        }
      } catch (err) {
        console.error('Error deleting room:', err)
        alert('Failed to delete room. Please try again.')
      } finally {
        setDeletingRoom(false)
      }
    }
  }

  const handleRemoveParticipant = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to remove "${userName}" from this room?`)) {
      return
    }

    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        alert('You must be logged in to remove participants')
        return
      }

      const response = await fetch(`http://localhost:4002/api/rooms/${room.id}/participants/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const data = await response.json()

      if (response.ok) {
        // Refresh participants list
        const participantsResponse = await fetch(`http://localhost:4002/api/rooms/${room.id}/participants`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          }
        })
        
        if (participantsResponse.ok) {
          const participantsData = await participantsResponse.json()
          setParticipants(participantsData.participants || [])
        }
      } else {
        alert(data.error || 'Failed to remove participant')
      }
    } catch (err) {
      console.error('Error removing participant:', err)
      alert('Failed to remove participant. Please try again.')
    }
  }

  const handleInviteUser = async () => {
    const email = prompt('Enter email address to invite:')
    if (email) {
      // ============================================
      // BACKEND INTEGRATION PLACEHOLDER
      // ============================================
      // Replace this with actual API call
      // Example:
      // const response = await fetch(`/api/rooms/${room.id}/invite`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email })
      // })
      
      console.log('Invite sent to:', email)
      alert('Invitation requires backend integration')
    }
  }

  return (
    <ProtectedRoute>
      <div className="page-root">
        <header className="page-header page-header-compact">
          <div className="page-header-brand">
            <a href="#/browse" className="btn btn-ghost btn-sm">← Back</a>
            <a href="#/" className="page-header-title">{roomLoading ? 'Loading...' : room?.name || 'Room'}</a>
          </div>
          <nav className="page-header-nav">
            <button className="btn btn-sm btn-ghost" onClick={handleInviteUser}>
              Invite
            </button>
            <ThemeToggle />
            {isOwner ? (
              <button className="btn btn-sm btn-danger" onClick={handleDeleteRoom} disabled={deletingRoom}>
                {deletingRoom ? 'Deleting...' : 'Delete Room'}
              </button>
            ) : (
              <button className="btn btn-sm btn-danger" onClick={handleLeaveRoom} disabled={leavingRoom}>
                {leavingRoom ? 'Leaving...' : 'Leave Room'}
              </button>
            )}
          </nav>
        </header>

      {roomLoading ? (
        <div className="loading-state">Loading room...</div>
      ) : !room ? (
        <div className="empty-state">
          <h3>Room not found</h3>
          <p>The room you're looking for doesn't exist or you don't have access to it.</p>
          <a href="#/dashboard" className="btn btn-primary">Go to Dashboard</a>
        </div>
      ) : (
      <div className="room-dashboard">
        <div className="room-sidebar">
          <div className="room-info">
            <div className="room-subject">{room.subject}</div>
            <div className="room-description">{room.description}</div>
          </div>

          <div className="room-participants">
            <h3 className="room-section-title">Participants ({participants.length})</h3>
            <div className="participant-list">
              {participantsLoading ? (
                <div className="loading-state">Loading participants...</div>
              ) : participants.length === 0 ? (
                <div className="empty-state">
                  <p>No participants yet</p>
                </div>
              ) : (
                participants.map(participant => (
                  <div key={participant.id} className="participant-item">
                    <div className="participant-avatar">
                      {participant.avatar}
                      <span className={`participant-status ${participant.isOnline ? 'participant-status-online' : 'participant-status-offline'}`}></span>
                    </div>
                    <div className="participant-info">
                      <div className="participant-name">{participant.name}</div>
                      <div className="participant-role">
                        {participant.role === 'owner' && <span className="badge badge-primary">Owner</span>}
                        {participant.role === 'admin' && <span className="badge badge-secondary">Admin</span>}
                        {participant.role === 'member' && <span className="badge badge-muted">Member</span>}
                      </div>
                    </div>
                    {isOwner && participant.role !== 'owner' && (
                      <button 
                        className="btn btn-sm btn-ghost"
                        onClick={() => handleRemoveParticipant(participant.id, participant.name)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="room-main">
          <div className="room-tabs">
            <button
              className={`room-tab ${activeTab === 'chat' ? 'room-tab-active' : ''}`}
              onClick={() => setActiveTab('chat')}
            >
              Chat
            </button>
            <button
              className={`room-tab ${activeTab === 'resources' ? 'room-tab-active' : ''}`}
              onClick={() => setActiveTab('resources')}
            >
              Resources
            </button>
            <button
              className={`room-tab ${activeTab === 'schedule' ? 'room-tab-active' : ''}`}
              onClick={() => setActiveTab('schedule')}
            >
              Schedule
            </button>
          </div>

          <div className="room-content">
            {activeTab === 'chat' && (
              <div className="room-chat">
                <div className="chat-messages">
                  {messages.length === 0 ? (
                    <div className="empty-state">
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map(msg => (
                      <div key={msg.id} className={`chat-message ${msg.isMine ? 'chat-message-mine' : ''}`}>
                        <div className="chat-message-header">
                          <span className="chat-message-user">{msg.user}</span>
                          <span className="chat-message-time">{msg.time}</span>
                        </div>
                        <div className="chat-message-text">{msg.text}</div>
                      </div>
                    ))
                  )}
                </div>
                <div className="chat-input-area">
                  <div className="chat-input-wrapper">
                    <input
                      type="text"
                      className="chat-input"
                      placeholder="Type a message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={handleSendMessage}
                      disabled={!message.trim()}
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'resources' && (
              <div className="room-resources">
                <div className="resources-header">
                  <h3>Shared Resources</h3>
                  <label className="btn btn-sm btn-primary">
                    Upload File
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="resource-list">
                  {room.resources && room.resources.length > 0 ? (
                    room.resources.map(resource => (
                      <div key={resource.id} className="resource-item">
                        <div className="resource-icon">
                          {resource.type === 'pdf' && '📄'}
                          {resource.type === 'doc' && '📝'}
                          {resource.type === 'image' && '🖼️'}
                        </div>
                        <div className="resource-info">
                          <div className="resource-name">{resource.name}</div>
                          <div className="resource-meta">
                            {resource.size} • Uploaded by {resource.uploadedBy}
                          </div>
                        </div>
                        <button className="btn btn-sm btn-ghost">Download</button>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state">
                      <p>No resources shared yet</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'schedule' && (
              <div className="room-schedule">
                <h3>Upcoming Sessions</h3>
                <div className="schedule-list">
                  {room.schedule && room.schedule.length > 0 ? (
                    room.schedule.map(session => (
                      <div key={session.id} className="schedule-item">
                        <div className="schedule-date">
                          <div className="schedule-day">{new Date(session.date).getDate()}</div>
                          <div className="schedule-month">{new Date(session.date).toLocaleString('default', { month: 'short' })}</div>
                        </div>
                        <div className="schedule-info">
                          <div className="schedule-title">{session.title}</div>
                          <div className="schedule-time">{session.time}</div>
                        </div>
                        <button className="btn btn-sm btn-primary">Join</button>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state">
                      <p>No scheduled sessions yet</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      )}
    </div>
    </ProtectedRoute>
  )
}
