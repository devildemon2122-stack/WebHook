import React, { createContext, useContext, useState } from 'react'

// Navigation types
export const NAVIGATION_TYPES = {
  REQUEST: 'request',
  COLLECTIONS: 'collections',
  ENVIRONMENT: 'environment',
  LOGS: 'logs',
  BACKEND_TEST: 'backend-test'
}

// Navigation context interface
const NavigationContext = createContext()

// Custom hook for navigation
export const useNavigation = () => {
  const context = useContext(NavigationContext)
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider')
  }
  return context
}

// Navigation provider component
export const NavigationProvider = ({ children }) => {
  const [activeTab, setActiveTab] = useState(NAVIGATION_TYPES.REQUEST)

  // Navigation items configuration
  const navigationItems = [
    { id: NAVIGATION_TYPES.REQUEST, label: 'New Request', icon: '📝' },
    { id: NAVIGATION_TYPES.COLLECTIONS, label: 'Collections', icon: '📁' },
    { id: NAVIGATION_TYPES.ENVIRONMENT, label: 'Environment', icon: '🌍' },
    { id: NAVIGATION_TYPES.LOGS, label: 'Logs', icon: '📊' },
    { id: NAVIGATION_TYPES.BACKEND_TEST, label: 'Backend Test', icon: '🔧' }
  ]

  // Set active tab
  const setActiveTabHandler = (tabId) => {
    setActiveTab(tabId)
  }

  const value = {
    // State
    activeTab,
    
    // Configuration
    navigationItems,
    
    // Actions
    setActiveTab: setActiveTabHandler
  }

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  )
} 