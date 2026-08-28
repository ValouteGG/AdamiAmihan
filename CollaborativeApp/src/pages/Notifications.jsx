import { useState, useEffect } from 'react'
import '../styles/pages.css'
import ThemeToggle from '../components/ThemeToggle'
import ProtectedRoute from '../components/ProtectedRoute'
import { useAuth } from '../context/AuthContext'
import { BookOpen, MessageSquare, Mail, Users, Bell, X, Check } from 'lucide-react'
import { supabase } from '../config/supabase'

export default function Notifications() {
  const { isAuthenticated } = useAuth()
  const [filter, setFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [notificationsLoading, setNotificationsLoading] = useState(true)
  
  // Fetch notifications from backend
  const fetchNotifications = async () => {
    try {
      setNotificationsLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      
      const headers = {
        'Content-Type': 'application/json',
      }
      
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }

      try {
        const response = await fetch('http://localhost:4002/api/notifications', {
          headers
        })
        
        if (response.ok) {
          const data = await response.json()
          setNotifications(data.notifications || [])
        } else {
          console.log('Notifications endpoint not available')
          setNotifications([])
        }
      } catch (apiError) {
        console.log('Notifications API call failed:', apiError.message)
        setNotifications([])
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
      setNotifications([])
    } finally {
      setNotificationsLoading(false)
    }
  }

  // Initial fetch and set up polling for real-time updates
  useEffect(() => {
    fetchNotifications()
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      fetchNotifications()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const handleMarkAsRead = async (id) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      const headers = {
        'Content-Type': 'application/json',
      }
      
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }

      const response = await fetch(`http://localhost:4002/api/notifications/${id}/read`, {
        method: 'POST',
        headers
      })

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notif =>
            notif.id === id ? { ...notif, read: true } : notif
          )
        )
      } else {
        // Fallback to local update if backend fails
        setNotifications(prev =>
          prev.map(notif =>
            notif.id === id ? { ...notif, read: true } : notif
          )
        )
      }
    } catch (err) {
      console.error('Error marking as read:', err)
      // Fallback to local update
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === id ? { ...notif, read: true } : notif
        )
      )
    }
  }

  const handleMarkAllAsRead = async () => {
    setIsLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      const headers = {
        'Content-Type': 'application/json',
      }
      
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }

      const response = await fetch('http://localhost:4002/api/notifications/read-all', {
        method: 'POST',
        headers
      })

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notif => ({ ...notif, read: true }))
        )
      } else {
        // Fallback to local update
        setNotifications(prev =>
          prev.map(notif => ({ ...notif, read: true }))
        )
      }
    } catch (err) {
      console.error('Error marking all as read:', err)
      // Fallback to local update
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, read: true }))
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleAction = async (id, action) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      const headers = {
        'Content-Type': 'application/json',
      }
      
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }

      if (action === 'accept') {
        const response = await fetch(`http://localhost:4002/api/notifications/${id}/accept`, {
          method: 'POST',
          headers
        })
        if (response.ok) {
          alert('Room invitation accepted!')
          fetchNotifications()
        } else {
          alert('Failed to accept invitation')
        }
      } else if (action === 'decline') {
        const response = await fetch(`http://localhost:4002/api/notifications/${id}/decline`, {
          method: 'POST',
          headers
        })
        if (response.ok) {
          setNotifications(prev => prev.filter(n => n.id !== id))
        }
      } else if (action === 'view') {
        // Navigate to the relevant content based on notification type
        const notification = notifications.find(n => n.id === id)
        if (notification) {
          if (notification.type === 'message' && notification.roomId) {
            window.location.hash = `#/room/${notification.roomId}`
          } else if (notification.type === 'private_message' && notification.userId) {
            window.location.hash = `#/messages?user=${notification.userId}`
          }
        }
      }
    } catch (err) {
      console.error('Error handling action:', err)
      alert('Failed to perform action')
    }
  }

  const handleDelete = async (id) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      const headers = {
        'Content-Type': 'application/json',
      }
      
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }

      const response = await fetch(`http://localhost:4002/api/notifications/${id}`, {
        method: 'DELETE',
        headers
      })

      if (response.ok) {
        setNotifications(prev => prev.filter(n => n.id !== id))
      } else {
        // Fallback to local delete
        setNotifications(prev => prev.filter(n => n.id !== id))
      }
    } catch (err) {
      console.error('Error deleting notification:', err)
      // Fallback to local delete
      setNotifications(prev => prev.filter(n => n.id !== id))
    }
  }

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'all') return true
    if (filter === 'unread') return !notif.read
    if (filter === 'room_invites') return notif.type === 'room_invite'
    if (filter === 'messages') return notif.type === 'message' || notif.type === 'private_message'
    if (filter === 'group_chats') return notif.type === 'group_message'
    return true
  })

  const unreadCount = notifications.filter(n => !n.read).length

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'room_invite': return <Users size={20} />
      case 'message': return <MessageSquare size={20} />
      case 'private_message': return <Mail size={20} />
      case 'group_message': return <Users size={20} />
      case 'reminder': return <Bell size={20} />
      case 'achievement': return <Check size={20} />
      default: return <Bell size={20} />
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
              <span className="page-header-current">Notifications</span>
            </div>
          </div>
          <nav className="page-header-nav">
            <a href="#/dashboard" className="btn btn-ghost btn-sm">Dashboard</a>
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
        <div className="page-inner">
          <div className="notifications-header">
            <div>
              <h1 className="page-title">Notifications</h1>
              <p className="page-subtitle">
                {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                className="btn btn-sm btn-ghost"
                onClick={handleMarkAllAsRead}
                disabled={isLoading}
              >
                {isLoading ? 'Marking...' : 'Mark all as read'}
              </button>
            )}
          </div>

          <div className="notifications-container">
            <div className="notifications-filter">
              <button
                className={`filter-btn ${filter === 'all' ? 'filter-btn-active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All
              </button>
              <button
                className={`filter-btn ${filter === 'unread' ? 'filter-btn-active' : ''}`}
                onClick={() => setFilter('unread')}
              >
                Unread
              </button>
              <button
                className={`filter-btn ${filter === 'room_invites' ? 'filter-btn-active' : ''}`}
                onClick={() => setFilter('room_invites')}
              >
                Invites
              </button>
              <button
                className={`filter-btn ${filter === 'messages' ? 'filter-btn-active' : ''}`}
                onClick={() => setFilter('messages')}
              >
                Messages
              </button>
              <button
                className={`filter-btn ${filter === 'group_chats' ? 'filter-btn-active' : ''}`}
                onClick={() => setFilter('group_chats')}
              >
                Group Chats
              </button>
            </div>

            <div className="notifications-list">
              {notificationsLoading ? (
                <div className="loading-state-enhanced">Loading notifications...</div>
              ) : filteredNotifications.length === 0 ? (
                <div className="notifications-empty">
                  <div className="notifications-empty-icon">
                    <Bell size={64} />
                  </div>
                  <h3>No notifications</h3>
                  <p>You're all caught up!</p>
                </div>
              ) : (
                filteredNotifications.map(notif => (
                  <div
                    key={notif.id}
                    className={`notification-item ${!notif.read ? 'notification-item-unread' : ''}`}
                  >
                    <div className="notification-icon">
                      {getNotificationIcon(notif.type)}
                    </div>
                    <div className="notification-content">
                      <div className="notification-header">
                        <h4 className="notification-title">{notif.title}</h4>
                        <span className="notification-time">{notif.time}</span>
                      </div>
                      <p className="notification-message">{notif.message}</p>
                      {notif.actions && notif.actions.length > 0 && (
                        <div className="notification-actions">
                          {notif.actions.map(action => (
                            <button
                              key={action}
                              className={`btn btn-sm ${
                                action === 'accept' || action === 'join' ? 'btn-primary' :
                                action === 'decline' ? 'btn-danger' : 'btn-ghost'
                              }`}
                              onClick={() => handleAction(notif.id, action)}
                            >
                              {action.charAt(0).toUpperCase() + action.slice(1)}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="notification-actions-secondary">
                      {!notif.read && (
                        <button
                          className="btn btn-sm btn-ghost"
                          onClick={() => handleMarkAsRead(notif.id)}
                          title="Mark as read"
                        >
                          <Check size={16} />
                        </button>
                      )}
                      <button
                        className="btn btn-sm btn-ghost"
                        onClick={() => handleDelete(notif.id)}
                        title="Delete"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
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
    </div>
    </ProtectedRoute>
  )
}
