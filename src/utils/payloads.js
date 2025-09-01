/**
 * Payload transformation utilities for webhook requests
 */

/**
 * Transform request data to backend API format
 * @param {Object} requestData - Frontend request data
 * @param {Object} currentEnvironment - Current environment
 * @param {Array} environments - All environments
 * @param {string} authType - Authentication type
 * @param {Object} authConfig - Authentication configuration
 * @returns {Object} Backend format payload
 */
export const buildNewFormatPayload = (requestData, currentEnvironment, environments, authType, authConfig, name = 'Webhook Request') => {
  // Input validation and defaults
  if (!requestData) {
    throw new Error('Request data is required')
  }
  
  if (!name || typeof name !== 'string') {
    name = 'Webhook Request'
  }
  
  if (!authType) {
    authType = 'no-auth'
  }
  
  if (!Array.isArray(environments)) {
    environments = []
  }

  // Debug logging
  console.log('buildNewFormatPayload inputs:', {
    requestData: !!requestData,
    currentEnvironment: !!currentEnvironment,
    environments: environments?.length || 0,
    authType,
    authConfig: !!authConfig,
    name
  })

  // Helper function to safely get environment code
  const getEnvCode = (env) => {
    if (!env || !env.variables || !Array.isArray(env.variables)) return 'DEV'
    const envCodeVar = env.variables.find(v => v && v.key === 'ENV_CODE')
    return envCodeVar?.value || 'DEV'
  }

  // Helper function to safely get base URL
  const getBaseUrl = (env) => {
    if (!env || !env.variables || !Array.isArray(env.variables)) return ''
    const baseUrlVar = env.variables.find(v => v && v.key === 'base_URL')
    return baseUrlVar?.value || ''
  }

  // Transform headers to webhookParams format
  const webhookParams = requestData.headers?.map(header => ({
    envCode: getEnvCode(currentEnvironment),
    paramName: header.key,
    paramValue: header.value,
    paramType: 'HEADER',
    bodyMode: requestData.bodyFormat === 'application/json' ? 'RAW' : 'NONE'
  })) || []

  // Add query parameters
  if (requestData.params) {
    const queryParams = requestData.params.filter(param => param.type === 'query')
    queryParams.forEach(param => {
      webhookParams.push({
        envCode: getEnvCode(currentEnvironment),
        paramName: param.key,
        paramValue: param.value,
        paramType: 'QUERY_PARAM',
        bodyMode: 'NONE'
      })
    })
  }

  // Add path parameters
  if (requestData.params) {
    const pathParams = requestData.params.filter(param => param.type === 'path')
    pathParams.forEach(param => {
      webhookParams.push({
        envCode: getEnvCode(currentEnvironment),
        paramName: param.key,
        paramValue: param.value,
        paramType: 'PATH_PARAM',
        bodyMode: 'NONE'
      })
    })
  }

  // Add authentication parameters
  if (authType !== 'no-auth' && authConfig) {
    switch (authType) {
      case 'api-key':
        if (authConfig.apiKey?.key && authConfig.apiKey?.value) {
          webhookParams.push({
            envCode: getEnvCode(currentEnvironment),
            paramName: authConfig.apiKey.key,
            paramValue: authConfig.apiKey.value,
            paramType: 'HEADER',
            bodyMode: 'NONE'
          })
        }
        break
      case 'bearer-token':
        if (authConfig.bearerToken?.token) {
          webhookParams.push({
            envCode: getEnvCode(currentEnvironment),
            paramName: 'Authorization',
            paramValue: `Bearer ${authConfig.bearerToken.token}`,
            paramType: 'HEADER',
            bodyMode: 'NONE'
          })
        }
        break
      case 'basic-auth':
        if (authConfig.basicAuth?.username && authConfig.basicAuth?.password) {
          const credentials = btoa ? btoa(`${authConfig.basicAuth.username}:${authConfig.basicAuth.password}`) : 
            Buffer.from(`${authConfig.basicAuth.username}:${authConfig.basicAuth.password}`).toString('base64')
          webhookParams.push({
            envCode: getEnvCode(currentEnvironment),
            paramName: 'Authorization',
            paramValue: `Basic ${credentials}`,
            paramType: 'HEADER',
            bodyMode: 'NONE'
          })
        }
        break
    }
  }

  // Transform environments to backend format
  const backendEnvironments = environments?.map(env => ({
    envCode: getEnvCode(env),
    baseUrl: getBaseUrl(env)
  })) || []

  // Build the final payload
  const payload = {
    name: name,
    endpoint: requestData.url || '',
    method: requestData.method || 'GET',
    authType: mapAuthTypeToBackend(authType),
    parentId: 0, // Default value as per API spec
    tenant: {
      id: 1 // Default tenant ID as per API spec
    },
    webhookParams: webhookParams,
    environments: backendEnvironments
  }

  return payload
}

/**
 * Map frontend auth type to backend auth type
 * @param {string} frontendAuthType - Frontend authentication type
 * @returns {string} Backend authentication type
 */
const mapAuthTypeToBackend = (frontendAuthType) => {
  const authTypeMap = {
    'no-auth': 'NONE',
    'api-key': 'API_KEY',
    'bearer-token': 'BEARER',
    'basic-auth': 'BASIC'
  }
  return authTypeMap[frontendAuthType] || 'NONE'
}

/**
 * Validate the new format payload
 * @param {Object} payload - Payload to validate
 * @returns {Object} Validation result with isValid and errors
 */
export const validateNewFormatPayload = (payload) => {
  const errors = []

  if (!payload.name || payload.name.trim() === '') {
    errors.push('Name is required')
  }

  if (!payload.endpoint || payload.endpoint.trim() === '') {
    errors.push('Endpoint is required')
  }

  if (!payload.method || !['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].includes(payload.method)) {
    errors.push('Valid HTTP method is required')
  }

  if (!payload.tenant || !payload.tenant.id) {
    errors.push('Tenant ID is required')
  }

  if (!Array.isArray(payload.webhookParams)) {
    errors.push('Webhook parameters must be an array')
  }

  if (!Array.isArray(payload.environments)) {
    errors.push('Environments must be an array')
  }

  return {
    isValid: errors.length === 0,
    errors: errors
  }
} 