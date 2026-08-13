import { useState } from 'react'
import '../styles/pages.css'
import ThemeToggle from '../components/ThemeToggle'
import ProtectedRoute from '../components/ProtectedRoute'

export default function Messages() {
  const [activeConversation, setActiveConversation] = useState(null)
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  // Mock conversations data
  const [conversations] = useState([
    { 
      id: 1, 
      name: 'Alice Johnson', 
      avatar: 'A', 
      lastMessage: 'Hey! Are you coming to the study session?', 
      time: '2 min ago', 
      unread: 2,
      online: true 
    },
    { 
      id: 2, 
      name: 'Bob Smith', 
      avatar: 'B', 
      lastMessage: 'Thanks for sharing the notes!', 
      time: '1 hour ago', 
      unread: 0,
      online: false 
    },
    { 
      id: 3, 
      name: 'Carol Davis', 
      avatar: 'C', 
      lastMessage: 'Let me know when you\'re free to discuss the project', 
      time: '3 hours ago', 
      unread: 0,
      online: true 
    },
    { 
      id: 4, 
      name: 'Study Group Chat', 
      avatar: '👥', 
      lastMessage: 'David: I\'ll bring the snacks!', 
      time: '1 day ago', 
      unread: 5,
      online: false,
      isGroup: true 
    },
  ])

  // Mock messages for active conversation
  const [messages, setMessages] = useState([
    { id: 1, sender: 'Alice Johnson', text: 'Hey! How\'s the calculus study going?', time: '10:30 AM', isMine: false },
    { id: 2, sender: 'You', text: 'Pretty good! Just finished chapter 5', time: '10:32 AM', isMine: true },
    { id: 3, sender: 'Alice Johnson', text: 'Nice! Are you coming to the study session today?', time: '10:33 AM', isMine: false },
  ])

  const handleSendMessage = async () => {
    if (!message.trim() || !activeConversation) return

    const newMessage = {
      id: messages.length + 1,
      sender: 'You',
      text: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMine: true
    }

    setMessages(prev => [...prev, newMessage])
    setMessage('')

    // ============================================
    // BACKEND INTEGRATION PLACEHOLDER
    // ============================================
    // Replace this with actual WebSocket or API call
    // Example:
    // websocket.send(JSON.stringify({
    //   type: 'message',
    //   conversationId: activeConversation.id,
    //   message: message
    // }))
    
    console.log('Message sent:', newMessage)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const selectedConversation = activeConversation || conversations[0]

  return (
    <ProtectedRoute>
      <div className="page-root">
        <header className="page-header page-header-compact">
          <div className="page-header-brand">
            <a href="#/" className="page-header-logo">📚</a>
            <a href="#/" className="page-header-title">Messages</a>
          </div>
          <nav className="page-header-nav">
            <a href="#/" className="btn btn-ghost btn-sm">Dashboard</a>
            <a href="#/browse" className="btn btn-ghost btn-sm">Browse Rooms</a>
            <ThemeToggle />
            <a href="#/profile" className="btn btn-ghost btn-sm">Profile</a>
          </nav>
        </header>

      <div className="messages-container">
        {/* Conversations List */}
        <div className="messages-sidebar">
          <div className="messages-sidebar-header">
            <h2>Conversations</h2>
            <button className="btn btn-sm btn-primary">+ New</button>
          </div>
          <div className="conversations-list">
            {conversations.map(conv => (
              <div
                key={conv.id}
                className={`conversation-item ${activeConversation?.id === conv.id ? 'conversation-item-active' : ''}`}
                onClick={() => setActiveConversation(conv)}
              >
                <div className="conversation-avatar">
                  {conv.avatar}
                  {conv.online && <span className="conversation-status-online"></span>}
                </div>
                <div className="conversation-info">
                  <div className="conversation-header">
                    <span className="conversation-name">{conv.name}</span>
                    <span className="conversation-time">{conv.time}</span>
                  </div>
                  <div className="conversation-preview">
                    <span className="conversation-message">{conv.lastMessage}</span>
                    {conv.unread > 0 && (
                      <span className="conversation-unread">{conv.unread}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="messages-main">
          {selectedConversation ? (
            <>
              <div className="messages-chat-header">
                <div className="messages-chat-info">
                  <div className="messages-chat-avatar">
                    {selectedConversation.avatar}
                    {selectedConversation.online && <span className="messages-chat-status-online"></span>}
                  </div>
                  <div>
                    <div className="messages-chat-name">{selectedConversation.name}</div>
                    <div className="messages-chat-status">
                      {selectedConversation.online ? 'Online' : 'Offline'}
                    </div>
                  </div>
                </div>
                <div className="messages-chat-actions">
                  <button className="btn btn-sm btn-ghost">📞</button>
                  <button className="btn btn-sm btn-ghost">📹</button>
                  <button className="btn btn-sm btn-ghost">⋮</button>
                </div>
              </div>

              <div className="messages-chat-messages">
                {messages.map(msg => (
                  <div key={msg.id} className={`chat-message ${msg.isMine ? 'chat-message-mine' : ''}`}>
                    <div className="chat-message-header">
                      <span className="chat-message-sender">{msg.sender}</span>
                      <span className="chat-message-time">{msg.time}</span>
                    </div>
                    <div className="chat-message-text">{msg.text}</div>
                  </div>
                ))}
              </div>

              <div className="messages-chat-input">
                <div className="messages-input-wrapper">
                  <button className="btn btn-sm btn-ghost">📎</button>
                  <textarea
                    className="messages-input"
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    rows={1}
                  />
                  <button className="btn btn-sm btn-ghost">😊</button>
                  <button
                    className="btn btn-primary"
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                  >
                    Send
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="messages-empty">
              <div className="messages-empty-icon">💬</div>
              <h3>Select a conversation</h3>
              <p>Choose a conversation from the list to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
    </ProtectedRoute>
  )
}
