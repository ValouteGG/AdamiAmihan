import { useState } from 'react'
import '../styles/auth.css'
import ThemeToggle from '../components/ThemeToggle'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    // Clear error when user starts typing
    if (error) setError('')
  }

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields')
      return
    }

    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }

    setIsLoading(true)

    try {
      // ============================================
      // BACKEND INTEGRATION PLACEHOLDER
      // ============================================
      // Replace this setTimeout with your actual API call
      // Example:
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     email: formData.email,
      //     password: formData.password,
      //     rememberMe: formData.rememberMe
      //   })
      // })
      // const data = await response.json()
      // if (response.ok) {
      //     // Handle successful login
      //     console.log('Login successful:', data)
      //     // Redirect to dashboard or home
      //     window.location.hash = '#/'
      // } else {
      //     setError(data.message || 'Login failed')
      // }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // For demo purposes, log the user in with mock data
      const userData = {
        id: 1,
        email: formData.email,
        firstName: 'Demo',
        lastName: 'User',
        avatar: 'D'
      }
      login(userData)
      
      // Redirect to dashboard
      window.location.hash = '#/dashboard'
      
    } catch (err) {
      setError('An error occurred. Please try again.')
      console.error('Login error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle social login (placeholder)
  const handleSocialLogin = (provider) => {
    console.log(`${provider} login clicked`)
    // ============================================
    // BACKEND INTEGRATION PLACEHOLDER
    // ============================================
    // Implement OAuth/social login logic here
    // Example: window.location.href = `/api/auth/${provider}`
  }

  return (
    <div className="auth-root">
      <div className="auth-theme-toggle">
        <ThemeToggle />
      </div>
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <a href="#/" className="auth-logo">📚</a>
            <h1 className="auth-title">Welcome Back</h1>
            <p className="auth-subtitle">Sign in to continue your collaborative learning journey</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {error && (
              <div className="auth-validation">
                {error}
              </div>
            )}

            <div className="auth-form-group">
              <label className="auth-label">
                Email Address
                <span className="auth-label-required">*</span>
              </label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon">📧</span>
                <input
                  type="email"
                  name="email"
                  className="auth-input auth-input-with-icon"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div className="auth-form-group">
              <label className="auth-label">
                Password
                <span className="auth-label-required">*</span>
              </label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon">🔒</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className="auth-input auth-input-with-icon"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={togglePasswordVisibility}
                  disabled={isLoading}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <div className="auth-remember">
              <label className="auth-remember">
                <input
                  type="checkbox"
                  name="rememberMe"
                  className="auth-checkbox"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                <span className="auth-remember-label">Remember me</span>
              </label>
              <a href="#/forgot-password" className="auth-forgot">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="auth-submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="auth-loading">
                  <span className="auth-spinner"></span>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>

            <div className="auth-divider">
              <span>or continue with</span>
            </div>

            <div className="auth-social">
              <button
                type="button"
                className="auth-social-btn"
                onClick={() => handleSocialLogin('google')}
                disabled={isLoading}
              >
                <span className="auth-social-icon">🔍</span>
                Google
              </button>
              <button
                type="button"
                className="auth-social-btn"
                onClick={() => handleSocialLogin('github')}
                disabled={isLoading}
              >
                <span className="auth-social-icon">🐙</span>
                GitHub
              </button>
            </div>
          </form>

          <div className="auth-footer">
            Don't have an account?{' '}
            <a href="#/signup" className="auth-footer-link">
              Sign up
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}