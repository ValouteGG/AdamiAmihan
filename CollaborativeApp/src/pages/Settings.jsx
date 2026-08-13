import { useState } from 'react'
import '../styles/pages.css'
import ThemeToggle from '../components/ThemeToggle'
import { useTheme } from '../context/ThemeContext'
import ProtectedRoute from '../components/ProtectedRoute'
import { useAuth } from '../context/AuthContext'

export default function Settings() {
  const { theme, setThemeMode } = useTheme()
  const { logout } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [settings, setSettings] = useState({
    // Notifications
    emailNotifications: true,
    pushNotifications: false,
    roomInvites: true,
    reminderMessages: true,
    weeklyDigest: false,
    
    // Privacy
    profileVisibility: 'public',
    showOnlineStatus: true,
    allowDirectMessages: true,
    
    // Appearance
    fontSize: 'medium',
    compactMode: false,
    
    // Accessibility
    reducedMotion: false,
    highContrast: false,
    
    // Account
    deleteAccount: false
  })

  const handleToggle = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const handleSelect = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // ============================================
      // BACKEND INTEGRATION PLACEHOLDER
      // ============================================
      // Replace this setTimeout with your actual API call
      // Example:
      // const response = await fetch('/api/user/settings', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(settings)
      // })
      // const data = await response.json()
      // if (response.ok) {
      //     console.log('Settings saved:', data)
      //     alert('Settings saved successfully!')
      // } else {
      //     setError(data.message || 'Failed to save settings')
      // }
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Settings saved:', settings)
      alert('Settings saved successfully!')
    } catch (err) {
      console.error('Settings save error:', err)
      alert('Failed to save settings. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // ============================================
      // BACKEND INTEGRATION PLACEHOLDER
      // ============================================
      // Replace this with actual account deletion logic
      // Example:
      // const response = await fetch('/api/user/account', {
      //   method: 'DELETE'
      // })
      // if (response.ok) {
      //     window.location.hash = '#/login'
      // }
      
      console.log('Account deletion requested')
      alert('Account deletion requires backend integration')
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
          <div className="settings-header">
            <h1 className="page-title">Settings</h1>
            <p className="page-subtitle">Customize your experience and manage your account</p>
          </div>

          <div className="settings-container">
            {/* Notifications Section */}
            <div className="settings-section">
              <h2 className="settings-section-title">Notifications</h2>
              <div className="settings-item">
                <div className="settings-item-info">
                  <div className="settings-item-label">Email Notifications</div>
                  <div className="settings-item-description">Receive updates via email</div>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={() => handleToggle('emailNotifications')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="settings-item">
                <div className="settings-item-info">
                  <div className="settings-item-label">Push Notifications</div>
                  <div className="settings-item-description">Receive browser push notifications</div>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.pushNotifications}
                    onChange={() => handleToggle('pushNotifications')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="settings-item">
                <div className="settings-item-info">
                  <div className="settings-item-label">Room Invites</div>
                  <div className="settings-item-description">Get notified when invited to rooms</div>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.roomInvites}
                    onChange={() => handleToggle('roomInvites')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="settings-item">
                <div className="settings-item-info">
                  <div className="settings-item-label">Reminder Messages</div>
                  <div className="settings-item-description">Study session reminders</div>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.reminderMessages}
                    onChange={() => handleToggle('reminderMessages')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="settings-item">
                <div className="settings-item-info">
                  <div className="settings-item-label">Weekly Digest</div>
                  <div className="settings-item-description">Weekly summary of activity</div>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.weeklyDigest}
                    onChange={() => handleToggle('weeklyDigest')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

            {/* Privacy Section */}
            <div className="settings-section">
              <h2 className="settings-section-title">Privacy</h2>
              <div className="settings-item">
                <div className="settings-item-info">
                  <div className="settings-item-label">Profile Visibility</div>
                  <div className="settings-item-description">Who can see your profile</div>
                </div>
                <select
                  className="settings-select"
                  value={settings.profileVisibility}
                  onChange={(e) => handleSelect('profileVisibility', e.target.value)}
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                  <option value="friends">Friends Only</option>
                </select>
              </div>
              <div className="settings-item">
                <div className="settings-item-info">
                  <div className="settings-item-label">Show Online Status</div>
                  <div className="settings-item-description">Let others see when you're online</div>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.showOnlineStatus}
                    onChange={() => handleToggle('showOnlineStatus')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="settings-item">
                <div className="settings-item-info">
                  <div className="settings-item-label">Allow Direct Messages</div>
                  <div className="settings-item-description">Receive messages from other users</div>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.allowDirectMessages}
                    onChange={() => handleToggle('allowDirectMessages')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

            {/* Appearance Section */}
            <div className="settings-section">
              <h2 className="settings-section-title">Appearance</h2>
              <div className="settings-item">
                <div className="settings-item-info">
                  <div className="settings-item-label">Theme</div>
                  <div className="settings-item-description">Choose your preferred theme</div>
                </div>
                <select
                  className="settings-select"
                  value={theme}
                  onChange={(e) => setThemeMode(e.target.value)}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>
              <div className="settings-item">
                <div className="settings-item-info">
                  <div className="settings-item-label">Font Size</div>
                  <div className="settings-item-description">Adjust text size</div>
                </div>
                <select
                  className="settings-select"
                  value={settings.fontSize}
                  onChange={(e) => handleSelect('fontSize', e.target.value)}
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>
              <div className="settings-item">
                <div className="settings-item-info">
                  <div className="settings-item-label">Compact Mode</div>
                  <div className="settings-item-description">Use more compact layout</div>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.compactMode}
                    onChange={() => handleToggle('compactMode')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

            {/* Accessibility Section */}
            <div className="settings-section">
              <h2 className="settings-section-title">Accessibility</h2>
              <div className="settings-item">
                <div className="settings-item-info">
                  <div className="settings-item-label">Reduced Motion</div>
                  <div className="settings-item-description">Minimize animations</div>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.reducedMotion}
                    onChange={() => handleToggle('reducedMotion')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="settings-item">
                <div className="settings-item-info">
                  <div className="settings-item-label">High Contrast</div>
                  <div className="settings-item-description">Increase color contrast</div>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.highContrast}
                    onChange={() => handleToggle('highContrast')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="settings-section settings-section-danger">
              <h2 className="settings-section-title">Danger Zone</h2>
              <div className="settings-item">
                <div className="settings-item-info">
                  <div className="settings-item-label">Sign Out</div>
                  <div className="settings-item-description">Sign out of your account</div>
                </div>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={logout}
                >
                  Sign Out
                </button>
              </div>
              <div className="settings-item">
                <div className="settings-item-info">
                  <div className="settings-item-label">Delete Account</div>
                  <div className="settings-item-description">Permanently delete your account and all data</div>
                </div>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={handleDeleteAccount}
                >
                  Delete Account
                </button>
              </div>
            </div>

            {/* Save Button */}
            <div className="settings-actions">
              <button
                className="btn btn-primary"
                onClick={handleSave}
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
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
