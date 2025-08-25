// HTTP Methods
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE'
}

// Request Tab Types
export const REQUEST_TAB_TYPES = {
  BODY: 'body',
  AUTH: 'auth',
  PARAMS: 'params',
  HEADERS: 'headers'
}

// Parameter Types
export const PARAMETER_TYPES = {
  PATH: 'path',
  QUERY: 'query'
}

// Parameter Generation Modes
export const PARAM_GENERATION_MODES = {
  TEMPLATE_ONLY: 'template_only',
  REAL_ONLY: 'real_only',
  TEMPLATE_AND_REAL: 'template_and_real'
}

// Default Parameter Names for Real Values
export const DEFAULT_PARAM_NAMES = [
  'param1', 'param2', 'param3', 'param4', 'param5',
  'param6', 'param7', 'param8', 'param9', 'param10'
]

// Body Format Types
export const BODY_FORMAT_TYPES = {
  JSON: 'json',
  XML: 'xml',
  FORM_DATA: 'form-data',
  X_WWW_FORM_URLENCODED: 'x-www-form-urlencoded',
  RAW: 'raw',
  BINARY: 'binary'
}

// Response Tab Types
export const RESPONSE_TAB_TYPES = {
  PREVIEW: 'preview',
  HEADERS: 'headers',
  TIMELINE: 'timeline'
}

// Status Code Ranges
export const STATUS_RANGES = {
  SUCCESS: { min: 200, max: 299 },
  CLIENT_ERROR: { min: 400, max: 499 },
  SERVER_ERROR: { min: 500, max: 599 }
}

// Default Values
export const DEFAULTS = {
  REQUEST_TIMEOUT: 30000, // 30 seconds
  MAX_HISTORY_ITEMS: 5, // Changed to 5 as requested
  DEFAULT_HEADERS: [
    { key: 'Content-Type', value: 'application/json' }
  ]
}

// Local Storage Keys
export const STORAGE_KEYS = {
  THEME: 'webhooks-theme',
  REQUEST_HISTORY: 'webhooks-request-history',
  USER_PREFERENCES: 'webhooks-user-preferences',
  ENVIRONMENTS: 'webhooks-environments'
}

// Webhook request interface
export const createWebhookRequest = (overrides = {}) => ({
  method: 'POST',
  url: 'https://api.example.com/webhook',
  headers: [{ key: 'Content-Type', value: 'application/json' }],
  // body: JSON.stringify({ message: 'Hello WebHooks!' }, null, 2),
  body: JSON.stringify({
    event: {}, 
    data: {
      userId: "u123",
      name: "Abhishek Mishra",
      email: "abhishek@example.com"
    },
    metadata: {
      timestamp: new Date().toISOString(), // ISO timestamp
      source: "Webhooks",              // where this originated
      requestId: "req_" + Math.random().toString(36).slice(2, 11) // unique request id
    },
  
  }, null, 2),

  params: [{ key: 'param1', value: 'value1', type: PARAMETER_TYPES.QUERY, enabled: true }],
  pathParams: [],
  bodyFormat: BODY_FORMAT_TYPES.JSON,
  ...overrides
}) 