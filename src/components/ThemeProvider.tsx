'use client'
import { createContext, useContext, useEffect, useState } from 'react'

export type Theme = 'dark' | 'light'

const ThemeContext = createContext<{
  theme: Theme
  setTheme: (t: Theme) => void
}>({ theme: 'dark', setTheme: () => {} })

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light')

  useEffect(() => {
    const stored = localStorage.getItem('amor-fati-theme') as Theme | null
    if (stored === 'light' || stored === 'dark') {
      setThemeState(stored)
      applyTheme(stored)
    } else {
      applyTheme('light')
    }
  }, [])

  function setTheme(t: Theme) {
    setThemeState(t)
    localStorage.setItem('amor-fati-theme', t)
    applyTheme(t)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

function applyTheme(t: Theme) {
  if (t === 'light') {
    document.documentElement.setAttribute('data-theme', 'light')
  } else {
    document.documentElement.removeAttribute('data-theme')
  }
}

export function useTheme() {
  return useContext(ThemeContext)
}
