import React, { useState, useEffect } from 'react'

/**
 * Logs Component
 * 
 * Responsibilities:
 * - Display application logs
 * - Filter logs by level, date, webhook ID
 * - Show log details
 * - Handle log pagination
 */
const Logs = () => {
  const [logs, setLogs] = useState([])
  const [filterLevel, setFilterLevel] = useState('all')
  const [filterDate, setFilterDate] = useState('')
  const [filterWebhookId, setFilterWebhookId] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [logsPerPage] = useState(50)

  // Mock logs data - replace with actual backend integration
  useEffect(() => {
    const mockLogs = [
      {
        id: 1,
        timestamp: new Date().toISOString(),
        level: 'INFO',
        webhookId: 'wh_123456789',
        message: 'Webhook request sent successfully',
        details: {
          method: 'POST',
          url: 'https://api.example.com/webhooks/payment',
          status: 200,
          responseTime: '150ms'
        }
      },
      {
        id: 2,
        timestamp: new Date(Date.now() - 60000).toISOString(),
        level: 'ERROR',
        webhookId: 'wh_123456789',
        message: 'Webhook request failed',
        details: {
          method: 'POST',
          url: 'https://api.example.com/webhooks/payment',
          status: 500,
          error: 'Internal server error'
        }
      },
      {
        id: 3,
        timestamp: new Date(Date.now() - 120000).toISOString(),
        level: 'WARN',
        webhookId: 'wh_987654321',
        message: 'Slow response time detected',
        details: {
          method: 'GET',
          url: 'https://api.example.com/webhooks/status',
          responseTime: '2500ms',
          threshold: '2000ms'
        }
      },
      {
        id: 4,
        timestamp: new Date(Date.now() - 180000).toISOString(),
        level: 'INFO',
        webhookId: 'wh_555666777',
        message: 'Environment configuration updated',
        details: {
          environment: 'Production',
          variables: 5,
          updatedBy: 'admin@example.com'
        }
      },
      {
        id: 5,
        timestamp: new Date(Date.now() - 240000).toISOString(),
        level: 'DEBUG',
        webhookId: 'wh_111222333',
        message: 'Request validation passed',
        details: {
          method: 'POST',
          url: 'https://api.example.com/webhooks/user',
          headers: 3,
          bodySize: '1.2KB'
        }
      }
    ]
    setLogs(mockLogs)
  }, [])

  const getLevelColor = (level) => {
    switch (level) {
      case 'ERROR': return '#ef4444'
      case 'WARN': return '#f59e0b'
      case 'INFO': return '#3b82f6'
      case 'DEBUG': return '#6b7280'
      default: return '#6b7280'
    }
  }

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString()
  }

  const filteredLogs = logs.filter(log => {
    if (filterLevel !== 'all' && log.level !== filterLevel) return false
    if (filterDate && !log.timestamp.includes(filterDate)) return false
    if (filterWebhookId && !log.webhookId.includes(filterWebhookId)) return false
    return true
  })

  const indexOfLastLog = currentPage * logsPerPage
  const indexOfFirstLog = indexOfLastLog - logsPerPage
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog)
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage)

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
  }

  const clearLogs = () => {
    // Show confirmation dialog
    if (window.confirm('Are you sure you want to clear all logs? This action cannot be undone.')) {
      // TODO: Backend integration - clear logs
      setLogs([])
    }
  }

  const exportLogs = () => {
    // TODO: Backend integration - export logs
    const logData = JSON.stringify(filteredLogs, null, 2)
    const blob = new Blob([logData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `webhooks-logs-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="logs-container" style={{ padding: '24px' }}>
      <div className="logs-header" style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: '0 0 16px 0', color: 'var(--text-primary)' }}>
          📊 Application Logs
        </h2>
        <p style={{ margin: '0', color: 'var(--text-muted)' }}>
          Monitor webhook requests, responses, and system events
        </p>
      </div>

      {/* Filters */}
      <div className="logs-filters" style={{ 
        display: 'flex', 
        gap: '16px', 
        marginBottom: '24px',
        padding: '16px',
        background: 'var(--bg-secondary)',
        borderRadius: '8px',
        border: '1px solid var(--border-color)'
      }}>
        <div className="filter-group">
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: 'var(--text-muted)' }}>
            Log Level
          </label>
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '4px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-primary)',
              color: 'var(--text-primary)'
            }}
          >
            <option value="all">All Levels</option>
            <option value="ERROR">Error</option>
            <option value="WARN">Warning</option>
            <option value="INFO">Info</option>
            <option value="DEBUG">Debug</option>
          </select>
        </div>

        <div className="filter-group">
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: 'var(--text-muted)' }}>
            Date
          </label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '4px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-primary)',
              color: 'var(--text-primary)'
            }}
          />
        </div>

        <div className="filter-group">
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: 'var(--text-muted)' }}>
            Webhook ID
          </label>
          <input
            type="text"
            placeholder="Filter by webhook ID"
            value={filterWebhookId}
            onChange={(e) => setFilterWebhookId(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '4px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              minWidth: '200px'
            }}
          />
        </div>

        <div className="filter-actions" style={{ display: 'flex', gap: '8px', alignItems: 'end' }}>
          <button
            className="btn btn-secondary"
            onClick={clearLogs}
            style={{
              padding: '8px 16px',
              borderRadius: '4px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              cursor: 'pointer'
            }}
          >
            Clear Logs
          </button>
          <button
            className="btn btn-primary"
            onClick={exportLogs}
            style={{
              padding: '8px 16px',
              borderRadius: '4px',
              border: 'none',
              background: 'var(--primary-color)',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            Export
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="logs-table" style={{
        background: 'var(--bg-primary)',
        borderRadius: '8px',
        border: '1px solid var(--border-color)',
        overflow: 'hidden',
        maxHeight: '600px'
      }}>
        <div className="logs-table-header" style={{
          display: 'grid',
          gridTemplateColumns: '80px 1fr 120px 200px 1fr',
          gap: '16px',
          padding: '16px',
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-color)',
          fontWeight: '600',
          fontSize: '14px',
          color: 'var(--text-primary)',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <div>Level</div>
          <div>Timestamp</div>
          <div>Webhook ID</div>
          <div>Message</div>
          <div>Details</div>
        </div>

        <div className="logs-table-body" style={{ 
          maxHeight: '500px', 
          overflow: 'auto',
          scrollBehavior: 'smooth',
          scrollbarWidth: 'thin',
          scrollbarColor: 'var(--border-color) var(--bg-secondary)'
        }}>
          {currentLogs.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No logs found matching the current filters
            </div>
          ) : (
            currentLogs.map((log) => (
              <div
                key={log.id}
                className="log-row"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '80px 1fr 120px 200px 1fr',
                  gap: '16px',
                  padding: '16px',
                  borderBottom: '1px solid var(--border-color)',
                  transition: 'background-color 0.2s ease',
                  minHeight: '60px',
                  alignItems: 'start'
                }}
                onMouseEnter={(e) => {
                  e.target.parentElement.style.background = 'var(--bg-secondary)'
                }}
                onMouseLeave={(e) => {
                  e.target.parentElement.style.background = 'var(--bg-primary)'
                }}
              >
                <div>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: 'white',
                    background: getLevelColor(log.level)
                  }}>
                    {log.level}
                  </span>
                </div>
                <div style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
                  {formatTimestamp(log.timestamp)}
                </div>
                <div style={{ fontSize: '14px', color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                  {log.webhookId}
                </div>
                <div style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
                  {log.message}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  <details>
                    <summary style={{ cursor: 'pointer', color: 'var(--primary-color)' }}>
                      View Details
                    </summary>
                    <div style={{ 
                      marginTop: '8px',
                      position: 'relative'
                    }}>
                      <pre style={{ 
                        padding: '12px', 
                        background: 'var(--bg-tertiary)', 
                        borderRadius: '6px',
                        overflow: 'auto',
                        fontSize: '11px',
                        maxHeight: '200px',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        border: '1px solid var(--border-color)',
                        position: 'relative'
                      }}>
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                      {JSON.stringify(log.details, null, 2).length > 500 && (
                        <div style={{
                          position: 'absolute',
                          bottom: '8px',
                          right: '8px',
                          background: 'var(--bg-secondary)',
                          color: 'var(--text-muted)',
                          fontSize: '10px',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          border: '1px solid var(--border-color)'
                        }}>
                          Scroll to see more
                        </div>
                      )}
                    </div>
                  </details>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="logs-pagination" style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px',
          marginTop: '24px'
        }}>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            style={{
              padding: '8px 12px',
              borderRadius: '4px',
              border: '1px solid var(--border-color)',
              background: currentPage === 1 ? 'var(--bg-tertiary)' : 'var(--bg-primary)',
              color: currentPage === 1 ? 'var(--text-muted)' : 'var(--text-primary)',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
            }}
          >
            Previous
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              style={{
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid var(--border-color)',
                background: currentPage === page ? 'var(--primary-color)' : 'var(--bg-primary)',
                color: currentPage === page ? 'white' : 'var(--text-primary)',
                cursor: 'pointer'
              }}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{
              padding: '8px 12px',
              borderRadius: '4px',
              border: '1px solid var(--border-color)',
              background: currentPage === totalPages ? 'var(--bg-tertiary)' : 'var(--bg-primary)',
              color: currentPage === totalPages ? 'var(--text-muted)' : 'var(--text-primary)',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
            }}
          >
            Next
          </button>
        </div>
      )}

      {/* Logs Summary */}
      <div className="logs-summary" style={{
        marginTop: '24px',
        padding: '16px',
        background: 'var(--bg-secondary)',
        borderRadius: '8px',
        border: '1px solid var(--border-color)'
      }}>
        <h4 style={{ margin: '0 0 12px 0', color: 'var(--text-primary)' }}>Logs Summary</h4>
        <div style={{ display: 'flex', gap: '24px', fontSize: '14px' }}>
          <div>
            <strong>Total Logs:</strong> {filteredLogs.length}
          </div>
          <div>
            <strong>Current Page:</strong> {currentPage} of {totalPages}
          </div>
          <div>
            <strong>Logs per Page:</strong> {logsPerPage}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Logs 