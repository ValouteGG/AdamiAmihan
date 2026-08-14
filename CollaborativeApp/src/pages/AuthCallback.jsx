import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../config/supabase'

export default function AuthCallback() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { loginWithUserData } = useAuth()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('Auth callback triggered')
        console.log('Current URL:', window.location.href)
        console.log('Hash:', window.location.hash)
        console.log('Search:', window.location.search)

        // Parse the full URL to check for tokens in various locations
        const fullUrl = new URL(window.location.href)
        console.log('Full URL search params:', fullUrl.search)
        
        // Handle double hash situation: #/auth/callback#access_token=...
        let hashAccessToken = null
        let hashRefreshToken = null
        
        // Check if hash contains the callback path plus tokens
        if (window.location.hash.includes('#/auth/callback#')) {
          // Split on the second # to get the token portion
          const hashParts = window.location.hash.split('#/auth/callback#')
          if (hashParts.length > 1) {
            const tokenPortion = hashParts[1]
            const tokenParams = new URLSearchParams(tokenPortion)
            hashAccessToken = tokenParams.get('access_token')
            hashRefreshToken = tokenParams.get('refresh_token')
            console.log('Extracted tokens from double-hash format')
          }
        } else {
          // Standard hash parsing
          const hashParams = new URLSearchParams(window.location.hash.substring(1))
          hashAccessToken = hashParams.get('access_token')
          hashRefreshToken = hashParams.get('refresh_token')
        }
        
        console.log('Access token from hash:', !!hashAccessToken)
        console.log('Refresh token from hash:', !!hashRefreshToken)

        // Check for tokens in query parameters
        const urlParams = new URLSearchParams(window.location.search)
        const accessToken = urlParams.get('access_token')
        const refreshToken = urlParams.get('refresh_token')
        
        console.log('Access token from query params:', !!accessToken)
        console.log('Refresh token from query params:', !!refreshToken)

        // Try to get session from Supabase directly (handles OAuth callback automatically)
        console.log('Attempting to get session from Supabase...')
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Session error:', sessionError)
        }
        
        console.log('Session from Supabase:', !!session)

        if (session) {
          console.log('Session found:', session.user)
          const userData = {
            id: session.user.id,
            email: session.user.email,
            firstName: session.user.user_metadata?.first_name || session.user.user_metadata?.full_name?.split(' ')[0] || session.user.user_metadata?.name?.split(' ')[0] || '',
            lastName: session.user.user_metadata?.last_name || session.user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || session.user.user_metadata?.name?.split(' ').slice(1).join(' ') || '',
            avatar: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || session.user.user_metadata?.first_name?.[0] || session.user.user_metadata?.name?.[0] || session.user.email[0]
          }

          loginWithUserData(userData)
          console.log('User logged in, redirecting to dashboard')
          window.location.href = window.location.origin + '#/dashboard'
          return
        }

        // If no session, try to exchange tokens if they exist
        const tokenToUse = hashAccessToken || accessToken
        const refreshToUse = hashRefreshToken || refreshToken
        
        if (tokenToUse && refreshToUse) {
          console.log('Setting session from tokens...')
          const { data: { session: newSession }, error: setSessionError } = 
            await supabase.auth.setSession({
              access_token: tokenToUse,
              refresh_token: refreshToUse
            })

          if (setSessionError) {
            console.error('Set session error:', setSessionError)
            throw setSessionError
          }

          if (newSession) {
            console.log('Session set successfully:', newSession.user)
            const userData = {
              id: newSession.user.id,
              email: newSession.user.email,
              firstName: newSession.user.user_metadata?.first_name || newSession.user.user_metadata?.full_name?.split(' ')[0] || newSession.user.user_metadata?.name?.split(' ')[0] || '',
              lastName: newSession.user.user_metadata?.last_name || newSession.user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || newSession.user.user_metadata?.name?.split(' ').slice(1).join(' ') || '',
              avatar: newSession.user.user_metadata?.avatar_url || newSession.user.user_metadata?.picture || newSession.user.user_metadata?.first_name?.[0] || newSession.user.user_metadata?.name?.[0] || newSession.user.email[0]
            }

            loginWithUserData(userData)
            console.log('User logged in from tokens, redirecting to dashboard')
            window.location.href = window.location.origin + '#/dashboard'
            return
          }
        }

        throw new Error('No session found and no tokens in URL')

      } catch (err) {
        console.error('Auth callback error:', err)
        setError('Authentication failed: ' + err.message)
        setTimeout(() => {
          window.location.hash = '#/login'
        }, 3000)
      } finally {
        setLoading(false)
      }
    }

    handleAuthCallback()
  }, [loginWithUserData])

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p>Completing authentication...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '20px',
        color: '#e74c3c'
      }}>
        <p>{error}</p>
        <p>Redirecting to login page...</p>
      </div>
    )
  }

  return null
}