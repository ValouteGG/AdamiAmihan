import { useAuth } from '../context/AuthContext'
import { useEffect } from 'react'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    // Only redirect if we're definitely not authenticated and not loading
    if (!isLoading && !isAuthenticated) {
      window.location.hash = '#/login'
    }
  }, [isAuthenticated, isLoading])

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Loading...
      </div>
    )
  }

  // Don't render anything while redirecting
  if (!isAuthenticated) {
    return null
  }

  return children
}
