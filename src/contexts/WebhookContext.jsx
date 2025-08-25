import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { createWebhookRequest, DEFAULTS } from '../utils/constants'
import { validateRequest } from '../utils/validation'
import { REQUEST_TEMPLATES, applyTemplate } from '../utils/templates'
import { RequestHistoryService, SavedRequestsService } from '../utils/storage'
import { buildSavePayload } from '../utils/payloads'
import { apiSaveRequest, apiFetchCollections, apiFetchCollectionItems, apiFetchLogs, apiFetchLogsByWebhook } from '../services/api'

// Webhook context interface
const WebhookContext = createContext()

// Custom hook for webhook operations
export const useWebhook = () => {
  const context = useContext(WebhookContext)
  if (!context) {
    throw new Error('useWebhook must be used within a WebhookProvider')
  }
  return context
}

// Webhook provider component
export const WebhookProvider = ({ children }) => {
  const [requestData, setRequestData] = useState(createWebhookRequest())
  const [response, setResponse] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [requestHistory, setRequestHistory] = useState([])
  const [savedRequests, setSavedRequests] = useState([])
  const [validationErrors, setValidationErrors] = useState([])
  const [activeTemplate, setActiveTemplate] = useState(null)

  useEffect(() => {
    setRequestHistory(RequestHistoryService.getAll())
    setSavedRequests(SavedRequestsService.getAll())
  }, [])

  const updateRequestData = useCallback((updates) => {
    const newData = { ...requestData, ...updates }
    setRequestData(newData)
    const validation = validateRequest(newData)
    setValidationErrors(validation.errors)
    return validation.isValid
  }, [requestData])

  const addHeader = useCallback(() => {
    updateRequestData({ headers: [...requestData.headers, { key: '', value: '' }] })
  }, [requestData.headers, updateRequestData])

  const updateHeader = useCallback((index, field, value) => {
    const headers = requestData.headers.map((h, i) => (i === index ? { ...h, [field]: value } : h))
    updateRequestData({ headers })
  }, [requestData.headers, updateRequestData])

  const removeHeader = useCallback((index) => {
    updateRequestData({ headers: requestData.headers.filter((_, i) => i !== index) })
  }, [requestData.headers, updateRequestData])

  const addParameter = useCallback(() => {
    updateRequestData({ params: [...requestData.params, { key: '', value: '' }] })
  }, [requestData.params, updateRequestData])

  const updateParameter = useCallback((index, field, value) => {
    const params = requestData.params.map((p, i) => (i === index ? { ...p, [field]: value } : p))
    updateRequestData({ params })
  }, [requestData.params, updateRequestData])

  const removeParameter = useCallback((index) => {
    updateRequestData({ params: requestData.params.filter((_, i) => i !== index) })
  }, [requestData.params, updateRequestData])

  const applyTemplateToRequest = useCallback((templateName) => {
    const template = REQUEST_TEMPLATES[templateName]
    if (template) {
      setRequestData(applyTemplate(template))
      setActiveTemplate(templateName)
      setValidationErrors([])
    }
  }, [])

  const clearTemplate = useCallback(() => setActiveTemplate(null), [])

  const saveRequest = useCallback((name, description = '') => {
    const savedRequest = SavedRequestsService.save(requestData, name, description)
    setSavedRequests(prev => [...prev, savedRequest])
    return savedRequest
  }, [requestData])

  const saveRequestToBackend = useCallback(async (name, description = '') => {
    const validation = validateRequest(requestData)
    if (!validation.isValid) {
      setValidationErrors(validation.errors)
      return { success: false, errors: validation.errors }
    }
    try {
      const payload = buildSavePayload(requestData, name, description)
      const data = await apiSaveRequest(payload)
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }, [requestData])

  // Saved requests helpers
  const loadSavedRequest = useCallback((id) => {
    const savedRequest = savedRequests.find(req => req.id === id)
    if (savedRequest) {
      setRequestData(savedRequest.request)
      setActiveTemplate(null)
      setValidationErrors([])
    }
  }, [savedRequests])

  const deleteSavedRequest = useCallback((id) => {
    const success = SavedRequestsService.delete(id)
    if (success) setSavedRequests(prev => prev.filter(req => req.id !== id))
    return success
  }, [])

  // History helpers
  const loadFromHistory = useCallback((id) => {
    const historyItem = requestHistory.find(item => item.id === id)
    if (historyItem) {
      setRequestData(historyItem.request)
      setResponse(historyItem.response)
      setActiveTemplate(null)
      setValidationErrors([])
    }
  }, [requestHistory])

  const deleteHistoryItem = useCallback((id) => {
    const success = RequestHistoryService.delete(id)
    if (success) setRequestHistory(prev => prev.filter(item => item.id !== id))
    return success
  }, [])

  const clearHistory = useCallback(() => {
    const success = RequestHistoryService.clear()
    if (success) setRequestHistory([])
    return success
  }, [])

  // Send webhook request (unchanged)
  const sendRequest = useCallback(async () => {
    const validation = validateRequest(requestData)
    if (!validation.isValid) {
      setValidationErrors(validation.errors)
      return { success: false, errors: validation.errors }
    }
    setIsLoading(true)
    setValidationErrors([])
    const startTime = Date.now()
    try {
      const mockResponse = await new Promise((resolve, reject) => {
        setTimeout(() => {
          const random = Math.random()
          if (random < 0.1) reject(new Error('Network error: Failed to connect to server'))
          else if (random < 0.2) resolve({ status: 400, statusText: 'Bad Request', headers: { 'content-type': 'application/json', 'x-error-code': 'VALIDATION_ERROR' }, body: JSON.stringify({ error: 'Bad Request', message: 'Invalid request parameters', details: ['URL format is invalid', 'Missing required headers'] }, null, 2) })
          else if (random < 0.3) resolve({ status: 500, statusText: 'Internal Server Error', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ error: 'Internal Server Error', message: 'Something went wrong on our end' }, null, 2) })
          else resolve({ status: 200, statusText: 'OK', headers: { 'content-type': 'application/json', 'x-webhook-id': `wh_${Date.now()}`, 'x-response-time': '150ms', 'x-request-id': `req_${Math.random().toString(36).substr(2, 9)}` }, body: JSON.stringify({ success: true, message: 'Webhook sent successfully', timestamp: new Date().toISOString(), id: `wh_${Date.now()}`, metadata: { method: requestData.method, url: requestData.url, headers_count: requestData.headers.length, params_count: requestData.params.length } }, null, 2) })
        }, 500 + Math.random() * 1000)
      })
      const responseTime = Date.now() - startTime
      setResponse(mockResponse)
      const historyEntry = RequestHistoryService.add(requestData, mockResponse, responseTime)
      setRequestHistory(prev => [historyEntry, ...prev].slice(0, DEFAULTS.MAX_HISTORY_ITEMS))
      return { success: true, response: mockResponse, responseTime }
    } catch (error) {
      const responseTime = Date.now() - startTime
      const errorResponse = { status: 0, statusText: 'Network Error', headers: {}, body: JSON.stringify({ error: 'Network Error', message: error.message, timestamp: new Date().toISOString() }, null, 2) }
      setResponse(errorResponse)
      const historyEntry = RequestHistoryService.add(requestData, errorResponse, responseTime)
      setRequestHistory(prev => [historyEntry, ...prev].slice(0, DEFAULTS.MAX_HISTORY_ITEMS))
      return { success: false, error: error.message, responseTime }
    } finally { setIsLoading(false) }
  }, [requestData])

  // Collections and Logs wrappers using services
  const fetchCollections = useCallback(async () => {
    try { return { success: true, data: await apiFetchCollections() } } catch (e) { return { success: false, error: e.message } }
  }, [])
  const fetchCollectionItems = useCallback(async (id) => {
    if (!id) return { success: false, error: 'collectionId required' }
    try { return { success: true, data: await apiFetchCollectionItems(id) } } catch (e) { return { success: false, error: e.message } }
  }, [])
  const fetchLogs = useCallback(async (params = {}) => {
    try { return { success: true, data: await apiFetchLogs(params) } } catch (e) { return { success: false, error: e.message } }
  }, [])
  const fetchLogsByWebhook = useCallback(async (webhookId, params = {}) => {
    if (!webhookId) return { success: false, error: 'webhookId required' }
    try { return { success: true, data: await apiFetchLogsByWebhook(webhookId, params) } } catch (e) { return { success: false, error: e.message } }
  }, [])

  const value = {
    requestData,
    response,
    isLoading,
    requestHistory,
    savedRequests,
    validationErrors,
    activeTemplate,
    updateRequestData,
    addHeader,
    updateHeader,
    removeHeader,
    addParameter,
    updateParameter,
    removeParameter,
    sendRequest,
    clearResponse: useCallback(() => setResponse(null), []),
    resetRequest: useCallback(() => { setRequestData(createWebhookRequest()); setResponse(null); setActiveTemplate(null); setValidationErrors([]) }, []),
    applyTemplate: applyTemplateToRequest,
    clearTemplate,
    getAvailableTemplates: useCallback(() => Object.entries(REQUEST_TEMPLATES).map(([key, template]) => ({ key, ...template })), []),
    saveRequest,
    saveRequestToBackend,
    loadSavedRequest,
    deleteSavedRequest,
    loadFromHistory,
    deleteHistoryItem,
    clearHistory,
    fetchCollections,
    fetchCollectionItems,
    fetchLogs,
    fetchLogsByWebhook
  }

  return (
    <WebhookContext.Provider value={value}>
      {children}
    </WebhookContext.Provider>
  )
} 