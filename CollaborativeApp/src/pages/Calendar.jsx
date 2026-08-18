import { useState, useEffect } from 'react'
import '../styles/pages.css'
import ThemeToggle from '../components/ThemeToggle'
import ProtectedRoute from '../components/ProtectedRoute'
import { BookOpen } from 'lucide-react'
import { supabase } from '../config/supabase'

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [view, setView] = useState('month') // 'month', 'week', 'day'
  const [showAddEvent, setShowAddEvent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [events, setEvents] = useState([])
  const [eventsLoading, setEventsLoading] = useState(true)
  const [rooms, setRooms] = useState([])
  
  // Add event form state
  const [eventTitle, setEventTitle] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [eventTime, setEventTime] = useState('')
  const [eventRoom, setEventRoom] = useState('')
  const [eventDescription, setEventDescription] = useState('')

  // Fetch user's rooms and schedules
  useEffect(() => {
    const fetchCalendarData = async () => {
      try {
        setEventsLoading(true)
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session?.access_token) {
          return
        }

        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        }

        // Fetch user's rooms
        const roomsResponse = await fetch('http://localhost:4002/api/rooms', {
          headers
        })
        
        if (roomsResponse.ok) {
          const roomsData = await roomsResponse.json()
          setRooms(roomsData.rooms || [])
          
          // Fetch schedules from each room
          const allSchedules = []
          
          for (const room of roomsData.rooms || []) {
            try {
              const scheduleResponse = await fetch(`http://localhost:4002/api/rooms/${room.id}/schedules`, {
                headers
              })
              
              if (scheduleResponse.ok) {
                const scheduleData = await scheduleResponse.json()
                const roomSchedules = (scheduleData.schedules || []).map(schedule => {
                  const scheduleDate = new Date(schedule.date)
                  return {
                    id: schedule.id,
                    title: schedule.title,
                    date: scheduleDate,
                    time: schedule.time,
                    room: room.name,
                    type: 'study',
                    roomId: room.id,
                    description: schedule.description,
                    isOwner: room.role === 'owner'
                  }
                })
                
                allSchedules.push(...roomSchedules)
              }
            } catch (scheduleError) {
              console.log(`Failed to fetch schedules for room ${room.id}:`, scheduleError.message)
            }
          }
          
          setEvents(allSchedules)
        }
      } catch (error) {
        console.error('Error fetching calendar data:', error)
      } finally {
        setEventsLoading(false)
      }
    }

    fetchCalendarData()
  }, [])

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
    // Set the event date to the selected date when opening the add event modal
    setEventDate(date.toISOString().split('T')[0])
  }

  const handleAddEvent = async () => {
    if (!eventTitle.trim() || !eventDate || !eventTime || !eventRoom) {
      alert('Please fill in all required fields')
      return
    }

    try {
      setIsLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        alert('You must be logged in to create events')
        return
      }

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      }

      const response = await fetch(`http://localhost:4002/api/rooms/${eventRoom}/schedules`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: eventTitle,
          date: eventDate,
          time: eventTime,
          description: eventDescription
        })
      })

      const data = await response.json()

      if (response.ok) {
        // Add the new schedule to the events list
        const scheduleDate = new Date(data.schedule.date)
        const newEvent = {
          id: data.schedule.id,
          title: data.schedule.title,
          date: scheduleDate,
          time: data.schedule.time,
          room: rooms.find(r => r.id === eventRoom)?.name || 'Unknown',
          type: 'study',
          roomId: eventRoom,
          description: eventDescription
        }
        
        setEvents(prev => [...prev, newEvent])
        
        // Reset form
        setEventTitle('')
        setEventDate('')
        setEventTime('')
        setEventRoom('')
        setEventDescription('')
        setShowAddEvent(false)
        
        alert('Event created successfully!')
      } else {
        console.error('Failed to create event:', data.error)
        alert('Failed to create event: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error adding event:', error)
      alert('Failed to add event: ' + error.message)
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
              onClick={() => {
                setEventDate(selectedDate.toISOString().split('T')[0])
                setShowAddEvent(true)
              }}
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
                    {eventsLoading ? (
                      <div className="loading-state">Loading events...</div>
                    ) : (
                      <>
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
                      </>
                    )}
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
              
              {eventsLoading ? (
                <div className="loading-state">Loading events...</div>
              ) : selectedDateEvents.length > 0 ? (
                <div className="calendar-events-list">
                  {selectedDateEvents.map(event => (
                    <div 
                      key={event.id} 
                      className="calendar-event-card"
                      onClick={() => window.location.hash = `#/room/${event.roomId}`}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="calendar-event-time">{event.time}</div>
                      <div className="calendar-event-title">{event.title}</div>
                      <div className="calendar-event-room">📚 {event.room}</div>
                      {event.description && (
                        <div className="calendar-event-description">{event.description}</div>
                      )}
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
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Enter event title"
                      value={eventTitle}
                      onChange={(e) => setEventTitle(e.target.value)}
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-label">
                      <span className="form-label-text">Date</span>
                      <input 
                        type="date" 
                        className="form-input"
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                      />
                    </div>
                    <div className="form-label">
                      <span className="form-label-text">Time</span>
                      <input 
                        type="time" 
                        className="form-input"
                        value={eventTime}
                        onChange={(e) => setEventTime(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="form-label">
                    <span className="form-label-text">Room</span>
                    <select 
                      className="form-select"
                      value={eventRoom}
                      onChange={(e) => setEventRoom(e.target.value)}
                    >
                      <option value="">Select a room</option>
                      {rooms.filter(room => room.role === 'owner').map(room => (
                        <option key={room.id} value={room.id}>{room.name}</option>
                      ))}
                    </select>
                    {rooms.filter(room => room.role === 'owner').length === 0 && (
                      <small className="form-label-hint">Only room owners can create schedules</small>
                    )}
                  </div>
                  <div className="form-label">
                    <span className="form-label-text">Description (optional)</span>
                    <textarea 
                      className="form-textarea"
                      placeholder="Add details about this event..."
                      value={eventDescription}
                      onChange={(e) => setEventDescription(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-ghost" onClick={() => setShowAddEvent(false)}>Cancel</button>
                  <button
                    className="btn btn-primary"
                    onClick={handleAddEvent}
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
