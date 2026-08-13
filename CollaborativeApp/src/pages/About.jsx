import '../styles/pages.css'

export default function About(){
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
          <h1 className="page-title">About CollaborativeApp</h1>
          <p className="page-subtitle">Built to help students study together — a lightweight prototype for live collaboration and study tools.</p>
          
          <div className="about-content">
            <div className="about-section">
              <h2 className="about-section-title">
                <span className="about-section-icon">🎯</span>
                Our Mission
              </h2>
              <div className="about-section-content">
                <p>CollaborativeApp is designed to make group study sessions effortless and engaging. We believe that learning together is better than learning alone, and our platform provides the tools students need to collaborate effectively in real-time.</p>
              </div>
            </div>

            <div className="about-section">
              <h2 className="about-section-title">
                <span className="about-section-icon">✨</span>
                What We Offer
              </h2>
              <div className="about-section-content">
                <p>Our platform combines essential study tools with AI-driven insights to help students and teams maximize their productivity and learning outcomes. From shared notes to live collaboration, we've got everything you need for successful study sessions.</p>
              </div>
            </div>

            <div className="about-section">
              <h2 className="about-section-title">
                <span className="about-section-icon">👥</span>
                Our Team
              </h2>
              <div className="about-section-content">
                <p>Built by students, for students. Our team understands the challenges of collaborative learning and has designed this platform with real student needs in mind.</p>
                
                <div className="team-grid">
                  <div className="team-member">
                    <div className="team-member-avatar">AA</div>
                    <h3 className="team-member-name">Adrian Philip Amihan</h3>
                    <p className="team-member-role">Co-Founder & Developer</p>
                  </div>
                  <div className="team-member">
                    <div className="team-member-avatar">MA</div>
                    <h3 className="team-member-name">Matthew Adami</h3>
                    <p className="team-member-role">Co-Founder & Developer</p>
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
  )
}
