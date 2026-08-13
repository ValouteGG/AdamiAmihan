import '../styles/pages.css'

export default function CreateRoom(){
  return (
    <div className="page-root">
      <header className="page-header">
        <div className="page-header-brand">
          <div className="page-header-logo">📚</div>
          <h1 className="page-header-title">CollaborativeApp</h1>
        </div>
        <nav className="page-header-nav">
          <a href="#/login" className="btn btn-ghost btn-sm">Sign In</a>
          <a href="#/signup" className="btn btn-primary btn-sm">Sign Up</a>
          <a href="#/" className="btn btn-ghost btn-sm">Back to Home</a>
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
  )
}
