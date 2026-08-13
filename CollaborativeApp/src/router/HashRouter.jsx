import { useEffect, useState } from 'react'
import Home from '../Home'
import CreateRoom from '../pages/CreateRoom'
import BrowseRooms from '../pages/BrowseRooms'
import About from '../pages/About'
import Features from '../pages/Features'
import Login from '../pages/Login'
import Signup from '../pages/Signup'

function getPath() {
  const hash = window.location.hash || '#/'
  return hash.replace(/^#/, '')
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

  return (
    <div style={{padding:40}}>
      <h2>Page not found</h2>
      <p>No route for <strong>{path}</strong></p>
      <a href="#/">Go home</a>
    </div>
  )
}
