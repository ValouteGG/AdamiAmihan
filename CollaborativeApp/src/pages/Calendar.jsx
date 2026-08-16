import { useState } from 'react'
import '../styles/pages.css'
import ThemeToggle from '../components/ThemeToggle'
import ProtectedRoute from '../components/ProtectedRoute'
import { BookOpen } from 'lucide-react'

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [view, setView] = useState('month') // 'month', 'week', 'day'
  const [showAddEvent, setShowAddEvent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  // Mock events data
  const [events] = useState([
    { id: 1, title: 'Calculus Study Session', date: new Date(2024, 0, 20), time: '3:00 PM', room: 'Calculus Study Group', type: 'study' },
    { id: 2, title: 'Physics Lab Meeting', date: new Date(2024, 0, 22), time: '10:00 AM', room: 'Physics Lab Partners', type: 'lab' },
    { id: 3, title: 'Literature Essay Workshop', date: new Date(2024, 0, 25), time: '2:00 PM', room: 'Literature Discussion', type: 'workshop' },
    { id: 4, title: 'CS Algorithm Practice', date: new Date(2024, 0, 27), time: '4:00 PM', room: 'Computer Science Algorithms', type: 'study' },
  ])

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    return { daysInMonth, startingDayOfWeek }
  }

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate)

  const getEventsForDate = (date) => {
    return events.filter(event => 
      event.date.toDateString() === date.toDateString()
    )
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const handleToday = () => {
    setCurrentDate(new Date())
    setSelectedDate(new Date())
  }

  const handleDateClick = (date) => {
    setSelectedDate(date)
  }

  const handleAddEvent = async (eventData) => {
    setIsLoading(true)
    try {
      // ============================================
      // BACKEND INTEGRATION PLACEHOLDER
      // ============================================
      // Replace this setTimeout with your actual API call
      // Example:
      // const response = await fetch('/api/calendar/events', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(eventData)
      // })
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Event added:', eventData)
      setShowAddEvent(false)
    } catch (err) {
      console.error('Error adding event:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const getEventTypeColor = (type) => {
    switch (type) {
      case 'study': return 'badge-primary'
      case 'lab': return 'badge-secondary'
      case 'workshop': return 'badge-success'
      default: return 'badge-muted'
    }
  }

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const selectedDateEvents = getEventsForDate(selectedDate)

  return (
    <ProtectedRoute>
      <div className="page-root">
        <header className="page-header">
          <div className="page-header-brand">
            <a href="#/" className="page-header-logo">
              <BookOpen size={24} />
            </a>
            <div className="page-header-brand-text">
              <a href="#/" className="page-header-title">CollaborativeApp</a>
              <span className="page-header-current">Calendar</span>
            </div>
          </div>
          <nav className="page-header-nav">
            <a href="#/dashboard" className="btn btn-ghost btn-sm">Dashboard</a>
            <a href="#/browse" className="btn btn-ghost btn-sm">Browse Rooms</a>
            <a href="#/create" className="btn btn-primary btn-sm">Create Room</a>
            <a href="#/friends" className="btn btn-ghost btn-sm">Friends</a>
            <a href="#/messages" className="btn btn-ghost btn-sm">Messages</a>
            <ThemeToggle />
            <a href="#/profile" className="btn btn-ghost btn-sm">Profile</a>
            <a href="#/settings" className="btn btn-ghost btn-sm">Settings</a>
          </nav>
        </header>

      <div className="page-content">
        <div className="page-inner calendar-inner">
          <div className="calendar-header">
            <div>
              <h1 className="page-title">Calendar</h1>
              <p className="page-subtitle">Schedule and manage your study sessions</p>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => setShowAddEvent(true)}
            >
              + Add Event
            </button>
          </div>

          <div className="calendar-container">
            <div className="calendar-main">
              <div className="calendar-controls">
                <div className="calendar-navigation">
                  <button className="btn btn-sm btn-ghost" onClick={handlePrevMonth}>
                    ←
                  </button>
                  <button className="btn btn-sm btn-ghost" onClick={handleToday}>
                    Today
                  </button>
                  <button className="btn btn-sm btn-ghost" onClick={handleNextMonth}>
                    →
                  </button>
                </div>
                <h2 className="calendar-month-title">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <div className="calendar-view-toggle">
                  <button
                    className={`btn btn-sm ${view === 'month' ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setView('month')}
                  >
                    Month
                  </button>
                  <button
                    className={`btn btn-sm ${view === 'week' ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setView('week')}
                  >
                    Week
                  </button>
                  <button
                    className={`btn btn-sm ${view === 'day' ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setView('day')}
                  >
                    Day
                  </button>
                </div>
              </div>

              {view === 'month' && (
                <div className="calendar-month-view">
                  <div className="calendar-weekdays">
                    {dayNames.map(day => (
                      <div key={day} className="calendar-weekday">{day}</div>
                    ))}
                  </div>
                  <div className="calendar-days">
                    {/* Empty cells for days before the first day of the month */}
                    {Array.from({ length: startingDayOfWeek }).map((_, index) => (
                      <div key={`empty-${index}`} className="calendar-day calendar-day-empty"></div>
                    ))}
                    
                    {/* Days of the month */}
                    {Array.from({ length: daysInMonth }).map((_, index) => {
                      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), index + 1)
                      const dayEvents = getEventsForDate(date)
                      const isSelected = date.toDateString() === selectedDate.toDateString()
                      const isToday = date.toDateString() === new Date().toDateString()
                      
                      return (
                        <div
                          key={index}
                          className={`calendar-day ${isSelected ? 'calendar-day-selected' : ''} ${isToday ? 'calendar-day-today' : ''}`}
                          onClick={() => handleDateClick(date)}
                        >
                          <div className="calendar-day-number">{index + 1}</div>
                          {dayEvents.length > 0 && (
                            <div className="calendar-day-events">
                              {dayEvents.slice(0, 3).map(event => (
                                <div key={event.id} className="calendar-day-event">
                                  {event.title}
                                </div>
                              ))}
                              {dayEvents.length > 3 && (
                                <div className="calendar-day-more">+{dayEvents.length - 3} more</div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Events Sidebar */}
            <div className="calendar-sidebar">
              <div className="calendar-sidebar-header">
                <h3>
                  {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h3>
              </div>
              
              {selectedDateEvents.length > 0 ? (
                <div className="calendar-events-list">
                  {selectedDateEvents.map(event => (
                    <div key={event.id} className="calendar-event-card">
                      <div className="calendar-event-time">{event.time}</div>
                      <div className="calendar-event-title">{event.title}</div>
                      <div className="calendar-event-room">📚 {event.room}</div>
                      <span className={`badge ${getEventTypeColor(event.type)}`}>{event.type}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="calendar-no-events">
                  <div className="calendar-no-events-icon">📅</div>
                  <p>No events scheduled</p>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => setShowAddEvent(true)}
                  >
                    Add Event
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Add Event Modal */}
          {showAddEvent && (
            <div className="modal-overlay" onClick={() => setShowAddEvent(false)}>
              <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>Add New Event</h3>
                  <button className="btn btn-sm btn-ghost" onClick={() => setShowAddEvent(false)}>✕</button>
                </div>
                <div className="modal-body">
                  <div className="form-label">
                    <span className="form-label-text">Event Title</span>
                    <input type="text" className="form-input" placeholder="Enter event title" />
                  </div>
                  <div className="form-row">
                    <div className="form-label">
                      <span className="form-label-text">Date</span>
                      <input type="date" className="form-input" />
                    </div>
                    <div className="form-label">
                      <span className="form-label-text">Time</span>
                      <input type="time" className="form-input" />
                    </div>
                  </div>
                  <div className="form-label">
                    <span className="form-label-text">Room</span>
                    <select className="form-select">
                      <option value="">Select a room</option>
                      <option value="1">Calculus Study Group</option>
                      <option value="2">Physics Lab Partners</option>
                      <option value="3">Literature Discussion</option>
                    </select>
                  </div>
                  <div className="form-label">
                    <span className="form-label-text">Type</span>
                    <select className="form-select">
                      <option value="study">Study Session</option>
                      <option value="lab">Lab Meeting</option>
                      <option value="workshop">Workshop</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-ghost" onClick={() => setShowAddEvent(false)}>Cancel</button>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleAddEvent({ title: 'New Event' })}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Adding...' : 'Add Event'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <footer className="page-footer">
        <p>© {new Date().getFullYear()} CollaborativeApp — Built for students</p>
      </footer>
    </div>
    </ProtectedRoute>
  )
}
