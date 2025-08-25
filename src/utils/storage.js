/**
 * Local storage service for request history and user preferences
 * 
 * Backend Integration Point:
 * - Replace localStorage with API calls to your backend
 * - Add user authentication and data persistence
 * - Add data synchronization across devices
 * - Add backup and restore functionality
 */

const STORAGE_KEYS = {
  REQUEST_HISTORY: 'webhook-pro-request-history',
  USER_PREFERENCES: 'webhook-pro-user-preferences',
  SAVED_REQUESTS: 'webhook-pro-saved-requests',
  COLLECTIONS: 'webhook-pro-collections',
  ENVIRONMENTS: 'webhook-pro-environments'
}

/**
 * Get item from localStorage with error handling
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if item not found
 * @returns {*} Stored value or default
 */
const getStorageItem = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.error(`Error reading from localStorage key "${key}":`, error)
    return defaultValue
  }
}

/**
 * Set item in localStorage with error handling
 * @param {string} key - Storage key
 * @param {*} value - Value to store
 * @returns {boolean} Success status
 */
const setStorageItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (error) {
    console.error(`Error writing to localStorage key "${key}":`, error)
    return false
  }
}

/**
 * Remove item from localStorage
 * @param {string} key - Storage key
 * @returns {boolean} Success status
 */
const removeStorageItem = (key) => {
  try {
    localStorage.removeItem(key)
    return true
  } catch (error) {
    console.error(`Error removing from localStorage key "${key}":`, error)
    return false
  }
}

/**
 * Request History Management
 */
export const RequestHistoryService = {
  /**
   * Get all request history
   * @returns {Array} Array of request history items
   */
  getAll: () => {
    return getStorageItem(STORAGE_KEYS.REQUEST_HISTORY, [])
  },

  /**
   * Add new request to history
   * @param {Object} requestData - Request data
   * @param {Object} response - Response data
   * @param {number} responseTime - Response time in milliseconds
   */
  add: (requestData, response, responseTime) => {
    const history = RequestHistoryService.getAll()
    const newEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      request: { ...requestData },
      response: { ...response },
      responseTime,
      status: response.status,
      method: requestData.method,
      url: requestData.url
    }

    // Add to beginning and limit to last 100 entries
    history.unshift(newEntry)
    if (history.length > 100) {
      history.splice(100)
    }

    setStorageItem(STORAGE_KEYS.REQUEST_HISTORY, history)
    return newEntry
  },

  /**
   * Get request history by ID
   * @param {string} id - Request history ID
   * @returns {Object|null} Request history item or null
   */
  getById: (id) => {
    const history = RequestHistoryService.getAll()
    return history.find(item => item.id === id) || null
  },

  /**
   * Delete request history item
   * @param {string} id - Request history ID
   * @returns {boolean} Success status
   */
  delete: (id) => {
    const history = RequestHistoryService.getAll()
    const filteredHistory = history.filter(item => item.id !== id)
    return setStorageItem(STORAGE_KEYS.REQUEST_HISTORY, filteredHistory)
  },

  /**
   * Clear all request history
   * @returns {boolean} Success status
   */
  clear: () => {
    return setStorageItem(STORAGE_KEYS.REQUEST_HISTORY, [])
  },

  /**
   * Search request history
   * @param {string} query - Search query
   * @returns {Array} Filtered request history
   */
  search: (query) => {
    if (!query) return RequestHistoryService.getAll()
    
    const history = RequestHistoryService.getAll()
    const lowerQuery = query.toLowerCase()
    
    return history.filter(item => 
      item.url.toLowerCase().includes(lowerQuery) ||
      item.method.toLowerCase().includes(lowerQuery) ||
      item.status.toString().includes(lowerQuery)
    )
  }
}

/**
 * Saved Requests Management
 */
export const SavedRequestsService = {
  /**
   * Get all saved requests
   * @returns {Array} Array of saved requests
   */
  getAll: () => {
    return getStorageItem(STORAGE_KEYS.SAVED_REQUESTS, [])
  },

  /**
   * Save a new request
   * @param {Object} requestData - Request data
   * @param {string} name - Request name
   * @param {string} description - Request description
   * @returns {Object} Saved request object
   */
  save: (requestData, name, description = '') => {
    const savedRequests = SavedRequestsService.getAll()
    const newRequest = {
      id: Date.now().toString(),
      name,
      description,
      timestamp: new Date().toISOString(),
      request: { ...requestData }
    }

    savedRequests.push(newRequest)
    setStorageItem(STORAGE_KEYS.SAVED_REQUESTS, savedRequests)
    return newRequest
  },

  /**
   * Update saved request
   * @param {string} id - Request ID
   * @param {Object} updates - Updates to apply
   * @returns {boolean} Success status
   */
  update: (id, updates) => {
    const savedRequests = SavedRequestsService.getAll()
    const index = savedRequests.findIndex(req => req.id === id)
    
    if (index === -1) return false
    
    savedRequests[index] = { ...savedRequests[index], ...updates }
    return setStorageItem(STORAGE_KEYS.SAVED_REQUESTS, savedRequests)
  },

  /**
   * Delete saved request
   * @param {string} id - Request ID
   * @returns {boolean} Success status
   */
  delete: (id) => {
    const savedRequests = SavedRequestsService.getAll()
    const filteredRequests = savedRequests.filter(req => req.id !== id)
    return setStorageItem(STORAGE_KEYS.SAVED_REQUESTS, filteredRequests)
  }
}

/**
 * User Preferences Management
 */
export const UserPreferencesService = {
  /**
   * Get user preferences
   * @returns {Object} User preferences object
   */
  get: () => {
    return getStorageItem(STORAGE_KEYS.USER_PREFERENCES, {
      theme: 'dark-theme',
      autoSave: true,
      maxHistoryItems: 100,
      defaultTimeout: 30000,
      showLineNumbers: true,
      fontSize: 'medium'
    })
  },

  /**
   * Update user preferences
   * @param {Object} updates - Preference updates
   * @returns {boolean} Success status
   */
  update: (updates) => {
    const preferences = UserPreferencesService.get()
    const updatedPreferences = { ...preferences, ...updates }
    return setStorageItem(STORAGE_KEYS.USER_PREFERENCES, updatedPreferences)
  },

  /**
   * Reset user preferences to defaults
   * @returns {boolean} Success status
   */
  reset: () => {
    return removeStorageItem(STORAGE_KEYS.USER_PREFERENCES)
  }
}

/**
 * Export/Import functionality
 */
export const DataExportService = {
  /**
   * Export all data as JSON
   * @returns {string} JSON string of all data
   */
  exportAll: () => {
    const data = {
      requestHistory: RequestHistoryService.getAll(),
      savedRequests: SavedRequestsService.getAll(),
      userPreferences: UserPreferencesService.get(),
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    }
    
    return JSON.stringify(data, null, 2)
  },

  /**
   * Import data from JSON
   * @param {string} jsonData - JSON string to import
   * @returns {boolean} Success status
   */
  importAll: (jsonData) => {
    try {
      const data = JSON.parse(jsonData)
      
      if (data.requestHistory) {
        setStorageItem(STORAGE_KEYS.REQUEST_HISTORY, data.requestHistory)
      }
      
      if (data.savedRequests) {
        setStorageItem(STORAGE_KEYS.SAVED_REQUESTS, data.savedRequests)
      }
      
      if (data.userPreferences) {
        setStorageItem(STORAGE_KEYS.USER_PREFERENCES, data.userPreferences)
      }
      
      return true
    } catch (error) {
      console.error('Error importing data:', error)
      return false
    }
  }
} 