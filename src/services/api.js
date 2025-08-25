const API_BASE = import.meta.env.VITE_API_BASE || ''

export const apiSaveRequest = async (payload) => {
  const res = await fetch(`${API_BASE}/api/webhooks/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  if (!res.ok) throw new Error((await res.text()) || 'Failed to save request')
  return res.json().catch(() => ({}))
}

export const apiFetchCollections = async () => {
  const res = await fetch(`${API_BASE}/api/collections`, { headers: { 'Content-Type': 'application/json' } })
  if (!res.ok) throw new Error((await res.text()) || 'Failed to fetch collections')
  return res.json()
}

export const apiFetchCollectionItems = async (collectionId) => {
  const res = await fetch(`${API_BASE}/api/collections/${encodeURIComponent(collectionId)}/requests`, { headers: { 'Content-Type': 'application/json' } })
  if (!res.ok) throw new Error((await res.text()) || 'Failed to fetch collection items')
  return res.json()
}

export const apiFetchLogs = async (params = {}) => {
  const qs = new URLSearchParams(params).toString()
  const res = await fetch(`${API_BASE}/api/logs${qs ? `?${qs}` : ''}`, { headers: { 'Content-Type': 'application/json' } })
  if (!res.ok) throw new Error((await res.text()) || 'Failed to fetch logs')
  return res.json()
}

export const apiFetchLogsByWebhook = async (webhookId, params = {}) => {
  const qs = new URLSearchParams(params).toString()
  const res = await fetch(`${API_BASE}/api/logs/${encodeURIComponent(webhookId)}${qs ? `?${qs}` : ''}`, { headers: { 'Content-Type': 'application/json' } })
  if (!res.ok) throw new Error((await res.text()) || 'Failed to fetch webhook logs')
  return res.json()
} 