import '../styles/pages.css'
import ThemeToggle from '../components/ThemeToggle'
import { useAuth } from '../context/AuthContext'
import { BookOpen, Target, Sparkles, Users, Award, Zap, Globe, Heart } from 'lucide-react'

export default function About(){
  const { isAuthenticated } = useAuth()
  
  return (
    <div className="page-root">
      <header className="page-header">
        <div className="page-header-brand">
          <a href="#/" className="page-header-logo">
            <BookOpen size={24} />
          </a>
          <div className="page-header-brand-text">
            <a href="#/" className="page-header-title">CollaborativeApp</a>
            <span className="page-header-current">About</span>
          </div>
        </div>
        <nav className="page-header-nav">
          <a href="#/features" className="btn btn-ghost btn-sm">Features</a>
          <a href="#/help" className="btn btn-ghost btn-sm">Help</a>
          {isAuthenticated ? (
            <>
              <a href="#/dashboard" className="btn btn-ghost btn-sm">Dashboard</a>
              <ThemeToggle />
              <a href="#/profile" className="btn btn-ghost btn-sm">Profile</a>
            </>
          ) : (
            <>
              <a href="#/login" className="btn btn-ghost btn-sm">Sign In</a>
              <a href="#/signup" className="btn btn-primary btn-sm">Sign Up</a>
              <ThemeToggle />
            </>
          )}
        </nav>
      </header>

      <div className="page-content">
        <div className="page-inner">
          {/* Hero Section */}
          <div className="about-hero">
            <div className="about-hero-content">
              <div className="about-hero-badge">
                <Target size={16} />
                <span>Our Story</span>
              </div>
              <h1 className="about-hero-title">Empowering Students Through Collaboration</h1>
              <p className="about-hero-description">
                CollaborativeApp was built with a simple mission: to make group study sessions effortless, engaging, and effective. We believe that learning together is better than learning alone.
              </p>
              <div className="about-hero-stats">
                <div className="about-stat">
                  <div className="about-stat-value">10K+</div>
                  <div className="about-stat-label">Students</div>
                </div>
                <div className="about-stat-divider"></div>
                <div className="about-stat">
                  <div className="about-stat-value">500+</div>
                  <div className="about-stat-label">Study Rooms</div>
                </div>
                <div className="about-stat-divider"></div>
                <div className="about-stat">
                  <div className="about-stat-value">50K+</div>
                  <div className="about-stat-label">Study Hours</div>
                </div>
              </div>
            </div>
            <div className="about-hero-visual">
              <div className="about-hero-icon">
                <Users size={120} />
              </div>
            </div>
          </div>

          {/* Mission Section */}
          <div className="about-mission">
            <div className="about-mission-icon">
              <Target size={48} />
            </div>
            <h2 className="about-mission-title">Our Mission</h2>
            <p className="about-mission-text">
              We're committed to transforming how students learn together by providing intuitive tools that foster real-time collaboration, seamless communication, and effective study management. Every feature we build is designed with the student experience at its core.
            </p>
          </div>

          {/* Values Grid */}
          <div className="about-values">
            <h2 className="about-section-heading">What We Stand For</h2>
            <div className="values-grid">
              <div className="value-card">
                <div className="value-icon">
                  <Sparkles size={32} />
                </div>
                <h3 className="value-title">Innovation</h3>
                <p className="value-description">Continuously improving our platform with cutting-edge features and AI-driven insights.</p>
              </div>
              <div className="value-card">
                <div className="value-icon">
                  <Heart size={32} />
                </div>
                <h3 className="value-title">Community</h3>
                <p className="value-description">Building a supportive environment where students can learn and grow together.</p>
              </div>
              <div className="value-card">
                <div className="value-icon">
                  <Zap size={32} />
                </div>
                <h3 className="value-title">Efficiency</h3>
                <p className="value-description">Streamlining study workflows to maximize productivity and minimize friction.</p>
              </div>
              <div className="value-card">
                <div className="value-icon">
                  <Globe size={32} />
                </div>
                <h3 className="value-title">Accessibility</h3>
                <p className="value-description">Making quality study tools available to students everywhere, regardless of location.</p>
              </div>
            </div>
          </div>

          {/* Team Section */}
          <div className="about-team">
            <h2 className="about-section-heading">Meet Our Team</h2>
            <p className="about-section-subheading">Built by students, for students</p>
            <div className="team-grid-enhanced">
              <div className="team-card">
                <div className="team-avatar-enhanced">
                  <div className="team-avatar-initials">AA</div>
                </div>
                <div className="team-info">
                  <h3 className="team-name">Adrian Philip Amihan</h3>
                  <p className="team-role">Co-Founder & Developer</p>
                  <p className="team-bio">Passionate about creating tools that make learning more collaborative and effective.</p>
                </div>
              </div>
              <div className="team-card">
                <div className="team-avatar-enhanced">
                  <div className="team-avatar-initials">MA</div>
                </div>
                <div className="team-info">
                  <h3 className="team-name">Matthew Adami</h3>
                  <p className="team-role">Co-Founder & Developer</p>
                  <p className="team-bio">Dedicated to building intuitive interfaces that enhance the student learning experience.</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="about-cta">
            <div className="about-cta-content">
              <Award size={48} className="about-cta-icon" />
              <h2 className="about-cta-title">Ready to Transform Your Study Sessions?</h2>
              <p className="about-cta-text">Join thousands of students who are already learning more effectively with CollaborativeApp.</p>
              <div className="about-cta-buttons">
                <a href="#/signup" className="btn btn-primary btn-lg">Get Started Free</a>
                <a href="#/features" className="btn btn-ghost btn-lg">Explore Features</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="page-footer">
        <p>© {new Date().getFullYear()} CollaborativeApp — Built for students</p>
        <div className="page-footer-links">
          <a href="#/privacy">Privacy Policy</a>
          <a href="#/terms">Terms of Service</a>
        </div>
      </footer>
    </div>
  )
}
