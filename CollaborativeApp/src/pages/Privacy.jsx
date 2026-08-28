import '../styles/pages.css'
import ThemeToggle from '../components/ThemeToggle'
import { useAuth } from '../context/AuthContext'
import { BookOpen, Shield, BarChart, Share, Lock, UserCheck, Cookie, Baby, FileText, Mail, Eye, Clock, ShieldCheck } from 'lucide-react'

export default function Privacy() {
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
            <span className="page-header-current">Privacy Policy</span>
          </div>
        </div>
        <nav className="page-header-nav">
          <a href="#/about" className="btn btn-ghost btn-sm">About</a>
          <a href="#/features" className="btn btn-ghost btn-sm">Features</a>
          <a href="#/terms" className="btn btn-ghost btn-sm">Terms</a>
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
          <div className="privacy-hero">
            <div className="privacy-hero-icon">
              <Shield size={64} />
            </div>
            <h1 className="privacy-hero-title">Your Privacy Matters</h1>
            <p className="privacy-hero-subtitle">
              We believe in transparency and giving you control over your data. This policy explains how we collect, use, and protect your information.
            </p>
            <div className="privacy-meta">
              <div className="privacy-meta-item">
                <Clock size={16} />
                <span>Last updated: {new Date().toLocaleDateString()}</span>
              </div>
              <div className="privacy-meta-item">
                <Eye size={16} />
                <span>Version 2.0</span>
              </div>
            </div>
          </div>

          {/* Quick Overview */}
          <div className="privacy-overview">
            <h2 className="privacy-section-title">Quick Overview</h2>
            <div className="privacy-highlights">
              <div className="privacy-highlight">
                <div className="privacy-highlight-icon">
                  <Lock size={24} />
                </div>
                <h3 className="privacy-highlight-title">Secure by Default</h3>
                <p className="privacy-highlight-text">Your data is encrypted and protected with industry-standard security measures.</p>
              </div>
              <div className="privacy-highlight">
                <div className="privacy-highlight-icon">
                  <UserCheck size={24} />
                </div>
                <h3 className="privacy-highlight-title">You're in Control</h3>
                <p className="privacy-highlight-text">Access, update, or delete your personal information at any time.</p>
              </div>
              <div className="privacy-highlight">
                <div className="privacy-highlight-icon">
                  <ShieldCheck size={24} />
                </div>
                <h3 className="privacy-highlight-title">No Selling Data</h3>
                <p className="privacy-highlight-text">We never sell your personal information to third parties.</p>
              </div>
            </div>
          </div>

          {/* Detailed Sections */}
          <div className="privacy-sections">
            <div className="privacy-section">
              <div className="privacy-section-header">
                <div className="privacy-section-icon">
                  <Lock size={32} />
                </div>
                <div>
                  <h2 className="privacy-section-heading">Information We Collect</h2>
                  <p className="privacy-section-subheading">Data we gather to provide you with the best experience</p>
                </div>
              </div>
              <div className="privacy-section-content">
                <div className="privacy-content-block">
                  <h3 className="privacy-content-title">Personal Information</h3>
                  <p className="privacy-content-text">When you create an account, we collect your name, email address, and any profile information you choose to provide. This helps us personalize your experience and communicate with you about your account.</p>
                </div>
                <div className="privacy-content-block">
                  <h3 className="privacy-content-title">Usage Data</h3>
                  <p className="privacy-content-text">We collect information about how you use our platform, including which features you use most, your study patterns, and technical data like IP address and device information. This helps us improve our services and fix bugs.</p>
                </div>
                <div className="privacy-content-block">
                  <h3 className="privacy-content-title">Content You Create</h3>
                  <p className="privacy-content-text">Any content you create within study rooms, including notes, messages, and shared files, is stored securely and used only to provide the collaboration features you requested.</p>
                </div>
              </div>
            </div>

            <div className="privacy-section">
              <div className="privacy-section-header">
                <div className="privacy-section-icon">
                  <BarChart size={32} />
                </div>
                <div>
                  <h2 className="privacy-section-heading">How We Use Your Information</h2>
                  <p className="privacy-section-subheading">Purpose-driven data usage to enhance your experience</p>
                </div>
              </div>
              <div className="privacy-section-content">
                <div className="privacy-content-block">
                  <h3 className="privacy-content-title">Service Delivery</h3>
                  <p className="privacy-content-text">We use your information to provide, maintain, and improve our collaborative study features, including room management, real-time collaboration, and communication tools.</p>
                </div>
                <div className="privacy-content-block">
                  <h3 className="privacy-content-title">Personalization</h3>
                  <p className="privacy-content-text">Your data helps us personalize your experience, recommend relevant study rooms, and provide insights about your learning patterns.</p>
                </div>
                <div className="privacy-content-block">
                  <h3 className="privacy-content-title">Security & Safety</h3>
                  <p className="privacy-content-text">We use your information to detect and prevent fraud, abuse, and security threats, keeping our platform safe for all users.</p>
                </div>
              </div>
            </div>

            <div className="privacy-section">
              <div className="privacy-section-header">
                <div className="privacy-section-icon">
                  <Share size={32} />
                </div>
                <div>
                  <h2 className="privacy-section-heading">Information Sharing</h2>
                  <p className="privacy-section-subheading">Limited sharing to protect your privacy</p>
                </div>
              </div>
              <div className="privacy-section-content">
                <div className="privacy-content-block">
                  <h3 className="privacy-content-title">Within Study Rooms</h3>
                  <p className="privacy-content-text">Your name and profile information are visible to other members of study rooms you join. Content you share within rooms is visible to room members for collaboration purposes.</p>
                </div>
                <div className="privacy-content-block">
                  <h3 className="privacy-content-title">Service Providers</h3>
                  <p className="privacy-content-text">We work with trusted third-party service providers to operate our platform. These providers have limited access to your data only as needed to perform their services and are bound by strict confidentiality agreements.</p>
                </div>
                <div className="privacy-content-block">
                  <h3 className="privacy-content-title">No Data Sales</h3>
                  <p className="privacy-content-text">We do not sell, rent, or trade your personal information with third parties for their marketing purposes.</p>
                </div>
              </div>
            </div>

            <div className="privacy-section">
              <div className="privacy-section-header">
                <div className="privacy-section-icon">
                  <ShieldCheck size={32} />
                </div>
                <div>
                  <h2 className="privacy-section-heading">Data Security</h2>
                  <p className="privacy-section-subheading">Industry-standard protection for your information</p>
                </div>
              </div>
              <div className="privacy-section-content">
                <div className="privacy-content-block">
                  <h3 className="privacy-content-title">Encryption</h3>
                  <p className="privacy-content-text">All data is encrypted in transit and at rest using industry-standard encryption protocols. Your study room content and communications are protected end-to-end.</p>
                </div>
                <div className="privacy-content-block">
                  <h3 className="privacy-content-title">Access Controls</h3>
                  <p className="privacy-content-text">Strict access controls and authentication measures ensure that only authorized personnel can access your data, and only when necessary.</p>
                </div>
                <div className="privacy-content-block">
                  <h3 className="privacy-content-title">Regular Audits</h3>
                  <p className="privacy-content-text">We conduct regular security audits and penetration testing to identify and address potential vulnerabilities proactively.</p>
                </div>
              </div>
            </div>

            <div className="privacy-section">
              <div className="privacy-section-header">
                <div className="privacy-section-icon">
                  <UserCheck size={32} />
                </div>
                <div>
                  <h2 className="privacy-section-heading">Your Rights</h2>
                  <p className="privacy-section-subheading">Control over your personal information</p>
                </div>
              </div>
              <div className="privacy-section-content">
                <div className="privacy-content-block">
                  <h3 className="privacy-content-title">Access & Correction</h3>
                  <p className="privacy-content-text">You can access and update your personal information through your profile settings at any time. We also provide tools to export your data.</p>
                </div>
                <div className="privacy-content-block">
                  <h3 className="privacy-content-title">Deletion</h3>
                  <p className="privacy-content-text">You can request deletion of your account and associated data through the Settings page or by contacting us. We will process your request within 30 days.</p>
                </div>
                <div className="privacy-content-block">
                  <h3 className="privacy-content-title">Opt-Out</h3>
                  <p className="privacy-content-text">You can opt out of marketing communications and certain data collection activities through your notification preferences and cookie settings.</p>
                </div>
              </div>
            </div>

            <div className="privacy-section">
              <div className="privacy-section-header">
                <div className="privacy-section-icon">
                  <Cookie size={32} />
                </div>
                <div>
                  <h2 className="privacy-section-heading">Cookies & Tracking</h2>
                  <p className="privacy-section-subheading">How we use cookies to improve your experience</p>
                </div>
              </div>
              <div className="privacy-section-content">
                <div className="privacy-content-block">
                  <h3 className="privacy-content-title">Essential Cookies</h3>
                  <p className="privacy-content-text">Required for basic platform functionality, including authentication and session management. These cannot be disabled.</p>
                </div>
                <div className="privacy-content-block">
                  <h3 className="privacy-content-title">Analytics Cookies</h3>
                  <p className="privacy-content-text">Help us understand how you use our platform so we can improve it. You can disable these through your browser settings.</p>
                </div>
                <div className="privacy-content-block">
                  <h3 className="privacy-content-title">Preference Cookies</h3>
                  <p className="privacy-content-text">Remember your settings and preferences, such as theme choices and language settings, for a personalized experience.</p>
                </div>
              </div>
            </div>

            <div className="privacy-section">
              <div className="privacy-section-header">
                <div className="privacy-section-icon">
                  <Baby size={32} />
                </div>
                <div>
                  <h2 className="privacy-section-heading">Children's Privacy</h2>
                  <p className="privacy-section-subheading">Protecting our younger users</p>
                </div>
              </div>
              <div className="privacy-section-content">
                <p className="privacy-content-text">CollaborativeApp is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware that we have collected such information, we will take immediate steps to delete it.</p>
              </div>
            </div>

            <div className="privacy-section">
              <div className="privacy-section-header">
                <div className="privacy-section-icon">
                  <FileText size={32} />
                </div>
                <div>
                  <h2 className="privacy-section-heading">Changes to This Policy</h2>
                  <p className="privacy-section-subheading">Keeping you informed about updates</p>
                </div>
              </div>
              <div className="privacy-section-content">
                <p className="privacy-content-text">We may update this privacy policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify users of significant changes by posting the new policy on this page and updating the "Last updated" date. Your continued use of the platform after such changes constitutes your acceptance of the updated policy.</p>
              </div>
            </div>

            <div className="privacy-section">
              <div className="privacy-section-header">
                <div className="privacy-section-icon">
                  <Mail size={32} />
                </div>
                <div>
                  <h2 className="privacy-section-heading">Contact Us</h2>
                  <p className="privacy-section-subheading">Questions about your privacy?</p>
                </div>
              </div>
              <div className="privacy-section-content">
                <p className="privacy-content-text">If you have questions about this privacy policy or our data practices, please contact us at privacy@collaborativeapp.com. We will respond to your inquiries within a reasonable timeframe.</p>
                <div className="privacy-contact-actions">
                  <a href="mailto:privacy@collaborativeapp.com" className="btn btn-primary">
                    <Mail size={16} />
                    Contact Privacy Team
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="page-footer">
        <p>© {new Date().getFullYear()} CollaborativeApp — Built for students</p>
        <div className="page-footer-links">
          <a href="#/terms">Terms of Service</a>
          <a href="#/about">About</a>
          <a href="#/help">Help</a>
        </div>
      </footer>
    </div>
  )
}