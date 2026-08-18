import { useState } from 'react'
import '../styles/pages.css'
import ThemeToggle from '../components/ThemeToggle'
import ProtectedRoute from '../components/ProtectedRoute'
import { BookOpen } from 'lucide-react'
import { supabase } from '../config/supabase'

export default function CreateRoom(){
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    visibility: 'private',
    description: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        setError('You must be logged in to create a room')
        setIsLoading(false)
        return
      }

      const response = await fetch('http://localhost:4002/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      console.log('Room creation response:', data)

      if (response.ok) {
        // Room created successfully, redirect to the new room
        console.log('Redirecting to room:', data.room.id)
        window.location.hash = `#/room/${data.room.id}`
      } else {
        console.error('Room creation failed:', data.error)
        setError(data.error || 'Failed to create room')
      }
    } catch (err) {
      console.error('Error creating room:', err)
      setError('Failed to create room. Please try again.')
    } finally {
      setIsLoading(false)
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
              <span className="page-header-current">Create Room</span>
            </div>
          </div>
          <nav className="page-header-nav">
            <a href="#/dashboard" className="btn btn-ghost btn-sm">Dashboard</a>
            <a href="#/browse" className="btn btn-ghost btn-sm">Browse Rooms</a>
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
            <h1 className="page-title">Create a Study Room</h1>
            <p className="page-subtitle">Create a private room, invite classmates, and start collaborating right away.</p>
            
            <div className="form-container">
              <form className="form" onSubmit={handleSubmit}>
                {error && (
                  <div className="form-error">
                    {error}
                  </div>
                )}
                
                <div className="form-section">
                  <h3 className="form-section-title">Room Details</h3>
                  
                  <div className="form-label">
                    <span className="form-label-text">
                      Room name
                      <span className="form-label-required"></span>
                    </span>
                    <input 
                      type="text" 
                      name="name"
                      className="form-input" 
                      placeholder="e.g. Calculus study group"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-label">
                    <span className="form-label-text">Subject</span>
                    <select 
                      name="subject"
                      className="form-select"
                      value={formData.subject}
                      onChange={handleChange}
                    >
                      <option value="">Select a subject</option>
                      <option value="math">Mathematics</option>
                      <option value="science">Science</option>
                      <option value="history">History</option>
                      <option value="literature">Literature</option>
                      <option value="computer-science">Computer Science</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="form-label">
                    <span className="form-label-text">Visibility</span>
                    <select 
                      name="visibility"
                      className="form-select"
                      value={formData.visibility}
                      onChange={handleChange}
                    >
                      <option value="private">Private - Invite only</option>
                      <option value="public">Public - Anyone can join</option>
                    </select>
                  </div>

                  <div className="form-label">
                    <span className="form-label-text">Description (optional)</span>
                    <textarea 
                      name="description"
                      className="form-textarea" 
                      placeholder="Describe what you'll be studying..."
                      value={formData.description}
                      onChange={handleChange}
                      rows={4}
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <a href="#/" className="btn btn-ghost">Cancel</a>
                  <button type="submit" className="btn btn-primary" disabled={isLoading}>
                    {isLoading ? 'Creating...' : 'Create Room'}
                  </button>
                </div>
              </form>
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
