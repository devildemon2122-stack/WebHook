import React, { useState, useEffect } from 'react'

/**
 * EnvironmentView Component
 * 
 * Responsibilities:
 * - Manage environment variables (like Postman)
 * - Save/load environment configurations
 * - Handle secret keys and sensitive data
 * - Provide environment switching
 */
const EnvironmentView = () => {
  const [environments, setEnvironments] = useState([])
  const [currentEnvironment, setCurrentEnvironment] = useState(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newEnvironment, setNewEnvironment] = useState({
    name: '',
    description: '',
    variables: []
  })

  // Helper: ensure reserved variables exist on an environment
  const ensureReservedVariables = (env) => {
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
  }

  // Load environments from localStorage on component mount
  useEffect(() => {
    const loadFromStorage = () => {
      // Try multiple keys for backward compatibility
      const keys = ['webhook_environments', 'webhooks-environments', 'webhook-pro-environments']
      let raw = null
      let usedKey = null
      for (const key of keys) {
        const v = localStorage.getItem(key)
        if (v) { raw = v; usedKey = key; break }
      }
      if (raw) {
        const parsed = JSON.parse(raw)
        const migrated = parsed.map(ensureReservedVariables)
        setEnvironments(migrated)
        if (migrated.length > 0) {
          setCurrentEnvironment(migrated[0])
        }
        // Persist under canonical key if key changed or migration happened
        if (usedKey !== 'webhook_environments' || JSON.stringify(parsed) !== JSON.stringify(migrated)) {
          localStorage.setItem('webhook_environments', JSON.stringify(migrated))
        }
      }
    }

    loadFromStorage()

    const onStorage = (e) => {
      if (['webhook_environments', 'webhooks-environments', 'webhook-pro-environments'].includes(e.key)) {
        loadFromStorage()
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  // Save environments to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('webhook_environments', JSON.stringify(environments))
  }, [environments])

  // Keep currentEnvironment in sync with environments state so edits render immediately
  useEffect(() => {
    if (!environments || environments.length === 0) return
    if (!currentEnvironment) {
      setCurrentEnvironment(environments[0])
      return
    }

    const updated = environments.find(env => env.id === currentEnvironment.id)
    if (updated && updated !== currentEnvironment) {
      setCurrentEnvironment(updated)
    } else if (!updated) {
      // Fallback if the current environment was removed
      setCurrentEnvironment(environments[0])
    }
  }, [environments])

  const handleCreateEnvironment = () => {
    if (newEnvironment.name.trim()) {
      const environment = {
        id: Date.now().toString(),
        name: newEnvironment.name.trim(),
        description: newEnvironment.description.trim(),
        variables: [
          { key: 'base_URL', value: '', type: 'default', enabled: true },
          { key: 'ENV_CODE', value: 'dev', type: 'default', enabled: true },
          ...newEnvironment.variables
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      setEnvironments(prev => [...prev, environment])
      setCurrentEnvironment(environment)
      setNewEnvironment({ name: '', description: '', variables: [] })
      setShowCreateDialog(false)
    }
  }

  const handleDeleteEnvironment = (environmentId) => {
    setEnvironments(prev => prev.filter(env => env.id !== environmentId))
    if (currentEnvironment?.id === environmentId) {
      setCurrentEnvironment(environments.length > 1 ? environments.find(env => env.id !== environmentId) : null)
    }
  }

  const addVariable = (environmentId) => {
    setEnvironments(prev => prev.map(env => {
      if (env.id === environmentId) {
        return {
          ...env,
          variables: [...env.variables, { 
            key: '', 
            value: '', 
            type: 'default', // 'default' or 'secret'
            enabled: true 
          }],
          updatedAt: new Date().toISOString()
        }
      }
      return env
    }))
  }

  const updateVariable = (environmentId, variableIndex, field, value) => {
    setEnvironments(prev => prev.map(env => {
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
    }))
  }

  const removeVariable = (environmentId, variableIndex) => {
    setEnvironments(prev => prev.map(env => {
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
    }))
  }

  const toggleVariable = (environmentId, variableIndex) => {
    setEnvironments(prev => prev.map(env => {
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
    }))
  }

  return (
    <div className="environment-view" style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-primary)',
      color: 'var(--text-primary)'
    }}>
      {/* Header */}
      <div style={{
        padding: '24px 32px',
        borderBottom: '1px solid var(--border-color)',
        background: 'var(--bg-secondary)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{
              margin: '0 0 8px 0',
              fontSize: '28px',
              fontWeight: '600',
              color: 'var(--text-primary)'
            }}>
              Environment Variables
            </h1>
            <p style={{
              margin: '0',
              fontSize: '14px',
              color: 'var(--text-muted)'
            }}>
              Manage environment variables and secrets for your webhook requests
            </p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateDialog(true)}
            style={{
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            + New Environment
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        overflow: 'hidden'
      }}>
        {/* Left Panel - Environment List */}
        <div style={{
          width: '300px',
          borderRight: '1px solid var(--border-color)',
          background: 'var(--bg-secondary)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            padding: '20px',
            borderBottom: '1px solid var(--border-color)',
            background: 'var(--bg-tertiary)'
          }}>
            <h3 style={{
              margin: '0 0 12px 0',
              fontSize: '16px',
              fontWeight: '600',
              color: 'var(--text-primary)'
            }}>
              ENVIRONMENTS
            </h3>
            <p style={{
              margin: '0',
              fontSize: '12px',
              color: 'var(--text-muted)'
            }}>
              Select an environment to manage its variables
            </p>
          </div>
          
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px'
          }}>
            {environments.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: 'var(--text-muted)'
              }}>
                <div style={{
                  fontSize: '48px',
                  marginBottom: '16px'
                }}>
                  🌍
                </div>
                <h3 style={{
                  margin: '0 0 8px 0',
                  fontSize: '16px',
                  fontWeight: '500'
                }}>
                  No Environments
                </h3>
                <p style={{
                  margin: '0 0 20px 0',
                  fontSize: '14px'
                }}>
                  Create your first environment to get started
                </p>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowCreateDialog(true)}
                  style={{
                    padding: '8px 16px',
                    fontSize: '13px'
                  }}
                >
                  Create Environment
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {environments.map((env) => (
                  <div
                    key={env.id}
                    onClick={() => setCurrentEnvironment(env)}
                    style={{
                      padding: '16px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      border: '1px solid var(--border-color)',
                      background: currentEnvironment?.id === env.id ? 'var(--primary-color)' : 'var(--bg-primary)',
                      color: currentEnvironment?.id === env.id ? 'white' : 'var(--text-primary)',
                      transition: 'all 0.2s ease',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      if (currentEnvironment?.id !== env.id) {
                        e.target.style.background = 'var(--bg-tertiary)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentEnvironment?.id !== env.id) {
                        e.target.style.background = 'var(--bg-primary)'
                      }
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '8px'
                    }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{
                          margin: '0 0 4px 0',
                          fontSize: '14px',
                          fontWeight: '600'
                        }}>
                          {env.name}
                        </h4>
                        <p style={{
                          margin: '0',
                          fontSize: '12px',
                          opacity: 0.8
                        }}>
                          {env.description || 'No description'}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteEnvironment(env.id)
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'inherit',
                          cursor: 'pointer',
                          fontSize: '16px',
                          opacity: 0.7,
                          padding: '4px'
                        }}
                        title="Delete environment"
                      >
                        ×
                      </button>
                    </div>
                    <div style={{
                      fontSize: '11px',
                      opacity: 0.8
                    }}>
                      {env.variables.length} variables • Updated {new Date(env.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Environment Details */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--bg-primary)'
        }}>
          {currentEnvironment ? (
            <>
              {/* Environment Header */}
              <div style={{
                padding: '24px 32px',
                borderBottom: '1px solid var(--border-color)',
                background: 'var(--bg-secondary)'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <h2 style={{
                      margin: '0 0 4px 0',
                      fontSize: '20px',
                      fontWeight: '600',
                      color: 'var(--text-primary)'
                    }}>
                      {currentEnvironment.name}
                    </h2>
                    <p style={{
                      margin: '0',
                      fontSize: '14px',
                      color: 'var(--text-muted)'
                    }}>
                      {currentEnvironment.description || 'No description'}
                    </p>
                  </div>
                  <button
                    className="btn btn-secondary"
                    onClick={() => addVariable(currentEnvironment.id)}
                    style={{
                      padding: '8px 16px',
                      fontSize: '13px'
                    }}
                  >
                    + Add Variable
                  </button>
                </div>
              </div>

              {/* Variables Table */}
              <div style={{
                flex: 1,
                padding: '24px 32px',
                overflowY: 'auto'
              }}>
                {currentEnvironment.variables.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '60px 20px',
                    color: 'var(--text-muted)'
                  }}>
                    <div style={{
                      fontSize: '48px',
                      marginBottom: '16px'
                    }}>
                      🔧
                    </div>
                    <h3 style={{
                      margin: '0 0 8px 0',
                      fontSize: '16px',
                      fontWeight: '500'
                    }}>
                      No Variables
                    </h3>
                    <p style={{
                      margin: '0 0 20px 0',
                      fontSize: '14px'
                    }}>
                      Add variables to this environment to use them in your requests
                    </p>
                    <button
                      className="btn btn-secondary"
                      onClick={() => addVariable(currentEnvironment.id)}
                      style={{
                        padding: '8px 16px',
                        fontSize: '13px'
                      }}
                    >
                      + Add Variable
                    </button>
                  </div>
                ) : (
                  <div style={{
                    background: 'var(--bg-secondary)',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    overflow: 'hidden'
                  }}>
                    {/* Table Header */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '60px 1fr 1fr 120px 80px',
                      gap: '16px',
                      padding: '16px 20px',
                      background: 'var(--bg-tertiary)',
                      borderBottom: '1px solid var(--border-color)',
                      fontWeight: '600',
                      fontSize: '12px',
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      <div>Active</div>
                      <div>Variable</div>
                      <div>Initial Value</div>
                      <div>Type</div>
                      <div>Actions</div>
                    </div>

                    {/* Variables List */}
                    <div>
                      {currentEnvironment.variables.map((variable, index) => (
                        <div
                          key={index}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '60px 1fr 1fr 120px 80px',
                            gap: '16px',
                            padding: '16px 20px',
                            borderBottom: '1px solid var(--border-color)',
                            alignItems: 'center'
                          }}
                        >
                          {/* Active Toggle */}
                          <button
                            onClick={() => toggleVariable(currentEnvironment.id, index)}
                            style={{
                              width: '40px',
                              height: '20px',
                              borderRadius: '10px',
                              border: 'none',
                              background: variable.enabled ? 'var(--success-color)' : 'var(--bg-tertiary)',
                              cursor: 'pointer',
                              position: 'relative',
                              transition: 'background 0.2s ease'
                            }}
                            title={variable.enabled ? 'Disable variable' : 'Enable variable'}
                          >
                            <div style={{
                              width: '16px',
                              height: '16px',
                              borderRadius: '50%',
                              background: 'white',
                              position: 'absolute',
                              top: '2px',
                              left: variable.enabled ? '22px' : '2px',
                              transition: 'left 0.2s ease'
                            }} />
                          </button>

                          {/* Variable Name */}
                          <input
                            type="text"
                            placeholder="Variable name"
                            value={variable.key}
                            onChange={(e) => updateVariable(currentEnvironment.id, index, 'key', e.target.value)}
                            style={{
                              padding: '8px 12px',
                              border: '1px solid var(--border-color)',
                              borderRadius: '4px',
                              background: 'var(--bg-primary)',
                              color: 'var(--text-primary)',
                              fontSize: '13px',
                              outline: 'none'
                            }}
                            disabled={variable.key === 'ENV_CODE' || variable.key === 'base_URL'}
                          />

                          {/* Variable Value */}
                          {variable.key === 'ENV_CODE' ? (
                            <select
                              value={variable.value}
                              onChange={(e) => updateVariable(currentEnvironment.id, index, 'value', e.target.value)}
                              style={{
                                padding: '8px 12px',
                                border: '1px solid var(--border-color)',
                                borderRadius: '4px',
                                background: 'var(--bg-primary)',
                                color: 'var(--text-primary)',
                                fontSize: '13px',
                                outline: 'none',
                                cursor: 'pointer'
                              }}
                            >
                              <option value="dev">dev</option>
                              <option value="prod">prod</option>
                              <option value="test">test</option>
                            </select>
                          ) : (
                            <input
                              type={variable.type === 'secret' ? 'password' : 'text'}
                              placeholder="Variable value"
                              value={variable.value}
                              onChange={(e) => updateVariable(currentEnvironment.id, index, 'value', e.target.value)}
                              style={{
                                padding: '8px 12px',
                                border: '1px solid var(--border-color)',
                                borderRadius: '4px',
                                background: 'var(--bg-primary)',
                                color: 'var(--text-primary)',
                                fontSize: '13px',
                                outline: 'none'
                              }}
                            />
                          )}

                          {/* Variable Type Dropdown */}
                          <select
                            value={variable.type}
                            onChange={(e) => updateVariable(currentEnvironment.id, index, 'type', e.target.value)}
                            style={{
                              padding: '8px 12px',
                              border: '1px solid var(--border-color)',
                              borderRadius: '4px',
                              background: 'var(--bg-primary)',
                              color: 'var(--text-primary)',
                              fontSize: '13px',
                              outline: 'none',
                              cursor: 'pointer'
                            }}
                            disabled={variable.key === 'ENV_CODE' || variable.key === 'base_URL'}
                          >
                            <option value="default">Default</option>
                            <option value="secret">Secret</option>
                          </select>

                          {/* Actions */}
                          {!(variable.key === 'ENV_CODE' || variable.key === 'base_URL') && (
                            <button
                              onClick={() => removeVariable(currentEnvironment.id, index)}
                              style={{
                                background: 'var(--danger-color)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '6px 8px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: '500'
                              }}
                              title="Remove variable"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Render Preview Section */}
              <div style={{ padding: '0 32px 32px' }}>
                <div style={{
                  marginTop: '12px',
                  fontSize: '12px',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '8px'
                }}>Render</div>
                <div style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '16px'
                }}>
                  {currentEnvironment && currentEnvironment.variables.filter(v => v.enabled).length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '12px' }}>
                      {currentEnvironment.variables.filter(v => v.enabled).map((v, i) => (
                        <React.Fragment key={`${v.key}-${i}`}>
                          <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{v.key}</div>
                          <div style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                            {v.type === 'secret' ? '••••••••' : (v.value || '')}
                          </div>
                        </React.Fragment>
                      ))}
                    </div>
                  ) : (
                    <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>No active variables to render</div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '64px',
                  marginBottom: '24px'
                }}>
                  🌍
                </div>
                <h3 style={{
                  margin: '0 0 12px 0',
                  fontSize: '18px',
                  fontWeight: '500'
                }}>
                  Select an Environment
                </h3>
                <p style={{
                  margin: '0',
                  fontSize: '14px'
                }}>
                  Choose an environment from the left panel to manage its variables
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Environment Dialog */}
      {showCreateDialog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'var(--bg-primary)',
            borderRadius: '8px',
            padding: '32px',
            width: '400px',
            border: '1px solid var(--border-color)'
          }}>
            <h3 style={{
              margin: '0 0 24px 0',
              fontSize: '18px',
              fontWeight: '600',
              color: 'var(--text-primary)'
            }}>
              Create New Environment
            </h3>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: 'var(--text-primary)'
              }}>
                Environment Name *
              </label>
              <input
                type="text"
                placeholder="e.g., Development, Production, Staging"
                value={newEnvironment.name}
                onChange={(e) => setNewEnvironment(prev => ({ ...prev, name: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '4px',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: 'var(--text-primary)'
              }}>
                Description
              </label>
              <textarea
                placeholder="Optional description for this environment"
                value={newEnvironment.description}
                onChange={(e) => setNewEnvironment(prev => ({ ...prev, description: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '4px',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  outline: 'none',
                  resize: 'vertical',
                  minHeight: '80px'
                }}
              />
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setShowCreateDialog(false)}
                style={{
                  padding: '10px 20px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '4px',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateEnvironment}
                disabled={!newEnvironment.name.trim()}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '4px',
                  background: newEnvironment.name.trim() ? 'var(--primary-color)' : 'var(--bg-tertiary)',
                  color: newEnvironment.name.trim() ? 'white' : 'var(--text-muted)',
                  cursor: newEnvironment.name.trim() ? 'pointer' : 'not-allowed',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Create Environment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EnvironmentView
