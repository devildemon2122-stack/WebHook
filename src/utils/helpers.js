import { STATUS_RANGES } from './constants'

/**
 * Get status class based on HTTP status code
 * @param {number} status - HTTP status code
 * @returns {string} CSS class name for status styling
 */
export const getStatusClass = (status) => {
  if (status >= STATUS_RANGES.SUCCESS.min && status <= STATUS_RANGES.SUCCESS.max) {
    return 'status-success'
  }
  if (status >= STATUS_RANGES.CLIENT_ERROR.min && status <= STATUS_RANGES.CLIENT_ERROR.max) {
    return 'status-error'
  }
  if (status >= STATUS_RANGES.SERVER_ERROR.min && status <= STATUS_RANGES.SERVER_ERROR.max) {
    return 'status-error'
  }
  return 'status-pending'
}

/**
 * Format headers object to string representation
 * @param {Object} headers - Headers object
 * @returns {string} Formatted headers string
 */
export const formatHeaders = (headers) => {
  return Object.entries(headers)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n')
}

/**
 * Validate URL format
 * @param {string} url - URL string to validate
 * @returns {boolean} True if URL is valid
 */
export const isValidUrl = (url) => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Format response time for display
 * @param {number} timeMs - Time in milliseconds
 * @returns {string} Formatted time string
 */
export const formatResponseTime = (timeMs) => {
  if (timeMs < 1000) {
    return `${timeMs}ms`
  }
  return `${(timeMs / 1000).toFixed(2)}s`
}

/**
 * Format file size for display
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size string
 */
export const formatFileSize = (bytes) => {
  if (bytes < 1024) {
    return `${bytes} B`
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * Debounce function for performance optimization
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Deep clone object (simple implementation)
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj))
} 