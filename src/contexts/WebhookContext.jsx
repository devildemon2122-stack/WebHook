import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { createWebhookRequest, DEFAULTS } from '../utils/constants'
import { validateRequest } from '../utils/validation'
import { REQUEST_TEMPLATES, applyTemplate } from '../utils/templates'
import { RequestHistoryService, SavedRequestsService } from '../utils/storage'
import { buildNewFormatPayload, validateNewFormatPayload } from '../utils/payloads'
import { createWebhookApi, updateWebhookApi, getWebhookApiById, getAllWebhookApis, deleteWebhookApi, getLogsByWebhookId, getLogsByRefId, getLogsByParentId, getLogsByDateRange } from '../services/webhookApiService'
import { sendHttpRequest } from '../services/httpService'

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

  const saveRequestToBackend = useCallback(async (name, description = '', currentEnvironment, allEnvironments, authType, authConfig) => {
    const validation = validateRequest(requestData)
    if (!validation.isValid) {
      setValidationErrors(validation.errors)
      return { success: false, errors: validation.errors }
    }
    try {
      // Use the new format as specified by the lead
      const payload = buildNewFormatPayload(requestData, currentEnvironment, allEnvironments, authType, authConfig, name)
      
      // Validate the new format payload
      const validation = validateNewFormatPayload(payload)
      if (!validation.isValid) {
        console.error('New format payload validation failed:', validation.errors)
        return { success: false, errors: validation.errors }
      }
      
      // Create webhook API using backend service
      const data = await createWebhookApi(payload)
      return { success: true, data }
    } catch (error) {
      console.error('Backend save error:', error)
      
      // Enhanced error handling for network issues
      if (error.message.includes('Network error') || error.message.includes('Request timeout')) {
        return { 
          success: false, 
          error: error.message,
          type: 'NETWORK_ERROR',
          suggestion: 'Please check if the backend server is running at 10.22.1.98:8082',
          details: 'The backend server appears to be offline or unreachable. You can save locally instead.'
        }
      } else {
        return { 
          success: false, 
          error: error.message,
          type: 'BACKEND_ERROR',
          details: 'There was an issue with the backend server processing your request.'
        }
      }
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

  // Send webhook request with real HTTP calls
  const sendRequest = useCallback(async () => {
    const validation = validateRequest(requestData)
    if (!validation.isValid) {
      setValidationErrors(validation.errors)
      return { success: false, errors: validation.errors }
    }
    setIsLoading(true)
    setValidationErrors([])
    try {
      // Use the real HTTP service instead of mock
      const result = await sendHttpRequest(requestData)
      
      if (result.success) {
        setResponse(result.response)
        const historyEntry = RequestHistoryService.add(requestData, result.response, result.responseTime)
        setRequestHistory(prev => [historyEntry, ...prev].slice(0, DEFAULTS.MAX_HISTORY_ITEMS))
        return { success: true, response: result.response, responseTime: result.responseTime }
      } else {
        setResponse(result.response)
        const historyEntry = RequestHistoryService.add(requestData, result.response, result.responseTime)
      setRequestHistory(prev => [historyEntry, ...prev].slice(0, DEFAULTS.MAX_HISTORY_ITEMS))
        return { success: false, error: result.error, responseTime: result.responseTime }
      }
    } catch (error) {
      const responseTime = Date.now()
      const errorResponse = { 
        status: 0, 
        statusText: 'Request Error', 
        headers: {}, 
        body: JSON.stringify({ 
          error: 'Request Error', 
          message: error.message || 'An unexpected error occurred', 
          timestamp: new Date().toISOString() 
        }, null, 2) 
      }
      setResponse(errorResponse)
      const historyEntry = RequestHistoryService.add(requestData, errorResponse, responseTime)
      setRequestHistory(prev => [historyEntry, ...prev].slice(0, DEFAULTS.MAX_HISTORY_ITEMS))
      return { success: false, error: error.message, responseTime }
    } finally { 
      setIsLoading(false) 
    }
  }, [requestData])

  // Collections and Logs wrappers using services
  const fetchCollections = useCallback(async () => {
    try { return { success: true, data: await getAllWebhookApis() } } catch (e) { return { success: false, error: e.message } }
  }, [])
  const fetchCollectionItems = useCallback(async (id) => {
    if (!id) return { success: false, error: 'webhookId required' }
    try { return { success: true, data: await getWebhookApiById(id) } } catch (e) { return { success: false, error: e.message } }
  }, [])
  const fetchLogs = useCallback(async (params = {}) => {
    try { return { success: true, data: await getLogsByWebhookId(1) } } catch (e) { return { success: false, error: e.message } }
  }, [])
  const fetchLogsByWebhook = useCallback(async (webhookId, params = {}) => {
    if (!webhookId) return { success: false, error: 'webhookId required' }
    try { return { success: true, data: await getLogsByWebhookId(webhookId) } } catch (e) { return { success: false, error: e.message } }
  }, [])

  // Additional webhook management functions
  const updateWebhook = useCallback(async (id, webhookData) => {
    try { return { success: true, data: await updateWebhookApi(id, webhookData) } } catch (e) { return { success: false, error: e.message } }
  }, [])
  
  const deleteWebhook = useCallback(async (id) => {
    try { return { success: true, data: await deleteWebhookApi(id) } } catch (e) { return { success: false, error: e.message } }
  }, [])
  
  const getWebhookById = useCallback(async (id) => {
    try { return { success: true, data: await getWebhookApiById(id) } } catch (e) { return { success: false, error: e.message } }
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
    fetchLogsByWebhook,
    updateWebhook,
    deleteWebhook,
    getWebhookById
  }

  return (
    <WebhookContext.Provider value={value}>
      {children}
    </WebhookContext.Provider>
  )
} 