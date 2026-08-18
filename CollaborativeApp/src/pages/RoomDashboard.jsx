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
  
  // Schedule form state
  const [showScheduleForm, setShowScheduleForm] = useState(false)
  const [scheduleTitle, setScheduleTitle] = useState('')
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduleTime, setScheduleTime] = useState('')
  const [scheduleDescription, setScheduleDescription] = useState('')
  const [creatingSchedule, setCreatingSchedule] = useState(false)
  const [schedules, setSchedules] = useState([])
  const [schedulesLoading, setSchedulesLoading] = useState(false)
  
  // Invite modal state
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [invitingUserId, setInvitingUserId] = useState(null)
  const [inviteError, setInviteError] = useState(null)
  const [inviteSuccess, setInviteSuccess] = useState(false)
  
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

  useEffect(() => {
    fetchParticipants()
  }, [room])

  const [messages, setMessages] = useState([])
  const [messagesLoading, setMessagesLoading] = useState(false)

  // Fetch messages when room is loaded
  useEffect(() => {
    const fetchMessages = async () => {
      if (!room) return
      
      try {
        setMessagesLoading(true)
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session?.access_token) {
          return
        }

        const response = await fetch(`http://localhost:4002/api/rooms/${room.id}/messages`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          setMessages(data.messages || [])
        } else {
          console.error('Failed to fetch messages:', response.status)
        }
      } catch (error) {
        console.error('Error fetching messages:', error)
      } finally {
        setMessagesLoading(false)
      }
    }

    fetchMessages()
  }, [room])

  // Fetch schedules when room is loaded
  useEffect(() => {
    const fetchSchedules = async () => {
      if (!room) return
      
      try {
        setSchedulesLoading(true)
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session?.access_token) {
          return
        }

        const response = await fetch(`http://localhost:4002/api/rooms/${room.id}/schedules`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          setSchedules(data.schedules || [])
        } else {
          console.error('Failed to fetch schedules:', response.status)
        }
      } catch (error) {
        console.error('Error fetching schedules:', error)
      } finally {
        setSchedulesLoading(false)
      }
    }

    fetchSchedules()
  }, [room])

  const handleSendMessage = async () => {
    if (!message.trim() || !room) return

    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        alert('You must be logged in to send messages')
        return
      }

      const response = await fetch(`http://localhost:4002/api/rooms/${room.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ text: message })
      })

      const data = await response.json()

      if (response.ok) {
        // Add the message locally
        setMessages(prev => [...prev, data.message])
        setMessage('')
      } else {
        console.error('Failed to send message:', data.error)
        alert('Failed to send message: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message: ' + error.message)
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (file) {
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

  const handleInviteUser = () => {
    setShowInviteModal(true)
    setSearchQuery('')
    setSearchResults([])
    setInviteError(null)
    setInviteSuccess(false)
  }

  const handleSearchUsers = async (query) => {
    setSearchQuery(query)
    
    if (query.length < 2) {
      setSearchResults([])
      return
    }

    try {
      setSearchLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        return
      }

      const response = await fetch(`http://localhost:4002/api/users/search?query=${encodeURIComponent(query)}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        // Filter out users who are already participants
        const participantIds = participants.map(p => p.user_id)
        const availableUsers = data.users.filter(user => 
          user.id !== room?.created_by && // Don't show room creator
          !participantIds.includes(user.id) // Don't show existing participants
        )
        setSearchResults(availableUsers)
      }
    } catch (error) {
      console.error('Error searching users:', error)
    } finally {
      setSearchLoading(false)
    }
  }

  const handleInviteUserToRoom = async (userId) => {
    try {
      setInvitingUserId(userId)
      setInviteError(null)
      setInviteSuccess(false)
      
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        setInviteError('You must be logged in to invite users')
        return
      }

      const response = await fetch(`http://localhost:4002/api/rooms/${room.id}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ roomId: room.id, userId })
      })

      const data = await response.json()

      if (response.ok) {
        setInviteSuccess(true)
        setShowInviteModal(false)
        setSearchQuery('')
        setSearchResults([])
        // Refresh participants
        fetchParticipants()
      } else {
        setInviteError(data.error || 'Failed to invite user')
      }
    } catch (error) {
      console.error('Error inviting user:', error)
      setInviteError('Failed to invite user: ' + error.message)
    } finally {
      setInvitingUserId(null)
    }
  }

  const handleCreateSchedule = async () => {
    if (!scheduleTitle.trim() || !scheduleDate || !scheduleTime) {
      alert('Please fill in the title, date, and time')
      return
    }

    try {
      setCreatingSchedule(true)
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        alert('You must be logged in to create schedules')
        return
      }

      const response = await fetch(`http://localhost:4002/api/rooms/${room.id}/schedules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          title: scheduleTitle,
          date: scheduleDate,
          time: scheduleTime,
          description: scheduleDescription
        })
      })

      const data = await response.json()

      if (response.ok) {
        // Add the schedule to the list
        setSchedules(prev => [...prev, data.schedule])
        
        // Add the announcement message to chat
        setMessages(prev => [...prev, data.message])
        
        // Reset form
        setScheduleTitle('')
        setScheduleDate('')
        setScheduleTime('')
        setScheduleDescription('')
        setShowScheduleForm(false)
        
        alert('Schedule created successfully!')
      } else {
        console.error('Failed to create schedule:', data.error)
        alert('Failed to create schedule: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error creating schedule:', error)
      alert('Failed to create schedule: ' + error.message)
    } finally {
      setCreatingSchedule(false)
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
                  {messagesLoading ? (
                    <div className="loading-state">Loading messages...</div>
                  ) : messages.length === 0 ? (
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
                <div className="schedule-header">
                  <h3>Upcoming Sessions</h3>
                  {isOwner && (
                    <button 
                      className="btn btn-sm btn-primary"
                      onClick={() => setShowScheduleForm(!showScheduleForm)}
                    >
                      {showScheduleForm ? 'Cancel' : '+ New Schedule'}
                    </button>
                  )}
                </div>
                
                {showScheduleForm && isOwner && (
                  <div className="schedule-form">
                    <div className="form-section">
                      <div className="form-label">
                        <span className="form-label-text">Session Title</span>
                        <input 
                          type="text" 
                          className="form-input" 
                          placeholder="e.g. Calculus Study Session"
                          value={scheduleTitle}
                          onChange={(e) => setScheduleTitle(e.target.value)}
                        />
                      </div>
                      
                      <div className="form-label">
                        <span className="form-label-text">Date</span>
                        <input 
                          type="date" 
                          className="form-input" 
                          value={scheduleDate}
                          onChange={(e) => setScheduleDate(e.target.value)}
                        />
                      </div>
                      
                      <div className="form-label">
                        <span className="form-label-text">Time</span>
                        <input 
                          type="time" 
                          className="form-input" 
                          value={scheduleTime}
                          onChange={(e) => setScheduleTime(e.target.value)}
                        />
                      </div>
                      
                      <div className="form-label">
                        <span className="form-label-text">Description (optional)</span>
                        <textarea 
                          className="form-textarea" 
                          placeholder="Add details about this session..."
                          value={scheduleDescription}
                          onChange={(e) => setScheduleDescription(e.target.value)}
                          rows={3}
                        />
                      </div>
                      
                      <div className="form-actions">
                        <button 
                          className="btn btn-ghost" 
                          onClick={() => setShowScheduleForm(false)}
                        >
                          Cancel
                        </button>
                        <button 
                          className="btn btn-primary" 
                          onClick={handleCreateSchedule}
                          disabled={creatingSchedule}
                        >
                          {creatingSchedule ? 'Creating...' : 'Create Schedule'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="schedule-list">
                  {schedulesLoading ? (
                    <div className="loading-state">Loading schedules...</div>
                  ) : schedules.length > 0 ? (
                    schedules.map(schedule => (
                      <div key={schedule.id} className="schedule-item">
                        <div className="schedule-date">
                          <div className="schedule-day">{new Date(schedule.date).getDate()}</div>
                          <div className="schedule-month">{new Date(schedule.date).toLocaleString('default', { month: 'short' })}</div>
                        </div>
                        <div className="schedule-info">
                          <div className="schedule-title">{schedule.title}</div>
                          <div className="schedule-time">{schedule.time}</div>
                          {schedule.description && (
                            <div className="schedule-description">{schedule.description}</div>
                          )}
                        </div>
                        <button className="btn btn-sm btn-primary">Join</button>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state">
                      <p>No scheduled sessions yet</p>
                      {isOwner && (
                        <button 
                          className="btn btn-primary btn-sm"
                          onClick={() => setShowScheduleForm(true)}
                        >
                          Create First Schedule
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="modal-overlay" onClick={() => setShowInviteModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Invite Users to {room?.name}</h3>
              <button className="btn btn-sm btn-ghost" onClick={() => setShowInviteModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-label">
                <span className="form-label-text">Search users by email or name</span>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Type to search..."
                  value={searchQuery}
                  onChange={(e) => handleSearchUsers(e.target.value)}
                />
              </div>
              
              {inviteError && (
                <div className="form-error" style={{ color: 'var(--color-error)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-2)' }}>
                  {inviteError}
                </div>
              )}
              
              {inviteSuccess && (
                <div className="form-success" style={{ color: 'var(--color-success)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-2)' }}>
                  User invited successfully!
                </div>
              )}
              
              {searchLoading && (
                <div className="loading-state">Searching...</div>
              )}
              
              {searchResults.length > 0 && (
                <div className="user-search-results">
                  {searchResults.map(user => (
                    <div key={user.id} className="user-search-item">
                      <div className="user-search-avatar">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.firstName} />
                        ) : (
                          <div className="avatar-placeholder">
                            {user.firstName?.[0] || user.email?.[0] || '?'}
                          </div>
                        )}
                      </div>
                      <div className="user-search-info">
                        <div className="user-search-name">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="user-search-email">{user.email}</div>
                      </div>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleInviteUserToRoom(user.id)}
                        disabled={invitingUserId === user.id}
                      >
                        {invitingUserId === user.id ? 'Inviting...' : 'Invite'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {searchQuery.length >= 2 && searchResults.length === 0 && !searchLoading && (
                <div className="empty-state">
                  <p>No users found matching "{searchQuery}"</p>
                </div>
              )}
              
              {searchQuery.length < 2 && (
                <div className="form-label-hint">
                  Type at least 2 characters to search
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
