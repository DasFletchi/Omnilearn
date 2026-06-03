'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

export type ThemeVariant = 'perplexity' | 'mistral'

interface ThemeContextType {
  theme: ThemeVariant
  setTheme: (theme: ThemeVariant) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeVariant>('perplexity')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem('lumina-theme') as ThemeVariant | null
    if (stored && (stored === 'perplexity' || stored === 'mistral')) {
      setTheme(stored)
    }
  }, [])

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('lumina-theme', theme)
      document.documentElement.setAttribute('data-theme', theme)
    }
  }, [theme, mounted])

  if (!mounted) {
    return <>{children}</>
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
