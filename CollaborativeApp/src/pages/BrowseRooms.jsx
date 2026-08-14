import '../styles/pages.css'
import ThemeToggle from '../components/ThemeToggle'
import { useAuth } from '../context/AuthContext'

export default function BrowseRooms(){
  const { isAuthenticated } = useAuth()
  
  const rooms = [
    { id: 1, name: 'Calculus 101 Study Group', subject: 'Mathematics', participants: 8, status: 'active' },
    { id: 2, name: 'Organic Chemistry Review', subject: 'Science', participants: 3, status: 'active' },
    { id: 3, name: 'World History Discussion', subject: 'History', participants: 12, status: 'active' },
    { id: 4, name: 'Literature Analysis', subject: 'Literature', participants: 5, status: 'active' },
    { id: 5, name: 'Computer Science Algorithms', subject: 'Computer Science', participants: 15, status: 'active' },
  ]

  return (
    <div className="page-root">
      <header className="page-header">
        <div className="page-header-brand">
          <a href="#/" className="page-header-logo">📚</a>
          <a href="#/" className="page-header-title">CollaborativeApp</a>
        </div>
        <nav className="page-header-nav">
          {isAuthenticated ? (
            <>
              <a href="#/dashboard" className="btn btn-ghost btn-sm">Dashboard</a>
              <a href="#/profile" className="btn btn-primary btn-sm">Profile</a>
            </>
          ) : (
            <>
              <a href="#/login" className="btn btn-ghost btn-sm">Sign In</a>
              <a href="#/signup" className="btn btn-primary btn-sm">Sign Up</a>
            </>
          )}
          <a href="#/create" className="btn btn-primary btn-sm">Create Room</a>
          <ThemeToggle />
          <a href="#/" className="btn btn-ghost btn-sm">Back to Home</a>
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

            <ul className="rooms-list">
              {rooms.map(room => (
                <li key={room.id} className="room-card">
                  <div className="room-info">
                    <h3 className="room-name">{room.name}</h3>
                    <div className="room-details">
                      <span className="room-subject">{room.subject}</span>
                      <div className="room-participants">
                        <span className="room-participants-icon">👥</span>
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
          </div>
        </div>
      </div>

      <footer className="page-footer">
        <p>© {new Date().getFullYear()} CollaborativeApp — Built for students</p>
      </footer>
    </div>
  )
}
