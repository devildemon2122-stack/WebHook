/**
 * HTTP Service for making real HTTP requests
 * Replaces mock functionality with actual network calls
 */

// CORS proxy service for testing external URLs (fallback option)
const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/'

// Import mock API service for local testing
import { mockApiHandler, isMockEndpoint } from './mockApiService'

/**
 * Send HTTP request with real network call
 * @param {Object} requestData - Request configuration
 * @returns {Promise<Object>} Response object
 */
export const sendHttpRequest = async (requestData) => {
  const startTime = Date.now()
  
  try {
    // Build the final URL with path parameters
    let finalUrl = requestData.url
    
    // Replace path parameters in URL
    if (requestData.params) {
      requestData.params.forEach(param => {
        if (param.type === 'path' && param.enabled && param.value) {
          const placeholder = `{${param.key}}`
          if (finalUrl.includes(placeholder)) {
            finalUrl = finalUrl.replace(placeholder, param.value)
          }
        }
      })
    }
    
    // Build query parameters
    const queryParams = requestData.params?.filter(p => p.type === 'query' && p.enabled && p.key) || []
    if (queryParams.length > 0) {
      const url = new URL(finalUrl)
      queryParams.forEach(param => {
        if (param.key && param.value !== undefined) {
          url.searchParams.set(param.key, param.value)
        }
      })
      finalUrl = url.toString()
    }
    
    // Prepare headers
    const headers = {}
    requestData.headers?.forEach(header => {
      if (header.key && header.value !== undefined) {
        headers[header.key] = header.value
      }
    })
    
    // Prepare request options
    const requestOptions = {
      method: requestData.method || 'GET',
      headers: headers,
      mode: 'cors', // Enable CORS
      cache: 'no-cache',
      credentials: 'omit', // Changed from 'same-origin' to avoid CORS issues
      redirect: 'follow',
      referrerPolicy: 'no-referrer'
    }
    
    // Add body for non-GET requests
    if (requestData.method !== 'GET' && requestData.body) {
      if (requestData.bodyFormat === 'application/json') {
        try {
          requestOptions.body = JSON.stringify(JSON.parse(requestData.body))
          if (!headers['Content-Type']) {
            headers['Content-Type'] = 'application/json'
          }
        } catch (e) {
          // If JSON parsing fails, send as raw text
          requestOptions.body = requestData.body
          if (!headers['Content-Type']) {
            headers['Content-Type'] = 'text/plain'
          }
        }
      } else if (requestData.bodyFormat === 'application/x-www-form-urlencoded') {
        requestOptions.body = requestData.body
        if (!headers['Content-Type']) {
          headers['Content-Type'] = 'application/x-www-form-urlencoded'
        }
      } else {
        requestOptions.body = requestData.body
        if (!headers['Content-Type']) {
          headers['Content-Type'] = 'text/plain'
        }
      }
    }
    
    // Check if this is a mock API endpoint (localhost)
    if (isMockEndpoint(finalUrl)) {
      console.log('Using mock API for localhost request:', finalUrl)
      const mockResponse = await mockApiHandler(finalUrl, requestOptions)
      const responseTime = Date.now() - startTime
      
      // Convert mock response to our format
      const responseBody = await mockResponse.text()
      const responseHeaders = {}
      mockResponse.headers.forEach((value, key) => {
        responseHeaders[key] = value
      })
      
      return {
        success: true,
        response: {
          status: mockResponse.status,
          statusText: mockResponse.statusText,
          headers: responseHeaders,
          body: responseBody
        },
        responseTime
      }
    }
    
    // Make the actual HTTP request
    let response
    try {
      response = await fetch(finalUrl, requestOptions)
    } catch (fetchError) {
      // If direct fetch fails due to CORS, try with proxy as fallback
      if (fetchError.name === 'TypeError' && fetchError.message.includes('fetch')) {
        console.warn('Direct request failed, trying with CORS proxy...')
        
        // Try with CORS proxy
        const proxyUrl = CORS_PROXY + finalUrl
        try {
          response = await fetch(proxyUrl, {
            ...requestOptions,
            headers: {
              ...requestOptions.headers,
              'Origin': window.location.origin,
              'X-Requested-With': 'XMLHttpRequest'
            }
          })
        } catch (proxyError) {
          // Both direct and proxy failed
          throw new Error(`CORS Error: Cannot access ${finalUrl}. This is likely due to browser security restrictions. Try using a local API endpoint or a CORS-enabled service.`)
        }
      } else {
        throw fetchError
      }
    }
    const responseTime = Date.now() - startTime
    
    // Get response headers
    const responseHeaders = {}
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value
    })
    
    // Get response body
    let responseBody
    const contentType = response.headers.get('content-type') || ''
    
    if (contentType.includes('application/json')) {
      try {
        responseBody = await response.json()
        responseBody = JSON.stringify(responseBody, null, 2)
      } catch (e) {
        responseBody = await response.text()
      }
    } else if (contentType.includes('text/')) {
      responseBody = await response.text()
    } else {
      // For binary or other content types
      const blob = await response.blob()
      responseBody = `Binary data: ${blob.type} (${blob.size} bytes)`
    }
    
    // Return response in the expected format
    return {
      success: true,
      response: {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        body: responseBody
      },
      responseTime
    }
    
  } catch (error) {
    const responseTime = Date.now() - startTime
    
    // Handle different types of errors with more specific messages
    let errorResponse
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      // Network error
      errorResponse = {
        status: 0,
        statusText: 'Network Error',
        headers: {},
        body: JSON.stringify({
          error: 'Network Error',
          message: 'Failed to connect to the server. Please check the URL and try again.',
          details: error.message,
          timestamp: new Date().toISOString(),
          troubleshooting: [
            'Check if the URL is correct and accessible',
            'Verify the server is running and accepting requests',
            'Check for CORS restrictions (try a local API endpoint)',
            'Ensure your internet connection is working'
          ]
        }, null, 2)
      }
    } else if (error.message && error.message.includes('CORS Error')) {
      // CORS specific error
      errorResponse = {
        status: 0,
        statusText: 'CORS Error',
        headers: {},
        body: JSON.stringify({
          error: 'CORS Error',
          message: error.message,
          details: 'Cross-Origin Resource Sharing restriction',
          timestamp: new Date().toISOString(),
          troubleshooting: [
            'Try using a local API endpoint (localhost:3000, 127.0.0.1)',
            'Use a CORS-enabled service or API',
            'Test with your own backend server',
            'Check if the target server allows CORS requests'
          ]
        }, null, 2)
      }
    } else if (error.name === 'AbortError') {
      // Request timeout
      errorResponse = {
        status: 0,
        statusText: 'Request Timeout',
        headers: {},
        body: JSON.stringify({
          error: 'Request Timeout',
          message: 'The request took too long to complete.',
          timestamp: new Date().toISOString()
        }, null, 2)
      }
    } else {
      // Other errors
      errorResponse = {
        status: 0,
        statusText: 'Request Error',
        headers: {},
        body: JSON.stringify({
          error: 'Request Error',
          message: error.message || 'An unexpected error occurred',
          timestamp: new Date().toISOString()
        }, null, 2)
      }
    }
    
    return {
      success: false,
      error: error.message,
      response: errorResponse,
      responseTime
    }
  }
}

/**
 * Validate if a URL is accessible (ping test)
 * @param {string} url - URL to test
 * @returns {Promise<boolean>} True if accessible
 */
export const pingUrl = async (url) => {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout
    
    const response = await fetch(url, {
      method: 'HEAD',
      mode: 'cors',
      signal: controller.signal,
      credentials: 'omit'
    })
    
    clearTimeout(timeoutId)
    return response.ok
  } catch (error) {
    if (error.name === 'AbortError') {
      console.warn('URL ping timeout:', url)
      return false
    }
    
    // Check if it's a CORS error
    if (error.message.includes('Failed to fetch') || error.message.includes('CORS')) {
      console.warn('CORS error when pinging URL:', url)
      return false
    }
    
    console.warn('Error pinging URL:', url, error)
    return false
  }
}

/**
 * Test URL accessibility with different HTTP methods
 * @param {string} url - URL to test
 * @param {Array} methods - HTTP methods to test
 * @returns {Promise<Object>} Test results
 */
export const testUrlMethods = async (url, methods = ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS']) => {
  const results = {}
  
  for (const method of methods) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 second timeout per method
      
      const response = await fetch(url, {
        method,
        mode: 'cors',
        signal: controller.signal,
        credentials: 'omit'
      })
      
      clearTimeout(timeoutId)
      results[method] = {
        allowed: true,
        status: response.status,
        statusText: response.statusText
      }
    } catch (error) {
      let errorMessage = error.message
      
      // Provide more user-friendly error messages
      if (error.name === 'AbortError') {
        errorMessage = 'Request timeout'
      } else if (error.message.includes('Failed to fetch') || error.message.includes('CORS')) {
        errorMessage = 'CORS blocked - server doesn\'t allow this method'
      } else if (error.message.includes('NetworkError')) {
        errorMessage = 'Network error'
      }
      
      results[method] = {
        allowed: false,
        error: errorMessage
      }
    }
  }
  
  return results
}
