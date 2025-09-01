/**
 * Backend Configuration
 * Centralized configuration for backend API endpoints
 */

export const BACKEND_CONFIG = {
  // Server configuration
  SERVER: {
    IP: '10.22.1.98',
    PORT: 8082,
    PROTOCOL: 'http'
  },
  
  // API endpoints
  ENDPOINTS: {
    WEBHOOK_API: '/api/webhooks/api',
    LOGS_API: '/api/webhooks/log'
  },
  
  // Default values
  DEFAULTS: {
    TENANT_ID: 1,
    PARENT_ID: 0
  }
}

/**
 * Get the full base URL for the backend
 * @returns {string} Complete base URL
 */
export const getBackendBaseUrl = () => {
  const { SERVER } = BACKEND_CONFIG
  return `${SERVER.PROTOCOL}://${SERVER.IP}:${SERVER.PORT}`
}

/**
 * Get the full webhook API base URL
 * @returns {string} Complete webhook API base URL
 */
export const getWebhookApiBaseUrl = () => {
  return `${getBackendBaseUrl()}${BACKEND_CONFIG.ENDPOINTS.WEBHOOK_API}`
}

/**
 * Get the full logs API base URL
 * @returns {string} Complete logs API base URL
 */
export const getLogsApiBaseUrl = () => {
  return `${getBackendBaseUrl()}${BACKEND_CONFIG.ENDPOINTS.LOGS_API}`
}
