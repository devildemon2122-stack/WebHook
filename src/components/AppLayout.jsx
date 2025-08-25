import React from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { useNavigation } from '../contexts/NavigationContext'
import Sidebar from './Sidebar'
import Header from './Header'
import RequestBuilder from './RequestBuilder'
import ResponsePanel from './ResponsePanel'
import Logs from './Logs'

const CollectionsView = React.lazy(() => import('./CollectionsView.jsx'))

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
      case 'history':
      case 'settings':
        return (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '18px' }}>
            <div style={{ marginBottom: '16px', fontSize: '48px' }}>
              {activeTab === 'environment' && '🌍'}
              {activeTab === 'history' && '⏱️'}
              {activeTab === 'settings' && '⚙️'}
            </div>
            <h2 style={{ margin: '0 0 16px 0', color: 'var(--text-primary)' }}>
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h2>
            <p>Backend integration point.</p>
          </div>
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