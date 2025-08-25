// Payload helpers
export const buildSavePayload = (requestData, name, description) => {
  const headers = (requestData.headers || [])
    .filter(h => h && typeof h.key === 'string' && h.key.trim())
    .map(h => ({ key: String(h.key), value: String(h.value ?? '') }))

  const params = (requestData.params || [])
    .filter(p => p && typeof p.key === 'string' && p.key.trim())
    .map(p => ({ key: String(p.key), value: p.value == null ? '' : String(p.value) }))

  const bodyString = requestData.body == null ? '' : String(requestData.body)

  const request = {
    method: requestData.method,
    url: requestData.url,
    headers,
    params,
    body: bodyString,
    bodyFormat: requestData.bodyFormat || 'json'
  }

  const metadata = {
    createdAt: new Date().toISOString(),
    client: 'webhooks-ui',
    version: 1,
    metrics: {
      headerCount: headers.length,
      paramCount: params.length,
      bodySize: bodyString.length
    }
  }

  return {
    name: name?.trim() || undefined,
    description: description?.trim() || undefined,
    request,
    metadata
  }
} 