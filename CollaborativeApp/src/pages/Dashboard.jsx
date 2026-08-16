import { useState, useEffect } from 'react'
import { BookOpen, Users, Clock, Award, MessageSquare, Paperclip, Mail, Trophy, Plus, Search, User, Timer, Palette, Layout, Calendar } from 'lucide-react'
import '../styles/pages.css'
import ThemeToggle from '../components/ThemeToggle'
import ProtectedRoute from '../components/ProtectedRoute'
import { supabase } from '../config/supabase'

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(false)
  
  // Real data state
  const [stats, setStats] = useState({
    totalRooms: 0,
    activeRooms: 0,
    totalHours: 0,
    streak: 0
  })

  const [recentRooms, setRecentRooms] = useState([])
  const [upcomingSessions, setUpcomingSessions] = useState([])
  const [recentActivity, setRecentActivity] = useState([])
  const [dataLoading, setDataLoading] = useState(true)

  // Fetch real data from backend
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setDataLoading(true)
        const { data: { session } } = await supabase.auth.getSession()
        
        const headers = {
          'Content-Type': 'application/json',
        }
        
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`
        }

        // Fetch dashboard data - use fallback if endpoint doesn't exist
        try {
          const response = await fetch('http://localhost:4002/api/dashboard', {
            headers
          })
          
          if (response.ok) {
            const data = await response.json()
            setStats(data.stats || { totalRooms: 0, activeRooms: 0, totalHours: 0, streak: 0 })
            setRecentRooms(data.recentRooms || [])
            setUpcomingSessions(data.upcomingSessions || [])
            setRecentActivity(data.recentActivity || [])
          } else {
            console.log('Dashboard endpoint not available, using empty state')
          }
        } catch (apiError) {
          console.log('Dashboard API call failed, using empty state:', apiError.message)
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setDataLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const getActivityIcon = (type) => {
    switch (type) {
      case 'message': return <MessageSquare size={20} />
      case 'upload': return <Paperclip size={20} />
      case 'invite': return <Mail size={20} />
      case 'achievement': return <Trophy size={20} />
      default: return <BookOpen size={20} />
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
            <a href="#/" className="page-header-logo">
              <BookOpen size={24} />
            </a>
            <div className="page-header-brand-text">
              <a href="#/" className="page-header-title">CollaborativeApp</a>
              <span className="page-header-current">Dashboard</span>
            </div>
          </div>
          <nav className="page-header-nav">
            <a href="#/browse" className="btn btn-ghost btn-sm">Browse Rooms</a>
            <a href="#/create" className="btn btn-primary btn-sm">Create Room</a>
            <a href="#/friends" className="btn btn-ghost btn-sm">Friends</a>
            <a href="#/messages" className="btn btn-ghost btn-sm">Messages</a>
            <a href="#/calendar" className="btn btn-ghost btn-sm">Calendar</a>
            <ThemeToggle />
            <a href="#/profile" className="btn btn-ghost btn-sm">Profile</a>
            <a href="#/settings" className="btn btn-ghost btn-sm">Settings</a>
          </nav>
        </header>

      <div className="page-content">
        <div className="page-inner dashboard-inner">
          <div className="dashboard-header">
            <div>
              <h1 className="page-title">Welcome back!</h1>
              <p className="page-subtitle">Here's what's happening with your study groups</p>
            </div>
            <button className="btn btn-primary" onClick={() => window.location.hash = '#/create'}>
              <Plus size={16} className="btn-icon" />
              Create Room
            </button>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <BookOpen size={24} />
              </div>
              <div className="stat-info">
                <div className="stat-value">{stats.totalRooms}</div>
                <div className="stat-label">Total Rooms</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <Users size={24} />
              </div>
              <div className="stat-info">
                <div className="stat-value">{stats.activeRooms}</div>
                <div className="stat-label">Active Rooms</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <Clock size={24} />
              </div>
              <div className="stat-info">
                <div className="stat-value">{stats.totalHours}h</div>
                <div className="stat-label">Study Hours</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <Award size={24} />
              </div>
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
                {dataLoading ? (
                  <div className="loading-state">Loading rooms...</div>
                ) : recentRooms.length === 0 ? (
                  <div className="empty-state">
                    <BookOpen size={48} className="empty-icon" />
                    <h3>No rooms yet</h3>
                    <p>Create your first study room to get started</p>
                  </div>
                ) : (
                  recentRooms.map(room => (
                    <div key={room.id} className="room-card" onClick={() => window.location.hash = '#/room'}>
                      <div className="room-info">
                        <div className="room-name">{room.name}</div>
                        <div className="room-details">
                          <span className="room-subject">{room.subject}</span>
                          <span className="room-participants">
                            <Users size={16} className="room-participants-icon" />
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
                  ))
                )}
              </div>
            </div>

            {/* Upcoming Sessions */}
            <div className="dashboard-section">
              <div className="dashboard-section-header">
                <h2 className="dashboard-section-title">Upcoming Sessions</h2>
                <a href="#/calendar" className="btn btn-sm btn-ghost">View Calendar</a>
              </div>
              <div className="session-list">
                {dataLoading ? (
                  <div className="loading-state">Loading sessions...</div>
                ) : upcomingSessions.length === 0 ? (
                  <div className="empty-state">
                    <Calendar size={48} className="empty-icon" />
                    <h3>No upcoming sessions</h3>
                    <p>Schedule your first study session</p>
                  </div>
                ) : (
                  upcomingSessions.map(session => (
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
                  ))
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="dashboard-section">
              <div className="dashboard-section-header">
                <h2 className="dashboard-section-title">Recent Activity</h2>
                <a href="#/notifications" className="btn btn-sm btn-ghost">View All</a>
              </div>
              <div className="activity-list">
                {dataLoading ? (
                  <div className="loading-state">Loading activity...</div>
                ) : recentActivity.length === 0 ? (
                  <div className="empty-state">
                    <MessageSquare size={48} className="empty-icon" />
                    <h3>No recent activity</h3>
                    <p>Your activity will appear here</p>
                  </div>
                ) : (
                  recentActivity.map(activity => (
                    <div key={activity.id} className="activity-item">
                      <div className="activity-icon">{getActivityIcon(activity.type)}</div>
                      <div className="activity-content">
                        <div className="activity-text">{activity.text}</div>
                        <div className="activity-time">{activity.time}</div>
                      </div>
                    </div>
                  ))
                )}
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
