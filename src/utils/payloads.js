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

/**
 * Transform request data to the new format specified by the lead
 * @param {Object} requestData - The current request data
 * @param {string} name - Request name
 * @param {string} description - Request description
 * @param {Object} currentEnvironment - Current environment context
 * @param {Array} allEnvironments - All available environments
 * @param {string} authType - Current authentication type
 * @param {Object} authConfig - Current authentication configuration
 * @returns {Object} Formatted payload according to lead's specifications
 */
export const buildNewFormatPayload = (requestData, name, description, currentEnvironment, allEnvironments, authType, authConfig) => {
  // Input validation
  if (!requestData) {
    throw new Error('Request data is required')
  }
  
  // Transform webhook parameters from headers and params
  const webhookParams = []
  
  // Add headers as HEADER type parameters
  if (requestData.headers && requestData.headers.length > 0) {
    requestData.headers.forEach(header => {
      if (header.key && header.key.trim()) {
        webhookParams.push({
          paramName: header.key.trim(),
          paramValue: header.value || '',
          paramType: 'HEADER',
          bodyMode: 'NONE',
          envCode: currentEnvironment?.variables?.find(v => v.key === 'ENV_CODE')?.value || 'DEV'
        })
      }
    })
  }
  
  // Add query parameters as QUERY_PARAM type
  if (requestData.params && requestData.params.length > 0) {
    requestData.params.forEach(param => {
      if (param.key && param.key.trim() && param.type === 'query') {
        webhookParams.push({
          paramName: param.key.trim(),
          paramValue: param.value || '',
          paramType: 'QUERY_PARAM',
          bodyMode: 'NONE',
          envCode: currentEnvironment?.variables?.find(v => v.key === 'ENV_CODE')?.value || 'DEV'
        })
      }
    })
  }
  
  // Add path parameters as QUERY_PARAM type (or could be PATH_PARAM if you prefer)
  if (requestData.params && requestData.params.length > 0) {
    requestData.params.forEach(param => {
      if (param.key && param.key.trim() && param.type === 'path') {
        webhookParams.push({
          paramName: param.key.trim(),
          paramValue: param.value || '',
          paramType: 'PATH_PARAM',
          bodyMode: 'NONE',
          envCode: currentEnvironment?.variables?.find(v => v.key === 'ENV_CODE')?.value || 'DEV'
        })
      }
    })
  }
  
  // Add authentication parameters if present
  if (authType && authConfig) {
    switch (authType) {
      case 'api-key':
        if (authConfig.apiKey?.key && authConfig.apiKey?.value) {
          webhookParams.push({
            paramName: authConfig.apiKey.key,
            paramValue: authConfig.apiKey.value,
            paramType: authConfig.apiKey.addTo === 'header' ? 'HEADER' : 'QUERY_PARAM',
            bodyMode: 'NONE',
            envCode: currentEnvironment?.variables?.find(v => v.key === 'ENV_CODE')?.value || 'DEV'
          })
        }
        break
      case 'bearer-token':
        if (authConfig.bearerToken?.token) {
          webhookParams.push({
            paramName: 'Authorization',
            paramValue: `Bearer ${authConfig.bearerToken.token}`,
            paramType: 'HEADER',
            bodyMode: 'NONE',
            envCode: currentEnvironment?.variables?.find(v => v.key === 'ENV_CODE')?.value || 'DEV'
          })
        }
        break
      case 'basic-auth':
        if (authConfig.basicAuth?.username && authConfig.basicAuth?.password) {
          const credentials = btoa(`${authConfig.basicAuth.username}:${authConfig.basicAuth.password}`)
          webhookParams.push({
            paramName: 'Authorization',
            paramValue: `Basic ${credentials}`,
            paramType: 'HEADER',
            bodyMode: 'NONE',
            envCode: currentEnvironment?.variables?.find(v => v.key === 'ENV_CODE')?.value || 'DEV'
          })
        }
        break
    }
  }
  
  // Transform environments
  const environments = []
  if (allEnvironments && allEnvironments.length > 0) {
    allEnvironments.forEach(env => {
      const envCode = env.variables?.find(v => v.key === 'ENV_CODE')?.value || 'DEV'
      const baseUrl = env.variables?.find(v => v.key === 'base_URL')?.value || ''
      
      // Add base environment
      if (baseUrl) {
        environments.push({
          envCode: envCode.toUpperCase(),
          baseUrl: baseUrl,
          key: env.name || '',
          value: env.description || ''
        })
      }
      
      // Add custom environment variables
      env.variables?.forEach(variable => {
        if (variable.key && variable.key !== 'ENV_CODE' && variable.key !== 'base_URL' && variable.enabled) {
          environments.push({
            envCode: envCode.toUpperCase(),
            baseUrl: baseUrl,
            key: variable.key,
            value: variable.value || ''
          })
        }
      })
    })
  }
  
  // If no environments exist, create a default one
  if (environments.length === 0) {
    const defaultEnvCode = currentEnvironment?.variables?.find(v => v.key === 'ENV_CODE')?.value || 'DEV'
    const defaultBaseUrl = currentEnvironment?.variables?.find(v => v.key === 'base_URL')?.value || ''
    
    environments.push({
      envCode: defaultEnvCode.toUpperCase(),
      baseUrl: defaultBaseUrl || 'https://api.example.com',
      key: 'default',
      value: 'Default environment'
    })
  }
  
  // Generate tenant ID (you might want to make this configurable)
  // const tenantId = `T${Date.now().toString().slice(-6)}`
  //  const tenantId = `+${Date.now().toString().slice(-6)}`
  const tenantId = 1;
  
  const payload = {
    name: name?.trim() || 'Unnamed Webhook',
    parentId: 0,
    endpoint: requestData.url || '',
    method: requestData.method || 'GET',
    authType: authType ? authType.toUpperCase().replace('-', '_') : 'NO_AUTH',
    tenant: {
      id: tenantId,
    },
    webhookParams: webhookParams,
    environments: environments
  }
  
  // Log the payload for debugging (remove this in production)
  // console.log('New Format Payload:', JSON.stringify(payload, null, 2))
  
  return payload
}

/**
 * Validate the new format payload
 * @param {Object} payload - The payload to validate
 * @returns {Object} Validation result with isValid and errors
 */
export const validateNewFormatPayload = (payload) => {
  const errors = []
  
  if (!payload.name || !payload.name.trim()) {
    errors.push('Name is required')
  }
  
  if (!payload.endpoint || !payload.endpoint.trim()) {
    errors.push('Endpoint is required')
  }
  
  if (!payload.method || !payload.method.trim()) {
    errors.push('Method is required')
  }
  
  if (!payload.authType) {
    errors.push('Auth type is required')
  }
  
  if (!payload.tenant || !payload.tenant.trim()) {
    errors.push('Tenant ID is required')
  }
  
  if (!Array.isArray(payload.webhookParams)) {
    errors.push('Webhook params must be an array')
  }
  
  if (!Array.isArray(payload.environments)) {
    errors.push('Environments must be an array')
  }
  
  // Validate webhook parameters
  if (Array.isArray(payload.webhookParams)) {
    payload.webhookParams.forEach((param, index) => {
      if (!param.paramName || !param.paramName.trim()) {
        errors.push(`Parameter ${index + 1}: paramName is required`)
      }
      if (!param.paramType || !['HEADER', 'QUERY_PARAM', 'PATH_PARAM'].includes(param.paramType)) {
        errors.push(`Parameter ${index + 1}: paramType must be HEADER, QUERY_PARAM, or PATH_PARAM`)
      }
      if (!param.envCode || !param.envCode.trim()) {
        errors.push(`Parameter ${index + 1}: envCode is required`)
      }
    })
  }
  
  // Validate environments
  if (Array.isArray(payload.environments)) {
    payload.environments.forEach((env, index) => {
      if (!env.envCode || !env.envCode.trim()) {
        errors.push(`Environment ${index + 1}: envCode is required`)
      }
      if (!env.baseUrl || !env.baseUrl.trim()) {
        errors.push(`Environment ${index + 1}: baseUrl is required`)
      }
    })
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  }
} 