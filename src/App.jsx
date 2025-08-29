import React from 'react'
import { ThemeProvider } from './contexts/ThemeContext'
import { WebhookProvider } from './contexts/WebhookContext'
import { NavigationProvider } from './contexts/NavigationContext'
import { EnvironmentProvider } from './contexts/EnvironmentContext'
import AppLayout from './components/AppLayout'

/**
 * Main App Component
 * 
 * Responsibilities:
 * - Provide context providers
 * - Initialize application state
 * - Render main layout
 */
function App() {
  return (
    <ThemeProvider>
      <NavigationProvider>
        <WebhookProvider>
          <EnvironmentProvider>
            <AppLayout />
          </EnvironmentProvider>
        </WebhookProvider>
      </NavigationProvider>
    </ThemeProvider>
  )
}

export default App 