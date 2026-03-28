'use client'
import { createContext, useContext, useEffect, useState } from 'react'

export type Theme = 'dark' | 'light' | 'system'

const ThemeContext = createContext<{
  theme: Theme
  resolvedTheme: 'dark' | 'light'
  setTheme: (t: Theme) => void
}>({ theme: 'system', resolvedTheme: 'dark', setTheme: () => {} })

function getSystemTheme(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(resolved: 'dark' | 'light') {
  if (resolved === 'light') {
    document.documentElement.setAttribute('data-theme', 'light')
  } else {
    document.documentElement.removeAttribute('data-theme')
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system')
  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    const stored = localStorage.getItem('amor-fati-theme') as Theme | null

    if (stored === 'light' || stored === 'dark') {
      setThemeState(stored)
      setResolvedTheme(stored)
      applyTheme(stored)
    } else {
      // Default to system preference (includes first-time visitors and explicit 'system')
      const sys = getSystemTheme()
      setThemeState('system')
      setResolvedTheme(sys)
      applyTheme(sys)
      // Clear any old value so layout script knows to use system
      if (stored !== 'system') {
        localStorage.setItem('amor-fati-theme', 'system')
      }
    }
  }, [])

  // Listen for OS theme changes when in system mode
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    function handleChange() {
      if (theme === 'system') {
        const sys = getSystemTheme()
        setResolvedTheme(sys)
        applyTheme(sys)
      }
    }
    mq.addEventListener('change', handleChange)
    return () => mq.removeEventListener('change', handleChange)
  }, [theme])

  function setTheme(t: Theme) {
    setThemeState(t)
    localStorage.setItem('amor-fati-theme', t)
    if (t === 'system') {
      const sys = getSystemTheme()
      setResolvedTheme(sys)
      applyTheme(sys)
    } else {
      setResolvedTheme(t)
      applyTheme(t)
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
