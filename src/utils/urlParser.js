/**
 * URL Parser Utilities
 * Handles URL parsing, parameter extraction, and URL building
 */

/**
 * Parse URL and extract path parameters (only template-style {paramName})
 * @param {string} url - URL to parse
 * @returns {Array} Array of path parameter objects
 */
export const parsePathParameters = (url) => {
  if (!url || typeof url !== 'string') return []
  
  try {
    // Handle relative URLs by adding a base
    const urlObj = new URL(url, 'https://api.example.com')
    const pathSegments = urlObj.pathname.split('/').filter(Boolean)
    
    if (pathSegments.length === 0) return []
    
    const pathParams = []
    
    pathSegments.forEach((segment, index) => {
      // Only detect template parameters {paramName}
      if (segment.startsWith('{') && segment.endsWith('}')) {
        const paramName = segment.slice(1, -1)
        if (paramName.trim()) {
          pathParams.push({
            key: paramName.trim(),
            value: '',
            enabled: true,
            type: 'path',
            required: true,
            isTemplate: true,
            segmentIndex: index
          })
        }
      }
    })
    
    return pathParams
  } catch (error) {
    console.error('Error parsing path parameters:', error)
    return []
  }
}

/**
 * Parse URL and extract query parameters
 * @param {string} url - URL to parse
 * @returns {Array} Array of query parameter objects
 */
export const parseQueryParameters = (url) => {
  if (!url || typeof url !== 'string') return []
  
  try {
    const urlObj = new URL(url, 'https://api.example.com')
    const queryParams = []
    
    urlObj.searchParams.forEach((value, key) => {
      if (key.trim()) {
        queryParams.push({
          key: key.trim(),
          value: value || '',
          type: 'query',
          required: false,
          enabled: true
        })
      }
    })
    
    return queryParams
  } catch (error) {
    console.error('Error parsing query parameters:', error)
    return []
  }
}

/**
 * Build URL from base URL and parameters
 * @param {string} baseUrl - Base URL
 * @param {Array} pathParams - Path parameters
 * @param {Array} queryParams - Query parameters
 * @returns {string} Built URL
 */
export const buildUrl = (baseUrl, pathParams = [], queryParams = []) => {
  if (!baseUrl) return ''
  
  try {
    let url = baseUrl
    
    // Replace path parameters
    pathParams.forEach(param => {
      if (param.enabled && param.isTemplate && param.value) {
        const placeholder = `{${param.key}}`
        if (url.includes(placeholder)) {
          url = url.replace(placeholder, param.value)
        }
      }
    })
    
    // Add query parameters
    if (queryParams.length > 0) {
      const urlObj = new URL(url, 'https://api.example.com')
      urlObj.search = ''
      
      queryParams.forEach(param => {
        if (param.enabled && param.key?.trim()) {
          urlObj.searchParams.set(param.key.trim(), param.value || '')
        }
      })
      
      url = urlObj.toString()
    }
    
    return url
  } catch (error) {
    console.error('Error building URL:', error)
    return baseUrl
  }
}

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean} True if URL is valid
 */
export const isValidUrl = (url) => {
  if (!url || typeof url !== 'string') return false
  
  try {
    new URL(url, 'https://api.example.com')
    return true
  } catch {
    return false
  }
}

/**
 * Extract domain and path from URL
 * @param {string} url - URL to parse
 * @returns {Object} Object with domain and path
 */
export const extractUrlParts = (url) => {
  if (!url || typeof url !== 'string') {
    return { domain: '', path: '', isValid: false }
  }
  
  try {
    const urlObj = new URL(url, 'https://api.example.com')
    return {
      domain: urlObj.origin,
      path: urlObj.pathname + urlObj.search,
      isValid: true
    }
  } catch (error) {
    return { domain: '', path: '', isValid: false }
  }
}
