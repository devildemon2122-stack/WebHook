import React, { useState } from 'react'
import { useWebhook } from '../contexts/WebhookContext'
import { RESPONSE_TAB_TYPES } from '../utils/constants'
import { getStatusClass, formatHeaders } from '../utils/helpers'

/**
 * ResponsePanel Component
 * 
 * Responsibilities:
 * - Display API responses
 * - Manage response tabs
 * - Show response metrics
 */
const ResponsePanel = () => {
  const [activeTab, setActiveTab] = useState(RESPONSE_TAB_TYPES.PREVIEW)
  const { response } = useWebhook()

  // Don't render if no response
  if (!response) {
    return null
  }

  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
  }

  const renderResponseInfo = () => (
    <div className="response-info">
      <div className="response-info-item">
        <span>Status:</span>
        <span className={`status-badge ${getStatusClass(response.status)}`}>
          {response.status} {response.statusText}
        </span>
      </div>
      <div className="response-info-item">
        <span>Time:</span>
        <span>~1000ms</span>
      </div>
      <div className="response-info-item">
        <span>Size:</span>
        <span>{response.body.length} B</span>
      </div>
      <div className="response-info-item">
        <span>Updated:</span>
        <span>Just now</span>
      </div>
    </div>
  )

  const renderPreviewTab = () => (
    <div className="response-code">
      {response.body}
    </div>
  )

  const renderHeadersTab = () => (
    <div className="response-code">
      {formatHeaders(response.headers)}
    </div>
  )

  const renderTimelineTab = () => (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <h4 style={{ marginBottom: '8px', color: 'var(--text-primary)' }}>Request Timeline</h4>
        <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          <div><strong>DNS Lookup:</strong> ~5ms</div>
          <div><strong>TCP Connection:</strong> ~15ms</div>
          <div><strong>TLS Handshake:</strong> ~25ms</div>
          <div><strong>Request Sent:</strong> ~2ms</div>
          <div><strong>Response Received:</strong> ~953ms</div>
        </div>
      </div>
      
      <div style={{ 
        padding: '16px', 
        background: 'var(--bg-tertiary)', 
        borderRadius: '6px',
        fontSize: '14px',
        color: 'var(--text-muted)'
      }}>
        Response metrics ready for backend integration
      </div>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case RESPONSE_TAB_TYPES.PREVIEW:
        return renderPreviewTab()
      case RESPONSE_TAB_TYPES.HEADERS:
        return renderHeadersTab()
      case RESPONSE_TAB_TYPES.TIMELINE:
        return renderTimelineTab()
      default:
        return renderPreviewTab()
    }
  }

  return (
    <div className="response-panel">
      {renderResponseInfo()}

      <div className="response-tabs">
        <button 
          className={`response-tab ${activeTab === RESPONSE_TAB_TYPES.PREVIEW ? 'active' : ''}`}
          onClick={() => handleTabChange(RESPONSE_TAB_TYPES.PREVIEW)}
        >
          Preview
        </button>
        <button 
          className={`response-tab ${activeTab === RESPONSE_TAB_TYPES.HEADERS ? 'active' : ''}`}
          onClick={() => handleTabChange(RESPONSE_TAB_TYPES.HEADERS)}
        >
          Headers
        </button>
        <button 
          className={`response-tab ${activeTab === RESPONSE_TAB_TYPES.TIMELINE ? 'active' : ''}`}
          onClick={() => handleTabChange(RESPONSE_TAB_TYPES.TIMELINE)}
        >
          Timeline
        </button>
      </div>

      <div className="response-content">
        {renderTabContent()}
      </div>
    </div>
  )
}

export default ResponsePanel 