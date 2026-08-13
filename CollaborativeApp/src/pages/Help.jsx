import { useState } from 'react'
import '../styles/pages.css'
import ThemeToggle from '../components/ThemeToggle'
import ProtectedRoute from '../components/ProtectedRoute'

export default function Help() {
  const [activeSection, setActiveSection] = useState('faq')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedFaq, setExpandedFaq] = useState(null)
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const faqs = [
    {
      id: 1,
      question: 'How do I create a study room?',
      answer: 'To create a study room, click on the "Create Room" button in the navigation bar. Fill in the room details such as name, subject, visibility, and description. Once created, you can invite others to join your room.'
    },
    {
      id: 2,
      question: 'Can I join multiple study rooms?',
      answer: 'Yes! You can join as many study rooms as you like. Browse available rooms or accept invitations from other users to join different study groups.'
    },
    {
      id: 3,
      question: 'How do I invite someone to my room?',
      answer: 'Navigate to your room dashboard and click the "Invite" button. Enter the email address of the person you want to invite, and they will receive an invitation to join your room.'
    },
    {
      id: 4,
      question: 'What resources can I share in a room?',
      answer: 'You can share various types of files including PDFs, documents, images, and more. Simply go to the Resources tab in your room and click "Upload File" to share materials with your study group.'
    },
    {
      id: 5,
      question: 'How do I change my notification settings?',
      answer: 'Go to Settings from the navigation menu. Under the Notifications section, you can customize which types of notifications you receive via email, push notifications, and more.'
    },
    {
      id: 6,
      question: 'Is my chat history private?',
      answer: 'Chat history within private rooms is only visible to room members. Public rooms may have visible chat history. Always be mindful of what you share in study rooms.'
    },
    {
      id: 7,
      question: 'How do I delete my account?',
      answer: 'To delete your account, go to Settings and scroll to the "Danger Zone" section. Click "Delete Account" and confirm your decision. Note that this action is irreversible and will delete all your data.'
    },
    {
      id: 8,
      question: 'Can I schedule study sessions?',
      answer: 'Yes! Each room has a Schedule tab where you can create and manage study sessions. Set the date, time, and topic for your sessions, and room members will be notified.'
    }
  ]

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleContactSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // ============================================
      // BACKEND INTEGRATION PLACEHOLDER
      // ============================================
      // Replace this setTimeout with your actual API call
      // Example:
      // const response = await fetch('/api/support/contact', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(contactForm)
      // })
      // const data = await response.json()
      // if (response.ok) {
      //     setSubmitSuccess(true)
      //     setContactForm({ name: '', email: '', subject: '', message: '' })
      // } else {
      //     setError(data.message || 'Failed to send message')
      // }
      
      await new Promise(resolve => setTimeout(resolve, 1500))
      console.log('Contact form submitted:', contactForm)
      setSubmitSuccess(true)
      setContactForm({ name: '', email: '', subject: '', message: '' })
      
      setTimeout(() => setSubmitSuccess(false), 5000)
    } catch (err) {
      console.error('Contact form error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleContactChange = (e) => {
    const { name, value } = e.target
    setContactForm(prev => ({
      ...prev,
      [name]: value
    }))
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
          </nav>
        </header>

      <div className="page-content">
        <div className="page-inner">
          <div className="help-header">
            <h1 className="page-title">Help & Support</h1>
            <p className="page-subtitle">Find answers to common questions or get in touch with our support team</p>
          </div>

          <div className="help-container">
            <div className="help-sidebar">
              <button
                className={`help-nav-btn ${activeSection === 'faq' ? 'help-nav-btn-active' : ''}`}
                onClick={() => setActiveSection('faq')}
              >
                FAQ
              </button>
              <button
                className={`help-nav-btn ${activeSection === 'contact' ? 'help-nav-btn-active' : ''}`}
                onClick={() => setActiveSection('contact')}
              >
                Contact Support
              </button>
              <button
                className={`help-nav-btn ${activeSection === 'guides' ? 'help-nav-btn-active' : ''}`}
                onClick={() => setActiveSection('guides')}
              >
                User Guides
              </button>
            </div>

            <div className="help-main">
              {activeSection === 'faq' && (
                <div className="help-section">
                  <div className="faq-search">
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Search FAQs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <div className="faq-list">
                    {filteredFaqs.length === 0 ? (
                      <div className="faq-empty">
                        <h3>No results found</h3>
                        <p>Try different search terms or contact support</p>
                      </div>
                    ) : (
                      filteredFaqs.map(faq => (
                        <div key={faq.id} className="faq-item">
                          <button
                            className="faq-question"
                            onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                          >
                            <span>{faq.question}</span>
                            <span className={`faq-icon ${expandedFaq === faq.id ? 'faq-icon-expanded' : ''}`}>
                              ▼
                            </span>
                          </button>
                          {expandedFaq === faq.id && (
                            <div className="faq-answer">
                              {faq.answer}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {activeSection === 'contact' && (
                <div className="help-section">
                  <div className="contact-intro">
                    <h2>Get in Touch</h2>
                    <p>Can't find what you're looking for? Send us a message and we'll get back to you within 24 hours.</p>
                  </div>

                  {submitSuccess && (
                    <div className="contact-success">
                      <div className="contact-success-icon">✓</div>
                      <h3>Message Sent!</h3>
                      <p>Thank you for contacting us. We'll get back to you soon.</p>
                    </div>
                  )}

                  <form className="contact-form" onSubmit={handleContactSubmit}>
                    <div className="form-row">
                      <div className="form-label">
                        <span className="form-label-text">Name</span>
                        <input
                          type="text"
                          name="name"
                          className="form-input"
                          value={contactForm.name}
                          onChange={handleContactChange}
                          required
                        />
                      </div>
                      <div className="form-label">
                        <span className="form-label-text">Email</span>
                        <input
                          type="email"
                          name="email"
                          className="form-input"
                          value={contactForm.email}
                          onChange={handleContactChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-label">
                      <span className="form-label-text">Subject</span>
                      <select
                        name="subject"
                        className="form-select"
                        value={contactForm.subject}
                        onChange={handleContactChange}
                        required
                      >
                        <option value="">Select a subject</option>
                        <option value="technical">Technical Issue</option>
                        <option value="billing">Billing Question</option>
                        <option value="feature">Feature Request</option>
                        <option value="feedback">General Feedback</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className="form-label">
                      <span className="form-label-text">Message</span>
                      <textarea
                        name="message"
                        className="form-textarea"
                        value={contactForm.message}
                        onChange={handleContactChange}
                        rows={6}
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Sending...' : 'Send Message'}
                    </button>
                  </form>

                  <div className="contact-alternatives">
                    <h3>Other Ways to Reach Us</h3>
                    <div className="contact-links">
                      <a href="mailto:support@collaborativeapp.com" className="contact-link">
                        <span className="contact-link-icon">📧</span>
                        support@collaborativeapp.com
                      </a>
                      <a href="#" className="contact-link">
                        <span className="contact-link-icon">🐦</span>
                        @CollaborativeApp
                      </a>
                      <a href="#" className="contact-link">
                        <span className="contact-link-icon">💬</span>
                        Discord Community
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'guides' && (
                <div className="help-section">
                  <h2>User Guides</h2>
                  <div className="guides-list">
                    <div className="guide-item">
                      <div className="guide-icon">🚀</div>
                      <div className="guide-content">
                        <h3>Getting Started</h3>
                        <p>Learn the basics of CollaborativeApp and set up your profile</p>
                        <button className="btn btn-sm btn-ghost">Read Guide</button>
                      </div>
                    </div>
                    <div className="guide-item">
                      <div className="guide-icon">👥</div>
                      <div className="guide-content">
                        <h3>Creating Study Rooms</h3>
                        <p>Step-by-step guide to creating and managing study rooms</p>
                        <button className="btn btn-sm btn-ghost">Read Guide</button>
                      </div>
                    </div>
                    <div className="guide-item">
                      <div className="guide-icon">💬</div>
                      <div className="guide-content">
                        <h3>Using Chat & Collaboration</h3>
                        <p>Make the most of real-time chat and collaboration features</p>
                        <button className="btn btn-sm btn-ghost">Read Guide</button>
                      </div>
                    </div>
                    <div className="guide-item">
                      <div className="guide-icon">📅</div>
                      <div className="guide-content">
                        <h3>Scheduling Sessions</h3>
                        <p>How to schedule and manage study sessions with your group</p>
                        <button className="btn btn-sm btn-ghost">Read Guide</button>
                      </div>
                    </div>
                    <div className="guide-item">
                      <div className="guide-icon">📎</div>
                      <div className="guide-content">
                        <h3>Sharing Resources</h3>
                        <p>Upload, organize, and share study materials effectively</p>
                        <button className="btn btn-sm btn-ghost">Read Guide</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
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
