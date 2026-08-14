import { useState, useEffect } from 'react'
import { supabase } from '../config/supabase'
import '../styles/pages.css'
import ThemeToggle from '../components/ThemeToggle'
import ProtectedRoute from '../components/ProtectedRoute'

export default function Friends() {
  const [activeTab, setActiveTab] = useState('friends') // 'friends', 'requests', 'discover'
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  
  // Real data from backend
  const [friends, setFriends] = useState([])
  const [requests, setRequests] = useState([])
  const [friendsLoading, setFriendsLoading] = useState(true)
  const [requestsLoading, setRequestsLoading] = useState(true)

  const handleSendRequest = async (userId) => {
    setIsLoading(true)
    try {
      // Get Supabase session for auth token
      const { data: { session } } = await supabase.auth.getSession()
      
      const headers = {
        'Content-Type': 'application/json',
      }
      
      // Add auth token if available
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }

      const response = await fetch('http://localhost:4002/api/friends/add', {
        method: 'POST',
        headers,
        body: JSON.stringify({ userId })
      })

      const data = await response.json()

      if (response.ok) {
        alert('Friend request sent successfully!')
        // Clear search results
        setSearchResults([])
        setSearchQuery('')
      } else {
        alert(data.error || 'Failed to send friend request')
      }
    } catch (err) {
      console.error('Error sending request:', err)
      alert('Failed to send friend request')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAcceptRequest = async (requestId) => {
    setIsLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      const headers = {
        'Content-Type': 'application/json',
      }
      
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }

      const response = await fetch(`http://localhost:4002/api/friends/requests/${requestId}/accept`, {
        method: 'POST',
        headers
      })

      const data = await response.json()

      if (response.ok) {
        alert('Friend request accepted!')
        // Refresh requests
        fetchRequests()
        // Refresh friends
        fetchFriends()
      } else {
        alert(data.error || 'Failed to accept friend request')
      }
    } catch (err) {
      console.error('Error accepting request:', err)
      alert('Failed to accept friend request')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeclineRequest = async (requestId) => {
    setIsLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      const headers = {
        'Content-Type': 'application/json',
      }
      
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }

      const response = await fetch(`http://localhost:4002/api/friends/requests/${requestId}/decline`, {
        method: 'POST',
        headers
      })

      const data = await response.json()

      if (response.ok) {
        alert('Friend request declined')
        // Refresh requests
        fetchRequests()
      } else {
        alert(data.error || 'Failed to decline friend request')
      }
    } catch (err) {
      console.error('Error declining request:', err)
      alert('Failed to decline friend request')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveFriend = async (friendId) => {
    if (window.confirm('Are you sure you want to remove this friend?')) {
      setIsLoading(true)
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        const headers = {
          'Content-Type': 'application/json',
        }
        
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`
        }

        const response = await fetch(`http://localhost:4002/api/friends/${friendId}`, {
          method: 'DELETE',
          headers
        })

        if (response.ok) {
          alert('Friend removed')
          fetchFriends()
        } else {
          alert('Failed to remove friend')
        }
      } catch (err) {
        console.error('Error removing friend:', err)
        alert('Failed to remove friend')
      } finally {
        setIsLoading(false)
      }
    }
  }

  // Fetch friends from backend
  const fetchFriends = async () => {
    try {
      setFriendsLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      
      const headers = {
        'Content-Type': 'application/json',
      }
      
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }

      const response = await fetch('http://localhost:4002/api/friends', {
        headers
      })
      const data = await response.json()

      if (response.ok) {
        setFriends(data.friends || [])
      } else {
        console.error('Failed to fetch friends:', data.error)
      }
    } catch (error) {
      console.error('Error fetching friends:', error)
    } finally {
      setFriendsLoading(false)
    }
  }

  // Fetch friend requests from backend
  const fetchRequests = async () => {
    try {
      setRequestsLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      
      const headers = {
        'Content-Type': 'application/json',
      }
      
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }

      const response = await fetch('http://localhost:4002/api/friends/requests', {
        headers
      })
      const data = await response.json()

      if (response.ok) {
        setRequests(data.requests || [])
      } else {
        console.error('Failed to fetch requests:', data.error)
      }
    } catch (error) {
      console.error('Error fetching requests:', error)
    } finally {
      setRequestsLoading(false)
    }
  }

  // Load data on mount
  useEffect(() => {
    fetchFriends()
    fetchRequests()
  }, [])

  const handleSearchUsers = async (query) => {
    setSearchQuery(query)
    
    if (query.length < 2) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      // Get Supabase session for auth token
      const { data: { session } } = await supabase.auth.getSession()
      
      const headers = {
        'Content-Type': 'application/json',
      }
      
      // Add auth token if available
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }

      const response = await fetch('http://localhost:4002/api/users/search', {
        method: 'POST',
        headers,
        body: JSON.stringify({ query })
      })

      const data = await response.json()

      if (response.ok) {
        setSearchResults(data.users || [])
      } else {
        console.error('Search error:', data.error)
        setSearchResults([])
      }
    } catch (error) {
      console.error('Error searching users:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
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
                Friends {friends.length > 0 && `(${friends.length})`}
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
                placeholder={activeTab === 'discover' ? "Search users by email or name..." : "Search friends by name or subject..."}
                value={searchQuery}
                onChange={(e) => {
                  if (activeTab === 'discover') {
                    handleSearchUsers(e.target.value)
                  } else {
                    setSearchQuery(e.target.value)
                  }
                }}
              />
            </div>

            {/* Content */}
            <div className="friends-content">
              {activeTab === 'friends' && (
                <div className="friends-list">
                  {friendsLoading ? (
                    <div className="friends-empty">
                      <div className="loading-spinner">Loading friends...</div>
                    </div>
                  ) : friends.length === 0 ? (
                    <div className="friends-empty">
                      <div className="friends-empty-icon">👥</div>
                      <h3>No friends yet</h3>
                      <p>Use the Discover tab to find and add friends</p>
                    </div>
                  ) : (
                    friends.map(friend => {
                      let avatarDisplay
                      if (friend.avatar && friend.avatar.startsWith('http')) {
                        avatarDisplay = <img src={friend.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                      } else {
                        avatarDisplay = friend.avatar || friend.name[0]
                      }

                      return (
                        <div key={friend.id} className="friend-card">
                          <div className="friend-avatar">
                            {avatarDisplay}
                            {friend.online && <span className="friend-status-online"></span>}
                          </div>
                          <div className="friend-info">
                            <div className="friend-name">{friend.name}</div>
                            <div className="friend-meta">
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
                      )
                    })
                  )}
                </div>
              )}

              {activeTab === 'requests' && (
                <div className="friends-list">
                  {requestsLoading ? (
                    <div className="friends-empty">
                      <div className="loading-spinner">Loading requests...</div>
                    </div>
                  ) : requests.length === 0 ? (
                    <div className="friends-empty">
                      <div className="friends-empty-icon">📨</div>
                      <h3>No pending requests</h3>
                      <p>You're all caught up!</p>
                    </div>
                  ) : (
                    requests.map(request => {
                      let avatarDisplay
                      if (request.avatar && request.avatar.startsWith('http')) {
                        avatarDisplay = <img src={request.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                      } else {
                        avatarDisplay = request.avatar || request.name[0]
                      }

                      return (
                        <div key={request.id} className="friend-card friend-card-request">
                          <div className="friend-avatar">{avatarDisplay}</div>
                          <div className="friend-info">
                            <div className="friend-name">{request.name}</div>
                            <div className="friend-email">{request.email}</div>
                            <div className="friend-message">{request.message}</div>
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
                      )
                    })
                  )}
                </div>
              )}

              {activeTab === 'discover' && (
                <div className="friends-list">
                  {/* Search Results */}
                  {searchQuery.length >= 2 && (
                    <div className="discover-section">
                      <h3>Search Results</h3>
                      {isSearching ? (
                        <div className="friends-empty">
                          <div className="loading-spinner">Searching...</div>
                        </div>
                      ) : searchResults.length === 0 ? (
                        <div className="friends-empty">
                          <div className="friends-empty-icon">🔍</div>
                          <h3>No users found</h3>
                          <p>Try a different search term</p>
                        </div>
                      ) : (
                        searchResults.map(user => {
                          // Determine avatar display
                          let avatarDisplay
                          if (user.avatar_url && user.avatar_url.startsWith('http')) {
                            avatarDisplay = <img src={user.avatar_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                          } else if (user.first_name || user.last_name) {
                            avatarDisplay = (user.first_name || user.last_name)[0].toUpperCase()
                          } else {
                            avatarDisplay = user.email[0].toUpperCase()
                          }

                          return (
                            <div key={user.id} className="friend-card">
                              <div className="friend-avatar">
                                {avatarDisplay}
                                {user.is_online && <span className="friend-status-online"></span>}
                              </div>
                              <div className="friend-info">
                                <div className="friend-name">
                                  {user.first_name || user.last_name ? `${user.first_name} ${user.last_name}` : user.email}
                                </div>
                                <div className="friend-email">{user.email}</div>
                                <div className="friend-meta">
                                  <span className={`friend-status ${user.is_online ? 'friend-status-online' : 'friend-status-offline'}`}>
                                    {user.is_online ? 'Online' : 'Offline'}
                                  </span>
                                </div>
                              </div>
                              <div className="friend-actions">
                                <button
                                  className="btn btn-sm btn-primary"
                                  onClick={() => handleSendRequest(user.id)}
                                  disabled={isLoading}
                                >
                                  Add Friend
                                </button>
                                <button className="btn btn-sm btn-ghost">Profile</button>
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>
                  )}

                  {/* Empty state when not searching */}
                  {searchQuery.length < 2 && (
                    <div className="friends-empty">
                      <div className="friends-empty-icon">🔍</div>
                      <h3>Search for users</h3>
                      <p>Type at least 2 characters to search for users by email or name</p>
                    </div>
                  )}

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
