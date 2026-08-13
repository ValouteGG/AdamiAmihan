import { useState } from 'react'
import '../styles/pages.css'
import ThemeToggle from '../components/ThemeToggle'
import ProtectedRoute from '../components/ProtectedRoute'

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(false)
  
  // Mock data for demo
  const [stats] = useState({
    totalRooms: 12,
    activeRooms: 3,
    totalHours: 156,
    streak: 7
  })

  const [recentRooms] = useState([
    { id: 1, name: 'Calculus Study Group', subject: 'Mathematics', participants: 8, lastActive: '2 hours ago', isActive: true },
    { id: 2, name: 'Physics Lab Partners', subject: 'Physics', participants: 4, lastActive: '1 day ago', isActive: false },
    { id: 3, name: 'Literature Discussion', subject: 'Literature', participants: 6, lastActive: '3 days ago', isActive: false },
  ])

  const [upcomingSessions] = useState([
    { id: 1, title: 'Chapter 5 Review', room: 'Calculus Study Group', date: 'Today', time: '3:00 PM', type: 'study' },
    { id: 2, title: 'Lab Report Discussion', room: 'Physics Lab Partners', date: 'Tomorrow', time: '10:00 AM', type: 'collaboration' },
    { id: 3, title: 'Essay Workshop', room: 'Literature Discussion', date: 'Friday', time: '2:00 PM', type: 'workshop' },
  ])

  const [recentActivity] = useState([
    { id: 1, type: 'message', text: 'Alice sent a message in Calculus Study Group', time: '1 hour ago' },
    { id: 2, type: 'upload', text: 'Bob uploaded notes.pdf to Physics Lab Partners', time: '3 hours ago' },
    { id: 3, type: 'invite', text: 'Carol invited you to Chemistry Study Group', time: '1 day ago' },
    { id: 4, type: 'achievement', text: 'You earned the "Week Warrior" badge!', time: '2 days ago' },
  ])

  const getActivityIcon = (type) => {
    switch (type) {
      case 'message': return '💬'
      case 'upload': return '📎'
      case 'invite': return '📨'
      case 'achievement': return '🏆'
      default: return '📌'
    }
  }

  const getSessionTypeColor = (type) => {
    switch (type) {
      case 'study': return 'badge-primary'
      case 'collaboration': return 'badge-secondary'
      case 'workshop': return 'badge-success'
      default: return 'badge-muted'
    }
  }

  return (
    <ProtectedRoute>
      <div className="page-root">
        <header className="page-header">
          <div className="page-header-brand">
            <a href="#/" className="page-header-logo">📚</a>
            <a href="#/" className="page-header-title">CollaborativeApp</a>
          </div>
          <nav className="page-header-nav">
            <a href="#/browse" className="btn btn-ghost btn-sm">Browse Rooms</a>
            <a href="#/create" className="btn btn-primary btn-sm">Create Room</a>
            <a href="#/profile" className="btn btn-ghost btn-sm">Profile</a>
            <ThemeToggle />
            <a href="#/settings" className="btn btn-ghost btn-sm">Settings</a>
          </nav>
        </header>

      <div className="page-content">
        <div className="page-inner dashboard-inner">
          <div className="dashboard-header">
            <div>
              <h1 className="page-title">Welcome back! 👋</h1>
              <p className="page-subtitle">Here's what's happening with your study groups</p>
            </div>
            <button className="btn btn-primary" onClick={() => window.location.hash = '#/create'}>
              + Create Room
            </button>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📚</div>
              <div className="stat-info">
                <div className="stat-value">{stats.totalRooms}</div>
                <div className="stat-label">Total Rooms</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🟢</div>
              <div className="stat-info">
                <div className="stat-value">{stats.activeRooms}</div>
                <div className="stat-label">Active Rooms</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⏱️</div>
              <div className="stat-info">
                <div className="stat-value">{stats.totalHours}h</div>
                <div className="stat-label">Study Hours</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🔥</div>
              <div className="stat-info">
                <div className="stat-value">{stats.streak}</div>
                <div className="stat-label">Day Streak</div>
              </div>
            </div>
          </div>

          <div className="dashboard-grid">
            {/* Recent Rooms */}
            <div className="dashboard-section">
              <div className="dashboard-section-header">
                <h2 className="dashboard-section-title">Recent Rooms</h2>
                <a href="#/browse" className="btn btn-sm btn-ghost">View All</a>
              </div>
              <div className="room-list">
                {recentRooms.map(room => (
                  <div key={room.id} className="room-card" onClick={() => window.location.hash = '#/room'}>
                    <div className="room-info">
                      <div className="room-name">{room.name}</div>
                      <div className="room-details">
                        <span className="room-subject">{room.subject}</span>
                        <span className="room-participants">
                          <span className="room-participants-icon">👥</span>
                          {room.participants}
                        </span>
                        <span className="room-status">
                          {room.isActive ? (
                            <span className="room-status-active">Active now</span>
                          ) : (
                            <span>{room.lastActive}</span>
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="room-actions">
                      <button className="btn btn-sm btn-primary">Join</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Sessions */}
            <div className="dashboard-section">
              <div className="dashboard-section-header">
                <h2 className="dashboard-section-title">Upcoming Sessions</h2>
                <a href="#/calendar" className="btn btn-sm btn-ghost">View Calendar</a>
              </div>
              <div className="session-list">
                {upcomingSessions.map(session => (
                  <div key={session.id} className="session-card">
                    <div className="session-date">
                      <div className="session-day">{session.date}</div>
                      <div className="session-time">{session.time}</div>
                    </div>
                    <div className="session-info">
                      <div className="session-title">{session.title}</div>
                      <div className="session-room">{session.room}</div>
                      <span className={`badge ${getSessionTypeColor(session.type)}`}>{session.type}</span>
                    </div>
                    <button className="btn btn-sm btn-ghost">→</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="dashboard-section">
              <div className="dashboard-section-header">
                <h2 className="dashboard-section-title">Recent Activity</h2>
                <a href="#/notifications" className="btn btn-sm btn-ghost">View All</a>
              </div>
              <div className="activity-list">
                {recentActivity.map(activity => (
                  <div key={activity.id} className="activity-item">
                    <div className="activity-icon">{getActivityIcon(activity.type)}</div>
                    <div className="activity-content">
                      <div className="activity-text">{activity.text}</div>
                      <div className="activity-time">{activity.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="dashboard-section">
              <div className="dashboard-section-header">
                <h2 className="dashboard-section-title">Quick Actions</h2>
              </div>
              <div className="quick-actions">
                <button className="quick-action" onClick={() => window.location.hash = '#/create'}>
                  <div className="quick-action-icon">➕</div>
                  <div className="quick-action-label">Create Room</div>
                </button>
                <button className="quick-action" onClick={() => window.location.hash = '#/browse'}>
                  <div className="quick-action-icon">🔍</div>
                  <div className="quick-action-label">Browse Rooms</div>
                </button>
                <button className="quick-action" onClick={() => window.location.hash = '#/friends'}>
                  <div className="quick-action-icon">👥</div>
                  <div className="quick-action-label">Find Friends</div>
                </button>
                <button className="quick-action" onClick={() => window.location.hash = '#/timer'}>
                  <div className="quick-action-icon">⏱️</div>
                  <div className="quick-action-label">Study Timer</div>
                </button>
                <button className="quick-action" onClick={() => window.location.hash = '#/whiteboard'}>
                  <div className="quick-action-icon">🎨</div>
                  <div className="quick-action-label">Whiteboard</div>
                </button>
                <button className="quick-action" onClick={() => window.location.hash = '#/messages'}>
                  <div className="quick-action-icon">💬</div>
                  <div className="quick-action-label">Messages</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="page-footer">
        <p>© {new Date().getFullYear()} CollaborativeApp — Built for students</p>
      </footer>
    </div>
    </ProtectedRoute>
  )
}
