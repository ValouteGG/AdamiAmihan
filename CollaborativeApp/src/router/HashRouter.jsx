import { useEffect, useState } from 'react'
import Home from '../Home'
import CreateRoom from '../pages/CreateRoom'
import BrowseRooms from '../pages/BrowseRooms'
import About from '../pages/About'
import Features from '../pages/Features'
import Login from '../pages/Login'
import Signup from '../pages/Signup'
import ForgotPassword from '../pages/ForgotPassword'
import Profile from '../pages/Profile'
import Settings from '../pages/Settings'
import RoomDashboard from '../pages/RoomDashboard'
import Notifications from '../pages/Notifications'
import Help from '../pages/Help'
import Dashboard from '../pages/Dashboard'
import Search from '../pages/Search'
import Messages from '../pages/Messages'
import Calendar from '../pages/Calendar'
import Whiteboard from '../pages/Whiteboard'
import Timer from '../pages/Timer'
import Friends from '../pages/Friends'
import AuthCallback from '../pages/AuthCallback'

function getPath() {
  const hash = window.location.hash || '#/'
  // Remove query parameters from the path
  const pathWithoutQuery = hash.replace(/^#/, '').split('?')[0]
  return pathWithoutQuery
}

export default function HashRouter() {
  const [path, setPath] = useState(getPath())

  useEffect(() => {
    const onHash = () => setPath(getPath())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  if (path === '/' || path === '') return <Home />
  if (path.startsWith('/create')) return <CreateRoom />
  if (path.startsWith('/browse')) return <BrowseRooms />
  if (path.startsWith('/about')) return <About />
  if (path.startsWith('/features')) return <Features />
  if (path.startsWith('/login')) return <Login />
  if (path.startsWith('/signup')) return <Signup />
  if (path.startsWith('/forgot-password')) return <ForgotPassword />
  if (path.startsWith('/auth/callback') || path === '/auth/callback') return <AuthCallback />
  if (path.startsWith('/profile')) return <Profile />
  if (path.startsWith('/settings')) return <Settings />
  if (path.startsWith('/room')) return <RoomDashboard />
  if (path.startsWith('/notifications')) return <Notifications />
  if (path.startsWith('/help')) return <Help />
  if (path.startsWith('/dashboard')) return <Dashboard />
  if (path.startsWith('/search')) return <Search />
  if (path.startsWith('/messages')) return <Messages />
  if (path.startsWith('/calendar')) return <Calendar />
  if (path.startsWith('/whiteboard')) return <Whiteboard />
  if (path.startsWith('/timer')) return <Timer />
  if (path.startsWith('/friends')) return <Friends />

  return (
    <div style={{padding:40}}>
      <h2>Page not found</h2>
      <p>No route for <strong>{path}</strong></p>
      <a href="#/">Go home</a>
    </div>
  )
}
