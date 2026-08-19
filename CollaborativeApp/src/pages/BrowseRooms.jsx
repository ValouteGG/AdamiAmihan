import '../styles/pages.css'
import '../styles/room-cards.css'
import ThemeToggle from '../components/ThemeToggle'
import { useAuth } from '../context/AuthContext'
import { BookOpen, Users } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '../config/supabase'

export default function BrowseRooms(){
  const { isAuthenticated } = useAuth()
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [joiningRoom, setJoiningRoom] = useState(null)
  
  // Fetch real rooms from backend
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true)
        
        // Try to fetch rooms, fallback to empty state if endpoint doesn't exist
        try {
          const response = await fetch('http://localhost:4002/api/rooms/public', {
            headers: {
              'Content-Type': 'application/json',
            }
          })
          
          if (response.ok) {
            const data = await response.json()
            console.log('Public rooms data received:', data)
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

  const handleJoinRoom = async (roomId) => {
    try {
      setJoiningRoom(roomId)
      
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        alert('You must be logged in to join a room')
        window.location.hash = '#/login'
        return
      }

      const response = await fetch(`http://localhost:4002/api/rooms/${roomId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const data = await response.json()

      if (response.ok) {
        console.log('Successfully joined room:', roomId)
        alert('Successfully joined the room!')
        // Redirect to the room
        window.location.hash = `#/room/${roomId}`
      } else {
        console.error('Failed to join room:', data.error)
        alert(data.error || 'Failed to join room')
      }
    } catch (error) {
      console.error('Error joining room:', error)
      alert('Failed to join room. Please try again.')
    } finally {
      setJoiningRoom(null)
    }
  }

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
                    <div className="room-card-header">
                      <div className="room-icon">
                        <BookOpen size={24} />
                      </div>
                      <div className="room-title-section">
                        <h3 className="room-title" onClick={() => window.location.hash = `#/room/${room.id}`}>{room.name}</h3>
                        <span className="room-subject-badge">{room.subject}</span>
                      </div>
                      <div className="room-participants-badge">
                        <Users size={16} />
                        <span>{room.participants}</span>
                      </div>
                    </div>
                    
                    <div className="room-card-body">
                      <div className="room-status-row">
                        <div className="room-status-indicator active">
                          <span className="status-dot"></span>
                          <span>Active now</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="room-card-footer">
                      <button 
                        className="btn btn-join"
                        onClick={() => handleJoinRoom(room.id)}
                        disabled={joiningRoom === room.id}
                      >
                        <Users size={16} />
                        {joiningRoom === room.id ? 'Joining...' : 'Join Room'}
                      </button>
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
