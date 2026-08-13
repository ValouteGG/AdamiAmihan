import { useState, useEffect, useRef } from 'react'
import '../styles/pages.css'
import ThemeToggle from '../components/ThemeToggle'
import ProtectedRoute from '../components/ProtectedRoute'

export default function Timer() {
  const [mode, setMode] = useState('pomodoro') // 'pomodoro', 'shortBreak', 'longBreak'
  const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false)
  const [customTime, setCustomTime] = useState(25)
  const [sessions, setSessions] = useState(0)
  const [totalFocusTime, setTotalFocusTime] = useState(0)
  const intervalRef = useRef(null)
  
  const modes = {
    pomodoro: { label: 'Pomodoro', defaultTime: 25, color: '#6d28d9' },
    shortBreak: { label: 'Short Break', defaultTime: 5, color: '#10b981' },
    longBreak: { label: 'Long Break', defaultTime: 15, color: '#3b82f6' }
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimerComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning])

  const handleTimerComplete = () => {
    setIsRunning(false)
    setSessions(prev => prev + 1)
    setTotalFocusTime(prev => prev + modes[mode].defaultTime)
    
    // Play notification sound (placeholder)
    // ============================================
    // BACKEND INTEGRATION PLACEHOLDER
    // ============================================
    // Add sound notification integration
    
    // Show browser notification
    if (Notification.permission === 'granted') {
      new Notification('Timer Complete!', {
        body: `${modes[mode].label} session finished`,
        icon: '/logo.svg'
      })
    }
    
    console.log('Timer completed:', mode)
  }

  const toggleTimer = () => {
    setIsRunning(!isRunning)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setTimeLeft(modes[mode].defaultTime * 60)
  }

  const handleModeChange = (newMode) => {
    setMode(newMode)
    setIsRunning(false)
    setTimeLeft(modes[newMode].defaultTime * 60)
    setCustomTime(modes[newMode].defaultTime)
  }

  const handleCustomTimeChange = (e) => {
    const value = parseInt(e.target.value)
    if (value > 0 && value <= 120) {
      setCustomTime(value)
      setTimeLeft(value * 60)
    }
  }

  const applyCustomTime = () => {
    setTimeLeft(customTime * 60)
    setIsRunning(false)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const progress = ((modes[mode].defaultTime * 60 - timeLeft) / (modes[mode].defaultTime * 60)) * 100

  return (
    <ProtectedRoute>
      <div className="page-root">
        <header className="page-header">
          <div className="page-header-brand">
            <a href="#/" className="page-header-logo">📚</a>
            <a href="#/" className="page-header-title">CollaborativeApp</a>
          </div>
          <nav className="page-header-nav">
            <a href="#/" className="btn btn-ghost btn-sm">Dashboard</a>
            <a href="#/browse" className="btn btn-ghost btn-sm">Browse Rooms</a>
            <a href="#/create" className="btn btn-primary btn-sm">Create Room</a>
            <ThemeToggle />
            <a href="#/profile" className="btn btn-ghost btn-sm">Profile</a>
          </nav>
        </header>

      <div className="page-content">
        <div className="page-inner timer-inner">
          <div className="timer-header">
            <h1 className="page-title">Study Timer</h1>
            <p className="page-subtitle">Stay focused with Pomodoro technique</p>
          </div>

          <div className="timer-container">
            {/* Mode Selector */}
            <div className="timer-modes">
              {Object.entries(modes).map(([key, value]) => (
                <button
                  key={key}
                  className={`timer-mode-btn ${mode === key ? 'timer-mode-btn-active' : ''}`}
                  onClick={() => handleModeChange(key)}
                  style={{
                    borderColor: mode === key ? value.color : 'transparent'
                  }}
                >
                  {value.label}
                </button>
              ))}
            </div>

            {/* Timer Display */}
            <div className="timer-display">
              <div className="timer-circle">
                <svg className="timer-progress" viewBox="0 0 200 200">
                  <circle
                    className="timer-progress-bg"
                    cx="100"
                    cy="100"
                    r="90"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                  />
                  <circle
                    className="timer-progress-fill"
                    cx="100"
                    cy="100"
                    r="90"
                    fill="none"
                    stroke={modes[mode].color}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 90}`}
                    strokeDashoffset={`${2 * Math.PI * 90 * (1 - progress / 100)}`}
                    transform="rotate(-90 100 100)"
                    style={{
                      transition: 'stroke-dashoffset 1s linear'
                    }}
                  />
                </svg>
                <div className="timer-time">
                  {formatTime(timeLeft)}
                </div>
              </div>
            </div>

            {/* Timer Controls */}
            <div className="timer-controls">
              <button
                className="btn btn-lg timer-toggle-btn"
                onClick={toggleTimer}
                style={{
                  background: isRunning ? 'var(--color-error)' : 'var(--color-primary)'
                }}
              >
                {isRunning ? '⏸ Pause' : '▶ Start'}
              </button>
              <button className="btn btn-lg btn-ghost" onClick={resetTimer}>
                ↺ Reset
              </button>
            </div>

            {/* Custom Time */}
            <div className="timer-custom">
              <label className="timer-custom-label">Custom time (minutes):</label>
              <div className="timer-custom-inputs">
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={customTime}
                  onChange={handleCustomTimeChange}
                  className="timer-custom-input"
                />
                <button className="btn btn-sm btn-primary" onClick={applyCustomTime}>
                  Apply
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="timer-stats">
              <div className="timer-stat">
                <div className="timer-stat-value">{sessions}</div>
                <div className="timer-stat-label">Sessions Today</div>
              </div>
              <div className="timer-stat">
                <div className="timer-stat-value">{Math.floor(totalFocusTime / 60)}h {totalFocusTime % 60}m</div>
                <div className="timer-stat-label">Total Focus Time</div>
              </div>
            </div>

            {/* Tips */}
            <div className="timer-tips">
              <h3>💡 Pomodoro Tips</h3>
              <ul className="timer-tips-list">
                <li>Work in focused 25-minute sessions</li>
                <li>Take short 5-minute breaks between sessions</li>
                <li>After 4 sessions, take a longer 15-minute break</li>
                <li>Use breaks to stretch, hydrate, and rest your eyes</li>
                <li>Eliminate distractions during focus time</li>
              </ul>
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
