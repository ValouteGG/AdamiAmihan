import { useState, useEffect } from 'react'
import { BookOpen, Users, Clock, Award, MessageSquare, Paperclip, Mail, Trophy, Plus, Search, User, Timer, Palette, Layout, Calendar, Sun, Moon, Zap, Trash2 } from 'lucide-react'
import '../styles/pages.css'
import '../styles/room-cards.css'
import ThemeToggle from '../components/ThemeToggle'
import ProtectedRoute from '../components/ProtectedRoute'
import ConfirmDialog from '../components/ConfirmDialog'
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
  const [leavingRoomId, setLeavingRoomId] = useState(null)
  const [deletingRoomId, setDeletingRoomId] = useState(null)

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    variant: 'danger'
  })

  // Fetch real data from backend
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

      // Fetch user's rooms first
      let rooms = []
      try {
        const roomsResponse = await fetch('http://localhost:4002/api/rooms', {
          headers
        })
        
        if (roomsResponse.ok) {
          const roomsData = await roomsResponse.json()
          rooms = roomsData.rooms || []
          
          // Format rooms for display
          const formattedRooms = rooms.map(room => ({
            id: room.id,
            name: room.name,
            subject: room.subject,
            participants: 0, // Will need to implement participant counting
            role: room.role,
            isActive: true,
            lastActive: 'Recently'
          }))
          
          setRecentRooms(formattedRooms)
        }
      } catch (roomsError) {
        console.log('Rooms API call failed:', roomsError.message)
      }

      // Fetch schedules from each room individually
      const allSchedules = []
      const today = new Date()
      
      for (const room of rooms) {
        try {
          const scheduleResponse = await fetch(`http://localhost:4002/api/rooms/${room.id}/schedules`, {
            headers
          })
          
          if (scheduleResponse.ok) {
            const scheduleData = await scheduleResponse.json()
            const roomSchedules = (scheduleData.schedules || [])
              .filter(schedule => {
                const scheduleDate = new Date(schedule.date)
                return scheduleDate >= today
              })
              .map(schedule => {
                const scheduleDate = new Date(schedule.date)
                return {
                  id: schedule.id,
                  title: schedule.title,
                  date: scheduleDate.getDate(),
                  month: scheduleDate.toLocaleString('default', { month: 'short' }),
                  time: schedule.time,
                  room: room.name,
                  type: 'study',
                  roomId: room.id,
                  fullDate: scheduleDate
                }
              })
            
            allSchedules.push(...roomSchedules)
          }
        } catch (scheduleError) {
          console.log(`Failed to fetch schedules for room ${room.id}:`, scheduleError.message)
        }
      }
      
      // Sort schedules by full date
      allSchedules.sort((a, b) => a.fullDate - b.fullDate)
      setUpcomingSessions(allSchedules.slice(0, 5))

      // Fetch dashboard data - use fallback if endpoint doesn't exist
      try {
        const response = await fetch('http://localhost:4002/api/dashboard', {
          headers
        })
        
        if (response.ok) {
          const data = await response.json()
          setStats(data.stats || { totalRooms: 0, activeRooms: 0, totalHours: 0, streak: 0 })
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

  useEffect(() => {
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

  const handleLeaveRoom = (roomId, roomName) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Leave Room',
      message: `Are you sure you want to leave "${roomName}"?`,
      onConfirm: () => {
        leaveRoom(roomId, roomName)
      },
      variant: 'warning'
    })
  }

  const leaveRoom = async (roomId, roomName) => {
    try {
      setLeavingRoomId(roomId)
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        alert('You must be logged in to leave a room')
        return
      }

      const response = await fetch(`http://localhost:4002/api/rooms/${roomId}/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const data = await response.json()

      if (response.ok) {
        // Refresh dashboard data to remove the left room
        fetchDashboardData()
      } else {
        alert(data.error || 'Failed to leave room')
      }
    } catch (err) {
      console.error('Error leaving room:', err)
      alert('Failed to leave room. Please try again.')
    } finally {
      setLeavingRoomId(null)
    }
  }

  const handleDeleteRoom = (roomId, roomName) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Room',
      message: `Are you sure you want to delete "${roomName}"? This action cannot be undone and will remove all participants, sessions, and data.`,
      onConfirm: () => {
        deleteRoom(roomId, roomName)
      },
      variant: 'danger'
    })
  }

  const deleteRoom = async (roomId, roomName) => {
    try {
      setDeletingRoomId(roomId)
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        alert('You must be logged in to delete a room')
        return
      }

      const response = await fetch(`http://localhost:4002/api/rooms/${roomId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const data = await response.json()

      if (response.ok) {
        // Refresh dashboard data to remove the deleted room
        fetchDashboardData()
      } else {
        alert(data.error || 'Failed to delete room')
      }
    } catch (err) {
      console.error('Error deleting room:', err)
      alert('Failed to delete room. Please try again.')
    } finally {
      setDeletingRoomId(null)
    }
  }

  const handleClearActivity = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Clear Activity',
      message: 'Are you sure you want to clear all recent activity? This action cannot be undone.',
      onConfirm: () => {
        clearActivity()
      },
      variant: 'danger'
    })
  }

  const clearActivity = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        alert('You must be logged in to clear activity')
        return
      }

      const response = await fetch('http://localhost:4002/api/dashboard/activity', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (response.ok) {
        setRecentActivity([])
        alert('Recent activity cleared successfully')
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Failed to clear activity')
      }
    } catch (err) {
      console.error('Error clearing activity:', err)
      alert('Failed to clear activity. Please try again.')
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
          {/* Enhanced Welcome Section */}
          <div className="dashboard-welcome">
            <div className="dashboard-welcome-content">
              <div className="dashboard-welcome-badge">
                <Clock size={16} />
                <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <h1 className="dashboard-welcome-title">Welcome back!</h1>
              <p className="dashboard-welcome-subtitle">Here's what's happening with your study groups today</p>
            </div>
            <button className="btn btn-primary btn-lg" onClick={() => window.location.hash = '#/create'}>
              <Plus size={20} className="btn-icon" />
              Create Room
            </button>
          </div>

          {/* Enhanced Stats Grid */}
          <div className="stats-grid-enhanced">
            <div className="stat-card-enhanced">
              <div className="stat-card-background">
                <BookOpen size={48} />
              </div>
              <div className="stat-card-content">
                <div className="stat-value-enhanced">{stats.totalRooms}</div>
                <div className="stat-label-enhanced">Total Rooms</div>
                <div className="stat-trend positive">
                  <Trophy size={12} />
                  <span>+2 this week</span>
                </div>
              </div>
            </div>
            <div className="stat-card-enhanced">
              <div className="stat-card-background">
                <Users size={48} />
              </div>
              <div className="stat-card-content">
                <div className="stat-value-enhanced">{stats.activeRooms}</div>
                <div className="stat-label-enhanced">Active Rooms</div>
                <div className="stat-trend positive">
                  <Trophy size={12} />
                  <span>+1 this week</span>
                </div>
              </div>
            </div>
            <div className="stat-card-enhanced">
              <div className="stat-card-background">
                <Clock size={48} />
              </div>
              <div className="stat-card-content">
                <div className="stat-value-enhanced">{stats.totalHours}h</div>
                <div className="stat-label-enhanced">Study Hours</div>
                <div className="stat-trend positive">
                  <Trophy size={12} />
                  <span>+5h this week</span>
                </div>
              </div>
            </div>
            <div className="stat-card-enhanced">
              <div className="stat-card-background">
                <Award size={48} />
              </div>
              <div className="stat-card-content">
                <div className="stat-value-enhanced">{stats.streak}</div>
                <div className="stat-label-enhanced">Day Streak</div>
                <div className="stat-trend positive">
                  <Trophy size={12} />
                  <span>Keep it up!</span>
                </div>
              </div>
            </div>
          </div>

          <div className="dashboard-grid-enhanced">
            {/* Recent Rooms */}
            <div className="dashboard-section-enhanced">
              <div className="dashboard-section-header-enhanced">
                <div className="dashboard-section-title-group">
                  <div className="dashboard-section-icon">
                    <BookOpen size={24} />
                  </div>
                  <div>
                    <h2 className="dashboard-section-title-enhanced">Recent Rooms</h2>
                    <p className="dashboard-section-subtitle">Your active study spaces</p>
                  </div>
                </div>
                <a href="#/browse" className="btn btn-sm btn-ghost">View All</a>
              </div>
              <div className="room-list-enhanced">
                {dataLoading ? (
                  <div className="loading-state-enhanced">Loading rooms...</div>
                ) : recentRooms.length === 0 ? (
                  <div className="empty-state-enhanced">
                    <div className="empty-state-icon">
                      <BookOpen size={64} />
                    </div>
                    <h3>No rooms yet</h3>
                    <p>Create your first study room to get started</p>
                    <button className="btn btn-primary" onClick={() => window.location.hash = '#/create'}>
                      <Plus size={16} />
                      Create Room
                    </button>
                  </div>
                ) : (
                  recentRooms.map(room => (
                    <div key={room.id} className="room-card-enhanced">
                      <div className="room-card-header-enhanced">
                        <div className="room-icon-enhanced">
                          <BookOpen size={32} />
                        </div>
                        <div className="room-info-enhanced">
                          <h3 className="room-title-enhanced" onClick={() => window.location.hash = `#/room/${room.id}`}>{room.name}</h3>
                          <div className="room-meta">
                            <span className="room-subject-badge-enhanced">{room.subject}</span>
                            <div className="room-participants-enhanced">
                              <Users size={14} />
                              <span>{room.participants} participants</span>
                            </div>
                          </div>
                        </div>
                        <div className="room-status-enhanced">
                          {room.isActive ? (
                            <div className="room-status-badge active">
                              <span className="status-dot-enhanced"></span>
                              <span>Active</span>
                            </div>
                          ) : (
                            <div className="room-status-badge inactive">
                              <span className="status-dot-enhanced"></span>
                              <span>{room.lastActive}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="room-card-footer-enhanced">
                        <button 
                          className="btn btn-primary btn-sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            window.location.hash = `#/room/${room.id}`
                          }}
                        >
                          <Users size={16} />
                          Join Room
                        </button>
                        {room.role === 'owner' ? (
                          <button 
                            className="btn btn-danger btn-sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteRoom(room.id, room.name)
                            }}
                            disabled={deletingRoomId === room.id}
                          >
                            {deletingRoomId === room.id ? 'Deleting...' : 'Delete'}
                          </button>
                        ) : (
                          <button 
                            className="btn btn-secondary btn-sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleLeaveRoom(room.id, room.name)
                            }}
                            disabled={leavingRoomId === room.id}
                          >
                            {leavingRoomId === room.id ? 'Leaving...' : 'Leave'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Upcoming Sessions */}
            <div className="dashboard-section-enhanced">
              <div className="dashboard-section-header-enhanced">
                <div className="dashboard-section-title-group">
                  <div className="dashboard-section-icon">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <h2 className="dashboard-section-title-enhanced">Upcoming Sessions</h2>
                    <p className="dashboard-section-subtitle">Your scheduled study times</p>
                  </div>
                </div>
                <a href="#/calendar" className="btn btn-sm btn-ghost">View Calendar</a>
              </div>
              <div className="session-list-enhanced">
                {dataLoading ? (
                  <div className="loading-state-enhanced">Loading sessions...</div>
                ) : upcomingSessions.length === 0 ? (
                  <div className="empty-state-enhanced">
                    <div className="empty-state-icon">
                      <Calendar size={64} />
                    </div>
                    <h3>No upcoming sessions</h3>
                    <p>Schedule your first study session</p>
                    <button className="btn btn-primary" onClick={() => window.location.hash = '#/calendar'}>
                      <Calendar size={16} />
                      Go to Calendar
                    </button>
                  </div>
                ) : (
                  upcomingSessions.map(session => (
                    <div key={session.id} className="session-card-enhanced" onClick={() => window.location.hash = `#/room/${session.roomId}`}>
                      <div className="session-date-enhanced">
                        <div className="session-day-enhanced">{session.date}</div>
                        <div className="session-month-enhanced">{session.month}</div>
                        <div className="session-time-enhanced">{session.time}</div>
                      </div>
                      <div className="session-info-enhanced">
                        <div className="session-title-enhanced">{session.title}</div>
                        <div className="session-room-enhanced">{session.room}</div>
                        <span className={`badge badge-enhanced ${getSessionTypeColor(session.type)}`}>{session.type}</span>
                      </div>
                      <button className="btn btn-icon-only">
                        <Plus size={20} className="rotate-45" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="dashboard-section-enhanced">
              <div className="dashboard-section-header-enhanced">
                <div className="dashboard-section-title-group">
                  <div className="dashboard-section-icon">
                    <MessageSquare size={24} />
                  </div>
                  <div>
                    <h2 className="dashboard-section-title-enhanced">Recent Activity</h2>
                    <p className="dashboard-section-subtitle">Your latest interactions</p>
                  </div>
                </div>
                <div className="dashboard-section-actions">
                  {recentActivity.length > 0 && (
                    <button 
                      className="btn btn-sm btn-danger-themed"
                      onClick={handleClearActivity}
                      title="Clear all activity"
                    >
                      <Trash2 size={16} />
                      Clear
                    </button>
                  )}
                  <a href="#/notifications" className="btn btn-sm btn-ghost">View All</a>
                </div>
              </div>
              <div className="activity-list-enhanced">
                {dataLoading ? (
                  <div className="loading-state-enhanced">Loading activity...</div>
                ) : recentActivity.length === 0 ? (
                  <div className="empty-state-enhanced">
                    <div className="empty-state-icon">
                      <MessageSquare size={64} />
                    </div>
                    <h3>No recent activity</h3>
                    <p>Your activity will appear here</p>
                  </div>
                ) : (
                  recentActivity.map(activity => (
                    <div key={activity.id} className="activity-item-enhanced">
                      <div className="activity-icon-enhanced">{getActivityIcon(activity.type)}</div>
                      <div className="activity-content-enhanced">
                        <div className="activity-text-enhanced">{activity.text}</div>
                        <div className="activity-time-enhanced">{activity.time}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="dashboard-section-enhanced quick-actions-section">
              <div className="dashboard-section-header-enhanced">
                <div className="dashboard-section-title-group">
                  <div className="dashboard-section-icon">
                    <Zap size={24} />
                  </div>
                  <div>
                    <h2 className="dashboard-section-title-enhanced">Quick Actions</h2>
                    <p className="dashboard-section-subtitle">Common tasks at your fingertips</p>
                  </div>
                </div>
              </div>
              <div className="quick-actions-enhanced">
                <button className="quick-action-enhanced" onClick={() => window.location.hash = '#/create'}>
                  <div className="quick-action-icon-enhanced primary">
                    <Plus size={24} />
                  </div>
                  <div className="quick-action-label-enhanced">Create Room</div>
                </button>
                <button className="quick-action-enhanced" onClick={() => window.location.hash = '#/browse'}>
                  <div className="quick-action-icon-enhanced secondary">
                    <Search size={24} />
                  </div>
                  <div className="quick-action-label-enhanced">Browse Rooms</div>
                </button>
                <button className="quick-action-enhanced" onClick={() => window.location.hash = '#/friends'}>
                  <div className="quick-action-icon-enhanced accent">
                    <Users size={24} />
                  </div>
                  <div className="quick-action-label-enhanced">Find Friends</div>
                </button>
                <button className="quick-action-enhanced" onClick={() => window.location.hash = '#/timer'}>
                  <div className="quick-action-icon-enhanced success">
                    <Timer size={24} />
                  </div>
                  <div className="quick-action-label-enhanced">Study Timer</div>
                </button>
                <button className="quick-action-enhanced" onClick={() => window.location.hash = '#/whiteboard'}>
                  <div className="quick-action-icon-enhanced warning">
                    <Palette size={24} />
                  </div>
                  <div className="quick-action-label-enhanced">Whiteboard</div>
                </button>
                <button className="quick-action-enhanced" onClick={() => window.location.hash = '#/messages'}>
                  <div className="quick-action-icon-enhanced info">
                    <MessageSquare size={24} />
                  </div>
                  <div className="quick-action-label-enhanced">Messages</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="page-footer">
        <p>© {new Date().getFullYear()} CollaborativeApp — Built for students</p>
        <div className="page-footer-links">
          <a href="#/privacy">Privacy Policy</a>
          <a href="#/terms">Terms of Service</a>
          <a href="#/about">About</a>
        </div>
      </footer>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant={confirmDialog.variant}
      />
    </div>
    </ProtectedRoute>
  )
}
