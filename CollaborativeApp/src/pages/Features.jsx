import '../styles/pages.css'
import ThemeToggle from '../components/ThemeToggle'

export default function Features(){
  const coreFeatures = [
    { icon: '🎯', title: 'Live Study Rooms', description: 'Create temporary rooms for group sessions with synced cursors and voice chat.', status: 'available' },
    { icon: '📝', title: 'Shared Notes', description: 'Collaborative documents with version history and highlights.', status: 'available' },
    { icon: '📋', title: 'Assignments & Tasks', description: 'Track deadlines, assign work, and get reminders.', status: 'available' },
    { icon: '🏆', title: 'Study Gamification', description: 'Earn badges, streaks, and friendly leaderboards to stay motivated.', status: 'available' },
  ]

  const advancedFeatures = [
    { icon: '🎙️', title: 'Voice Chat Integration', description: 'Crystal-clear audio communication during study sessions.', status: 'coming-soon' },
    { icon: '⏱️', title: 'Productivity Timers', description: 'Built-in Pomodoro method and customizable timer settings.', status: 'coming-soon' },
    { icon: '🤖', title: 'AI Study Insights', description: 'Automated tracking of challenging lessons with targeted assistance.', status: 'coming-soon' },
    { icon: '🎨', title: 'Collaborative Whiteboard', description: 'Shared digital whiteboards for real-time brainstorming sessions.', status: 'coming-soon' },
    { icon: '📊', title: 'Performance Analytics', description: 'Comparative analysis of historical and current performance scores.', status: 'coming-soon' },
    { icon: '🧠', title: 'Metacognitive Reflection', description: 'AI analysis of mock exam results to improve learning strategies.', status: 'coming-soon' },
  ]

  return (
    <div className="page-root">
      <header className="page-header">
        <div className="page-header-brand">
          <a href="#/" className="page-header-logo">📚</a>
          <a href="#/" className="page-header-title">CollaborativeApp</a>
        </div>
        <nav className="page-header-nav">
          <a href="#/login" className="btn btn-ghost btn-sm">Sign In</a>
          <a href="#/signup" className="btn btn-primary btn-sm">Sign Up</a>
          <ThemeToggle />
          <a href="#/" className="btn btn-ghost btn-sm">Back to Home</a>
        </nav>
      </header>

      <div className="page-content">
        <div className="page-inner">
          <h1 className="page-title">Features</h1>
          <p className="page-subtitle">Explore the powerful tools designed to enhance your collaborative learning experience.</p>
          
          <div className="features-page">
            <div className="feature-category">
              <h2 className="feature-category-title">Core Features</h2>
              {coreFeatures.map((feature, index) => (
                <div key={index} className="feature-item">
                  <div className="feature-item-icon">{feature.icon}</div>
                  <div className="feature-item-content">
                    <h3 className="feature-item-title">{feature.title}</h3>
                    <p className="feature-item-description">{feature.description}</p>
                    <span className={`feature-item-status feature-item-status-${feature.status}`}>
                      {feature.status === 'available' ? '✓ Available' : '🔜 Coming Soon'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="feature-category">
              <h2 className="feature-category-title">Advanced Features</h2>
              {advancedFeatures.map((feature, index) => (
                <div key={index} className="feature-item">
                  <div className="feature-item-icon">{feature.icon}</div>
                  <div className="feature-item-content">
                    <h3 className="feature-item-title">{feature.title}</h3>
                    <p className="feature-item-description">{feature.description}</p>
                    <span className={`feature-item-status feature-item-status-${feature.status}`}>
                      {feature.status === 'available' ? '✓ Available' : '🔜 Coming Soon'}
                    </span>
                  </div>
                </div>
              ))}
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
