import React, { createContext, useContext, useState, useEffect } from 'react'

// Theme types
export const THEME_TYPES = {
  DARK: 'dark-theme',
  LIGHT: 'light-theme'
}

// Theme context interface
const ThemeContext = createContext()

// Custom hook for theme
export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

// Theme provider component
export const ThemeProvider = ({ children }) => {
  const [isDarkTheme, setIsDarkTheme] = useState(true)
  const [currentTheme, setCurrentTheme] = useState(THEME_TYPES.DARK)

  // Initialize theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('webhook-pro-theme')
    if (savedTheme) {
      const isDark = savedTheme === THEME_TYPES.DARK
      setIsDarkTheme(isDark)
      setCurrentTheme(savedTheme)
      document.body.className = savedTheme
    } else {
      document.body.className = THEME_TYPES.DARK
    }
  }, [])

  // Toggle theme function
  const toggleTheme = () => {
    const newTheme = isDarkTheme ? THEME_TYPES.LIGHT : THEME_TYPES.DARK
    setIsDarkTheme(!isDarkTheme)
    setCurrentTheme(newTheme)
    document.body.className = newTheme
    localStorage.setItem('webhook-pro-theme', newTheme)
  }

  // Set specific theme
  const setTheme = (theme) => {
    const isDark = theme === THEME_TYPES.DARK
    setIsDarkTheme(isDark)
    setCurrentTheme(theme)
    document.body.className = theme
    localStorage.setItem('webhook-pro-theme', theme)
  }

  const value = {
    isDarkTheme,
    currentTheme,
    toggleTheme,
    setTheme
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
} 