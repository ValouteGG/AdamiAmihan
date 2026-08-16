import '../styles/pages.css'
import ThemeToggle from '../components/ThemeToggle'
import ProtectedRoute from '../components/ProtectedRoute'
import { BookOpen } from 'lucide-react'

export default function CreateRoom(){
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
              <form className="form">
                <div className="form-section">
                  <h3 className="form-section-title">Room Details</h3>
                  
                  <div className="form-label">
                    <span className="form-label-text">
                      Room name
                      <span className="form-label-required">*</span>
                    </span>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. Calculus study group" 
                    />
                  </div>

                  <div className="form-label">
                    <span className="form-label-text">Subject</span>
                    <select className="form-select">
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
                    <select className="form-select">
                      <option value="private">Private - Invite only</option>
                      <option value="public">Public - Anyone can join</option>
                    </select>
                  </div>

                  <div className="form-label">
                    <span className="form-label-text">Description (optional)</span>
                    <textarea 
                      className="form-textarea" 
                      placeholder="Describe what you'll be studying..."
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <a href="#/" className="btn btn-ghost">Cancel</a>
                  <button type="submit" className="btn btn-primary">Create Room</button>
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
