import './home.css'
import logo from './assets/logo.svg'
import hero from './assets/hero-student.svg'

function Home() {
  return (
    <div className="home-root">
      <header className="site-header">
        <div className="brand">
          <img src={logo} alt="Logo" className="logo" />
          <div>
            <h1 className="title">CollaborativeApp</h1>
            <div className="tag">Study together • Share faster • Learn smarter</div>
          </div>
        </div>
        <nav className="main-nav">
          <a href="#features">Features</a>
          <a href="#how">How it works</a>
          <a href="#about">About</a>
        </nav>
      </header>

      <main>
        <section className="hero student-hero">
          <div className="hero-content">
            <h2>Make group study effortless</h2>
            <p className="lead">Join classmates in live study rooms, share notes, plan assignments, and level up with friendly challenges.</p>
            <div className="cta-row">
              <button className="btn primary">Create a study room</button>
              <button className="btn ghost">Browse public rooms</button>
            </div>
            <div className="trust">
              <span className="badge">Free for students</span>
              <span className="badge muted">No credit card</span>
              <span className="badge">Collaborative notes</span>
            </div>
          </div>
          <div className="hero-visual">
            <img src={hero} alt="Students collaborating illustration" />
          </div>
        </section>

        <section id="features" className="features">
          <h3>Student-focused building blocks</h3>
          <div className="feature-grid">
            <article className="feature">
              <h4>Live Study Rooms</h4>
              <p>Create temporary rooms for group sessions with synced cursors and voice chat.</p>
            </article>
            <article className="feature">
              <h4>Shared Notes</h4>
              <p>Collaborative documents with version history and highlights.</p>
            </article>
            <article className="feature">
              <h4>Assignments & Tasks</h4>
              <p>Track deadlines, assign work, and get reminders.</p>
            </article>
            <article className="feature">
              <h4>Study Gamification</h4>
              <p>Earn badges, streaks, and friendly leaderboards to stay motivated.</p>
            </article>
          </div>
        </section>

        <section id="how" className="how">
          <h3>How it works</h3>
          <div className="steps">
            <div className="step">
              <div className="step-num">1</div>
              <div>
                <h4>Start a room</h4>
                <p>Invite friends or join a public session.</p>
              </div>
            </div>
            <div className="step">
              <div className="step-num">2</div>
              <div>
                <h4>Share notes</h4>
                <p>Collaborate in real time with live cursors.</p>
              </div>
            </div>
            <div className="step">
              <div className="step-num">3</div>
              <div>
                <h4>Study & review</h4>
                <p>Use flashcards, quizzes, and challenges.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="testimonial">
          <blockquote>
            “This made study groups actually fun — we finished assignments faster and remembered more.”
            <cite>— Maya, Computer Science</cite>
          </blockquote>
        </section>
      </main>

      <footer className="site-footer">
        <div>© {new Date().getFullYear()} CollaborativeApp — Built for students</div>
        <div className="footer-links">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
        </div>
      </footer>
    </div>
  )
}

export default Home
