import React, { useState, useEffect, useCallback } from 'react'
import { useWebhook } from '../contexts/WebhookContext'
import { 
  HTTP_METHODS, 
  REQUEST_TAB_TYPES, 
  BODY_FORMAT_TYPES
} from '../utils/constants'

/**
 * RequestBuilder Component
 * 
 * Responsibilities:
 * - Build webhook requests
 * - Manage request tabs
 * - Handle form inputs
 * - Show validation errors
 * - Apply request templates
 * - Handle path parameters with smart parsing
 * - Handle authentication
 * - Parse URL parameters automatically (Postman-style)
 */
const RequestBuilder = () => {
  const [activeRequestTab, setActiveRequestTab] = useState(REQUEST_TAB_TYPES.BODY)
  const [showEnvironment, setShowEnvironment] = useState(false)
  const [showEnvironmentConfig, setShowEnvironmentConfig] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [saveName, setSaveName] = useState('')
  const [saveDescription, setSaveDescription] = useState('')
  const [bodyFormat, setBodyFormat] = useState(BODY_FORMAT_TYPES.JSON)
  const [pathParams, setPathParams] = useState([])
  const [queryParams, setQueryParams] = useState([])
  const [environmentConfig, setEnvironmentConfig] = useState({
    name: '',
    baseUrl: '',
    role: 'client', // client, admin, author
    variables: []
  })
  
  // Authentication state
  const [authType, setAuthType] = useState('no-auth')
  const [authConfig, setAuthConfig] = useState({
    apiKey: { key: '', value: '', addTo: 'header' },
    bearerToken: { token: '' },
    basicAuth: { username: '', password: '' }
  })
  
  const {
    requestData,
    updateRequestData,
    addHeader,
    updateHeader,
    removeHeader,
    addParameter,
    updateParameter,
    removeParameter,
    sendRequest,
    isLoading,
    validationErrors,
    activeTemplate,
    applyTemplate,
    clearTemplate,
    getAvailableTemplates,
    saveRequest,
    saveRequestToBackend
  } = useWebhook()

  // Smart path parameter parsing (Postman-style)
  const parsePathParameters = useCallback((url) => {
    if (!url) return []

    try {
      // Handle relative URLs by adding a base
      const urlObj = new URL(url, "https://api.example.com")
      const pathSegments = urlObj.pathname.split('/').filter(Boolean)
      
      if (pathSegments.length === 0) return []

      const newPathParams = []
      let paramIndex = 0

      pathSegments.forEach((segment, index) => {
        // Case 1: Template parameter {paramName}
        if (segment.startsWith('{') && segment.endsWith('}')) {
          const paramName = segment.slice(1, -1)
          const existingParam = pathParams.find(p => p.key === paramName)
          
          newPathParams.push({
            key: paramName,
            value: existingParam ? existingParam.value : '',
            enabled: existingParam ? existingParam.enabled : true,
            type: PARAMETER_TYPES.PATH,
            required: true,
            isTemplate: true,
            segmentIndex: index
          })
        }
        // Case 2: Real value (numeric, UUID, etc.)
        else if (segment.match(/^[\w\-\.]+$/) && segment !== 'api' && segment !== 'v1' && segment !== 'v2') {
          // Skip common API path segments
          if (!['api', 'v1', 'v2', 'users', 'posts', 'comments', 'auth', 'webhook'].includes(segment.toLowerCase())) {
            const paramName = DEFAULT_PARAM_NAMES[paramIndex] || `param${paramIndex + 1}`
            const existingParam = pathParams.find(p => p.key === paramName)
            
            newPathParams.push({
              key: paramName,
              value: existingParam ? existingParam.value : segment,
              enabled: existingParam ? existingParam.enabled : true,
              type: PARAMETER_TYPES.PATH,
              required: false,
              isTemplate: false,
              segmentIndex: index,
              originalValue: segment
            })
            paramIndex++
          }
        }
      })

      return newPathParams
    } catch (error) {
      console.error('Error parsing path parameters:', error)
      return []
    }
  }, [pathParams])

  // Debounced parse for URL changes so Params update reliably while typing
  useEffect(() => {
    const handle = setTimeout(() => {
      try {
        const url = requestData.url
        if (!url) return
        const urlObj = new URL(url, "https://api.example.com")
        // build query params fresh
        const detected = []
        urlObj.searchParams.forEach((value, key) => {
          detected.push({ key, value, enabled: true, type: 'query', required: false })
        })
        if (detected.length > 0) {
          setQueryParams(detected)
          // also refresh combined params for requestData
          updateRequestData({ params: [...(pathParams || []), ...detected] })
        }
      } catch (_) {
        // ignore during typing
      }
    }, 200)
    return () => clearTimeout(handle)
  }, [requestData.url])

  // Update URL when parameters change
  useEffect(() => {
    const updateUrlFromParams = () => {
      if (!requestData.url) return
      
      try {
        let newUrl = requestData.url
        
        // Update path parameters only when we actually have enabled values to replace
        const hasPathEnabledValues = pathParams.some(p => p.enabled && p.value)
        if (hasPathEnabledValues) {
          pathParams.forEach(param => {
            if (param.enabled && param.value) {
              if (param.isTemplate) {
                const placeholder = `{${param.key}}`
                if (newUrl.includes(placeholder)) {
                  newUrl = newUrl.replace(placeholder, param.value)
                }
              } else if (typeof param.segmentIndex === 'number') {
                const segs = newUrl.split('/')
                const idx = param.segmentIndex + 1
                if (segs[idx]) {
                  segs[idx] = param.value
                  newUrl = segs.join('/')
                }
              }
            }
          })
        }
        
        // Update query parameters only when we have at least one enabled key
        const hasEnabledQuery = queryParams.some(p => p.enabled && (p.key?.trim() || p.value?.trim()))
        if (hasEnabledQuery) {
          const urlObj = new URL(newUrl, "https://api.example.com")
          // Do not wipe search unless we intend to rebuild it
          // Start with current params, then set/override enabled ones
          queryParams.forEach(param => {
            if (param.enabled && param.key?.trim()) {
              urlObj.searchParams.set(param.key, param.value ?? '')
            }
          })
          newUrl = urlObj.toString()
        }
        
        if (newUrl !== requestData.url) {
          updateRequestData({ url: newUrl })
        }
        
      } catch (error) {
        // Invalid URL, skip update
      }
    }

    updateUrlFromParams()
  }, [pathParams, queryParams])

  // Update headers when auth changes
  useEffect(() => {
    const newHeaders = [...requestData.headers]
    
    // Remove existing auth headers
    const filteredHeaders = newHeaders.filter(header => 
      !['Authorization', 'X-API-Key', 'X-Auth-Key'].includes(header.key)
    )
    
    // Add new auth headers based on type
    switch (authType) {
      case 'api-key':
        if (authConfig.apiKey.key && authConfig.apiKey.value) {
          if (authConfig.apiKey.addTo === 'header') {
            filteredHeaders.push({ key: authConfig.apiKey.key, value: authConfig.apiKey.value })
          } else {
            // Add to query params
            const newParams = [...requestData.params]
            const existingIndex = newParams.findIndex(p => p.key === authConfig.apiKey.key)
            if (existingIndex >= 0) {
              newParams[existingIndex].value = authConfig.apiKey.value
            } else {
              newParams.push({ key: authConfig.apiKey.key, value: authConfig.apiKey.value })
            }
            updateRequestData({ params: newParams })
          }
        }
        break
      case 'bearer-token':
        if (authConfig.bearerToken.token) {
          filteredHeaders.push({ key: 'Authorization', value: `Bearer ${authConfig.bearerToken.token}` })
        }
        break
      case 'basic-auth':
        if (authConfig.basicAuth.username && authConfig.basicAuth.password) {
          const credentials = btoa(`${authConfig.basicAuth.username}:${authConfig.basicAuth.password}`)
          filteredHeaders.push({ key: 'Authorization', value: `Basic ${credentials}` })
        }
        break
      default:
        break
    }
    
    updateRequestData({ headers: filteredHeaders })
  }, [authType, authConfig, requestData.params])

  const handleTabChange = (tabId) => {
    setActiveRequestTab(tabId)
  }

  const handleMethodChange = (method) => {
    updateRequestData({ method })
  }

  const handleUrlChange = (url) => {
    updateRequestData({ url })
  }

  const handleBodyChange = (body) => {
    updateRequestData({ body })
  }

  const handleBodyFormatChange = (format) => {
    setBodyFormat(format)
    // Update Content-Type header based on format
    const contentTypeMap = {
      [BODY_FORMAT_TYPES.JSON]: 'application/json',
      [BODY_FORMAT_TYPES.XML]: 'application/xml',
      [BODY_FORMAT_TYPES.FORM_DATA]: 'multipart/form-data',
      [BODY_FORMAT_TYPES.X_WWW_FORM_URLENCODED]: 'application/x-www-form-urlencoded',
      [BODY_FORMAT_TYPES.RAW]: 'text/plain',
      [BODY_FORMAT_TYPES.BINARY]: 'application/octet-stream'
    }
    
    const newHeaders = [...requestData.headers]
    const contentTypeIndex = newHeaders.findIndex(h => h.key.toLowerCase() === 'content-type')
    
    if (contentTypeIndex >= 0) {
      newHeaders[contentTypeIndex].value = contentTypeMap[format]
    } else {
      newHeaders.push({ key: 'Content-Type', value: contentTypeMap[format] })
    }
    
    updateRequestData({ headers: newHeaders })
  }

  const handlePathParamChange = (index, field, value) => {
    const newPathParams = [...pathParams]
    newPathParams[index][field] = value
    setPathParams(newPathParams)
  }

  const handleQueryParamChange = (index, field, value) => {
    const newQueryParams = [...queryParams]
    newQueryParams[index][field] = value
    setQueryParams(newQueryParams)
  }

  const toggleParameter = (type, index) => {
    if (type === PARAMETER_TYPES.PATH) {
      const newPathParams = [...pathParams]
      newPathParams[index].enabled = !newPathParams[index].enabled
      setPathParams(newPathParams)
    } else {
      const newQueryParams = [...queryParams]
      newQueryParams[index].enabled = !newQueryParams[index].enabled
      setQueryParams(newQueryParams)
    }
  }

  const addQueryParameter = () => {
    const newQueryParams = [...queryParams, { 
      key: '', 
      value: '', 
      enabled: true, 
      type: PARAMETER_TYPES.QUERY,
      required: false
    }]
    setQueryParams(newQueryParams)
  }

  const removeQueryParameter = (index) => {
    const newQueryParams = queryParams.filter((_, i) => i !== index)
    setQueryParams(newQueryParams)
  }

  const handleAuthTypeChange = (type) => {
    setAuthType(type)
  }

  const handleAuthConfigChange = (type, field, value) => {
    setAuthConfig(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value
      }
    }))
  }

  const handleSaveRequest = async () => {
    if (!saveName.trim()) return

    // Try backend save first
    const apiResult = await saveRequestToBackend(saveName.trim(), saveDescription.trim())
    if (apiResult?.success) {
      setSaveName('')
      setSaveDescription('')
      setShowSaveDialog(false)
      return
    }

    // Fallback to local save if backend not available
      saveRequest(saveName.trim(), saveDescription.trim())
      setSaveName('')
      setSaveDescription('')
      setShowSaveDialog(false)
  }

  const handleTemplateSelect = (templateKey) => {
    applyTemplate(templateKey)
    setShowEnvironment(false)
  }

  const handleEnvironmentConfig = () => {
    setShowEnvironmentConfig(true)
    setShowEnvironment(false)
  }

  const handleEnvironmentSave = () => {
    if (environmentConfig.name.trim() && environmentConfig.baseUrl.trim()) {
      // TODO: Save environment configuration to backend
      console.log('Environment saved:', environmentConfig)
      console.log('Backend Integration Point: Send this data to your backend API')
      console.log('API Endpoint: POST /api/environments')
      console.log('Data:', {
        name: environmentConfig.name,
        baseUrl: environmentConfig.baseUrl,
        role: environmentConfig.role,
        variables: environmentConfig.variables,
        createdAt: new Date().toISOString(),
        createdBy: 'current_user_id' // TODO: Get from authentication context
      })
      
      setShowEnvironmentConfig(false)
      setEnvironmentConfig({ name: '', baseUrl: '', role: 'client', variables: [] })
    }
  }

  const addEnvironmentVariable = () => {
    setEnvironmentConfig(prev => ({
      ...prev,
      variables: [...prev.variables, { key: '', value: '' }]
    }))
  }

  const updateEnvironmentVariable = (index, field, value) => {
    setEnvironmentConfig(prev => ({
      ...prev,
      variables: prev.variables.map((variable, i) => 
        i === index ? { ...variable, [field]: value } : variable
      )
    }))
  }

  const removeEnvironmentVariable = (index) => {
    setEnvironmentConfig(prev => ({
      ...prev,
      variables: prev.variables.filter((_, i) => i !== index)
    }))
  }

  // Add inbuilt header
  const addInbuiltHeader = (headerKey, headerValue) => {
    const newHeaders = [...requestData.headers, { key: headerKey, value: headerValue }]
    updateRequestData({ headers: newHeaders })
  }

  // Check if header already exists
  const headerExists = (headerKey) => {
    return requestData.headers.some(header => header.key.toLowerCase() === headerKey.toLowerCase())
  }

  const renderValidationErrors = () => {
    if (validationErrors.length === 0) return null

    return (
      <div className="validation-errors" style={{ 
        marginBottom: '16px',
        padding: '12px',
        background: 'var(--error-color)',
        color: 'white',
        borderRadius: '6px',
        fontSize: '14px'
      }}>
        <div style={{ fontWeight: '600', marginBottom: '8px' }}>
          ⚠️ Validation Errors ({validationErrors.length})
        </div>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          {validationErrors.map((error, index) => (
            <li key={index}>{error}</li>
          ))}
        </ul>
      </div>
    )
  }

  const renderEnvironmentDropdown = () => {
    if (!showEnvironment) return null

    const templates = getAvailableTemplates()

    return (
      <div className="environment-dropdown" style={{
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        background: 'var(--bg-primary)',
        border: '1px solid var(--border-color)',
        borderRadius: '6px',
        boxShadow: 'var(--shadow-lg)',
        zIndex: 1000,
        maxHeight: '300px',
        overflowY: 'auto'
      }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ fontWeight: '600', marginBottom: '4px' }}>Environment Templates</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Select a template to configure environment variables
          </div>
        </div>
        {templates.map((template) => (
          <div
            key={template.key}
            className="template-item"
            onClick={() => handleTemplateSelect(template.key)}
            style={{
              padding: '12px 16px',
              cursor: 'pointer',
              borderBottom: '1px solid var(--border-color)',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'var(--bg-tertiary)'
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'var(--bg-primary)'
            }}
          >
            <div style={{ fontWeight: '600', marginBottom: '4px' }}>
              {template.name}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {template.description}
            </div>
          </div>
        ))}
        <div
          className="template-item"
          onClick={handleEnvironmentConfig}
          style={{
            padding: '12px 16px',
            cursor: 'pointer',
            borderTop: '2px solid var(--border-color)',
            background: 'var(--bg-secondary)',
            transition: 'background-color 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'var(--bg-tertiary)'
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'var(--bg-secondary)'
          }}
        >
          <div style={{ fontWeight: '600', marginBottom: '4px', color: 'var(--primary-color)' }}>
            ⚙️ Configure New Environment
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Create custom environment with variables
          </div>
        </div>
      </div>
    )
  }

  const renderBodyContent = () => {
    switch (bodyFormat) {
      case BODY_FORMAT_TYPES.JSON:
        return (
          <textarea
            className="form-input"
            rows="8"
            value={requestData.body}
            onChange={(e) => handleBodyChange(e.target.value)}
            placeholder="Enter JSON body"
          />
        )
      case BODY_FORMAT_TYPES.XML:
        return (
          <textarea
            className="form-input"
            rows="8"
            value={requestData.body}
            onChange={(e) => handleBodyChange(e.target.value)}
            placeholder="Enter XML body"
          />
        )
      case BODY_FORMAT_TYPES.FORM_DATA:
        return (
          <div>
            <div style={{ marginBottom: '8px' }}>
              <button className="btn btn-secondary" onClick={() => {
                const newBody = requestData.body + '\nkey: value'
                handleBodyChange(newBody)
              }}>
                + Add Field
              </button>
            </div>
            <textarea
              className="form-input"
              rows="8"
              value={requestData.body}
              onChange={(e) => handleBodyChange(e.target.value)}
              placeholder="key: value&#10;another_key: another_value"
            />
          </div>
        )
      case BODY_FORMAT_TYPES.X_WWW_FORM_URLENCODED:
        return (
          <textarea
            className="form-input"
            rows="8"
            value={requestData.body}
            onChange={(e) => handleBodyChange(e.target.value)}
            placeholder="key=value&another_key=another_value"
          />
        )
      case BODY_FORMAT_TYPES.RAW:
        return (
          <textarea
            className="form-input"
            rows="8"
            value={requestData.body}
            onChange={(e) => handleBodyChange(e.target.value)}
            placeholder="Enter raw body content"
          />
        )
      case BODY_FORMAT_TYPES.BINARY:
        return (
          <div>
            <input
              type="file"
              className="form-input"
              onChange={(e) => {
                const file = e.target.files[0]
                if (file) {
                  handleBodyChange(`File: ${file.name} (${file.size} bytes)`)
                }
              }}
            />
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Select a file to upload
            </div>
          </div>
        )
      default:
        return null
    }
  }

  const renderAuthContent = () => {
    switch (authType) {
      case 'no-auth':
        return (
          <div style={{ color: 'var(--text-muted)', fontSize: '14px', padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔓</div>
            <strong>No Authentication Required</strong>
            <br />
            <br />
            This request will be sent without any authentication headers.
          </div>
        )
      
      case 'api-key':
        return (
          <div style={{ padding: '20px' }}>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">API Key</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter API key"
                value={authConfig.apiKey.key}
                onChange={(e) => handleAuthConfigChange('apiKey', 'key', e.target.value)}
                style={{ marginBottom: '8px' }}
              />
            </div>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">API Value</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter API key value"
                value={authConfig.apiKey.value}
                onChange={(e) => handleAuthConfigChange('apiKey', 'value', e.target.value)}
                style={{ marginBottom: '8px' }}
              />
            </div>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">Add to</label>
              <select
                className="form-select"
                value={authConfig.apiKey.addTo}
                onChange={(e) => handleAuthConfigChange('apiKey', 'addTo', e.target.value)}
              >
                <option value="header">Header</option>
                <option value="query">Query Parameter</option>
              </select>
            </div>
            <div style={{ 
              padding: '12px', 
              background: 'var(--bg-secondary)', 
              borderRadius: '6px',
              fontSize: '14px',
              color: 'var(--text-muted)'
            }}>
              <strong>Backend Integration:</strong> The API key will be automatically added to your request based on the selected option.
            </div>
          </div>
        )
      
      case 'bearer-token':
        return (
          <div style={{ padding: '20px' }}>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">Bearer Token</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter bearer token"
                value={authConfig.bearerToken.token}
                onChange={(e) => handleAuthConfigChange('bearerToken', 'token', e.target.value)}
                style={{ marginBottom: '8px' }}
              />
            </div>
            <div style={{ 
              padding: '12px', 
              background: 'var(--bg-secondary)', 
              borderRadius: '6px',
              fontSize: '14px',
              color: 'var(--text-muted)'
            }}>
              <strong>Backend Integration:</strong> The token will be automatically added as "Authorization: Bearer {token}" header.
            </div>
          </div>
        )
      
      case 'basic-auth':
        return (
          <div style={{ padding: '20px' }}>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">Username</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter username"
                value={authConfig.basicAuth.username}
                onChange={(e) => handleAuthConfigChange('basicAuth', 'username', e.target.value)}
                style={{ marginBottom: '8px' }}
              />
            </div>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Enter password"
                value={authConfig.basicAuth.password}
                onChange={(e) => handleAuthConfigChange('basicAuth', 'password', e.target.value)}
                style={{ marginBottom: '8px' }}
              />
            </div>
            <div style={{ 
              padding: '12px', 
              background: 'var(--bg-secondary)', 
              borderRadius: '6px',
              fontSize: '14px',
              color: 'var(--text-muted)'
            }}>
              <strong>Backend Integration:</strong> Credentials will be automatically encoded and added as "Authorization: Basic {base64}" header.
            </div>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <>
      {/* URL Bar - Compact Postman Style */}
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
            <input
              className="form-input url-input"
              placeholder="Enter URL or paste text"
              value={requestData.url}
              onChange={(e) => handleUrlChange(e.target.value)}
              style={{
                flex: 1,
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
            <button 
              className={`btn btn-success ${isLoading ? 'disabled' : ''}`}
              onClick={sendRequest}
              disabled={isLoading || validationErrors.length > 0}
              style={{
                padding: '12px 20px',
                borderRadius: '0',
                border: 'none',
                background: 'var(--success-color)',
                color: 'white',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '13px',
                height: '48px',
                minWidth: '80px',
                maxWidth: '90px'
              }}
            >
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      </div>

      {/* Request Tabs */}
      <div className="request-section">
        <div className="request-tabs">
          <button 
            className={`request-tab ${activeRequestTab === REQUEST_TAB_TYPES.BODY ? 'active' : ''}`}
            onClick={() => handleTabChange(REQUEST_TAB_TYPES.BODY)}
          >
            Body
          </button>
          <button 
            className={`request-tab ${activeRequestTab === REQUEST_TAB_TYPES.AUTH ? 'active' : ''}`}
            onClick={() => handleTabChange(REQUEST_TAB_TYPES.AUTH)}
          >
            Authorization
          </button>
          <button 
            className={`request-tab ${activeRequestTab === REQUEST_TAB_TYPES.PARAMS ? 'active' : ''}`}
            onClick={() => handleTabChange(REQUEST_TAB_TYPES.PARAMS)}
          >
            Params
          </button>
          <button 
            className={`request-tab ${activeRequestTab === REQUEST_TAB_TYPES.HEADERS ? 'active' : ''}`}
            onClick={() => handleTabChange(REQUEST_TAB_TYPES.HEADERS)}
          >
            Headers ({requestData.headers.length})
          </button>
        </div>
        
        <div className="section-content">
          {activeRequestTab === REQUEST_TAB_TYPES.BODY && (
            <div className="form-group">
              <div style={{ marginBottom: '12px' }}>
                <label className="form-label">Body Format</label>
                <select
                  className="form-select"
                  value={bodyFormat}
                  onChange={(e) => handleBodyFormatChange(e.target.value)}
                  style={{ marginLeft: '12px' }}
                >
                  {Object.entries(BODY_FORMAT_TYPES).map(([key, value]) => (
                    <option key={key} value={value}>
                      {key === 'JSON' ? 'JSON' : 
                       key === 'XML' ? 'XML' : 
                       key === 'FORM_DATA' ? 'Form Data' : 
                       key === 'X_WWW_FORM_URLENCODED' ? 'x-www-form-urlencoded' : 
                       key === 'RAW' ? 'Raw' : 
                       key === 'BINARY' ? 'Binary' : value}
                    </option>
                  ))}
                </select>
              </div>
              <label className="form-label">Request Body</label>
              {renderBodyContent()}
            </div>
          )}

          {activeRequestTab === REQUEST_TAB_TYPES.AUTH && (
            <div>
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">Type</label>
                <select
                  className="form-select"
                  value={authType}
                  onChange={(e) => handleAuthTypeChange(e.target.value)}
                  style={{ marginLeft: '12px', minWidth: '200px' }}
                >
                  <option value="no-auth">No Auth</option>
                  <option value="api-key">API Key</option>
                  <option value="bearer-token">Bearer Token</option>
                  <option value="basic-auth">Basic Auth</option>
                </select>
              </div>
              {renderAuthContent()}
            </div>
          )}

          {activeRequestTab === REQUEST_TAB_TYPES.PARAMS && (
            <div>
              {/* Path Parameters Section */}
              {pathParams.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
              <div className="section-header" style={{ margin: '0 -16px 16px -16px', borderRadius: '0' }}>
                    <span>Path Parameters</span>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      Automatically detected from URL
              </div>
                  </div>
                  <div style={{ 
                    background: 'var(--bg-secondary)', 
                    borderRadius: '8px', 
                    padding: '16px',
                    border: '1px solid var(--border-color)'
                  }}>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: '60px 1fr 1fr 80px 60px', 
                      gap: '12px',
                      marginBottom: '12px',
                      fontWeight: '600',
                      fontSize: '12px',
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      <div>ON/OFF</div>
                      <div>Key</div>
                      <div>Value</div>
                      <div>Required</div>
                      <div>Type</div>
                    </div>
                    {pathParams.map((param, index) => (
                      <div key={index} style={{ 
                        display: 'grid', 
                        gridTemplateColumns: '60px 1fr 1fr 80px 60px', 
                        gap: '12px',
                        alignItems: 'center',
                        padding: '8px 0',
                        borderBottom: '1px solid var(--border-color)'
                      }}>
                        <button 
                          className="btn btn-secondary"
                          onClick={() => toggleParameter(PARAMETER_TYPES.PATH, index)}
                          style={{ 
                            padding: '6px 8px',
                            background: param.enabled ? 'var(--success-color)' : 'var(--bg-tertiary)',
                            color: param.enabled ? 'white' : 'var(--text-muted)',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          {param.enabled ? 'ON' : 'OFF'}
                        </button>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Parameter name"
                    value={param.key}
                          onChange={(e) => handlePathParamChange(index, 'key', e.target.value)}
                          disabled={param.isTemplate}
                          style={{ 
                            background: param.isTemplate ? 'var(--bg-tertiary)' : 'var(--bg-primary)',
                            color: param.isTemplate ? 'var(--text-muted)' : 'var(--text-primary)',
                            fontSize: '12px',
                            padding: '6px 8px',
                            cursor: param.isTemplate ? 'not-allowed' : 'text'
                          }}
                          title={param.isTemplate ? 'Template parameter - key cannot be changed' : 'Real parameter - key can be edited'}
                  />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Parameter value"
                    value={param.value}
                          onChange={(e) => handlePathParamChange(index, 'value', e.target.value)}
                          style={{ fontSize: '12px', padding: '6px 8px' }}
                        />
                        <div style={{ 
                          padding: '4px 8px', 
                          background: param.required ? 'var(--warning-color)' : 'var(--bg-tertiary)', 
                          borderRadius: '4px',
                          fontSize: '11px',
                          color: param.required ? 'white' : 'var(--text-muted)',
                          textAlign: 'center'
                        }}>
                          {param.required ? 'Required' : 'Optional'}
                        </div>
                        <div style={{ 
                          padding: '4px 8px', 
                          background: param.isTemplate ? 'var(--primary-color)' : 'var(--secondary-color)', 
                          borderRadius: '4px',
                          fontSize: '11px',
                          color: 'white',
                          textAlign: 'center'
                        }}>
                          {param.isTemplate ? 'Template' : 'Real'}
                        </div>
                      </div>
                    ))}
                    
                    {/* Parameter Type Legend */}
                    <div style={{ 
                      marginTop: '16px', 
                      padding: '12px', 
                      background: 'var(--bg-tertiary)', 
                      borderRadius: '6px',
                      fontSize: '11px',
                      color: 'var(--text-muted)'
                    }}>
                      <div style={{ fontWeight: '600', marginBottom: '8px' }}>Parameter Types:</div>
                      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div style={{ 
                            width: '12px', 
                            height: '12px', 
                            background: 'var(--primary-color)', 
                            borderRadius: '2px' 
                          }}></div>
                          <span>Template: {`{paramName}`} - Key cannot be changed</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div style={{ 
                            width: '12px', 
                            height: '12px', 
                            background: 'var(--secondary-color)', 
                            borderRadius: '2px' 
                          }}></div>
                          <span>Real: Actual values - Key can be edited</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Query Parameters Section */}
              <div>
                <div className="section-header" style={{ margin: '0 -16px 16px -16px', borderRadius: '0' }}>
                  <span>Query Parameters</span>
                  <button className="btn btn-secondary" onClick={addQueryParameter}>
                    + Add Parameter
                  </button>
                </div>
                <div style={{ 
                  background: 'var(--bg-secondary)', 
                  borderRadius: '8px', 
                  padding: '16px',
                  border: '1px solid var(--border-color)'
                }}>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '60px 1fr 1fr 80px 60px', 
                    gap: '12px',
                    marginBottom: '12px',
                    fontWeight: '600',
                    fontSize: '12px',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    <div>ON/OFF</div>
                    <div>Key</div>
                    <div>Value</div>
                    <div>Required</div>
                    <div>Type</div>
                  </div>
                  {queryParams.length === 0 ? (
                    <div style={{ 
                      padding: '24px', 
                      textAlign: 'center', 
                      color: 'var(--text-muted)',
                      fontSize: '14px'
                    }}>
                      No query parameters detected. Add some or they will be parsed automatically from the URL.
                    </div>
                  ) : (
                    queryParams.map((param, index) => (
                      <div key={index} style={{ 
                        display: 'grid', 
                        gridTemplateColumns: '60px 1fr 1fr 80px 60px', 
                        gap: '12px',
                        alignItems: 'center',
                        padding: '8px 0',
                        borderBottom: '1px solid var(--border-color)'
                      }}>
                  <button 
                    className="btn btn-secondary"
                          onClick={() => toggleParameter(PARAMETER_TYPES.QUERY, index)}
                          style={{ 
                            padding: '6px 8px',
                            background: param.enabled ? 'var(--success-color)' : 'var(--bg-tertiary)',
                            color: param.enabled ? 'white' : 'var(--text-muted)',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                  >
                          {param.enabled ? 'ON' : 'OFF'}
                  </button>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Parameter name"
                          value={param.key}
                          onChange={(e) => handleQueryParamChange(index, 'key', e.target.value)}
                          style={{ fontSize: '12px', padding: '6px 8px' }}
                        />
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Parameter value"
                          value={param.value}
                          onChange={(e) => handleQueryParamChange(index, 'value', e.target.value)}
                          style={{ fontSize: '12px', padding: '6px 8px' }}
                        />
                        <div style={{ 
                          padding: '4px 8px', 
                          background: 'var(--bg-tertiary)', 
                          borderRadius: '4px',
                          fontSize: '11px',
                          color: 'var(--text-muted)',
                          textAlign: 'center'
                        }}>
                          Optional
                </div>
                        <div style={{ 
                          padding: '4px 8px', 
                          background: 'var(--secondary-color)', 
                          borderRadius: '4px',
                          fontSize: '11px',
                          color: 'white',
                          textAlign: 'center'
                        }}>
                          Query
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeRequestTab === REQUEST_TAB_TYPES.HEADERS && (
            <div>
              <div className="section-header" style={{ margin: '0 -16px 16px -16px', borderRadius: '0' }}>
                <span>Headers</span>
                <button className="btn btn-secondary" onClick={addHeader}>
                  + Add Header
                </button>
              </div>
              
              {/* Inbuilt Headers Section */}
              <div style={{ 
                marginBottom: '20px', 
                padding: '16px', 
                background: 'var(--bg-secondary)', 
                borderRadius: '8px',
                border: '1px solid var(--border-color)'
              }}>
                <h4 style={{ margin: '0 0 12px 0', color: 'var(--text-primary)', fontSize: '14px' }}>
                  🚀 Quick Add Headers
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                  {!headerExists('Accept') && (
                    <button 
                      className="btn btn-secondary"
                      onClick={() => addInbuiltHeader('Accept', '*/*')}
                      style={{ fontSize: '12px', padding: '6px 12px' }}
                    >
                      + Accept: */*
                    </button>
                  )}
                  {!headerExists('User-Agent') && (
                    <button 
                      className="btn btn-secondary"
                      onClick={() => addInbuiltHeader('User-Agent', 'WebHooks/1.0')}
                      style={{ fontSize: '12px', padding: '6px 12px' }}
                    >
                      + User-Agent: WebHooks/1.0
                    </button>
                  )}
                  {!headerExists('Authorization') && (
                    <button 
                      className="btn btn-secondary"
                      onClick={() => addInbuiltHeader('Authorization', 'Bearer your_token_here')}
                      style={{ fontSize: '12px', padding: '6px 12px' }}
                    >
                      + Authorization: Bearer
                    </button>
                  )}
                  {!headerExists('X-API-Key') && (
                    <button 
                      className="btn btn-secondary"
                      onClick={() => addInbuiltHeader('X-API-Key', 'your_api_key_here')}
                      style={{ fontSize: '12px', padding: '6px 12px' }}
                    >
                      + X-API-Key
                    </button>
                  )}
                  {!headerExists('X-Request-ID') && (
                    <button 
                      className="btn btn-secondary"
                      onClick={() => addInbuiltHeader('X-Request-ID', `req_${Date.now()}`)}
                      style={{ fontSize: '12px', padding: '6px 12px' }}
                    >
                      + X-Request-ID
                    </button>
                  )}
                  {!headerExists('Cache-Control') && (
                    <button 
                      className="btn btn-secondary"
                      onClick={() => addInbuiltHeader('Cache-Control', 'no-cache')}
                      style={{ fontSize: '12px', padding: '6px 12px' }}
                    >
                      + Cache-Control: no-cache
                    </button>
                  )}
                </div>
                <div style={{ 
                  marginTop: '12px', 
                  fontSize: '12px', 
                  color: 'var(--text-muted)',
                  fontStyle: 'italic'
                }}>
                  Click any header above to add it to your request. Headers already present won't show here.
                </div>
              </div>
              
              {/* Custom Headers */}
              {requestData.headers.map((header, index) => (
                <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Header name"
                    value={header.key}
                    onChange={(e) => updateHeader(index, 'key', e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Header value"
                    value={header.value}
                    onChange={(e) => updateHeader(index, 'value', e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <button 
                    className="btn btn-secondary"
                    onClick={() => removeHeader(index)}
                    style={{ padding: '8px' }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Environment Configuration Dialog */}
      {showEnvironmentConfig && (
        <div className="save-dialog-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000
        }}>
          <div className="save-dialog" style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '24px',
            minWidth: '600px',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <h3 style={{ marginBottom: '16px', color: 'var(--text-primary)' }}>
              Configure Environment
            </h3>
            
            {/* Backend Integration Notice */}
            <div style={{ 
              marginBottom: '20px', 
              padding: '12px', 
              background: 'var(--bg-secondary)', 
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              fontSize: '14px'
            }}>
              <div style={{ fontWeight: '600', marginBottom: '8px', color: 'var(--primary-color)' }}>
                🔧 Backend Integration Required
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                This environment configuration will be stored in your backend database. 
                Implement CRUD operations for environment management.
              </div>
            </div>
            
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">Environment Name *</label>
              <input
                type="text"
                className="form-input"
                value={environmentConfig.name}
                onChange={(e) => setEnvironmentConfig(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Development, Production, Staging"
                autoFocus
              />
            </div>
            
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">Base URL *</label>
              <input
                type="text"
                className="form-input"
                value={environmentConfig.baseUrl}
                onChange={(e) => setEnvironmentConfig(prev => ({ ...prev, baseUrl: e.target.value }))}
                placeholder="e.g., https://api.example.com"
              />
            </div>
            
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">Role *</label>
              <select
                className="form-select"
                value={environmentConfig.role}
                onChange={(e) => setEnvironmentConfig(prev => ({ ...prev, role: e.target.value }))}
                style={{ marginLeft: '0' }}
              >
                <option value="client">Client - Basic webhook access</option>
                <option value="admin">Admin - Full system access</option>
                <option value="author">Author - Content creation access</option>
              </select>
              <div style={{ 
                marginTop: '4px', 
                fontSize: '12px', 
                color: 'var(--text-muted)' 
              }}>
                Role determines access level and available features
              </div>
            </div>
            
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label className="form-label">Environment Variables</label>
                <button className="btn btn-secondary" onClick={addEnvironmentVariable}>
                  + Add Variable
                </button>
              </div>
              {environmentConfig.variables.map((variable, index) => (
                <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Variable name"
                    value={variable.key}
                    onChange={(e) => updateEnvironmentVariable(index, 'key', e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Variable value"
                    value={variable.value}
                    onChange={(e) => updateEnvironmentVariable(index, 'value', e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <button 
                    className="btn btn-secondary"
                    onClick={() => removeEnvironmentVariable(index)}
                    style={{ padding: '8px' }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            
            {/* Backend Integration Instructions */}
            <div style={{ 
              marginBottom: '20px', 
              padding: '16px', 
              background: 'var(--bg-tertiary)', 
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              fontSize: '13px'
            }}>
              <div style={{ fontWeight: '600', marginBottom: '8px', color: 'var(--text-primary)' }}>
                📋 Backend Implementation Guide
              </div>
              <div style={{ color: 'var(--text-muted)', lineHeight: '1.5' }}>
                <strong>API Endpoints Required:</strong><br/>
                • POST /api/environments - Create environment<br/>
                • GET /api/environments - List environments<br/>
                • PUT /api/environments/:id - Update environment<br/>
                • DELETE /api/environments/:id - Delete environment<br/>
                • GET /api/environments/:id - Get environment details<br/><br/>
                <strong>Database Schema:</strong><br/>
                • Store environment name, base URL, role, and variables<br/>
                • Implement role-based access control (RBAC)<br/>
                • Add user authentication and authorization<br/>
                • Support environment sharing between team members
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                className="btn btn-secondary"
                onClick={() => setShowEnvironmentConfig(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleEnvironmentSave}
                disabled={!environmentConfig.name.trim() || !environmentConfig.baseUrl.trim()}
              >
                Save Environment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="save-dialog-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000
        }}>
          <div className="save-dialog" style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '24px',
            minWidth: '400px',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <h3 style={{ marginBottom: '16px', color: 'var(--text-primary)' }}>
              Save Request
            </h3>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">Request Name *</label>
              <input
                type="text"
                className="form-input"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="Enter request name"
                autoFocus
              />
            </div>
            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label">Description</label>
              <textarea
                className="form-input"
                rows="3"
                value={saveDescription}
                onChange={(e) => setSaveDescription(e.target.value)}
                placeholder="Enter description (optional)"
              />
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                className="btn btn-secondary"
                onClick={() => setShowSaveDialog(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleSaveRequest}
                disabled={!saveName.trim()}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default RequestBuilder 