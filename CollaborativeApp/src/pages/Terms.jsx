import '../styles/pages.css'
import ThemeToggle from '../components/ThemeToggle'
import { useAuth } from '../context/AuthContext'
import { BookOpen, ScrollText, GraduationCap, User, PenSquare, Ban, FileText, Link, AlertTriangle, Gavel, DoorOpen, Building2, RefreshCw, Mail, Shield, CheckCircle, Clock } from 'lucide-react'

export default function Terms() {
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
            <span className="page-header-current">Terms of Service</span>
          </div>
        </div>
        <nav className="page-header-nav">
          <a href="#/about" className="btn btn-ghost btn-sm">About</a>
          <a href="#/features" className="btn btn-ghost btn-sm">Features</a>
          <a href="#/privacy" className="btn btn-ghost btn-sm">Privacy</a>
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
          <div className="terms-hero">
            <div className="terms-hero-icon">
              <ScrollText size={64} />
            </div>
            <h1 className="terms-hero-title">Terms of Service</h1>
            <p className="terms-hero-subtitle">
              By using CollaborativeApp, you agree to these terms that govern your use of our educational collaboration platform.
            </p>
            <div className="terms-meta">
              <div className="terms-meta-item">
                <Clock size={16} />
                <span>Last updated: {new Date().toLocaleDateString()}</span>
              </div>
              <div className="terms-meta-item">
                <CheckCircle size={16} />
                <span>Version 2.0</span>
              </div>
            </div>
          </div>

          {/* Quick Overview */}
          <div className="terms-overview">
            <h2 className="terms-section-title">Key Points</h2>
            <div className="terms-highlights">
              <div className="terms-highlight">
                <div className="terms-highlight-icon">
                  <GraduationCap size={24} />
                </div>
                <h3 className="terms-highlight-title">Educational Focus</h3>
                <p className="terms-highlight-text">Designed for academic integrity and collaborative learning.</p>
              </div>
              <div className="terms-highlight">
                <div className="terms-highlight-icon">
                  <Shield size={24} />
                </div>
                <h3 className="terms-highlight-title">Respectful Conduct</h3>
                <p className="terms-highlight-text">Maintain a safe, inclusive environment for all users.</p>
              </div>
              <div className="terms-highlight">
                <div className="terms-highlight-icon">
                  <CheckCircle size={24} />
                </div>
                <h3 className="terms-highlight-title">Clear Guidelines</h3>
                <p className="terms-highlight-text">Transparent rules for fair and productive collaboration.</p>
              </div>
            </div>
          </div>

          {/* Detailed Sections */}
          <div className="terms-sections">
            <div className="terms-section">
              <div className="terms-section-header">
                <div className="terms-section-icon">
                  <ScrollText size={32} />
                </div>
                <div>
                  <h2 className="terms-section-heading">Acceptance of Terms</h2>
                  <p className="terms-section-subheading">Your agreement to use our platform</p>
                </div>
              </div>
              <div className="terms-section-content">
                <p className="terms-content-text">By accessing or using CollaborativeApp, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform. These terms constitute a legally binding agreement between you and CollaborativeApp.</p>
                <div className="terms-content-block">
                  <h3 className="terms-content-title">Binding Agreement</h3>
                  <p className="terms-content-text">These terms apply to all users of our platform, including students, educators, and administrators. By creating an account or using our services, you acknowledge that you have read, understood, and agree to be bound by these terms.</p>
                </div>
              </div>
            </div>

            <div className="terms-section">
              <div className="terms-section-header">
                <div className="terms-section-icon">
                  <GraduationCap size={32} />
                </div>
                <div>
                  <h2 className="terms-section-heading">Educational Purpose</h2>
                  <p className="terms-section-subheading">Academic integrity at the core</p>
                </div>
              </div>
              <div className="terms-section-content">
                <div className="terms-content-block">
                  <h3 className="terms-content-title">Primary Use</h3>
                  <p className="terms-content-text">CollaborativeApp is designed primarily for educational purposes and collaborative learning. Users are expected to use the platform responsibly and in accordance with academic integrity principles.</p>
                </div>
                <div className="terms-content-block">
                  <h3 className="terms-content-title">Academic Honesty</h3>
                  <p className="terms-content-text">Any misuse of the platform for academic dishonesty, cheating, or unauthorized assistance is strictly prohibited. We reserve the right to suspend accounts that violate these principles.</p>
                </div>
                <div className="terms-content-block">
                  <h3 className="terms-content-title">Learning Environment</h3>
                  <p className="terms-content-text">We foster a positive learning environment where users can collaborate genuinely and enhance their educational experience through legitimate study practices.</p>
                </div>
              </div>
            </div>

            <div className="terms-section">
              <div className="terms-section-header">
                <div className="terms-section-icon">
                  <User size={32} />
                </div>
                <div>
                  <h2 className="terms-section-heading">User Accounts</h2>
                  <p className="terms-section-subheading">Your responsibilities as a user</p>
                </div>
              </div>
              <div className="terms-section-content">
                <div className="terms-content-block">
                  <h3 className="terms-content-title">Account Security</h3>
                  <p className="terms-content-text">You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must provide accurate and complete information when creating an account.</p>
                </div>
                <div className="terms-content-block">
                  <h3 className="terms-content-title">Account Information</h3>
                  <p className="terms-content-text">You agree to notify us immediately of any unauthorized use of your account or any other breach of security. We are not responsible for losses caused by unauthorized access to your account.</p>
                </div>
                <div className="terms-content-block">
                  <h3 className="terms-content-title">Account Usage</h3>
                  <p className="terms-content-text">Each user may maintain only one account. Sharing accounts or allowing others to use your account is prohibited and may result in account suspension.</p>
                </div>
              </div>
            </div>

            <div className="terms-section">
              <div className="terms-section-header">
                <div className="terms-section-icon">
                  <PenSquare size={32} />
                </div>
                <div>
                  <h2 className="terms-section-heading">User Content and Conduct</h2>
                  <p className="terms-section-subheading">Standards for appropriate behavior</p>
                </div>
              </div>
              <div className="terms-section-content">
                <div className="terms-content-block">
                  <h3 className="terms-content-title">Content Ownership</h3>
                  <p className="terms-content-text">You retain ownership of content you create and share on CollaborativeApp. By sharing content, you grant us a license to use, modify, and display it for the purpose of providing our services.</p>
                </div>
                <div className="terms-content-block">
                  <h3 className="terms-content-title">Acceptable Content</h3>
                  <p className="terms-content-text">You agree not to post content that is illegal, harmful, threatening, abusive, defamatory, or otherwise objectionable. Harassment, hate speech, and discrimination are strictly prohibited.</p>
                </div>
                <div className="terms-content-block">
                  <h3 className="terms-content-title">Professional Conduct</h3>
                  <p className="terms-content-text">Users must interact respectfully with others. Bullying, harassment, or disruptive behavior will not be tolerated and may result in account termination.</p>
                </div>
              </div>
            </div>

            <div className="terms-section">
              <div className="terms-section-header">
                <div className="terms-section-icon">
                  <Ban size={32} />
                </div>
                <div>
                  <h2 className="terms-section-heading">Prohibited Activities</h2>
                  <p className="terms-section-subheading">Actions that are not allowed</p>
                </div>
              </div>
              <div className="terms-section-content">
                <div className="terms-content-block">
                  <h3 className="terms-content-title">Illegal Activities</h3>
                  <p className="terms-content-text">You may not use CollaborativeApp for any illegal purpose, to distribute malware, to interfere with or disrupt the service, or to violate any applicable laws or regulations.</p>
                </div>
                <div className="terms-content-block">
                  <h3 className="terms-content-title">Unauthorized Access</h3>
                  <p className="terms-content-text">Attempting to gain unauthorized access to our systems, other users' accounts, or any part of the platform is strictly prohibited and may result in legal action.</p>
                </div>
                <div className="terms-content-block">
                  <h3 className="terms-content-title">Data Mining</h3>
                  <p className="terms-content-text">Automated scraping, data mining, or unauthorized collection of user data is prohibited without our express written consent.</p>
                </div>
              </div>
            </div>

            <div className="terms-section">
              <div className="terms-section-header">
                <div className="terms-section-icon">
                  <FileText size={32} />
                </div>
                <div>
                  <h2 className="terms-section-heading">Intellectual Property</h2>
                  <p className="terms-section-subheading">Respecting creative rights</p>
                </div>
              </div>
              <div className="terms-section-content">
                <div className="terms-content-block">
                  <h3 className="terms-content-title">Platform Ownership</h3>
                  <p className="terms-content-text">CollaborativeApp and its original content, features, and functionality are owned by CollaborativeApp and are protected by international copyright, trademark, and other intellectual property laws.</p>
                </div>
                <div className="terms-content-block">
                  <h3 className="terms-content-title">User Rights</h3>
                  <p className="terms-content-text">You may not reproduce, modify, distribute, or create derivative works of our platform without our express written permission. You retain rights to your original content while granting us limited licenses to operate the service.</p>
                </div>
                <div className="terms-content-block">
                  <h3 className="terms-content-title">Third-Party Content</h3>
                  <p className="terms-content-text">If you upload content that you do not own, you represent that you have the necessary rights to do so and that such use does not violate any third-party rights.</p>
                </div>
              </div>
            </div>

            <div className="terms-section">
              <div className="terms-section-header">
                <div className="terms-section-icon">
                  <Link size={32} />
                </div>
                <div>
                  <h2 className="terms-section-heading">Third-Party Links</h2>
                  <p className="terms-section-subheading">External resources and their policies</p>
                </div>
              </div>
              <div className="terms-section-content">
                <p className="terms-content-text">Our platform may contain links to third-party websites or resources. We are not responsible for the content, policies, or practices of third-party sites. Your interactions with third-party websites are governed by their terms and conditions, not by these Terms of Service.</p>
              </div>
            </div>

            <div className="terms-section">
              <div className="terms-section-header">
                <div className="terms-section-icon">
                  <AlertTriangle size={32} />
                </div>
                <div>
                  <h2 className="terms-section-heading">Disclaimer of Warranties</h2>
                  <p className="terms-section-subheading">Service provided as-is</p>
                </div>
              </div>
              <div className="terms-section-content">
                <div className="terms-content-block">
                  <h3 className="terms-content-title">No Warranties</h3>
                  <p className="terms-content-text">CollaborativeApp is provided on an "as is" and "as available" basis without warranties of any kind, either express or implied. We do not warrant that the platform will be uninterrupted, secure, or error-free.</p>
                </div>
                <div className="terms-content-block">
                  <h3 className="terms-content-title">No Guarantees</h3>
                  <p className="terms-content-text">We disclaim all warranties regarding the accuracy, reliability, or completeness of any content or information provided. Educational outcomes are not guaranteed.</p>
                </div>
              </div>
            </div>

            <div className="terms-section">
              <div className="terms-section-header">
                <div className="terms-section-icon">
                  <Gavel size={32} />
                </div>
                <div>
                  <h2 className="terms-section-heading">Limitation of Liability</h2>
                  <p className="terms-section-subheading">Scope of our responsibility</p>
                </div>
              </div>
              <div className="terms-section-content">
                <div className="terms-content-block">
                  <h3 className="terms-content-title">Indirect Damages</h3>
                  <p className="terms-content-text">To the maximum extent permitted by law, CollaborativeApp shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or other intangible losses.</p>
                </div>
                <div className="terms-content-block">
                  <h3 className="terms-content-title">Liability Cap</h3>
                  <p className="terms-content-text">Our total liability shall not exceed the amount you paid, if any, for using the platform. In no event shall we be liable for any damages exceeding this amount.</p>
                </div>
              </div>
            </div>

            <div className="terms-section">
              <div className="terms-section-header">
                <div className="terms-section-icon">
                  <DoorOpen size={32} />
                </div>
                <div>
                  <h2 className="terms-section-heading">Termination</h2>
                  <p className="terms-section-subheading">Ending your relationship with us</p>
                </div>
              </div>
              <div className="terms-section-content">
                <div className="terms-content-block">
                  <h3 className="terms-content-title">Our Right to Terminate</h3>
                  <p className="terms-content-text">We reserve the right to suspend or terminate your account at any time, with or without cause, with or without notice. Upon termination, your right to use the platform will immediately cease.</p>
                </div>
                <div className="terms-content-block">
                  <h3 className="terms-content-title">Your Right to Terminate</h3>
                  <p className="terms-content-text">You may also terminate your account at any time through the Settings page or by contacting us. We will process your request and delete your account data as per our privacy policy.</p>
                </div>
              </div>
            </div>

            <div className="terms-section">
              <div className="terms-section-header">
                <div className="terms-section-icon">
                  <Building2 size={32} />
                </div>
                <div>
                  <h2 className="terms-section-heading">Governing Law</h2>
                  <p className="terms-section-subheading">Legal jurisdiction</p>
                </div>
              </div>
              <div className="terms-section-content">
                <p className="terms-content-text">These Terms of Service shall be governed by and construed in accordance with the laws of the jurisdiction in which CollaborativeApp is based, without regard to its conflict of law provisions. Any disputes arising under these terms shall be resolved in the competent courts of that jurisdiction.</p>
              </div>
            </div>

            <div className="terms-section">
              <div className="terms-section-header">
                <div className="terms-section-icon">
                  <RefreshCw size={32} />
                </div>
                <div>
                  <h2 className="terms-section-heading">Changes to Terms</h2>
                  <p className="terms-section-subheading">How we update our terms</p>
                </div>
              </div>
              <div className="terms-section-content">
                <div className="terms-content-block">
                  <h3 className="terms-content-title">Right to Modify</h3>
                  <p className="terms-content-text">We may modify these Terms of Service at any time. We will notify users of material changes by posting the updated terms on this page and updating the "Last updated" date.</p>
                </div>
                <div className="terms-content-block">
                  <h3 className="terms-content-title">Continued Use</h3>
                  <p className="terms-content-text">Your continued use of the platform after such changes constitutes your acceptance of the modified terms. If you do not agree to the changes, you must stop using the platform.</p>
                </div>
              </div>
            </div>

            <div className="terms-section">
              <div className="terms-section-header">
                <div className="terms-section-icon">
                  <Mail size={32} />
                </div>
                <div>
                  <h2 className="terms-section-heading">Contact Us</h2>
                  <p className="terms-section-subheading">Questions about these terms?</p>
                </div>
              </div>
              <div className="terms-section-content">
                <p className="terms-content-text">If you have questions about these Terms of Service, please contact us at legal@collaborativeapp.com. We will respond to your inquiries within a reasonable timeframe.</p>
                <div className="terms-contact-actions">
                  <a href="mailto:legal@collaborativeapp.com" className="btn btn-primary">
                    <Mail size={16} />
                    Contact Legal Team
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
          <a href="#/privacy">Privacy Policy</a>
          <a href="#/about">About</a>
          <a href="#/help">Help</a>
        </div>
      </footer>
    </div>
  )
}