import { useState } from 'react'
import '../styles/pages.css'
import ThemeToggle from '../components/ThemeToggle'
import ProtectedRoute from '../components/ProtectedRoute'

export default function RoomDashboard() {
  const [activeTab, setActiveTab] = useState('chat')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  // Mock data for demo
  const [room] = useState({
    id: '1',
    name: 'Calculus Study Group',
    subject: 'Mathematics',
    description: 'Weekly calculus study sessions for exam preparation',
    participants: [
      { id: 1, name: 'Alice Johnson', avatar: 'A', status: 'online' },
      { id: 2, name: 'Bob Smith', avatar: 'B', status: 'online' },
      { id: 3, name: 'Carol Davis', avatar: 'C', status: 'away' },
      { id: 4, name: 'You', avatar: 'Y', status: 'online' }
    ],
    resources: [
      { id: 1, name: 'Calculus Notes.pdf', type: 'pdf', size: '2.4 MB', uploadedBy: 'Alice Johnson' },
      { id: 2, name: 'Practice Problems.docx', type: 'doc', size: '1.1 MB', uploadedBy: 'Bob Smith' },
      { id: 3, name: 'Formula Sheet.png', type: 'image', size: '856 KB', uploadedBy: 'Carol Davis' }
    ],
    schedule: [
      { id: 1, title: 'Chapter 5 Review', date: '2024-01-20', time: '3:00 PM' },
      { id: 2, title: 'Practice Session', date: '2024-01-22', time: '4:00 PM' },
      { id: 3, title: 'Exam Prep', date: '2024-01-25', time: '2:00 PM' }
    ]
  })

  const [messages, setMessages] = useState([
    { id: 1, user: 'Alice Johnson', text: 'Hey everyone! Ready for today\'s session?', time: '2:55 PM', isMine: false },
    { id: 2, user: 'Bob Smith', text: 'Yes! I have some questions about derivatives', time: '2:56 PM', isMine: false },
    { id: 3, user: 'You', text: 'I\'ll bring my notes from last class', time: '2:57 PM', isMine: true }
  ])

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
      // ============================================
      // BACKEND INTEGRATION PLACEHOLDER
      // ============================================
      // Replace this with actual API call
      // Example:
      // const response = await fetch(`/api/rooms/${room.id}/leave`, {
      //   method: 'POST'
      // })
      // if (response.ok) {
      //     window.location.hash = '#/browse'
      // }
      
      console.log('Leave room requested')
      alert('Leaving room requires backend integration')
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
            <a href="#/" className="page-header-title">{room.name}</a>
          </div>
          <nav className="page-header-nav">
            <button className="btn btn-sm btn-ghost" onClick={handleInviteUser}>
              Invite
            </button>
            <ThemeToggle />
            <button className="btn btn-sm btn-danger" onClick={handleLeaveRoom}>
              Leave Room
            </button>
          </nav>
        </header>

      <div className="room-dashboard">
        <div className="room-sidebar">
          <div className="room-info">
            <div className="room-subject">{room.subject}</div>
            <div className="room-description">{room.description}</div>
          </div>

          <div className="room-participants">
            <h3 className="room-section-title">Participants ({room.participants.length})</h3>
            <div className="participant-list">
              {room.participants.map(participant => (
                <div key={participant.id} className="participant-item">
                  <div className="participant-avatar">
                    {participant.avatar}
                    <span className={`participant-status participant-status-${participant.status}`}></span>
                  </div>
                  <div className="participant-name">{participant.name}</div>
                </div>
              ))}
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
                  {messages.map(msg => (
                    <div key={msg.id} className={`chat-message ${msg.isMine ? 'chat-message-mine' : ''}`}>
                      <div className="chat-message-header">
                        <span className="chat-message-user">{msg.user}</span>
                        <span className="chat-message-time">{msg.time}</span>
                      </div>
                      <div className="chat-message-text">{msg.text}</div>
                    </div>
                  ))}
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
                  {room.resources.map(resource => (
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
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'schedule' && (
              <div className="room-schedule">
                <h3>Upcoming Sessions</h3>
                <div className="schedule-list">
                  {room.schedule.map(session => (
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
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  )
}
