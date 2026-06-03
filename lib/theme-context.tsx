'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

export type ThemeVariant = 'perplexity' | 'mistral' | 'dark' | 'chatgpt'

interface ThemeContextType {
  theme: ThemeVariant
  setTheme: (theme: ThemeVariant) => void
  showIntroLoader: boolean
  setShowIntroLoader: (showIntroLoader: boolean) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)
const themes: ThemeVariant[] = ['perplexity', 'mistral', 'dark', 'chatgpt']

function getStoredTheme(): ThemeVariant {
  if (typeof window === 'undefined') return 'perplexity'

  const storedTheme = window.localStorage.getItem('lumina-theme') as ThemeVariant | null
  return storedTheme && themes.includes(storedTheme) ? storedTheme : 'perplexity'
}

function getStoredIntroLoaderPreference() {
  if (typeof window === 'undefined') return true

  return window.localStorage.getItem('lumina-intro-loader') !== 'off'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeVariant>(getStoredTheme)
  const [showIntroLoader, setShowIntroLoader] = useState(getStoredIntroLoaderPreference)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('lumina-theme', theme)
      document.documentElement.setAttribute('data-theme', theme)
    }
  }, [theme, mounted])

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('lumina-intro-loader', showIntroLoader ? 'on' : 'off')
    }
  }, [showIntroLoader, mounted])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, showIntroLoader, setShowIntroLoader }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)

  return context ?? {
    theme: 'perplexity' as ThemeVariant,
    setTheme: () => undefined,
    showIntroLoader: true,
    setShowIntroLoader: () => undefined,
  }
}
