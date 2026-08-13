import { useState } from 'react'
import '../styles/auth.css'

export default function Signup() {
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
    if (password.length >= 8) strength++
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

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long')
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
      // ============================================
      // BACKEND INTEGRATION PLACEHOLDER
      // ============================================
      // Replace this setTimeout with your actual API call
      // Example:
      // const response = await fetch('/api/auth/signup', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     firstName: formData.firstName,
      //     lastName: formData.lastName,
      //     email: formData.email,
      //     password: formData.password
      //   })
      // })
      // const data = await response.json()
      // if (response.ok) {
      //     // Handle successful signup
      //     console.log('Signup successful:', data)
      //     // Redirect to login or dashboard
      //     window.location.hash = '#/login'
      // } else {
      //     setError(data.message || 'Signup failed')
      // }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // For demo purposes, just log the data
      console.log('Signup attempt:', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email
      })
      alert('Signup functionality ready for backend integration!')
      
      // Reset form after successful submission
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        agreeToTerms: false
      })
      
    } catch (err) {
      setError('An error occurred. Please try again.')
      console.error('Signup error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle social signup (placeholder)
  const handleSocialSignup = (provider) => {
    console.log(`${provider} signup clicked`)
    // ============================================
    // BACKEND INTEGRATION PLACEHOLDER
    // ============================================
    // Implement OAuth/social signup logic here
    // Example: window.location.href = `/api/auth/${provider}`
  }

  return (
    <div className="auth-root">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">📚</div>
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
                <span className="auth-input-icon">👤</span>
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
                <span className="auth-input-icon">👤</span>
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
                Must be at least 8 characters with a mix of letters, numbers, and symbols
              </div>
            </div>

            <div className="auth-form-group">
              <label className="auth-label">
                Confirm Password
                <span className="auth-label-required">*</span>
              </label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon">🔒</span>
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
                  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <div className="auth-validation">
                  Passwords do not match
                </div>
              )}
              {formData.confirmPassword && formData.password === formData.confirmPassword && (
                <div className="auth-success">
                  Passwords match
                </div>
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
                <span className="auth-social-icon">🔍</span>
                Google
              </button>
              <button
                type="button"
                className="auth-social-btn"
                onClick={() => handleSocialSignup('github')}
                disabled={isLoading}
              >
                <span className="auth-social-icon">🐙</span>
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