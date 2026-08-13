import { useAuth } from '../context/AuthContext'
import { useEffect } from 'react'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.hash = '#/login'
    }
  }, [isAuthenticated])

  if (!isAuthenticated) {
    return null // Don't render anything while redirecting
  }

  return children
}
