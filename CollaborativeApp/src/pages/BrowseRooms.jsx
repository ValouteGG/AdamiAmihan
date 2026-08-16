import '../styles/pages.css'
import ThemeToggle from '../components/ThemeToggle'
import { useAuth } from '../context/AuthContext'
import { BookOpen, Users } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '../config/supabase'

export default function BrowseRooms(){
  const { isAuthenticated } = useAuth()
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Fetch real rooms from backend
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true)
        const { data: { session } } = await supabase.auth.getSession()
        
        const headers = {
          'Content-Type': 'application/json',
        }
        
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`
        }

        // Try to fetch rooms, fallback to empty state if endpoint doesn't exist
        try {
          const response = await fetch('http://localhost:4002/api/rooms/public', {
            headers
          })
          
          if (response.ok) {
            const data = await response.json()
            setRooms(data.rooms || [])
          } else {
            console.log('Rooms endpoint not available, using empty state')
          }
        } catch (apiError) {
          console.log('Rooms API call failed, using empty state:', apiError.message)
        }
      } catch (error) {
        console.error('Error fetching rooms:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRooms()
  }, [])

  return (
    <div className="page-root">
      <header className="page-header">
        <div className="page-header-brand">
          <a href="#/" className="page-header-logo">
            <BookOpen size={24} />
          </a>
          <div className="page-header-brand-text">
            <a href="#/" className="page-header-title">CollaborativeApp</a>
            <span className="page-header-current">Browse Rooms</span>
          </div>
        </div>
        <nav className="page-header-nav">
          {isAuthenticated ? (
            <>
              <a href="#/dashboard" className="btn btn-ghost btn-sm">Dashboard</a>
              <a href="#/create" className="btn btn-primary btn-sm">Create Room</a>
              <a href="#/friends" className="btn btn-ghost btn-sm">Friends</a>
              <a href="#/messages" className="btn btn-ghost btn-sm">Messages</a>
              <a href="#/calendar" className="btn btn-ghost btn-sm">Calendar</a>
              <ThemeToggle />
              <a href="#/profile" className="btn btn-ghost btn-sm">Profile</a>
              <a href="#/settings" className="btn btn-ghost btn-sm">Settings</a>
            </>
          ) : (
            <>
              <a href="#/login" className="btn btn-ghost btn-sm">Sign In</a>
              <a href="#/signup" className="btn btn-primary btn-sm">Sign Up</a>
              <ThemeToggle />
              <a href="#/" className="btn btn-ghost btn-sm">Back to Home</a>
            </>
          )}
        </nav>
      </header>

      <div className="page-content">
        <div className="page-inner">
          <h1 className="page-title">Browse Public Rooms</h1>
          <p className="page-subtitle">Discover active study sessions and join public rooms of interest.</p>
          
          <div className="rooms-container">
            <div className="rooms-header">
              <h2 className="rooms-title">Available Rooms</h2>
              <span className="rooms-count">{rooms.length} active rooms</span>
            </div>

            {loading ? (
              <div className="loading-state">Loading rooms...</div>
            ) : rooms.length === 0 ? (
              <div className="empty-state">
                <Users size={48} className="empty-icon" />
                <h3>No public rooms available</h3>
                <p>Be the first to create a public study room!</p>
              </div>
            ) : (
              <ul className="rooms-list">
                {rooms.map(room => (
                  <li key={room.id} className="room-card">
                    <div className="room-info">
                      <h3 className="room-name">{room.name}</h3>
                      <div className="room-details">
                        <span className="room-subject">{room.subject}</span>
                        <div className="room-participants">
                          <Users size={16} className="room-participants-icon" />
                          <span>{room.participants} participants</span>
                        </div>
                        <span className="room-status room-status-active">Active now</span>
                      </div>
                    </div>
                    <div className="room-actions">
                      <button className="btn btn-primary btn-sm">Join Room</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <footer className="page-footer">
        <p>© {new Date().getFullYear()} CollaborativeApp — Built for students</p>
      </footer>
    </div>
  )
}
