import { useState } from 'react'
import '../styles/pages.css'
import ThemeToggle from '../components/ThemeToggle'

export default function Search() {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(false)
  
  // Mock search results
  const [results, setResults] = useState({
    rooms: [
      { id: 1, name: 'Advanced Calculus', subject: 'Mathematics', participants: 15, description: 'Deep dive into integration techniques' },
      { id: 2, name: 'Organic Chemistry Study', subject: 'Chemistry', participants: 8, description: 'Weekly organic chemistry review sessions' },
      { id: 3, name: 'Computer Science Algorithms', subject: 'Computer Science', participants: 22, description: 'Algorithm practice and discussion' },
    ],
    users: [
      { id: 1, name: 'Alice Johnson', avatar: 'A', subjects: ['Mathematics', 'Physics'], bio: 'Math major passionate about calculus' },
      { id: 2, name: 'Bob Smith', avatar: 'B', subjects: ['Computer Science'], bio: 'CS student interested in algorithms' },
      { id: 3, name: 'Carol Davis', avatar: 'C', subjects: ['Chemistry', 'Biology'], bio: 'Chemistry student, loves lab work' },
    ],
    resources: [
      { id: 1, name: 'Calculus Formula Sheet.pdf', type: 'pdf', room: 'Advanced Calculus', uploader: 'Alice Johnson' },
      { id: 2, name: 'Algorithm Notes.docx', type: 'doc', room: 'Computer Science Algorithms', uploader: 'Bob Smith' },
      { id: 3, name: 'Chemistry Periodic Table.png', type: 'image', room: 'Organic Chemistry Study', uploader: 'Carol Davis' },
    ]
  })

  const handleSearch = async () => {
    if (!query.trim()) return
    
    setIsLoading(true)
    try {
      // ============================================
      // BACKEND INTEGRATION PLACEHOLDER
      // ============================================
      // Replace this setTimeout with your actual API call
      // Example:
      // const response = await fetch(`/api/search?q=${query}&filter=${filter}`, {
      //   method: 'GET'
      // })
      // const data = await response.json()
      // setResults(data)
      
      await new Promise(resolve => setTimeout(resolve, 800))
      console.log('Search query:', query, 'Filter:', filter)
    } catch (err) {
      console.error('Search error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const filteredResults = () => {
    if (filter === 'all') return results
    if (filter === 'rooms') return { rooms: results.rooms, users: [], resources: [] }
    if (filter === 'users') return { rooms: [], users: results.users, resources: [] }
    if (filter === 'resources') return { rooms: [], users: [], resources: results.resources }
    return results
  }

  const currentResults = filteredResults()

  return (
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
        <div className="page-inner search-inner">
          <div className="search-header">
            <h1 className="page-title">Search</h1>
            <p className="page-subtitle">Find rooms, users, and resources</p>
          </div>

          <div className="search-container">
            <div className="search-bar">
              <div className="search-input-wrapper">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search for rooms, users, or resources..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <button
                  className="btn btn-primary"
                  onClick={handleSearch}
                  disabled={isLoading}
                >
                  {isLoading ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>

            <div className="search-filters">
              <button
                className={`filter-btn ${filter === 'all' ? 'filter-btn-active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All
              </button>
              <button
                className={`filter-btn ${filter === 'rooms' ? 'filter-btn-active' : ''}`}
                onClick={() => setFilter('rooms')}
              >
                Rooms
              </button>
              <button
                className={`filter-btn ${filter === 'users' ? 'filter-btn-active' : ''}`}
                onClick={() => setFilter('users')}
              >
                Users
              </button>
              <button
                className={`filter-btn ${filter === 'resources' ? 'filter-btn-active' : ''}`}
                onClick={() => setFilter('resources')}
              >
                Resources
              </button>
            </div>

            <div className="search-results">
              {query && (
                <>
                  {/* Room Results */}
                  {currentResults.rooms.length > 0 && (
                    <div className="search-section">
                      <h3 className="search-section-title">Rooms ({currentResults.rooms.length})</h3>
                      <div className="search-results-list">
                        {currentResults.rooms.map(room => (
                          <div key={room.id} className="search-result-item">
                            <div className="search-result-icon">📚</div>
                            <div className="search-result-content">
                              <div className="search-result-title">{room.name}</div>
                              <div className="search-result-meta">
                                <span className="badge badge-primary">{room.subject}</span>
                                <span className="search-result-participants">👥 {room.participants}</span>
                              </div>
                              <div className="search-result-description">{room.description}</div>
                            </div>
                            <button className="btn btn-sm btn-primary">Join Room</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* User Results */}
                  {currentResults.users.length > 0 && (
                    <div className="search-section">
                      <h3 className="search-section-title">Users ({currentResults.users.length})</h3>
                      <div className="search-results-list">
                        {currentResults.users.map(user => (
                          <div key={user.id} className="search-result-item">
                            <div className="search-result-avatar">{user.avatar}</div>
                            <div className="search-result-content">
                              <div className="search-result-title">{user.name}</div>
                              <div className="search-result-meta">
                                {user.subjects.map(subject => (
                                  <span key={subject} className="badge badge-secondary">{subject}</span>
                                ))}
                              </div>
                              <div className="search-result-description">{user.bio}</div>
                            </div>
                            <div className="search-result-actions">
                              <button className="btn btn-sm btn-ghost">View Profile</button>
                              <button className="btn btn-sm btn-primary">Add Friend</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Resource Results */}
                  {currentResults.resources.length > 0 && (
                    <div className="search-section">
                      <h3 className="search-section-title">Resources ({currentResults.resources.length})</h3>
                      <div className="search-results-list">
                        {currentResults.resources.map(resource => (
                          <div key={resource.id} className="search-result-item">
                            <div className="search-result-icon">
                              {resource.type === 'pdf' && '📄'}
                              {resource.type === 'doc' && '📝'}
                              {resource.type === 'image' && '🖼️'}
                            </div>
                            <div className="search-result-content">
                              <div className="search-result-title">{resource.name}</div>
                              <div className="search-result-meta">
                                <span className="badge badge-muted">{resource.type}</span>
                                <span className="search-result-room">📚 {resource.room}</span>
                              </div>
                              <div className="search-result-description">Uploaded by {resource.uploader}</div>
                            </div>
                            <button className="btn btn-sm btn-ghost">Download</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentResults.rooms.length === 0 && 
                   currentResults.users.length === 0 && 
                   currentResults.resources.length === 0 && (
                    <div className="search-empty">
                      <div className="search-empty-icon">🔍</div>
                      <h3>No results found</h3>
                      <p>Try different search terms or filters</p>
                    </div>
                  )}
                </>
              )}

              {!query && (
                <div className="search-empty">
                  <div className="search-empty-icon">🔍</div>
                  <h3>Start searching</h3>
                  <p>Enter a search term to find rooms, users, or resources</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <footer className="page-footer">
        <p>© {new Date().getFullYear()} CollaborativeApp — Built for students</p>
      </footer>
    </div>
  )
}
