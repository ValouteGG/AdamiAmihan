import { BookOpen, GraduationCap, Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import ThemeToggle from './ThemeToggle'
import { useAuth } from '../context/AuthContext'

export default function Header() {
  const { isAuthenticated, user } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [currentPath, setCurrentPath] = useState('')

  // Get current path from hash
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPath(window.location.hash.replace('#/', '') || 'home')
    }
    
    handleHashChange()
    window.addEventListener('hashchange', handleHashChange)
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange)
    }
  }, [])

  const navItems = [
    { path: '', label: 'Home', show: true },
    { path: 'features', label: 'Features', show: true },
    { path: 'about', label: 'About', show: true },
    { path: 'browse', label: 'Browse Rooms', show: isAuthenticated },
    { path: 'create', label: 'Create Room', show: isAuthenticated },
    { path: 'dashboard', label: 'Dashboard', show: isAuthenticated },
    { path: 'friends', label: 'Friends', show: isAuthenticated },
    { path: 'messages', label: 'Messages', show: isAuthenticated },
    { path: 'calendar', label: 'Calendar', show: isAuthenticated },
    { path: 'profile', label: 'Profile', show: isAuthenticated },
    { path: 'settings', label: 'Settings', show: isAuthenticated },
  ]

  const filteredNavItems = navItems.filter(item => item.show)

  const getPageTitle = () => {
    const pathMap = {
      '': 'Home',
      'features': 'Features',
      'about': 'About',
      'browse': 'Browse Rooms',
      'create': 'Create Room',
      'dashboard': 'Dashboard',
      'friends': 'Friends',
      'messages': 'Messages',
      'calendar': 'Calendar',
      'profile': 'Profile',
      'settings': 'Settings',
      'login': 'Sign In',
      'signup': 'Sign Up',
      'forgot-password': 'Forgot Password',
      'room': 'Study Room',
      'whiteboard': 'Whiteboard',
      'timer': 'Study Timer',
      'search': 'Search',
      'notifications': 'Notifications',
      'help': 'Help'
    }
    
    return pathMap[currentPath] || 'CollaborativeApp'
  }

  return (
    <header className="site-header">
      <div className="header-container">
        {/* Logo and Brand */}
        <div className="header-brand">
          <a href="#/" className="header-logo">
            <GraduationCap size={28} className="logo-icon" />
          </a>
          <div className="header-brand-text">
            <a href="#/" className="header-title">CollaborativeApp</a>
            <span className="header-page-title">{getPageTitle()}</span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="header-nav desktop-nav">
          {filteredNavItems.map(item => (
            <a
              key={item.path}
              href={`#/${item.path}`}
              className={`header-nav-item ${currentPath === item.path ? 'active' : ''}`}
            >
              {item.label}
            </a>
          ))}
          
          {isAuthenticated ? (
            <div className="header-auth-section">
              <ThemeToggle />
              <div className="header-user-info">
                <span className="header-user-name">
                  {user?.firstName || user?.email?.split('@')[0]}
                </span>
              </div>
            </div>
          ) : (
            <div className="header-auth-section">
              <ThemeToggle />
              <a href="#/login" className="btn btn-ghost btn-sm">Sign In</a>
              <a href="#/signup" className="btn btn-primary btn-sm">Sign Up</a>
            </div>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="mobile-menu-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <nav className="header-nav mobile-nav">
          {filteredNavItems.map(item => (
            <a
              key={item.path}
              href={`#/${item.path}`}
              className={`header-nav-item ${currentPath === item.path ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item.label}
            </a>
          ))}
          
          {isAuthenticated ? (
            <div className="mobile-auth-section">
              <ThemeToggle />
              <div className="mobile-user-info">
                <span className="mobile-user-name">
                  {user?.firstName || user?.email?.split('@')[0]}
                </span>
              </div>
            </div>
          ) : (
            <div className="mobile-auth-section">
              <ThemeToggle />
              <a href="#/login" className="btn btn-ghost btn-sm">Sign In</a>
              <a href="#/signup" className="btn btn-primary btn-sm">Sign Up</a>
            </div>
          )}
        </nav>
      )}
    </header>
  )
}