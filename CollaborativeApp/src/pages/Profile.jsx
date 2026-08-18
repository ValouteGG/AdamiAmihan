import { useState, useEffect } from 'react'
import '../styles/pages.css'
import ThemeToggle from '../components/ThemeToggle'
import ProtectedRoute from '../components/ProtectedRoute'
import { useAuth } from '../context/AuthContext'
import { BookOpen } from 'lucide-react'
import { supabase } from '../config/supabase'

export default function Profile() {
  const { user, refreshUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [stats, setStats] = useState({
    rooms: 0,
    sessions: 0,
    hours: 0
  })
  const [statsLoading, setStatsLoading] = useState(true)
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    bio: '',
    avatar: null,
    timezone: 'UTC-5',
    language: 'en'
  })

  // Initialize profile with real user data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        try {
          const { data: { session } } = await supabase.auth.getSession()
          
          if (!session?.access_token) {
            return
          }

          const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          }

          // Try to fetch user profile from backend
          const response = await fetch('http://localhost:4002/api/user/profile', {
            headers
          })

          if (response.ok) {
            const data = await response.json()
            if (data.profile) {
              setProfile({
                firstName: data.profile.first_name || user.user_metadata?.first_name || '',
                lastName: data.profile.last_name || user.user_metadata?.last_name || '',
                email: data.profile.email || user.email || '',
                bio: data.profile.bio || 'Passionate learner and collaborative problem solver',
                avatar: data.profile.avatar_url || user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
                timezone: data.profile.timezone || 'UTC-5',
                language: data.profile.language || 'en'
              })
            }
          } else {
            // Fallback to user metadata
            setProfile({
              firstName: user.user_metadata?.first_name || user.email?.split('@')[0] || '',
              lastName: user.user_metadata?.last_name || '',
              email: user.email || '',
              bio: 'Passionate learner and collaborative problem solver',
              avatar: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
              timezone: 'UTC-5',
              language: 'en'
            })
          }
        } catch (error) {
          console.error('Error fetching user profile:', error)
          // Fallback to user metadata
          setProfile({
            firstName: user.user_metadata?.first_name || user.email?.split('@')[0] || '',
            lastName: user.user_metadata?.last_name || '',
            email: user.email || '',
            bio: 'Passionate learner and collaborative problem solver',
            avatar: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
            timezone: 'UTC-5',
            language: 'en'
          })
        }
      }
    }

    fetchUserProfile()
  }, [user])

  // Fetch user statistics from backend
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true)
        const { data: { session } } = await supabase.auth.getSession()
        
        const headers = {
          'Content-Type': 'application/json',
        }
        
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`
        }

        const response = await fetch('http://localhost:4002/api/user/stats', {
          headers
        })
        
        if (response.ok) {
          const data = await response.json()
          setStats(data.stats || { rooms: 0, sessions: 0, hours: 0 })
        } else {
          console.error('Failed to fetch user stats')
          setStats({ rooms: 0, sessions: 0, hours: 0 })
        }
      } catch (error) {
        console.error('Error fetching user stats:', error)
        setStats({ rooms: 0, sessions: 0, hours: 0 })
      } finally {
        setStatsLoading(false)
      }
    }

    fetchStats()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setProfile(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        alert('You must be logged in to update your profile')
        return
      }

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      }

      const response = await fetch('http://localhost:4002/api/auth/update-profile', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          userId: user.id,
          firstName: profile.firstName,
          lastName: profile.lastName,
          avatarUrl: profile.avatar
        })
      })

      const data = await response.json()

      if (response.ok) {
        // Update Supabase user metadata as well
        const { error: metadataError } = await supabase.auth.updateUser({
          data: {
            first_name: profile.firstName,
            last_name: profile.lastName
          }
        })

        if (metadataError) {
          console.error('Error updating user metadata:', metadataError)
        }

        alert('Profile updated successfully!')
        setIsEditing(false)
        
        // Refresh user data throughout the app
        await refreshUser()
      } else {
        console.error('Failed to update profile:', data.error)
        alert('Failed to update profile: ' + (data.error || 'Unknown error'))
      }
    } catch (err) {
      console.error('Profile update error:', err)
      alert('Failed to update profile: ' + err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (file) {
      // ============================================
      // BACKEND INTEGRATION PLACEHOLDER
      // ============================================
      // Replace this with actual file upload logic
      // Example:
      // const formData = new FormData()
      // formData.append('avatar', file)
      // const response = await fetch('/api/user/avatar', {
      //   method: 'POST',
      //   body: formData
      // })
      
      console.log('Avatar upload:', file.name)
      // For demo, just show a preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfile(prev => ({ ...prev, avatar: reader.result }))
      }
      reader.readAsDataURL(file)
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
              <span className="page-header-current">Profile</span>
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
            <a href="#/settings" className="btn btn-ghost btn-sm">Settings</a>
          </nav>
        </header>

      <div className="page-content">
        <div className="page-inner">
          <div className="profile-header">
            <h1 className="page-title">My Profile</h1>
            <p className="page-subtitle">Manage your personal information and preferences</p>
          </div>

          <div className="profile-container">
            <div className="profile-sidebar">
              <div className="profile-avatar-section">
                <div className="profile-avatar">
                  {profile.avatar && typeof profile.avatar === 'string' && !profile.avatar.startsWith('/') ? (
                    <img src={profile.avatar} alt="Profile" className="profile-avatar-image" />
                  ) : (
                    <div className="profile-avatar-placeholder">
                      {profile.firstName ? profile.firstName[0] : profile.email ? profile.email[0] : '?'}{profile.lastName ? profile.lastName[0] : ''}
                    </div>
                  )}
                </div>
                {isEditing && (
                  <div className="profile-avatar-upload">
                    <label className="btn btn-sm btn-ghost">
                      Change Avatar
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>

              <div className="profile-stats">
                <div className="profile-stat">
                  <div className="profile-stat-value">{statsLoading ? '...' : stats.rooms}</div>
                  <div className="profile-stat-label">Rooms</div>
                </div>
                <div className="profile-stat">
                  <div className="profile-stat-value">{statsLoading ? '...' : stats.sessions}</div>
                  <div className="profile-stat-label">Sessions</div>
                </div>
                <div className="profile-stat">
                  <div className="profile-stat-value">{statsLoading ? '...' : stats.hours}</div>
                  <div className="profile-stat-label">Hours</div>
                </div>
              </div>
            </div>

            <div className="profile-main">
              <div className="profile-card">
                <div className="profile-card-header">
                  <h2 className="profile-card-title">Personal Information</h2>
                  {!isEditing ? (
                    <button
                      className="btn btn-sm btn-ghost"
                      onClick={() => setIsEditing(true)}
                    >
                      Edit
                    </button>
                  ) : (
                    <div className="profile-card-actions">
                      <button
                        className="btn btn-sm btn-ghost"
                        onClick={() => setIsEditing(false)}
                        disabled={isLoading}
                      >
                        Cancel
                      </button>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={handleSave}
                        disabled={isLoading}
                      >
                        {isLoading ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  )}
                </div>

                <div className="profile-form">
                  <div className="form-row">
                    <div className="form-label">
                      <span className="form-label-text">First Name</span>
                      <input
                        type="text"
                        name="firstName"
                        className="form-input"
                        value={profile.firstName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="form-label">
                      <span className="form-label-text">Last Name</span>
                      <input
                        type="text"
                        name="lastName"
                        className="form-input"
                        value={profile.lastName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="form-label">
                    <span className="form-label-text">Email</span>
                    <input
                      type="email"
                      name="email"
                      className="form-input"
                      value={profile.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="form-label">
                    <span className="form-label-text">Bio</span>
                    <textarea
                      name="bio"
                      className="form-textarea"
                      value={profile.bio}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      rows={4}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-label">
                      <span className="form-label-text">Timezone</span>
                      <select
                        name="timezone"
                        className="form-select"
                        value={profile.timezone}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      >
                        <option value="UTC-8">UTC-8 (Pacific Time)</option>
                        <option value="UTC-5">UTC-5 (Eastern Time)</option>
                        <option value="UTC+0">UTC+0 (GMT)</option>
                        <option value="UTC+1">UTC+1 (Central European)</option>
                        <option value="UTC+8">UTC+8 (Singapore)</option>
                      </select>
                    </div>
                    <div className="form-label">
                      <span className="form-label-text">Language</span>
                      <select
                        name="language"
                        className="form-select"
                        value={profile.language}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                        <option value="zh">Chinese</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="profile-card">
                <div className="profile-card-header">
                  <h2 className="profile-card-title">Account Status</h2>
                </div>
                <div className="profile-status">
                  <div className="profile-status-item">
                    <div className="profile-status-label">Account Type</div>
                    <div className="profile-status-value">Student</div>
                  </div>
                  <div className="profile-status-item">
                    <div className="profile-status-label">User ID</div>
                    <div className="profile-status-value">{user?.id || 'N/A'}</div>
                  </div>
                  <div className="profile-status-item">
                    <div className="profile-status-label">Email Verified</div>
                    <div className="profile-status-value status-verified">✓ Verified</div>
                  </div>
                </div>
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
