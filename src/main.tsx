import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'
import { AuthProvider } from './hooks/useAuth'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#FAF6F1',
              color: '#2C1A1A',
              border: '1px solid rgba(193, 80, 106, 0.25)',
            },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>,
)

