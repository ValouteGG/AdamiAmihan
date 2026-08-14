import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../config/supabase'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing Supabase session on app load
    const checkSession = async () => {
      try {
        // First check localStorage for quick persistence
        const storedAuth = localStorage.getItem('isAuthenticated')
        const storedUser = localStorage.getItem('user')
        
        if (storedAuth === 'true' && storedUser) {
          try {
            const userData = JSON.parse(storedUser)
            setUser(userData)
            setIsAuthenticated(true)
          } catch (e) {
            console.error('Error parsing stored user data:', e)
            localStorage.removeItem('isAuthenticated')
            localStorage.removeItem('user')
          }
        }
        
        // Then verify with Supabase
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session) {
          const userData = {
            id: session.user.id,
            email: session.user.email,
            firstName: session.user.user_metadata?.first_name || '',
            lastName: session.user.user_metadata?.last_name || '',
            avatar: session.user.user_metadata?.avatar || session.user.user_metadata?.first_name?.[0] || session.user.email[0],
            createdAt: session.user.created_at,
            confirmedAt: session.user.confirmed_at
          }
          setUser(userData)
          setIsAuthenticated(true)
          localStorage.setItem('isAuthenticated', 'true')
          localStorage.setItem('user', JSON.stringify(userData))
        } else {
          // No valid session, clear localStorage
          setUser(null)
          setIsAuthenticated(false)
          localStorage.removeItem('isAuthenticated')
          localStorage.removeItem('user')
        }
      } catch (error) {
        console.error('Error checking session:', error)
        setUser(null)
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const userData = {
          id: session.user.id,
          email: session.user.email,
          firstName: session.user.user_metadata?.first_name || '',
          lastName: session.user.user_metadata?.last_name || '',
          avatar: session.user.user_metadata?.avatar || session.user.user_metadata?.first_name?.[0] || session.user.email[0],
          createdAt: session.user.created_at,
          confirmedAt: session.user.confirmed_at
        }
        setUser(userData)
        setIsAuthenticated(true)
        localStorage.setItem('isAuthenticated', 'true')
        localStorage.setItem('user', JSON.stringify(userData))
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setIsAuthenticated(false)
        localStorage.removeItem('isAuthenticated')
        localStorage.removeItem('user')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      const userData = {
        id: data.user.id,
        email: data.user.email,
        firstName: data.user.user_metadata?.first_name || '',
        lastName: data.user.user_metadata?.last_name || '',
        avatar: data.user.user_metadata?.avatar || data.user.user_metadata?.first_name?.[0] || data.user.email[0],
        createdAt: data.user.created_at,
        confirmedAt: data.user.confirmed_at
      }

      setUser(userData)
      setIsAuthenticated(true)
      localStorage.setItem('isAuthenticated', 'true')
      localStorage.setItem('user', JSON.stringify(userData))
      
      return { success: true, user: userData }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: error.message }
    }
  }

  // Keep the old login method for backward compatibility (used by Login.jsx with userData)
  const loginWithUserData = (userData) => {
    setUser(userData)
    setIsAuthenticated(true)
    localStorage.setItem('isAuthenticated', 'true')
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('user')
    window.location.hash = '#/login'
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, loginWithUserData, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
