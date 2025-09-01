import React, { useEffect, useState } from 'react'
import { apiFetchLogs } from '../services/api'

/**
 * Logs Component
 *
 * Displays backend logs from GET /api/logs with server-side pagination.
 * Columns are based on backend schema: method, url, status, responseTime, timestamp, details.
 */
const Logs = () => {
  const [logs, setLogs] = useState([])
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadLogs = async (pageNumber) => {
    setLoading(true)
    setError('')
    try {
      const data = await apiFetchLogs({ page: pageNumber, limit })
      // Handle both { success, data: { logs, pagination } } and direct { logs, pagination }
      const payload = data?.data || data || {}
      console.log(payload)
      const fetchedLogs = payload.logs || []
      const pagination = payload.pagination || {}

      setLogs(Array.isArray(fetchedLogs) ? fetchedLogs : [])
      const pages = pagination.totalPages || (pagination.total && limit ? Math.max(1, Math.ceil(pagination.total / limit)) : 1)
      setTotalPages(pages)
    } catch (e) {
      setError(e?.message || 'Failed to load logs')
      setLogs([])
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLogs(page)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  const handlePageChange = (nextPage) => {
    if (nextPage < 1 || nextPage > totalPages) return
    setPage(nextPage)
  }

  const formatTimestamp = (iso) => {
    if (!iso) return ''
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return String(iso)
    return d.toLocaleString()
  }

  const renderStatus = (status, statusText) => {
    const code = Number(status)
    const color = Number.isFinite(code)
      ? (code >= 500 ? '#ef4444' : code >= 400 ? '#f59e0b' : code >= 200 ? '#22c55e' : '#6b7280')
      : '#6b7280'
    return (
      <span style={{
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: 600,
        color: 'white',
        background: color,
        display: 'inline-block'
      }}>
        {status}{statusText ? ` ${statusText}` : ''}
      </span>
    )
  }

  return (
    <div className="logs-container" style={{
      padding: '24px',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <div className="logs-header" style={{ marginBottom: '16px', flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: '0 0 6px 0', color: 'var(--text-primary)' }}>📊 Application Logs</h2>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>Fetched from backend on demand</p>
        </div>
        <div>
          <button
            onClick={() => loadLogs(page)}
            disabled={loading}
            style={{
              padding: '8px 16px',
              borderRadius: '4px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          marginBottom: '16px',
          padding: '12px',
          borderRadius: '6px',
          border: '1px solid var(--border-color)',
          background: 'var(--bg-secondary)',
          color: 'var(--text-primary)'
        }}>
          {error}
        </div>
      )}

      <div className="logs-table" style={{
        background: 'var(--bg-primary)',
        borderRadius: '8px',
        border: '1px solid var(--border-color)',
        overflow: 'hidden',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0
      }}>
        <div className="logs-table-header" style={{
          display: 'grid',
          gridTemplateColumns: '100px 1fr 160px 140px 180px 1fr',
          gap: '16px',
          padding: '16px',
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-color)',
          fontWeight: 600,
          fontSize: '14px',
          color: 'var(--text-primary)',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <div>Method</div>
          <div>URL</div>
          <div>Status</div>
          <div>Response Time</div>
          <div>Timestamp</div>
          <div>Details</div>
        </div>

        <div className="logs-table-body" style={{
          flex: 1,
          overflow: 'auto',
          scrollBehavior: 'smooth',
          scrollbarWidth: 'thin',
          scrollbarColor: 'var(--border-color) var(--bg-secondary)',
          minHeight: 0
        }}>
          {loading ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading…
            </div>
          ) : logs.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No logs found
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="log-row"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '100px 1fr 160px 140px 180px 1fr',
                  gap: '16px',
                  padding: '16px',
                  borderBottom: '1px solid var(--border-color)',
                  minHeight: '60px',
                  alignItems: 'start'
                }}
              >
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{log.method}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-primary)', wordBreak: 'break-all' }}>{log.url}</div>
                <div>{renderStatus(log.status, log.statusText)}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-primary)' }}>{typeof log.responseTime === 'number' ? `${log.responseTime} ms` : String(log.responseTime || '')}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-primary)' }}>{formatTimestamp(log.timestamp)}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  <details style={{ margin: 0 }}>
                    <summary style={{ cursor: 'pointer', color: 'var(--primary-color)', fontSize: '11px', fontWeight: 500 }}>
                      ▼ View Details
                    </summary>
                    <div style={{ marginTop: '8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-primary)' }}>Request</div>
                        <pre style={{
                          padding: '8px',
                          background: 'var(--bg-tertiary)',
                          borderRadius: '4px',
                          overflow: 'auto',
                          fontSize: '10px',
                          maxHeight: '160px',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          border: '1px solid var(--border-color)',
                          margin: 0,
                          lineHeight: '1.3'
                        }}>{JSON.stringify({ headers: log?.request?.headers || {}, body: log?.request?.body ?? null }, null, 2)}</pre>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-primary)' }}>Response</div>
                        <pre style={{
                          padding: '8px',
                          background: 'var(--bg-tertiary)',
                          borderRadius: '4px',
                          overflow: 'auto',
                          fontSize: '10px',
                          maxHeight: '160px',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          border: '1px solid var(--border-color)',
                          margin: 0,
                          lineHeight: '1.3'
                        }}>{JSON.stringify({ headers: log?.response?.headers || {}, body: log?.response?.body ?? null }, null, 2)}</pre>
                      </div>
                    </div>
                  </details>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="logs-pagination" style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px',
          marginTop: '16px',
          flexShrink: 0
        }}>
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1 || loading}
            style={{
              padding: '8px 12px',
              borderRadius: '4px',
              border: '1px solid var(--border-color)',
              background: page === 1 || loading ? 'var(--bg-tertiary)' : 'var(--bg-primary)',
              color: page === 1 || loading ? 'var(--text-muted)' : 'var(--text-primary)',
              cursor: page === 1 || loading ? 'not-allowed' : 'pointer'
            }}
          >
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, page - 3), Math.max(0, page - 3) + 5).map((p) => (
            <button
              key={p}
              onClick={() => handlePageChange(p)}
              disabled={loading}
              style={{
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid var(--border-color)',
                background: page === p ? 'var(--primary-color)' : 'var(--bg-primary)',
                color: page === p ? 'white' : 'var(--text-primary)',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages || loading}
            style={{
              padding: '8px 12px',
              borderRadius: '4px',
              border: '1px solid var(--border-color)',
              background: page === totalPages || loading ? 'var(--bg-tertiary)' : 'var(--bg-primary)',
              color: page === totalPages || loading ? 'var(--text-muted)' : 'var(--text-primary)',
              cursor: page === totalPages || loading ? 'not-allowed' : 'pointer'
            }}
          >
            Next
          </button>
        </div>
      )}

      <div className="logs-summary" style={{
        marginTop: '16px',
        padding: '12px',
        background: 'var(--bg-secondary)',
        borderRadius: '8px',
        border: '1px solid var(--border-color)',
        flexShrink: 0,
        display: 'flex',
        gap: '24px',
        fontSize: '14px'
      }}>
        <div><strong>Current Page:</strong> {page} of {totalPages}</div>
        <div><strong>Logs per Page:</strong> {limit}</div>
      </div>
    </div>
  )
}

export default Logs 