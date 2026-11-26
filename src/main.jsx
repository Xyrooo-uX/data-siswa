import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#17382a',
          color: '#f5fbf7',
          border: '1px solid #2d6549'
        },
        success: {
          iconTheme: {
            primary: '#73c5b8',
            secondary: '#17382a'
          }
        },
        error: {
          iconTheme: {
            primary: '#ef6b6b',
            secondary: '#17382a'
          }
        }
      }}
    />
  </StrictMode>,
)
