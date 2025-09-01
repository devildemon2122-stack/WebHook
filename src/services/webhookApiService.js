/**
 * Webhook API Service
 * Handles all backend API calls for webhook management and logs
 */

import { getWebhookApiBaseUrl, getLogsApiBaseUrl } from '../config/backend'

// Webhook API endpoints
const WEBHOOK_API_BASE = getWebhookApiBaseUrl()
const LOG_API_BASE = getLogsApiBaseUrl()

/**
 * Create a new webhook API
 * @param {Object} webhookData - Webhook data in backend format
 * @returns {Promise<Object>} Created webhook object
 */
export const createWebhookApi = async (webhookData) => {
  try {
    const response = await fetch(`${WEBHOOK_API_BASE}/createApi`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookData)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error creating webhook API:', error)
    throw error
  }
}

/**
 * Update an existing webhook API
 * @param {number} id - Webhook ID
 * @param {Object} webhookData - Updated webhook data
 * @returns {Promise<Object>} Updated webhook object
 */
export const updateWebhookApi = async (id, webhookData) => {
  try {
    const response = await fetch(`${WEBHOOK_API_BASE}/updateApi/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookData)
    })

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Webhook not found')
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error updating webhook API:', error)
    throw error
  }
}

/**
 * Get webhook API by ID
 * @param {number} id - Webhook ID
 * @returns {Promise<Object>} Webhook object
 */
export const getWebhookApiById = async (id) => {
  try {
    const response = await fetch(`${WEBHOOK_API_BASE}/getById/${id}`)

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Webhook not found')
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error getting webhook API by ID:', error)
    throw error
  }
}

/**
 * Get all webhook APIs
 * @returns {Promise<Array>} Array of webhook objects
 */
export const getAllWebhookApis = async () => {
  try {
    const response = await fetch(`${WEBHOOK_API_BASE}/getAll`)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error getting all webhook APIs:', error)
    throw error
  }
}

/**
 * Delete webhook API by ID
 * @param {number} id - Webhook ID
 * @returns {Promise<boolean>} Success status
 */
export const deleteWebhookApi = async (id) => {
  try {
    const response = await fetch(`${WEBHOOK_API_BASE}/deleteApi/${id}`, {
      method: 'DELETE'
    })

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Webhook not found')
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return true
  } catch (error) {
    console.error('Error deleting webhook API:', error)
    throw error
  }
}

/**
 * Get logs by webhook ID
 * @param {number} webhookId - Webhook ID
 * @returns {Promise<Array>} Array of log objects
 */
export const getLogsByWebhookId = async (webhookId) => {
  try {
    const response = await fetch(`${LOG_API_BASE}/getByWebhookId/${webhookId}`)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error getting logs by webhook ID:', error)
    throw error
  }
}

/**
 * Get logs by reference ID
 * @param {string} refId - Reference ID
 * @returns {Promise<Array>} Array of log objects
 */
export const getLogsByRefId = async (refId) => {
  try {
    const response = await fetch(`${LOG_API_BASE}/getByRefId/${refId}`)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error getting logs by ref ID:', error)
    throw error
  }
}

/**
 * Get logs by parent ID
 * @param {number} parentId - Parent ID
 * @returns {Promise<Array>} Array of log objects
 */
export const getLogsByParentId = async (parentId) => {
  try {
    const response = await fetch(`${LOG_API_BASE}/getByParentId/${parentId}`)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error getting logs by parent ID:', error)
    throw error
  }
}

/**
 * Get logs by date range
 * @param {string} startDate - Start date (yyyy-MM-dd HH:mm:ss)
 * @param {string} endDate - End date (yyyy-MM-dd HH:mm:ss)
 * @returns {Promise<Array>} Array of log objects
 */
export const getLogsByDateRange = async (startDate, endDate) => {
  try {
    const params = new URLSearchParams({
      start: startDate,
      end: endDate
    })

    const response = await fetch(`${LOG_API_BASE}/getByDateRange?${params}`)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error getting logs by date range:', error)
    throw error
  }
}
