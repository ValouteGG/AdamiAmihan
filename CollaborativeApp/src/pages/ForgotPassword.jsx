import { useState } from 'react'
import '../styles/auth.css'
import ThemeToggle from '../components/ThemeToggle'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!email) {
      setError('Please enter your email address')
      return
    }

    if (!email.includes('@')) {
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
      // const response = await fetch('/api/auth/forgot-password', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email })
      // })
      // const data = await response.json()
      // if (response.ok) {
      //     setSuccess(true)
      //     console.log('Password reset email sent:', data)
      // } else {
      //     setError(data.message || 'Failed to send reset email')
      // }
      
      await new Promise(resolve => setTimeout(resolve, 1500))
      console.log('Password reset requested for:', email)
      setSuccess(true)
      setEmail('')
      
    } catch (err) {
      setError('An error occurred. Please try again.')
      console.error('Password reset error:', err)
    } finally {
      setIsLoading(false)
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
            <a href="#/" className="auth-logo">🔐</a>
            <h1 className="auth-title">Forgot Password?</h1>
            <p className="auth-subtitle">Enter your email address and we'll send you a link to reset your password</p>
          </div>

          {success ? (
            <div className="auth-success">
              <div className="auth-success-icon">✓</div>
              <h3 className="auth-success-title">Check your email</h3>
              <p className="auth-success-message">
                We've sent a password reset link to your email address. Please check your inbox and follow the instructions.
              </p>
              <button
                className="auth-submit"
                onClick={() => setSuccess(false)}
              >
                Send another link
              </button>
            </div>
          ) : (
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
                    className="auth-input auth-input-with-icon"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="auth-submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="auth-loading">
                    <span className="auth-spinner"></span>
                    Sending...
                  </span>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>
          )}

          <div className="auth-footer">
            Remember your password?{' '}
            <a href="#/login" className="auth-footer-link">
              Sign in
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
