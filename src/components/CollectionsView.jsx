import React, { useEffect, useState } from 'react'
import { useWebhook } from '../contexts/WebhookContext'

const CollectionsView = () => {
  const { fetchCollections, fetchCollectionItems, updateRequestData } = useWebhook()
  const [collections, setCollections] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      setError('')
      const res = await fetchCollections()
      if (!mounted) return
      if (res.success) setCollections(res.data || [])
      else setError(res.error || 'Failed to load collections')
      setLoading(false)
    }
    load()
    return () => { mounted = false }
  }, [fetchCollections])

  const handleSelect = async (id) => {
    setSelectedId(id)
    setItems([])
    setLoading(true)
    const res = await fetchCollectionItems(id)
    if (res.success) setItems(res.data || [])
    setLoading(false)
  }

  const handleOpen = (item) => {
    if (!item?.request) return
    updateRequestData(item.request)
  }

  return (
    <div style={{ padding: '24px' }}>
      <div className="section-header" style={{ marginBottom: '16px' }}>
        <span>Collections</span>
      </div>

      {error && (
        <div style={{ marginBottom: '12px', color: 'var(--error-color)' }}>{error}</div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px' }}>
        <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px' }}>
          <div style={{ padding: '12px', borderBottom: '1px solid var(--border-color)', fontWeight: 600 }}>All Collections</div>
          <div style={{ maxHeight: '400px', overflow: 'auto' }}>
            {loading && collections.length === 0 && (
              <div style={{ padding: '12px', color: 'var(--text-muted)' }}>Loading…</div>
            )}
            {(collections || []).map((c) => (
              <div
                key={c.id || c._id || c.name}
                onClick={() => handleSelect(c.id || c._id)}
                style={{ padding: '10px 12px', cursor: 'pointer', borderBottom: '1px solid var(--border-color)' }}
              >
                📁 {c.name || 'Unnamed Collection'}
              </div>
            ))}
            {(!loading && (!collections || collections.length === 0)) && (
              <div style={{ padding: '12px', color: 'var(--text-muted)' }}>No collections yet.</div>
            )}
          </div>
        </div>

        <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px' }}>
          <div style={{ padding: '12px', borderBottom: '1px solid var(--border-color)', fontWeight: 600 }}>Saved Requests</div>
          <div style={{ maxHeight: '400px', overflow: 'auto' }}>
            {loading && selectedId && items.length === 0 && (
              <div style={{ padding: '12px', color: 'var(--text-muted)' }}>Loading…</div>
            )}
            {(items || []).map((it) => (
              <div
                key={it.id || it._id || it.name}
                style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>{it.name || 'Untitled'}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{it.description || ''}</div>
                </div>
                <div>
                  <button className="btn btn-secondary" onClick={() => handleOpen(it)}>Open</button>
                </div>
              </div>
            ))}
            {(!loading && selectedId && items.length === 0) && (
              <div style={{ padding: '12px', color: 'var(--text-muted)' }}>No requests in this collection.</div>
            )}
            {!selectedId && (
              <div style={{ padding: '12px', color: 'var(--text-muted)' }}>Select a collection to view requests.</div>
            )}
          </div>
        </div>
      </div>

      <div style={{ marginTop: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
        Backend URL can be configured via VITE_API_BASE.
      </div>
    </div>
  )
}

export default CollectionsView 