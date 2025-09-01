export const API_BASE = import.meta.env.VITE_API_BASE || 'http:10.22.1.98:8082/api/webhooks'

// export const apiSaveRequest = async (payload) => {
//   const res = await fetch(`${API_BASE}/api/createApi`, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify(payload)
//   })
//   if (!res.ok) throw new Error((await res.text()) || 'Failed to save request')
//   return res.json().catch(() => ({}))
// }

export const apiSaveRequest = async (payload) => {
  try {
    const res = await fetch(`${API_BASE}/api/createApi`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    // Check HTTP status
    if (!res.ok) {
      const errorText = await res.text();
      console.error('Server error:', errorText);
      throw new Error(errorText || 'Failed to save request');
    }

    // Parse JSON safely
    const data = await res.json().catch(() => ({}));

    // Optional: check API-defined success field
    if (data.success === false) {
      console.warn('API reported failure:', data.message);
      throw new Error(data.message || 'API reported failure');
    }

    // Success
    console.log('Request saved successfully:', data);
    return data;
  } catch (err) {
    // Network error or server failure
    console.error('Error saving request:', err.message);
    throw err; // Let the caller handle/display the error
  }
};



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
  const res = await fetch(`${API_BASE}/logs/${qs ? `?${qs}` : ''}`, { headers: { 'Content-Type': 'application/json' } })
  if (!res.ok) throw new Error((await res.text()) || 'Failed to fetch logs')
  return res.json()
}

export const apiFetchLogsByWebhook = async (webhookId, params = {}) => {
  const qs = new URLSearchParams(params).toString()
  const res = await fetch(`${API_BASE}/api/logs/${encodeURIComponent(webhookId)}${qs ? `?${qs}` : ''}`, { headers: { 'Content-Type': 'application/json' } })
  if (!res.ok) throw new Error((await res.text()) || 'Failed to fetch webhook logs')
  return res.json()
} 