import { useState } from 'react'
import '../styles/pages.css'
import ThemeToggle from '../components/ThemeToggle'
import ProtectedRoute from '../components/ProtectedRoute'

export default function Notifications() {
  const [filter, setFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(false)
  
  // Mock notifications data
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'room_invite',
      title: 'Room Invitation',
      message: 'Alice Johnson invited you to join "Physics Study Group"',
      time: '2 hours ago',
      read: false,
      actions: ['accept', 'decline']
    },
    {
      id: 2,
      type: 'message',
      title: 'New Message',
      message: 'Bob Smith sent you a message in "Calculus Study Group"',
      time: '5 hours ago',
      read: false,
      actions: ['view']
    },
    {
      id: 3,
      type: 'reminder',
      title: 'Session Reminder',
      message: 'Study session "Chemistry Review" starts in 30 minutes',
      time: '30 minutes ago',
      read: true,
      actions: ['join']
    },
    {
      id: 4,
      type: 'resource',
      title: 'New Resource',
      message: 'Carol Davis uploaded "Practice Problems.pdf" to "Math Help"',
      time: '1 day ago',
      read: true,
      actions: ['view']
    },
    {
      id: 5,
      type: 'system',
      title: 'Account Update',
      message: 'Your password was successfully changed',
      time: '2 days ago',
      read: true,
      actions: []
    },
    {
      id: 6,
      type: 'room_invite',
      title: 'Room Invitation',
      message: 'David Lee invited you to join "Computer Science Lab"',
      time: '3 days ago',
      read: true,
      actions: ['accept', 'decline']
    }
  ])

  const handleMarkAsRead = async (id) => {
    // ============================================
    // BACKEND INTEGRATION PLACEHOLDER
    // ============================================
    // Replace this with actual API call
    // Example:
    // const response = await fetch(`/api/notifications/${id}/read`, {
    //   method: 'POST'
    // })
    
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    )
    console.log('Marked as read:', id)
  }

  const handleMarkAllAsRead = async () => {
    setIsLoading(true)
    try {
      // ============================================
      // BACKEND INTEGRATION PLACEHOLDER
      // ============================================
      // Replace this with actual API call
      // Example:
      // const response = await fetch('/api/notifications/read-all', {
      //   method: 'POST'
      // })
      
      await new Promise(resolve => setTimeout(resolve, 500))
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, read: true }))
      )
      console.log('All notifications marked as read')
    } catch (err) {
      console.error('Error marking all as read:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAction = async (id, action) => {
    // ============================================
    // BACKEND INTEGRATION PLACEHOLDER
    // ============================================
    // Replace this with actual API call based on action type
    // Example:
    // const response = await fetch(`/api/notifications/${id}/${action}`, {
    //   method: 'POST'
    // })
    
    console.log(`Action ${action} for notification ${id}`)
    
    if (action === 'accept') {
      alert('Room invitation accepted (backend integration required)')
    } else if (action === 'decline') {
      setNotifications(prev => prev.filter(n => n.id !== id))
    } else if (action === 'view') {
      alert('Navigate to relevant content (backend integration required)')
    } else if (action === 'join') {
      alert('Join session (backend integration required)')
    }
  }

  const handleDelete = async (id) => {
    // ============================================
    // BACKEND INTEGRATION PLACEHOLDER
    // ============================================
    // Replace this with actual API call
    // Example:
    // const response = await fetch(`/api/notifications/${id}`, {
    //   method: 'DELETE'
    // })
    
    setNotifications(prev => prev.filter(n => n.id !== id))
    console.log('Deleted notification:', id)
  }

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'all') return true
    if (filter === 'unread') return !notif.read
    if (filter === 'room_invites') return notif.type === 'room_invite'
    if (filter === 'messages') return notif.type === 'message'
    return true
  })

  const unreadCount = notifications.filter(n => !n.read).length

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'room_invite': return '📨'
      case 'message': return '💬'
      case 'reminder': return '⏰'
      case 'resource': return '📎'
      case 'system': return '⚙️'
      default: return '🔔'
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
            <a href="#/" className="btn btn-ghost btn-sm">Home</a>
            <a href="#/browse" className="btn btn-ghost btn-sm">Browse Rooms</a>
            <a href="#/create" className="btn btn-primary btn-sm">Create Room</a>
            <ThemeToggle />
            <a href="#/profile" className="btn btn-ghost btn-sm">Profile</a>
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
            </div>

            <div className="notifications-list">
              {filteredNotifications.length === 0 ? (
                <div className="notifications-empty">
                  <div className="notifications-empty-icon">🔔</div>
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
                      {notif.actions.length > 0 && (
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
                          ✓
                        </button>
                      )}
                      <button
                        className="btn btn-sm btn-ghost"
                        onClick={() => handleDelete(notif.id)}
                        title="Delete"
                      >
                        ✕
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
      </footer>
    </div>
    </ProtectedRoute>
  )
}
