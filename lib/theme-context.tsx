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
  if (typeof window === 'undefined') return 'mistral'

  const stored = window.localStorage.getItem('omnilearn-theme') as ThemeVariant | null

  return stored && themes.includes(stored) ? stored : 'mistral'
}

function getStoredIntroLoaderPreference(): boolean {
  if (typeof window === 'undefined') return false

  return window.localStorage.getItem('lumina-intro-loader') === 'on'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // HARD DEFAULTS (SSR safe, no hydration chaos)
  const [theme, setTheme] = useState<ThemeVariant>('mistral')
  const [showIntroLoader, setShowIntroLoader] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Hydration step: load real values AFTER mount
  useEffect(() => {
    const storedTheme = getStoredTheme()
    const storedIntro = getStoredIntroLoaderPreference()

    setTheme(storedTheme)
    setShowIntroLoader(storedIntro)

    setMounted(true)
  }, [])

  // Apply theme to DOM + persist
  useEffect(() => {
    if (!mounted) return

    localStorage.setItem('omnilearn-theme', theme)
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme, mounted])

  // Persist intro loader
  useEffect(() => {
    if (!mounted) return

    localStorage.setItem(
      'lumina-intro-loader',
      showIntroLoader ? 'on' : 'off'
    )
  }, [showIntroLoader, mounted])

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        showIntroLoader,
        setShowIntroLoader,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)

  if (!context) {
    return {
      theme: 'mistral' as ThemeVariant,
      setTheme: () => {},
      showIntroLoader: false,
      setShowIntroLoader: () => {},
    }
  }

  return context
}
