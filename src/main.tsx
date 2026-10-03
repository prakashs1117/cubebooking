import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './context/ThemeContext.tsx'
import LocaleProvider from './context/LocaleContext.tsx'
import { initializeAnalytics } from './shared/firebase.ts'

// Apply stored theme immediately before first paint to avoid flash
;(() => {
  try {
    const stored = localStorage.getItem('curiosity-theme') ?? 'system'
    const resolved = stored === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : stored
    document.documentElement.setAttribute('data-theme', resolved)
  } catch { /* noop */ }
})()

// Initialize Firebase Analytics
initializeAnalytics().catch(console.error)

document.addEventListener('contextmenu', (e) => e.preventDefault())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <LocaleProvider>
        <App />
      </LocaleProvider>
    </ThemeProvider>
  </StrictMode>,
)
