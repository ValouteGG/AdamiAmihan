import { useState } from 'react'
import '../styles/pages.css'
import ThemeToggle from '../components/ThemeToggle'
import ProtectedRoute from '../components/ProtectedRoute'

export default function Friends() {
  const [activeTab, setActiveTab] = useState('friends') // 'friends', 'requests', 'discover'
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  // Mock data
  const [friends] = useState([
    { id: 1, name: 'Alice Johnson', avatar: 'A', subjects: ['Mathematics', 'Physics'], mutualFriends: 5, online: true },
    { id: 2, name: 'Bob Smith', avatar: 'B', subjects: ['Computer Science'], mutualFriends: 3, online: false },
    { id: 3, name: 'Carol Davis', avatar: 'C', subjects: ['Chemistry', 'Biology'], mutualFriends: 2, online: true },
    { id: 4, name: 'David Lee', avatar: 'D', subjects: ['Mathematics'], mutualFriends: 8, online: false },
  ])

  const [requests] = useState([
    { id: 1, name: 'Emma Wilson', avatar: 'E', subjects: ['Literature', 'History'], mutualFriends: 1, message: 'Hey! I saw you\'re in the calculus study group. Mind if I join?' },
    { id: 2, name: 'Frank Miller', avatar: 'F', subjects: ['Physics', 'Chemistry'], mutualFriends: 0, message: 'Would love to collaborate on the physics project!' },
  ])

  const [suggestions] = useState([
    { id: 1, name: 'Grace Kim', avatar: 'G', subjects: ['Computer Science', 'Mathematics'], mutualFriends: 4, reason: 'Studying similar subjects' },
    { id: 2, name: 'Henry Chen', avatar: 'H', subjects: ['Physics', 'Engineering'], mutualFriends: 2, reason: 'In your study groups' },
    { id: 3, name: 'Ivy Martinez', avatar: 'I', subjects: ['Biology', 'Chemistry'], mutualFriends: 3, reason: 'Mutual connections' },
  ])

  const handleSendRequest = async (userId) => {
    setIsLoading(true)
    try {
      // ============================================
      // BACKEND INTEGRATION PLACEHOLDER
      // ============================================
      // Replace this setTimeout with your actual API call
      // Example:
      // const response = await fetch('/api/friends/request', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ userId })
      // })
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Friend request sent to:', userId)
    } catch (err) {
      console.error('Error sending request:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAcceptRequest = async (requestId) => {
    setIsLoading(true)
    try {
      // ============================================
      // BACKEND INTEGRATION PLACEHOLDER
      // ============================================
      // Replace this setTimeout with your actual API call
      // Example:
      // const response = await fetch(`/api/friends/requests/${requestId}/accept`, {
      //   method: 'POST'
      // })
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Friend request accepted:', requestId)
    } catch (err) {
      console.error('Error accepting request:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeclineRequest = async (requestId) => {
    setIsLoading(true)
    try {
      // ============================================
      // BACKEND INTEGRATION PLACEHOLDER
      // ============================================
      // Replace this setTimeout with your actual API call
      // Example:
      // const response = await fetch(`/api/friends/requests/${requestId}/decline`, {
      //   method: 'POST'
      // })
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Friend request declined:', requestId)
    } catch (err) {
      console.error('Error declining request:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveFriend = async (friendId) => {
    if (window.confirm('Are you sure you want to remove this friend?')) {
      setIsLoading(true)
      try {
        // ============================================
        // BACKEND INTEGRATION PLACEHOLDER
        // ============================================
        // Replace this setTimeout with your actual API call
        // Example:
        // const response = await fetch(`/api/friends/${friendId}`, {
        //   method: 'DELETE'
        // })
        
        await new Promise(resolve => setTimeout(resolve, 1000))
        console.log('Friend removed:', friendId)
      } catch (err) {
        console.error('Error removing friend:', err)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const filteredFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.subjects.some(subject => subject.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <ProtectedRoute>
      <div className="page-root">
        <header className="page-header">
          <div className="page-header-brand">
            <a href="#/" className="page-header-logo">📚</a>
            <a href="#/" className="page-header-title">CollaborativeApp</a>
          </div>
          <nav className="page-header-nav">
            <a href="#/" className="btn btn-ghost btn-sm">Dashboard</a>
            <a href="#/browse" className="btn btn-ghost btn-sm">Browse Rooms</a>
            <a href="#/create" className="btn btn-primary btn-sm">Create Room</a>
            <ThemeToggle />
            <a href="#/profile" className="btn btn-ghost btn-sm">Profile</a>
          </nav>
        </header>

      <div className="page-content">
        <div className="page-inner friends-inner">
          <div className="friends-header">
            <h1 className="page-title">Friends & Connections</h1>
            <p className="page-subtitle">Find study partners and manage your connections</p>
          </div>

          <div className="friends-container">
            {/* Tabs */}
            <div className="friends-tabs">
              <button
                className={`friends-tab ${activeTab === 'friends' ? 'friends-tab-active' : ''}`}
                onClick={() => setActiveTab('friends')}
              >
                Friends ({friends.length})
              </button>
              <button
                className={`friends-tab ${activeTab === 'requests' ? 'friends-tab-active' : ''}`}
                onClick={() => setActiveTab('requests')}
              >
                Requests {requests.length > 0 && `(${requests.length})`}
              </button>
              <button
                className={`friends-tab ${activeTab === 'discover' ? 'friends-tab-active' : ''}`}
                onClick={() => setActiveTab('discover')}
              >
                Discover
              </button>
            </div>

            {/* Search */}
            <div className="friends-search">
              <input
                type="text"
                className="friends-search-input"
                placeholder="Search friends by name or subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Content */}
            <div className="friends-content">
              {activeTab === 'friends' && (
                <div className="friends-list">
                  {filteredFriends.length === 0 ? (
                    <div className="friends-empty">
                      <div className="friends-empty-icon">👥</div>
                      <h3>No friends found</h3>
                      <p>Try different search terms or discover new connections</p>
                    </div>
                  ) : (
                    filteredFriends.map(friend => (
                      <div key={friend.id} className="friend-card">
                        <div className="friend-avatar">
                          {friend.avatar}
                          {friend.online && <span className="friend-status-online"></span>}
                        </div>
                        <div className="friend-info">
                          <div className="friend-name">{friend.name}</div>
                          <div className="friend-subjects">
                            {friend.subjects.map(subject => (
                              <span key={subject} className="badge badge-secondary">{subject}</span>
                            ))}
                          </div>
                          <div className="friend-meta">
                            <span className="friend-mutual">{friend.mutualFriends} mutual friends</span>
                            <span className={`friend-status ${friend.online ? 'friend-status-online' : 'friend-status-offline'}`}>
                              {friend.online ? 'Online' : 'Offline'}
                            </span>
                          </div>
                        </div>
                        <div className="friend-actions">
                          <button className="btn btn-sm btn-ghost">Message</button>
                          <button className="btn btn-sm btn-ghost">Profile</button>
                          <button
                            className="btn btn-sm btn-ghost-danger"
                            onClick={() => handleRemoveFriend(friend.id)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'requests' && (
                <div className="friends-list">
                  {requests.length === 0 ? (
                    <div className="friends-empty">
                      <div className="friends-empty-icon">📨</div>
                      <h3>No pending requests</h3>
                      <p>You're all caught up!</p>
                    </div>
                  ) : (
                    requests.map(request => (
                      <div key={request.id} className="friend-card friend-card-request">
                        <div className="friend-avatar">{request.avatar}</div>
                        <div className="friend-info">
                          <div className="friend-name">{request.name}</div>
                          <div className="friend-subjects">
                            {request.subjects.map(subject => (
                              <span key={subject} className="badge badge-secondary">{subject}</span>
                            ))}
                          </div>
                          <div className="friend-message">{request.message}</div>
                          <div className="friend-meta">
                            <span className="friend-mutual">{request.mutualFriends} mutual friends</span>
                          </div>
                        </div>
                        <div className="friend-actions">
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => handleAcceptRequest(request.id)}
                            disabled={isLoading}
                          >
                            Accept
                          </button>
                          <button
                            className="btn btn-sm btn-ghost"
                            onClick={() => handleDeclineRequest(request.id)}
                            disabled={isLoading}
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'discover' && (
                <div className="friends-list">
                  <div className="discover-section">
                    <h3>Suggested for you</h3>
                    {suggestions.map(suggestion => (
                      <div key={suggestion.id} className="friend-card">
                        <div className="friend-avatar">{suggestion.avatar}</div>
                        <div className="friend-info">
                          <div className="friend-name">{suggestion.name}</div>
                          <div className="friend-subjects">
                            {suggestion.subjects.map(subject => (
                              <span key={subject} className="badge badge-secondary">{subject}</span>
                            ))}
                          </div>
                          <div className="friend-reason">✨ {suggestion.reason}</div>
                          <div className="friend-meta">
                            <span className="friend-mutual">{suggestion.mutualFriends} mutual friends</span>
                          </div>
                        </div>
                        <div className="friend-actions">
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => handleSendRequest(suggestion.id)}
                            disabled={isLoading}
                          >
                            Add Friend
                          </button>
                          <button className="btn btn-sm btn-ghost">Profile</button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="discover-section">
                    <h3>Find by subject</h3>
                    <div className="subject-tags">
                      {['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Literature', 'History', 'Engineering'].map(subject => (
                        <button key={subject} className="subject-tag">
                          {subject}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
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
