import React from 'react'
import { useTheme } from '../contexts/ThemeContext'

/**
 * Header Component
 * 
 * Responsibilities:
 * - Display page title
 * - Show action buttons
 * - Handle theme toggle
 */
const Header = () => {
  const { isDarkTheme, toggleTheme } = useTheme()

  return (
    <div className="header">
      <div className="header-title">
        New Request
      </div>
      <div className="header-actions">
        <button 
          className="btn btn-secondary theme-toggle"
          onClick={toggleTheme}
          title={isDarkTheme ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkTheme ? '☀️' : '🌙'}
        </button>
      </div>
    </div>
  )
}

export default Header 