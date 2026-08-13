import { useState, useRef, useEffect } from 'react'
import '../styles/pages.css'
import ThemeToggle from '../components/ThemeToggle'
import ProtectedRoute from '../components/ProtectedRoute'

export default function Whiteboard() {
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [color, setColor] = useState('#6d28d9')
  const [brushSize, setBrushSize] = useState(3)
  const [tool, setTool] = useState('pen') // 'pen', 'eraser', 'text', 'shapes'
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [participants] = useState([
    { id: 1, name: 'Alice Johnson', avatar: 'A', color: '#ef4444' },
    { id: 2, name: 'Bob Smith', avatar: 'B', color: '#10b981' },
    { id: 3, name: 'You', avatar: 'Y', color: '#6d28d9' },
  ])
  const [cursorPositions, setCursorPositions] = useState({})

  const colors = ['#6d28d9', '#ef4444', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280']

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Set initial canvas background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Simulate other users' cursors moving
    const interval = setInterval(() => {
      setCursorPositions({
        1: { x: Math.random() * canvas.width, y: Math.random() * canvas.height },
        2: { x: Math.random() * canvas.width, y: Math.random() * canvas.height },
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const startDrawing = (e) => {
    setIsDrawing(true)
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e) => {
    if (!isDrawing) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    ctx.lineTo(x, y)
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color
    ctx.lineWidth = tool === 'eraser' ? brushSize * 3 : brushSize
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  const saveCanvas = () => {
    const canvas = canvasRef.current
    const link = document.createElement('a')
    link.download = 'whiteboard.png'
    link.href = canvas.toDataURL()
    link.click()
  }

  const handleUndo = () => {
    // ============================================
    // BACKEND INTEGRATION PLACEHOLDER
    // ============================================
    // Implement undo functionality with canvas history
    console.log('Undo action')
  }

  const handleRedo = () => {
    // ============================================
    // BACKEND INTEGRATION PLACEHOLDER
    // ============================================
    // Implement redo functionality with canvas history
    console.log('Redo action')
  }

  return (
    <ProtectedRoute>
      <div className="page-root">
        <header className="page-header page-header-compact">
          <div className="page-header-brand">
            <a href="#/" className="btn btn-ghost btn-sm">← Back</a>
            <a href="#/" className="page-header-title">Whiteboard</a>
          </div>
          <nav className="page-header-nav">
            <div className="whiteboard-participants">
              {participants.map(p => (
                <div key={p.id} className="participant-badge" style={{ borderLeftColor: p.color }}>
                  <span className="participant-avatar-mini">{p.avatar}</span>
                  <span className="participant-name-mini">{p.name}</span>
                </div>
              ))}
            </div>
            <button className="btn btn-sm btn-primary" onClick={() => window.location.hash = '#/create'}>
              Invite
            </button>
            <ThemeToggle />
          </nav>
        </header>

        <div className="whiteboard-container">
          {/* Toolbar */}
          <div className="whiteboard-toolbar">
            <div className="toolbar-section">
              <button
                className={`toolbar-btn ${tool === 'pen' ? 'toolbar-btn-active' : ''}`}
                onClick={() => setTool('pen')}
                title="Pen"
              >
                ✏️
              </button>
              <button
                className={`toolbar-btn ${tool === 'eraser' ? 'toolbar-btn-active' : ''}`}
                onClick={() => setTool('eraser')}
                title="Eraser"
              >
                🧹
              </button>
              <button
                className={`toolbar-btn ${tool === 'text' ? 'toolbar-btn-active' : ''}`}
                onClick={() => setTool('text')}
                title="Text"
              >
                📝
              </button>
              <button
                className={`toolbar-btn ${tool === 'shapes' ? 'toolbar-btn-active' : ''}`}
                onClick={() => setTool('shapes')}
                title="Shapes"
              >
                ⬛
              </button>
            </div>

            <div className="toolbar-divider"></div>

            <div className="toolbar-section">
              <div className="color-picker-container">
                <button
                  className="color-picker-btn"
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  style={{ backgroundColor: color }}
                ></button>
                {showColorPicker && (
                  <div className="color-picker-dropdown">
                    {colors.map(c => (
                      <button
                        key={c}
                        className="color-option"
                        style={{ backgroundColor: c }}
                        onClick={() => {
                          setColor(c)
                          setShowColorPicker(false)
                        }}
                      ></button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="toolbar-divider"></div>

            <div className="toolbar-section">
              <div className="brush-size-control">
                <button
                  className="brush-size-btn"
                  onClick={() => setBrushSize(Math.max(1, brushSize - 1))}
                >
                  -
                </button>
                <span className="brush-size-label">{brushSize}px</span>
                <button
                  className="brush-size-btn"
                  onClick={() => setBrushSize(Math.min(20, brushSize + 1))}
                >
                  +
                </button>
              </div>
            </div>

            <div className="toolbar-divider"></div>

            <div className="toolbar-section">
              <button className="toolbar-btn" onClick={handleUndo} title="Undo">
                ↩️
              </button>
              <button className="toolbar-btn" onClick={handleRedo} title="Redo">
                ↪️
              </button>
              <button className="toolbar-btn" onClick={clearCanvas} title="Clear">
                🗑️
              </button>
              <button className="toolbar-btn" onClick={saveCanvas} title="Save">
                💾
              </button>
            </div>
          </div>

          {/* Canvas Area */}
          <div className="whiteboard-canvas-container">
            <canvas
              ref={canvasRef}
              className="whiteboard-canvas"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
            />
            
            {/* Other users' cursors */}
            {Object.entries(cursorPositions).map(([userId, pos]) => {
              const user = participants.find(p => p.id === parseInt(userId))
              if (!user) return null
              return (
                <div
                  key={userId}
                  className="remote-cursor"
                  style={{
                    left: pos.x,
                    top: pos.y,
                    borderColor: user.color
                  }}
                >
                  <div className="cursor-label" style={{ backgroundColor: user.color }}>
                    {user.name}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Collaborative Chat */}
          <div className="whiteboard-chat">
            <div className="whiteboard-chat-header">
              <h3>Chat</h3>
              <span className="chat-badge">3 online</span>
            </div>
            <div className="whiteboard-chat-messages">
              <div className="chat-message">
                <div className="chat-message-header">
                  <span className="chat-message-user">Alice Johnson</span>
                  <span className="chat-message-time">2:30 PM</span>
                </div>
                <div className="chat-message-text">I added the diagram for the calculus problem</div>
              </div>
              <div className="chat-message">
                <div className="chat-message-header">
                  <span className="chat-message-user">Bob Smith</span>
                  <span className="chat-message-time">2:32 PM</span>
                </div>
                <div className="chat-message-text">Great! Let me add the labels</div>
              </div>
            </div>
            <div className="whiteboard-chat-input">
              <input
                type="text"
                className="chat-input-field"
                placeholder="Type a message..."
              />
              <button className="btn btn-sm btn-primary">Send</button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
