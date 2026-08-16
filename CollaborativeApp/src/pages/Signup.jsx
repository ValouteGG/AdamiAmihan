import { useState } from 'react'
import '../styles/auth.css'
import { User, Mail, Lock, Eye, EyeOff, Globe, GitBranch } from 'lucide-react'
import ThemeToggle from '../components/ThemeToggle'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../config/supabase'

export default function Signup() {
  const { loginWithUserData } = useAuth()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [passwordStrength, setPasswordStrength] = useState('weak')

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    // Clear error when user starts typing
    if (error) setError('')
    
    // Calculate password strength when password changes
    if (name === 'password') {
      calculatePasswordStrength(value)
    }
  }

  // Calculate password strength
  const calculatePasswordStrength = (password) => {
    let strength = 0
    if (password.length >= 6) strength++
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++
    if (password.match(/\d/)) strength++
    if (password.match(/[^a-zA-Z\d]/)) strength++
    
    const levels = ['weak', 'fair', 'good', 'strong']
    setPasswordStrength(levels[strength] || 'weak')
  }

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword)
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError('Please fill in all required fields')
      return
    }

    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (!formData.agreeToTerms) {
      setError('You must agree to the terms and conditions')
      return
    }

    setIsLoading(true)

    try {
      console.log('Attempting signup with:', { email: formData.email, firstName: formData.firstName })
      
      // Call backend API for signup
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4002'
      const response = await fetch(`${apiUrl}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
        }),
      })

      console.log('Backend response status:', response.status)
      const data = await response.json()
      console.log('Backend response data:', data)

      if (!response.ok) {
        // Handle specific error cases
        if (data.error === 'User already registered') {
          setError('This email is already registered. Please log in instead.')
        } else if (data.error === 'Invalid email format') {
          setError('Please provide a valid email address.')
        } else if (data.error === 'Password too weak') {
          setError('Password must be at least 6 characters long.')
        } else {
          setError(data.message || data.error || 'Signup failed. Please try again.')
        }
        return
      }

      // If successful, log the user in with the returned user data
      const userData = {
        id: data.user.id,
        email: data.user.email,
        firstName: data.user.firstName || formData.firstName,
        lastName: data.user.lastName || formData.lastName,
        avatar: formData.firstName[0]
      }
      loginWithUserData(userData)

      // Redirect to dashboard
      window.location.hash = '#/dashboard'

    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError('Unable to connect to server. Please check if the backend is running.')
      } else {
        setError('An error occurred. Please try again.')
      }
      console.error('Signup error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle social signup
  const handleSocialSignup = async (provider) => {
    try {
      if (provider === 'google') {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4002'
        console.log('Attempting Google signup with API URL:', apiUrl)
        
        const response = await fetch(`${apiUrl}/api/auth/google/url`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        console.log('Google OAuth response status:', response.status)
        
        const data = await response.json()
        console.log('Google OAuth response data:', data)

        if (!response.ok) {
          setError('Google signup failed. Please try again.')
          console.error('Google OAuth error:', data.error)
          return
        }

        // The user will be redirected to Google's OAuth page
        console.log('Redirecting to Google OAuth URL:', data.url)
        window.location.href = data.url
      } else if (provider === 'github') {
        // For GitHub, we'll use the same pattern (can be implemented similarly)
        setError('GitHub signup is not yet implemented')
      }
    } catch (err) {
      setError(`${provider} signup failed. Please try again.`)
      console.error(`${provider} signup error:`, err)
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
              <User size={32} />
            </a>
            <h1 className="auth-title">Create Account</h1>
            <p className="auth-subtitle">Join our collaborative learning community today</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {error && (
              <div className="auth-validation">
                {error}
              </div>
            )}

            <div className="auth-form-group">
              <label className="auth-label">
                First Name
                <span className="auth-label-required">*</span>
              </label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon">
                  <User size={20} />
                </span>
                <input
                  type="text"
                  name="firstName"
                  className="auth-input auth-input-with-icon"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div className="auth-form-group">
              <label className="auth-label">
                Last Name
                <span className="auth-label-required">*</span>
              </label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon">
                  <User size={20} />
                </span>
                <input
                  type="text"
                  name="lastName"
                  className="auth-input auth-input-with-icon"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

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
              {formData.password && (
                <div className="auth-password-strength">
                  <div className="auth-strength-bar">
                    <div 
                      className={`auth-strength-fill ${passwordStrength}`}
                      style={{ width: ['weak', 'fair', 'good', 'strong'].indexOf(passwordStrength) * 25 + 25 + '%' }}
                    ></div>
                  </div>
                  <span className="auth-strength-text">
                    Password strength: <strong>{passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)}</strong>
                  </span>
                </div>
              )}
              <div className="auth-hint">
                Must be at least 6 characters with a mix of letters, numbers, and symbols
              </div>
            </div>

            <div className="auth-form-group">
              <label className="auth-label">
                Confirm Password
                <span className="auth-label-required">*</span>
              </label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon">
                  <Lock size={20} />
                </span>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  className="auth-input auth-input-with-icon"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={toggleConfirmPasswordVisibility}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <div className="auth-validation">
                  Passwords do not match
                </div>
              )}
              {formData.confirmPassword && formData.password === formData.confirmPassword && (
                <div className="auth-success"></div>
              )}
            </div>

            <div className="auth-remember">
              <label className="auth-remember">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  className="auth-checkbox"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
                <span className="auth-remember-label">
                  I agree to the{' '}
                  <a href="#/terms" className="auth-footer-link">
                    Terms of Service
                  </a>
                  {' '}and{' '}
                  <a href="#/privacy" className="auth-footer-link">
                    Privacy Policy
                  </a>
                </span>
              </label>
            </div>

            <button
              type="submit"
              className="auth-submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="auth-loading">
                  <span className="auth-spinner"></span>
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>

            <div className="auth-divider">
              <span>or sign up with</span>
            </div>

            <div className="auth-social">
              <button
                type="button"
                className="auth-social-btn"
                onClick={() => handleSocialSignup('google')}
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
                onClick={() => handleSocialSignup('github')}
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
            Already have an account?{' '}
            <a href="#/login" className="auth-footer-link">
              Sign in
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}