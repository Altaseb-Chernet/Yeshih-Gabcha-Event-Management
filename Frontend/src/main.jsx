import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import 'leaflet/dist/leaflet.css'
import App from './App.jsx'
import './i18n'

// Check for saved theme preference immediately
const savedTheme = localStorage.getItem('darkMode');
if (savedTheme === 'true') {
  document.documentElement.classList.add('dark');
  console.log('Initial dark mode applied from localStorage');
} else if (savedTheme === null) {
  // Check system preference if no saved preference
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (prefersDark) {
    document.documentElement.classList.add('dark');
    console.log('Initial dark mode applied from system preference');
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
