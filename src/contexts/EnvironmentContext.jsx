import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

// Environment context interface
const EnvironmentContext = createContext()

// Custom hook for environment operations
export const useEnvironment = () => {
  const context = useContext(EnvironmentContext)
  if (!context) {
    throw new Error('useEnvironment must be used within an EnvironmentProvider')
  }
  return context
}

// Environment provider component
export const EnvironmentProvider = ({ children }) => {
  const [environments, setEnvironments] = useState([])
  const [currentEnvironment, setCurrentEnvironment] = useState(null)

  // Helper: ensure reserved variables exist on an environment
  const ensureReservedVariables = useCallback((env) => {
    const existingKeys = (env.variables || []).map(v => v.key)
    const updatedVariables = [...(env.variables || [])]
    let changed = false

    if (!existingKeys.includes('ENV_CODE')) {
      updatedVariables.unshift({ key: 'ENV_CODE', value: 'dev', type: 'default', enabled: true })
      changed = true
    }
    if (!existingKeys.includes('base_URL')) {
      updatedVariables.unshift({ key: 'base_URL', value: '', type: 'default', enabled: true })
      changed = true
    }

    return changed ? { ...env, variables: updatedVariables, updatedAt: new Date().toISOString() } : env
  }, [])

  // Load environments from localStorage
  const loadEnvironments = useCallback(() => {
    try {
      // Try multiple keys for backward compatibility
      const keys = ['webhook_environments', 'webhooks-environments', 'webhook-pro-environments']
      let raw = null
      let usedKey = null
      
      for (const key of keys) {
        const v = localStorage.getItem(key)
        if (v) { 
          raw = v; 
          usedKey = key; 
          break 
        }
      }
      
      if (raw) {
        const parsed = JSON.parse(raw)
        const migrated = parsed.map(ensureReservedVariables)
        setEnvironments(migrated)
        
        // Set current environment if none exists or if current was deleted
        setCurrentEnvironment(prevCurrent => {
          if (!prevCurrent) {
            if (migrated.length > 0) {
              return migrated[0]
            }
            return null
          } else {
            // Check if current environment still exists
            const updatedCurrent = migrated.find(env => env.id === prevCurrent.id)
            if (!updatedCurrent && migrated.length > 0) {
              return migrated[0]
            } else if (updatedCurrent) {
              return updatedCurrent
            }
            return prevCurrent
          }
        })

        // Persist under canonical key if key changed or migration happened
        if (usedKey !== 'webhook_environments' || JSON.stringify(parsed) !== JSON.stringify(migrated)) {
          localStorage.setItem('webhook_environments', JSON.stringify(migrated))
        }
      }
    } catch (error) {
      console.error('Error loading environments:', error)
    }
  }, [ensureReservedVariables])

  // Save environments to localStorage
  const saveEnvironments = useCallback((newEnvironments) => {
    try {
      localStorage.setItem('webhook_environments', JSON.stringify(newEnvironments))
      setEnvironments(newEnvironments)
    } catch (error) {
      console.error('Error saving environments:', error)
    }
  }, [])

  // Create new environment
  const createEnvironment = useCallback((name, description = '', variables = []) => {
    const newEnvironment = {
      id: Date.now().toString(),
      name: name.trim(),
      description: description.trim(),
      variables: [
        { key: 'base_URL', value: '', type: 'default', enabled: true },
        { key: 'ENV_CODE', value: 'dev', type: 'default', enabled: true },
        ...variables
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    const updatedEnvironments = [...environments, newEnvironment]
    saveEnvironments(updatedEnvironments)
    setCurrentEnvironment(newEnvironment)
    return newEnvironment
  }, [environments, saveEnvironments])

  // Update environment
  const updateEnvironment = useCallback((environmentId, updates) => {
    const updatedEnvironments = environments.map(env => 
      env.id === environmentId 
        ? { ...env, ...updates, updatedAt: new Date().toISOString() }
        : env
    )
    saveEnvironments(updatedEnvironments)
    
    // Update current environment if it was the one updated
    if (currentEnvironment?.id === environmentId) {
      const updated = updatedEnvironments.find(env => env.id === environmentId)
      if (updated) {
        setCurrentEnvironment(updated)
      }
    }
  }, [environments, currentEnvironment, saveEnvironments])

  // Delete environment
  const deleteEnvironment = useCallback((environmentId) => {
    const updatedEnvironments = environments.filter(env => env.id !== environmentId)
    saveEnvironments(updatedEnvironments)
    
    // Update current environment if it was deleted
    if (currentEnvironment?.id === environmentId) {
      if (updatedEnvironments.length > 0) {
        setCurrentEnvironment(updatedEnvironments[0])
      } else {
        setCurrentEnvironment(null)
      }
    }
  }, [environments, currentEnvironment, saveEnvironments])

  // Add variable to environment
  const addVariable = useCallback((environmentId) => {
    const updatedEnvironments = environments.map(env => {
      if (env.id === environmentId) {
        return {
          ...env,
          variables: [...env.variables, { 
            key: '', 
            value: '', 
            type: 'default',
            enabled: true 
          }],
          updatedAt: new Date().toISOString()
        }
      }
      return env
    })
    saveEnvironments(updatedEnvironments)
  }, [environments, saveEnvironments])

  // Update variable in environment
  const updateVariable = useCallback((environmentId, variableIndex, field, value) => {
    const updatedEnvironments = environments.map(env => {
      if (env.id === environmentId) {
        const updatedVariables = [...env.variables]
        const targetVar = updatedVariables[variableIndex]
        const isReserved = targetVar.key === 'ENV_CODE' || targetVar.key === 'base_URL'
        
        updatedVariables[variableIndex] = {
          ...updatedVariables[variableIndex],
          // prevent renaming reserved keys
          ...(field === 'key' && isReserved ? {} : { [field]: value })
        }
        
        // force reserved type to default
        if (isReserved) {
          updatedVariables[variableIndex].type = 'default'
        }
        
        return {
          ...env,
          variables: updatedVariables,
          updatedAt: new Date().toISOString()
        }
      }
      return env
    })
    saveEnvironments(updatedEnvironments)
  }, [environments, saveEnvironments])

  // Remove variable from environment
  const removeVariable = useCallback((environmentId, variableIndex) => {
    const updatedEnvironments = environments.map(env => {
      if (env.id === environmentId) {
        const targetVar = env.variables[variableIndex]
        const isReserved = targetVar?.key === 'ENV_CODE' || targetVar?.key === 'base_URL'
        
        if (isReserved) {
          return env
        }
        
        const updatedVariables = env.variables.filter((_, index) => index !== variableIndex)
        return {
          ...env,
          variables: updatedVariables,
          updatedAt: new Date().toISOString()
        }
      }
      return env
    })
    saveEnvironments(updatedEnvironments)
  }, [environments, saveEnvironments])

  // Toggle variable in environment
  const toggleVariable = useCallback((environmentId, variableIndex) => {
    const updatedEnvironments = environments.map(env => {
      if (env.id === environmentId) {
        const updatedVariables = [...env.variables]
        updatedVariables[variableIndex] = {
          ...updatedVariables[variableIndex],
          enabled: !updatedVariables[variableIndex].enabled
        }
        return {
          ...env,
          variables: updatedVariables,
          updatedAt: new Date().toISOString()
        }
      }
      return env
    })
    saveEnvironments(updatedEnvironments)
  }, [environments, saveEnvironments])

  // Load environments on mount
  useEffect(() => {
    loadEnvironments()
  }, [loadEnvironments])

  // Listen for storage changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (['webhook_environments', 'webhooks-environments', 'webhook-pro-environments'].includes(e.key)) {
        loadEnvironments()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [loadEnvironments])

  const value = {
    // State
    environments,
    currentEnvironment,
    
    // Actions
    setCurrentEnvironment,
    createEnvironment,
    updateEnvironment,
    deleteEnvironment,
    addVariable,
    updateVariable,
    removeVariable,
    toggleVariable,
    
    // Utilities
    loadEnvironments,
    ensureReservedVariables
  }

  return (
    <EnvironmentContext.Provider value={value}>
      {children}
    </EnvironmentContext.Provider>
  )
}
