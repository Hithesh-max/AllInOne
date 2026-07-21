import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { ModeProvider } from './context/ModeContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <ModeProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ModeProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
