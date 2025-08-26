import React from 'react'
import { HTTP_METHODS } from '../../utils/constants'

/**
 * UrlBar Component
 * 
 * Responsibilities:
 * - Display HTTP method selector
 * - Handle URL input
 * - Show environment button with dropdown
 * - Display validation errors
 * - Show environment variable count
 */
const UrlBar = ({
  requestData,
  handleMethodChange,
  handleUrlChange,
  validationErrors,
  currentEnvironment,
  showEnvironment,
  setShowEnvironment,
  renderEnvironmentDropdown,
  setShowSaveDialog,
  activeTemplate,
  clearTemplate
}) => {
  const renderValidationErrors = () => {
    if (validationErrors.length === 0) return null

    return (
      <div style={{
        padding: '12px',
        marginBottom: '12px',
        background: 'var(--error-bg)',
        border: '1px solid var(--error-color)',
        borderRadius: '6px',
        color: 'var(--error-color)',
        fontSize: '13px'
      }}>
        <div style={{ fontWeight: '600', marginBottom: '8px' }}>
          ⚠️ Validation Errors:
        </div>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          {validationErrors.map((error, index) => (
            <li key={index}>{error}</li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <div className="request-section">
      <div className="section-header">
        <span>Request URL</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className="btn btn-secondary"
            onClick={() => setShowEnvironment(!showEnvironment)}
            style={{ position: 'relative' }}
          >
            🌍 Environment
            {currentEnvironment && currentEnvironment.variables && currentEnvironment.variables.filter(v => v.enabled).length > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                background: 'var(--success-color)',
                color: 'white',
                fontSize: '10px',
                padding: '2px 4px',
                borderRadius: '8px',
                minWidth: '16px',
                textAlign: 'center'
              }}>
                {currentEnvironment.variables.filter(v => v.enabled).length}
              </span>
            )}
            {renderEnvironmentDropdown()}
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => setShowSaveDialog(true)}
          >
            💾 Save
          </button>
          {activeTemplate && (
            <button 
              className="btn btn-secondary"
              onClick={clearTemplate}
            >
              ✕ Clear Template
            </button>
          )}
        </div>
      </div>
      <div className="section-content">
        {renderValidationErrors()}
        <div className="url-bar" style={{ 
          display: 'flex', 
          gap: '0', 
          alignItems: 'center',
          padding: '0',
          background: 'var(--bg-secondary)',
          borderRadius: '8px',
          border: '1px solid var(--border-color)',
          overflow: 'hidden',
          minHeight: '48px'
        }}>
          <select 
            className="form-select url-method"
            value={requestData.method}
            onChange={(e) => handleMethodChange(e.target.value)}
            style={{
              minWidth: '60px',
              maxWidth: '70px',
              padding: '12px 4px',
              borderRadius: '0',
              border: 'none',
              borderRight: '1px solid var(--border-color)',
              background: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              height: '48px',
              textAlign: 'center'
            }}
          >
            {Object.values(HTTP_METHODS).map(method => (
              <option key={method} value={method}>{method}</option>
            ))}
          </select>
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              className="form-input url-input"
              placeholder="Enter URL or paste text"
              value={requestData.url}
              onChange={(e) => handleUrlChange(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '0',
                border: '2px solid var(--primary-color)',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: '14px',
                outline: 'none',
                height: '48px',
                minWidth: '300px',
                boxSizing: 'border-box',
                fontWeight: '500'
              }}
            />
            {currentEnvironment && currentEnvironment.variables && currentEnvironment.variables.filter(v => v.enabled).length > 0 && (
              <div style={{
                position: 'absolute',
                bottom: '-18px',
                left: '0',
                fontSize: '11px',
                color: 'var(--success-color)',
                fontWeight: '500'
              }}>
                Using {currentEnvironment.variables.filter(v => v.enabled).length} environment variables
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default UrlBar
