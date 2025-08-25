/**
 * Validation utilities for webhook requests
 * 
 * Backend Integration Point:
 * - Replace client-side validation with server-side validation
 * - Add custom validation rules based on your backend requirements
 */

/**
 * Validate URL format and accessibility
 * @param {string} url - URL to validate
 * @returns {Object} Validation result with isValid and error message
 */
export const validateUrl = (url) => {
  if (!url) {
    return { isValid: false, error: 'URL is required' }
  }

  try {
    const urlObj = new URL(url)
    
    // Check if protocol is HTTP or HTTPS
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return { isValid: false, error: 'URL must use HTTP or HTTPS protocol' }
    }

    // Check if hostname exists
    if (!urlObj.hostname) {
      return { isValid: false, error: 'Invalid hostname' }
    }

    // Check for common TLD patterns
    const tldPattern = /\.[a-z]{2,}$/i
    if (!tldPattern.test(urlObj.hostname)) {
      return { isValid: false, error: 'Invalid domain format' }
    }

    return { isValid: true, error: null }
  } catch (error) {
    return { isValid: false, error: 'Invalid URL format' }
  }
}

/**
 * Validate HTTP method
 * @param {string} method - HTTP method to validate
 * @returns {Object} Validation result
 */
export const validateHttpMethod = (method) => {
  const validMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']
  
  if (!validMethods.includes(method)) {
    return { isValid: false, error: 'Invalid HTTP method' }
  }

  return { isValid: true, error: null }
}

/**
 * Validate request headers
 * @param {Array} headers - Array of header objects
 * @returns {Object} Validation result
 */
export const validateHeaders = (headers) => {
  if (!Array.isArray(headers)) {
    return { isValid: false, error: 'Headers must be an array' }
  }

  for (let i = 0; i < headers.length; i++) {
    const header = headers[i]
    
    if (!header.key || !header.key.trim()) {
      return { isValid: false, error: `Header ${i + 1}: Key is required` }
    }

    if (!header.value || !header.value.trim()) {
      return { isValid: false, error: `Header ${i + 1}: Value is required` }
    }

    // Check for duplicate keys
    const duplicateIndex = headers.findIndex((h, index) => 
      index !== i && h.key.toLowerCase() === header.key.toLowerCase()
    )
    
    if (duplicateIndex !== -1) {
      return { isValid: false, error: `Duplicate header key: ${header.key}` }
    }
  }

  return { isValid: true, error: null }
}

/**
 * Validate JSON body
 * @param {string} body - JSON string to validate
 * @returns {Object} Validation result
 */
export const validateJsonBody = (body) => {
  if (!body || !body.trim()) {
    return { isValid: true, error: null } // Empty body is valid
  }

  try {
    JSON.parse(body)
    return { isValid: true, error: null }
  } catch (error) {
    return { isValid: false, error: 'Invalid JSON format' }
  }
}

/**
 * Validate query parameters
 * @param {Array} params - Array of parameter objects
 * @returns {Object} Validation result
 */
export const validateQueryParams = (params) => {
  if (!Array.isArray(params)) {
    return { isValid: false, error: 'Query parameters must be an array' }
  }

  for (let i = 0; i < params.length; i++) {
    const param = params[i]
    
    if (!param.key || !param.key.trim()) {
      return { isValid: false, error: `Parameter ${i + 1}: Key is required` }
    }

    // Check for duplicate keys
    const duplicateIndex = params.findIndex((p, index) => 
      index !== i && p.key === param.key
    )
    
    if (duplicateIndex !== -1) {
      return { isValid: false, error: `Duplicate parameter key: ${param.key}` }
    }
  }

  return { isValid: true, error: null }
}

/**
 * Comprehensive request validation
 * @param {Object} requestData - Complete request data
 * @returns {Object} Validation result with all errors
 */
export const validateRequest = (requestData) => {
  const errors = []
  
  // URL validation
  const urlValidation = validateUrl(requestData.url)
  if (!urlValidation.isValid) {
    errors.push(urlValidation.error)
  }

  // Method validation
  const methodValidation = validateHttpMethod(requestData.method)
  if (!methodValidation.isValid) {
    errors.push(methodValidation.error)
  }

  // Headers validation
  const headersValidation = validateHeaders(requestData.headers)
  if (!headersValidation.isValid) {
    errors.push(headersValidation.error)
  }

  // Body validation for POST/PUT/PATCH
  if (['POST', 'PUT', 'PATCH'].includes(requestData.method)) {
    const bodyValidation = validateJsonBody(requestData.body)
    if (!bodyValidation.isValid) {
      errors.push(bodyValidation.error)
    }
  }

  // Query parameters validation
  const paramsValidation = validateQueryParams(requestData.params)
  if (!paramsValidation.isValid) {
    errors.push(paramsValidation.error)
  }

  return {
    isValid: errors.length === 0,
    errors,
    errorCount: errors.length
  }
} 