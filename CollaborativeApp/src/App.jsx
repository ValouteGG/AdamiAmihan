import HashRouter from './router/HashRouter'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <HashRouter />
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App
