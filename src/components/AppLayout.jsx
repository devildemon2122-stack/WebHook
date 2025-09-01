import React from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { useNavigation } from '../contexts/NavigationContext'
import Sidebar from './Sidebar'
import Header from './Header'
import RequestBuilder from './RequestBuilder'
import ResponsePanel from './ResponsePanel'
import Logs from './Logs'

const CollectionsView = React.lazy(() => import('./CollectionsView.jsx'))
const EnvironmentView = React.lazy(() => import('./EnvironmentView.jsx'))
const BackendTest = React.lazy(() => import('./BackendTest.jsx'))

/**
 * AppLayout Component
 * 
 * Responsibilities:
 * - Manage application layout structure
 * - Coordinate between main components
 * - Handle theme application
 * - Handle navigation between different views
 */
const AppLayout = () => {
  const { currentTheme } = useTheme()
  const { activeTab } = useNavigation()

  const renderMainContent = () => {
    switch (activeTab) {
      case 'request':
        return (
          <div className="request-builder">
            <RequestBuilder />
            <ResponsePanel />
          </div>
        )
      case 'logs':
        return (
          <React.Suspense fallback={<div style={{ padding: '24px' }}>Loading…</div>}>
            <Logs />
          </React.Suspense>
        )
      case 'collections':
        return (
          <React.Suspense fallback={<div style={{ padding: '24px' }}>Loading…</div>}>
            <CollectionsView />
          </React.Suspense>
        )
      case 'environment':
        return (
          <React.Suspense fallback={<div style={{ padding: '24px' }}>Loading…</div>}>
            <EnvironmentView />
          </React.Suspense>
        )
      case 'backend-test':
        return (
          <React.Suspense fallback={<div style={{ padding: '24px' }}>Loading…</div>}>
            <BackendTest />
          </React.Suspense>
        )
      default:
        return (
          <div className="request-builder">
            <RequestBuilder />
            <ResponsePanel />
          </div>
        )
    }
  }

  return (
    <div className={`app ${currentTheme}`}>
      <Sidebar />
      <div className="main-content">
        <Header />
        {renderMainContent()}
      </div>
    </div>
  )
}

export default AppLayout 