/**
 * Mock API Service for testing HTTP requests locally
 * Provides test endpoints that work without CORS restrictions
 */

// Simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// Mock database for storing data
let mockData = {
  users: [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com' }
  ],
  posts: [
    { id: 1, title: 'First Post', content: 'This is the first post content' },
    { id: 2, title: 'Second Post', content: 'This is the second post content' }
  ]
}

/**
 * Mock API endpoint handler
 * @param {string} url - Request URL
 * @param {Object} options - Request options
 * @returns {Promise<Response>} Mock response
 */
export const mockApiHandler = async (url, options = {}) => {
  const urlObj = new URL(url)
  const path = urlObj.pathname
  const method = options.method || 'GET'
  
  // Simulate network delay
  await delay(500 + Math.random() * 1000)
  
  // Handle different endpoints
  if (path === '/api/users') {
    if (method === 'GET') {
      return new Response(JSON.stringify(mockData.users), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    } else if (method === 'POST') {
      try {
        const body = JSON.parse(options.body || '{}')
        const newUser = {
          id: mockData.users.length + 1,
          name: body.name || 'Unknown User',
          email: body.email || 'unknown@example.com'
        }
        mockData.users.push(newUser)
        return new Response(JSON.stringify(newUser), {
          status: 201,
          headers: { 'Content-Type': 'application/json' }
        })
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        })
      }
    }
  } else if (path === '/api/posts') {
    if (method === 'GET') {
      return new Response(JSON.stringify(mockData.posts), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    } else if (method === 'POST') {
      try {
        const body = JSON.parse(options.body || '{}')
        const newPost = {
          id: mockData.posts.length + 1,
          title: body.title || 'Untitled Post',
          content: body.content || 'No content'
        }
        mockData.posts.push(newPost)
        return new Response(JSON.stringify(newPost), {
          status: 201,
          headers: { 'Content-Type': 'application/json' }
        })
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        })
      }
    }
  } else if (path === '/api/webhook-test') {
    // Webhook test endpoint that validates the new payload format
    try {
      const body = JSON.parse(options.body || '{}')
      
      // Validate the expected payload format
      const validation = {
        isValid: true,
        errors: [],
        receivedPayload: body,
        timestamp: new Date().toISOString()
      }
      
      // Check required fields
      if (!body.name) {
        validation.isValid = false
        validation.errors.push('Missing required field: name')
      }
      if (!body.endpoint) {
        validation.isValid = false
        validation.errors.push('Missing required field: endpoint')
      }
      if (!body.method) {
        validation.isValid = false
        validation.errors.push('Missing required field: method')
      }
      if (!body.authType) {
        validation.isValid = false
        validation.errors.push('Missing required field: authType')
      }
      if (!body.tenantId) {
        validation.isValid = false
        validation.errors.push('Missing required field: tenantId')
      }
      if (!Array.isArray(body.webhookParams)) {
        validation.isValid = false
        validation.errors.push('Missing required field: webhookParams (must be array)')
      }
      if (!Array.isArray(body.environments)) {
        validation.isValid = false
        validation.errors.push('Missing required field: environments (must be array)')
      }
      
      // Check webhookParams structure
      if (Array.isArray(body.webhookParams)) {
        body.webhookParams.forEach((param, index) => {
          if (!param.paramName) {
            validation.errors.push(`webhookParams[${index}]: Missing paramName`)
          }
          if (!param.paramValue) {
            validation.errors.push(`webhookParams[${index}]: Missing paramValue`)
          }
          if (!param.paramType) {
            validation.errors.push(`webhookParams[${index}]: Missing paramType`)
          }
          if (!param.bodyMode) {
            validation.errors.push(`webhookParams[${index}]: Missing bodyMode`)
          }
          if (!param.envCode) {
            validation.errors.push(`webhookParams[${index}]: Missing envCode`)
          }
        })
      }
      
      // Check environments structure
      if (Array.isArray(body.environments)) {
        body.environments.forEach((env, index) => {
          if (!env.envCode) {
            validation.errors.push(`environments[${index}]: Missing envCode`)
          }
          if (!env.baseUrl) {
            validation.errors.push(`environments[${index}]: Missing baseUrl`)
          }
          if (!env.key) {
            validation.errors.push(`environments[${index}]: Missing key`)
          }
          if (!env.value) {
            validation.errors.push(`environments[${index}]: Missing value`)
          }
        })
      }
      
      if (validation.errors.length > 0) {
        validation.isValid = false
      }
      
      const response = {
        success: validation.isValid,
        message: validation.isValid ? 'Payload format is valid!' : 'Payload format validation failed',
        validation,
        receivedAt: new Date().toISOString(),
        webhookId: validation.isValid ? `webhook_${Date.now()}` : null
      }
      
      return new Response(JSON.stringify(response, null, 2), {
        status: validation.isValid ? 200 : 400,
        headers: { 'Content-Type': 'application/json' }
      })
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid JSON payload',
        message: error.message
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  } else if (path === '/api/echo') {
    // Echo endpoint that returns request data
    const echoData = {
      method,
      url: url,
      headers: options.headers || {},
      body: options.body || null,
      timestamp: new Date().toISOString(),
      queryParams: Object.fromEntries(urlObj.searchParams)
    }
    return new Response(JSON.stringify(echoData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } else if (path === '/api/status') {
    // Status endpoint for testing
    return new Response(JSON.stringify({
      status: 'OK',
      message: 'Mock API is running',
      timestamp: new Date().toISOString(),
      endpoints: [
        'GET /api/users - Get all users',
        'POST /api/users - Create a new user',
        'GET /api/posts - Get all posts',
        'POST /api/posts - Create a new post',
        'GET /api/echo - Echo request data',
        'GET /api/status - API status'
      ]
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } else if (path === '/api/error') {
    // Error endpoint for testing error handling
    return new Response(JSON.stringify({
      error: 'Test Error',
      message: 'This is a test error response',
      code: 'TEST_ERROR_001',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  } else if (path === '/api/timeout') {
    // Timeout endpoint for testing timeout handling
    await delay(10000) // 10 second delay
    return new Response(JSON.stringify({ message: 'This should timeout' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  }
  
  // 404 for unknown endpoints
  return new Response(JSON.stringify({
    error: 'Not Found',
    message: `Endpoint ${path} not found`,
    timestamp: new Date().toISOString()
  }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' }
  })
}

/**
 * Check if a URL is a mock API endpoint
 * @param {string} url - URL to check
 * @returns {boolean} True if it's a mock endpoint
 */
export const isMockEndpoint = (url) => {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname === 'localhost' && urlObj.pathname.startsWith('/api/')
  } catch {
    return false
  }
}

/**
 * Get available test URLs for the user
 * @returns {Array} Array of test URLs with descriptions
 */
export const getTestUrls = () => [
  {
    url: 'http://localhost:3000/api/status',
    description: 'API Status - Test basic GET request',
    method: 'GET'
  },
  {
    url: 'http://localhost:3000/api/users',
    description: 'Get Users - Test GET with JSON response',
    method: 'GET'
  },
  {
    url: 'http://localhost:3000/api/users',
    description: 'Create User - Test POST with JSON body',
    method: 'POST',
    body: JSON.stringify({ name: 'Test User', email: 'test@example.com' })
  },
  {
    url: 'http://localhost:3000/api/echo',
    description: 'Echo Request - Test POST with custom headers and body',
    method: 'POST',
    body: JSON.stringify({ message: 'Hello World', timestamp: new Date().toISOString() })
  },
  {
    url: 'http://localhost:3000/api/webhook-test',
    description: 'Webhook Payload Test - Validate the new payload format',
    method: 'POST',
    body: JSON.stringify({
      name: "Order Webhook",
      endpoint: "https://api.example.com/webhook/orders",
      method: "POST",
      authType: "API_KEY",
      tenantId: "T123",
      webhookParams: [
        {
          paramName: "Authorization",
          paramValue: "Bearer xyz",
          paramType: "HEADER",
          bodyMode: "NONE",
          envCode: "DEV"
        },
        {
          paramName: "limit",
          paramValue: "100",
          paramType: "QUERY_PARAM",
          bodyMode: "NONE",
          envCode: "DEV"
        }
      ],
      environments: [
        {
          envCode: "DEV",
          baseUrl: "https://dev.api.example.com",
          key: "key1",
          value: "value1"
        },
        {
          envCode: "PROD",
          baseUrl: "https://api.example.com",
          key: "key2",
          value: "value2"
        }
      ]
    })
  },
  {
    url: 'http://localhost:3000/api/error',
    description: 'Error Response - Test error handling',
    method: 'GET'
  }
]
