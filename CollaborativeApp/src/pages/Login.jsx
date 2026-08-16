import { useState } from 'react'
import '../styles/auth.css'
import { Mail, Lock, Eye, EyeOff, Globe, GitBranch } from 'lucide-react'
import ThemeToggle from '../components/ThemeToggle'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../config/supabase'

export default function Login() {
  const { loginWithUserData } = useAuth()
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
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4002'
      
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      })

      const data = await response.json()

      if (response.ok) {
        // Handle successful login
        console.log('Login successful:', data)
        
        // Create user data for the auth context
        const userData = {
          id: data.user.id,
          email: data.user.email,
          firstName: data.user.firstName || '',
          lastName: data.user.lastName || '',
          avatar: (data.user.firstName || data.user.email)[0].toUpperCase()
        }
        
        loginWithUserData(userData)
        
        // Redirect to dashboard
        window.location.hash = '#/dashboard'
      } else {
        setError(data.message || 'Login failed')
      }
      
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError('Unable to connect to server. Please check if the backend is running.')
      } else {
        setError('An error occurred. Please try again.')
      }
      console.error('Login error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle social login
  const handleSocialLogin = async (provider) => {
    try {
      if (provider === 'google') {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/#/auth/callback`
          }
        })

        if (error) {
          setError('Google login failed. Please try again.')
          console.error('Google OAuth error:', error)
          return
        }

        // The user will be redirected to Google's OAuth page
        window.location.href = data.url
      } else if (provider === 'github') {
        // For GitHub, we'll use the same pattern (can be implemented similarly)
        setError('GitHub login is not yet implemented')
      }
    } catch (err) {
      setError(`${provider} login failed. Please try again.`)
      console.error(`${provider} login error:`, err)
    }
  }

  return (
    <div className="auth-root">
      <div className="auth-theme-toggle">
        <ThemeToggle />
      </div>
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <a href="#/" className="auth-logo">
              <Mail size={32} />
            </a>
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
                <span className="auth-input-icon">
                  <Mail size={20} />
                </span>
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
                <span className="auth-input-icon">
                  <Lock size={20} />
                </span>
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
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
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
                <span className="auth-social-icon">
                  <Globe size={20} />
                </span>
                Google
              </button>
              <button
                type="button"
                className="auth-social-btn"
                onClick={() => handleSocialLogin('github')}
                disabled={isLoading}
              >
                <span className="auth-social-icon">
                  <GitBranch size={20} />
                </span>
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