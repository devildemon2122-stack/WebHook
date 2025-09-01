// import React, { useState } from 'react'
// import { useEnvironment } from '../contexts/EnvironmentContext'

// /**
//  * EnvironmentView Component
//  * 
//  * Responsibilities:
//  * - Manage environment variables (like Postman)
//  * - Save/load environment configurations
//  * - Handle secret keys and sensitive data
//  * - Provide environment switching
//  */
// const EnvironmentView = () => {
//   const { 
//     environments, 
//     currentEnvironment, 
//     setCurrentEnvironment,
//     createEnvironment,
//     deleteEnvironment,
//     addVariable,
//     updateVariable,
//     removeVariable,
//     toggleVariable
//   } = useEnvironment()

//   const [showCreateDialog, setShowCreateDialog] = useState(false)
//   const [newEnvironment, setNewEnvironment] = useState({
//     name: '',
//     description: '',
//     variables: []
//   })

//   const handleCreateEnvironment = () => {
//     if (newEnvironment.name.trim()) {
//       createEnvironment(newEnvironment.name, newEnvironment.description, newEnvironment.variables)
//       setNewEnvironment({ name: '', description: '', variables: [] })
//       setShowCreateDialog(false)
//     }
//   }

//   const handleDeleteEnvironment = (environmentId) => {
//     deleteEnvironment(environmentId)
//   }

//   const addVariableToCurrent = (environmentId) => {
//     addVariable(environmentId)
//   }

//   const updateVariableInCurrent = (environmentId, variableIndex, field, value) => {
//     updateVariable(environmentId, variableIndex, field, value)
//   }

//   const removeVariableFromCurrent = (environmentId, variableIndex) => {
//     removeVariable(environmentId, variableIndex)
//   }

//   const toggleVariableInCurrent = (environmentId, variableIndex) => {
//     toggleVariable(environmentId, variableIndex)
//   }

//   return (
//     <div className="environment-view" style={{
//       height: '100vh',
//       display: 'flex',
//       flexDirection: 'column',
//       background: 'var(--bg-primary)',
//       color: 'var(--text-primary)'
//     }}>
//       {/* Header */}
//       <div style={{
//         padding: '24px 32px',
//         borderBottom: '1px solid var(--border-color)',
//         background: 'var(--bg-secondary)'
//       }}>
//         <div style={{
//           display: 'flex',
//           justifyContent: 'space-between',
//           alignItems: 'center'
//         }}>
//           <div>
//             <h1 style={{
//               margin: '0 0 8px 0',
//               fontSize: '28px',
//               fontWeight: '600',
//               color: 'var(--text-primary)'
//             }}>
//               Environment Variables
//             </h1>
//             <p style={{
//               margin: '0',
//               fontSize: '14px',
//               color: 'var(--text-muted)'
//             }}>
//               Manage environment variables and secrets for your webhook requests
//             </p>
//           </div>
//           <button
//             className="btn btn-primary"
//             onClick={() => setShowCreateDialog(true)}
//             style={{
//               padding: '12px 24px',
//               fontSize: '14px',
//               fontWeight: '500'
//             }}
//           >
//             + New Environment
//           </button>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div style={{
//         flex: 1,
//         display: 'flex',
//         overflow: 'hidden'
//       }}>
//         {/* Left Panel - Environment List */}
//         <div style={{
//           width: '300px',
//           borderRight: '1px solid var(--border-color)',
//           background: 'var(--bg-secondary)',
//           display: 'flex',
//           flexDirection: 'column'
//         }}>
//           <div style={{
//             padding: '20px',
//             borderBottom: '1px solid var(--border-color)',
//             background: 'var(--bg-tertiary)'
//           }}>
//             <h3 style={{
//               margin: '0 0 12px 0',
//               fontSize: '16px',
//               fontWeight: '600',
//               color: 'var(--text-primary)'
//             }}>
//               ENVIRONMENTS
//             </h3>
//             <p style={{
//               margin: '0',
//               fontSize: '12px',
//               color: 'var(--text-muted)'
//             }}>
//               Select an environment to manage its variables
//             </p>
//           </div>

//           <div style={{
//             flex: 1,
//             overflowY: 'auto',
//             padding: '16px'
//           }}>
//             {environments.length === 0 ? (
//               <div style={{
//                 textAlign: 'center',
//                 padding: '40px 20px',
//                 color: 'var(--text-muted)'
//               }}>
//                 <div style={{
//                   fontSize: '48px',
//                   marginBottom: '16px'
//                 }}>
//                   🌍
//                 </div>
//                 <h3 style={{
//                   margin: '0 0 8px 0',
//                   fontSize: '16px',
//                   fontWeight: '500'
//                 }}>
//                   No Environments
//                 </h3>
//                 <p style={{
//                   margin: '0 0 20px 0',
//                   fontSize: '14px'
//                 }}>
//                   Create your first environment to get started
//                 </p>
//                 <button
//                   className="btn btn-primary"
//                   onClick={() => setShowCreateDialog(true)}
//                   style={{
//                     padding: '8px 16px',
//                     fontSize: '13px'
//                   }}
//                 >
//                   Create Environment
//                 </button>
//               </div>
//             ) : (
//               <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
//                 {environments.map((env) => (
//                   <div
//                     key={env.id}
//                     onClick={() => setCurrentEnvironment(env)}
//                     style={{
//                       padding: '16px',
//                       borderRadius: '8px',
//                       cursor: 'pointer',
//                       border: '1px solid var(--border-color)',
//                       background: currentEnvironment?.id === env.id ? 'var(--primary-color)' : 'var(--bg-primary)',
//                       color: currentEnvironment?.id === env.id ? 'white' : 'var(--text-primary)',
//                       transition: 'all 0.2s ease',
//                       position: 'relative'
//                     }}
//                     onMouseEnter={(e) => {
//                       if (currentEnvironment?.id !== env.id) {
//                         e.target.style.background = 'var(--bg-tertiary)'
//                       }
//                     }}
//                     onMouseLeave={(e) => {
//                       if (currentEnvironment?.id !== env.id) {
//                         e.target.style.background = 'var(--bg-primary)'
//                       }
//                     }}
//                   >
//                     <div style={{
//                       display: 'flex',
//                       justifyContent: 'space-between',
//                       alignItems: 'flex-start',
//                       marginBottom: '8px'
//                     }}>
//                       <div style={{ flex: 1 }}>
//                         <h4 style={{
//                           margin: '0 0 4px 0',
//                           fontSize: '14px',
//                           fontWeight: '600'
//                         }}>
//                           {env.name}
//                         </h4>
//                         <p style={{
//                           margin: '0',
//                           fontSize: '12px',
//                           opacity: 0.8
//                         }}>
//                           {env.description || 'No description'}
//                         </p>
//                       </div>
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation()
//                           handleDeleteEnvironment(env.id)
//                         }}
//                         style={{
//                           background: 'none',
//                           border: 'none',
//                           color: 'inherit',
//                           cursor: 'pointer',
//                           fontSize: '16px',
//                           opacity: 0.7,
//                           padding: '4px'
//                         }}
//                         title="Delete environment"
//                       >
//                         ×
//                       </button>
//                     </div>
//                     <div style={{
//                       fontSize: '11px',
//                       opacity: 0.8
//                     }}>
//                       {env.variables.length} variables • Updated {new Date(env.updatedAt).toLocaleDateString()}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Right Panel - Environment Details */}
//         <div style={{
//           flex: 1,
//           display: 'flex',
//           flexDirection: 'column',
//           background: 'var(--bg-primary)'
//         }}>
//           {currentEnvironment ? (
//             <>
//               {/* Environment Header */}
//               <div style={{
//                 padding: '24px 32px',
//                 borderBottom: '1px solid var(--border-color)',
//                 background: 'var(--bg-secondary)'
//               }}>
//                 <div style={{
//                   display: 'flex',
//                   justifyContent: 'space-between',
//                   alignItems: 'center'
//                 }}>
//                   <div>
//                     <h2 style={{
//                       margin: '0 0 4px 0',
//                       fontSize: '20px',
//                       fontWeight: '600',
//                       color: 'var(--text-primary)'
//                     }}>
//                       {currentEnvironment.name}
//                     </h2>
//                     <p style={{
//                       margin: '0',
//                       fontSize: '14px',
//                       color: 'var(--text-muted)'
//                     }}>
//                       {currentEnvironment.description || 'No description'}
//                     </p>
//                   </div>
//                   <button
//                     className="btn btn-secondary"
//                     onClick={() => addVariableToCurrent(currentEnvironment.id)}
//                     style={{
//                       padding: '8px 16px',
//                       fontSize: '13px'
//                     }}
//                   >
//                     + Add Variable
//                   </button>
//                 </div>
//               </div>

//               {/* Variables Table */}
//               <div style={{
//                 flex: 1,
//                 padding: '24px 32px',
//                 overflowY: 'auto'
//               }}>
//                 {currentEnvironment.variables.length === 0 ? (
//                   <div style={{
//                     textAlign: 'center',
//                     padding: '60px 20px',
//                     color: 'var(--text-muted)'
//                   }}>
//                     <div style={{
//                       fontSize: '48px',
//                       marginBottom: '16px'
//                     }}>
//                       🔧
//                     </div>
//                     <h3 style={{
//                       margin: '0 0 8px 0',
//                       fontSize: '16px',
//                       fontWeight: '500'
//                     }}>
//                       No Variables
//                     </h3>
//                     <p style={{
//                       margin: '0 0 20px 0',
//                       fontSize: '14px'
//                     }}>
//                       Add variables to this environment to use them in your requests
//                     </p>
//                     <button
//                       className="btn btn-secondary"
//                       onClick={() => addVariableToCurrent(currentEnvironment.id)}
//                       style={{
//                         padding: '8px 16px',
//                         fontSize: '13px'
//                       }}
//                     >
//                       + Add Variable
//                     </button>
//                   </div>
//                 ) : (
//                   <div style={{
//                     background: 'var(--bg-secondary)',
//                     borderRadius: '8px',
//                     border: '1px solid var(--border-color)',
//                     overflow: 'hidden'
//                   }}>
//                     {/* Table Header */}
//                     <div style={{
//                       display: 'grid',
//                       gridTemplateColumns: '60px 1fr 1fr 120px 80px',
//                       gap: '16px',
//                       padding: '16px 20px',
//                       background: 'var(--bg-tertiary)',
//                       borderBottom: '1px solid var(--border-color)',
//                       fontWeight: '600',
//                       fontSize: '12px',
//                       color: 'var(--text-muted)',
//                       textTransform: 'uppercase',
//                       letterSpacing: '0.5px'
//                     }}>
//                       <div>Active</div>
//                       <div>Variable</div>
//                       <div>Initial Value</div>
//                       <div>Type</div>
//                       <div>Actions</div>
//                     </div>

//                     {/* Variables List */}
//                     <div>
//                       {currentEnvironment.variables.map((variable, index) => (
//                         <div
//                           key={index}
//                           style={{
//                             display: 'grid',
//                             gridTemplateColumns: '60px 1fr 1fr 120px 80px',
//                             gap: '16px',
//                             padding: '16px 20px',
//                             borderBottom: '1px solid var(--border-color)',
//                             alignItems: 'center'
//                           }}
//                         >
//                           {/* Active Toggle */}
//                           <button
//                             onClick={() => toggleVariableInCurrent(currentEnvironment.id, index)}
//                             style={{
//                               width: '40px',
//                               height: '20px',
//                               borderRadius: '10px',
//                               border: 'none',
//                               background: variable.enabled ? 'var(--success-color)' : 'var(--bg-tertiary)',
//                               cursor: 'pointer',
//                               position: 'relative',
//                               transition: 'background 0.2s ease'
//                             }}
//                             title={variable.enabled ? 'Disable variable' : 'Enable variable'}
//                           >
//                             <div style={{
//                               width: '16px',
//                               height: '16px',
//                               borderRadius: '50%',
//                               background: 'white',
//                               position: 'absolute',
//                               top: '2px',
//                               left: variable.enabled ? '22px' : '2px',
//                               transition: 'left 0.2s ease'
//                             }} />
//                           </button>

//                           {/* Variable Name */}
//                           <input
//                             type="text"
//                             placeholder="Variable name"
//                             value={variable.key}
//                             onChange={(e) => updateVariableInCurrent(currentEnvironment.id, index, 'key', e.target.value)}
//                             style={{
//                               padding: '8px 12px',
//                               border: '1px solid var(--border-color)',
//                               borderRadius: '4px',
//                               background: variable.key === 'ENV_CODE' || variable.key === 'base_URL' ? 'var(--bg-tertiary)' : 'var(--bg-primary)',
//                               color: variable.key === 'ENV_CODE' || variable.key === 'base_URL' ? 'var(--text-muted)' : 'var(--text-primary)',
//                               fontSize: '13px',
//                               outline: 'none',
//                               width: '100%',
//                               boxSizing: 'border-box'
//                             }}
//                             disabled={variable.key === 'ENV_CODE' || variable.key === 'base_URL'}
//                           />

//                           {/* Variable Value */}
//                           {variable.key === 'ENV_CODE' ? (
//                             <select
//                               value={variable.value}
//                               onChange={(e) => updateVariableInCurrent(currentEnvironment.id, index, 'value', e.target.value)}
//                               style={{
//                                 padding: '8px 12px',
//                                 border: '1px solid var(--border-color)',
//                                 borderRadius: '4px',
//                                 background: 'var(--bg-primary)',
//                                 color: 'var(--text-primary)',
//                                 fontSize: '13px',
//                                 outline: 'none',
//                                 cursor: 'pointer'
//                               }}
//                             >
//                               <option value="dev">dev</option>
//                               <option value="prod">prod</option>
//                               <option value="test">test</option>
//                             </select>
//                           ) : (
//                             <input
//                               type={variable.type === 'secret' ? 'password' : 'text'}
//                               placeholder="Variable value"
//                               value={variable.value}
//                               onChange={(e) => updateVariableInCurrent(currentEnvironment.id, index, 'value', e.target.value)}
//                               style={{
//                                 padding: '8px 12px',
//                                 border: '1px solid var(--border-color)',
//                                 borderRadius: '4px',
//                                 background: 'var(--bg-primary)',
//                                 color: 'var(--text-primary)',
//                                 fontSize: '13px',
//                                 outline: 'none',
//                                 width: '100%',
//                                 boxSizing: 'border-box'
//                               }}
//                             />
//                           )}

//                           {/* Variable Type Dropdown */}
//                           <select
//                             value={variable.type}
//                             onChange={(e) => updateVariableInCurrent(currentEnvironment.id, index, 'type', e.target.value)}
//                             style={{
//                               padding: '8px 12px',
//                               border: '1px solid var(--border-color)',
//                               borderRadius: '4px',
//                               background: 'var(--bg-primary)',
//                               color: 'var(--text-primary)',
//                               fontSize: '13px',
//                               outline: 'none',
//                               cursor: 'pointer'
//                             }}
//                             disabled={variable.key === 'ENV_CODE' || variable.key === 'base_URL'}
//                           >
//                             <option value="default">Default</option>
//                             <option value="secret">Secret</option>
//                           </select>

//                           {/* Actions */}
//                           {!(variable.key === 'ENV_CODE' || variable.key === 'base_URL') && (
//                             <button
//                               onClick={() => removeVariableFromCurrent(currentEnvironment.id, index)}
//                               style={{
//                                 background: 'var(--danger-color)',
//                                 color: 'white',
//                                 border: 'none',
//                                 borderRadius: '4px',
//                                 padding: '6px 8px',
//                                 cursor: 'pointer',
//                                 fontSize: '12px',
//                                 fontWeight: '500'
//                               }}
//                               title="Remove variable"
//                             >
//                               ×
//                             </button>
//                           )}
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* Render Preview Section */}
//               <div style={{ padding: '0 32px 32px' }}>
//                 <div style={{
//                   marginTop: '12px',
//                   fontSize: '12px',
//                   color: 'var(--text-muted)',
//                   textTransform: 'uppercase',
//                   letterSpacing: '0.5px',
//                   marginBottom: '8px'
//                 }}>Render</div>
//                 <div style={{
//                   background: 'var(--bg-secondary)',
//                   border: '1px solid var(--border-color)',
//                   borderRadius: '8px',
//                   padding: '16px'
//                 }}>
//                   {currentEnvironment && currentEnvironment.variables.filter(v => v.enabled).length > 0 ? (
//                     <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '12px' }}>
//                       {currentEnvironment.variables.filter(v => v.enabled).map((v, i) => (
//                         <React.Fragment key={`${v.key}-${i}`}>
//                           <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{v.key}</div>
//                           <div style={{ fontFamily: 'monospace', fontSize: '12px' }}>
//                             {v.type === 'secret' ? '••••••••' : (v.value || '')}
//                           </div>
//                         </React.Fragment>
//                       ))}
//                     </div>
//                   ) : (
//                     <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>No active variables to render</div>
//                   )}
//                 </div>
//               </div>
//             </>
//           ) : (
//             <div style={{
//               flex: 1,
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//               color: 'var(--text-muted)'
//             }}>
//               <div style={{ textAlign: 'center' }}>
//                 <div style={{
//                   fontSize: '64px',
//                   marginBottom: '24px'
//                 }}>
//                   🌍
//                 </div>
//                 <h3 style={{
//                   margin: '0 0 12px 0',
//                   fontSize: '18px',
//                   fontWeight: '500'
//                 }}>
//                   Select an Environment
//                 </h3>
//                 <p style={{
//                   margin: '0',
//                   fontSize: '14px'
//                 }}>
//                   Choose an environment from the left panel to manage its variables
//                 </p>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Create Environment Dialog */}
//       {showCreateDialog && (
//         <div style={{
//           position: 'fixed',
//           top: 0,
//           left: 0,
//           right: 0,
//           bottom: 0,
//           background: 'rgba(0, 0, 0, 0.5)',
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//           zIndex: 1000
//         }}>
//           <div style={{
//             background: 'var(--bg-primary)',
//             borderRadius: '8px',
//             padding: '32px',
//             width: '400px',
//             border: '1px solid var(--border-color)'
//           }}>
//             <h3 style={{
//               margin: '0 0 24px 0',
//               fontSize: '18px',
//               fontWeight: '600',
//               color: 'var(--text-primary)'
//             }}>
//               Create New Environment
//             </h3>

//             <div style={{ marginBottom: '20px' }}>
//               <label style={{
//                 display: 'block',
//                 marginBottom: '8px',
//                 fontSize: '14px',
//                 fontWeight: '500',
//                 color: 'var(--text-primary)'
//               }}>
//                 Environment Name *
//               </label>
//               <input
//                 type="text"
//                 placeholder="e.g., Development, Production, Staging"
//                 value={newEnvironment.name}
//                 onChange={(e) => setNewEnvironment(prev => ({ ...prev, name: e.target.value }))}
//                 style={{
//                   width: '100%',
//                   padding: '12px',
//                   border: '1px solid var(--border-color)',
//                   borderRadius: '4px',
//                   background: 'var(--bg-secondary)',
//                   color: 'var(--text-primary)',
//                   fontSize: '14px',
//                   outline: 'none'
//                 }}
//               />
//             </div>

//             <div style={{ marginBottom: '24px' }}>
//               <label style={{
//                 display: 'block',
//                 marginBottom: '8px',
//                 fontSize: '14px',
//                 fontWeight: '500',
//                 color: 'var(--text-primary)'
//               }}>
//                 Description
//               </label>
//               <textarea
//                 placeholder="Optional description for this environment"
//                 value={newEnvironment.description}
//                 onChange={(e) => setNewEnvironment(prev => ({ ...prev, description: e.target.value }))}
//                 style={{
//                   width: '100%',
//                   padding: '12px',
//                   border: '1px solid var(--border-color)',
//                   borderRadius: '4px',
//                   background: 'var(--bg-secondary)',
//                   color: 'var(--text-primary)',
//                   fontSize: '14px',
//                   outline: 'none',
//                   resize: 'vertical',
//                   minHeight: '80px'
//                 }}
//               />
//             </div>

//             <div style={{
//               display: 'flex',
//               gap: '12px',
//               justifyContent: 'flex-end'
//             }}>
//               <button
//                 onClick={() => setShowCreateDialog(false)}
//                 style={{
//                   padding: '10px 20px',
//                   border: '1px solid var(--border-color)',
//                   borderRadius: '4px',
//                   background: 'var(--bg-secondary)',
//                   color: 'var(--text-primary)',
//                   cursor: 'pointer',
//                   fontSize: '14px'
//                 }}
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleCreateEnvironment}
//                 disabled={!newEnvironment.name.trim()}
//                 style={{
//                   padding: '10px 20px',
//                   border: 'none',
//                   borderRadius: '4px',
//                   background: newEnvironment.name.trim() ? 'var(--primary-color)' : 'var(--bg-tertiary)',
//                   color: newEnvironment.name.trim() ? 'white' : 'var(--text-muted)',
//                   cursor: newEnvironment.name.trim() ? 'pointer' : 'not-allowed',
//                   fontSize: '14px',
//                   fontWeight: '500'
//                 }}
//               >
//                 Create Environment
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }

// export default EnvironmentView




import React, { useState, useEffect } from 'react'
import { useEnvironment } from '../contexts/EnvironmentContext'

const EnvironmentView = () => {
  const {
    environments,
    currentEnvironment,
    setCurrentEnvironment,
    createEnvironment,
    deleteEnvironment,
    addVariable,
    updateVariable,
    removeVariable,
    toggleVariable
  } = useEnvironment()

  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newEnvironment, setNewEnvironment] = useState({
    name: '',
    description: '',
    variables: []
  })

  // Local state for variables to allow instant updates
  const [localVariables, setLocalVariables] = useState([])

  // Sync localVariables whenever currentEnvironment changes
  useEffect(() => {
    if (currentEnvironment) {
      setLocalVariables(currentEnvironment.variables)
    }
  }, [currentEnvironment])

  // Handle input/select change locally
  const handleVariableChange = (index, field, value) => {
    setLocalVariables(prev => {
      const copy = [...prev]
      copy[index] = { ...copy[index], [field]: value }
      return copy
    })
  }

  // Sync local change back to context
  const handleVariableBlur = (index) => {
    const variable = localVariables[index]
    updateVariable(currentEnvironment.id, index, 'key', variable.key)
    updateVariable(currentEnvironment.id, index, 'value', variable.value)
    updateVariable(currentEnvironment.id, index, 'type', variable.type)
  }

  const addVariableToCurrentEnv = () => {
    addVariable(currentEnvironment.id)
    // Update local variables immediately
    setLocalVariables([...localVariables, { key: '', value: '', type: 'default', enabled: true }])
  }

  const removeVariableFromCurrentEnv = (index) => {
    removeVariable(currentEnvironment.id, index)
    setLocalVariables(prev => prev.filter((_, i) => i !== index))
  }

  const toggleVariableInCurrentEnv = (index) => {
    toggleVariable(currentEnvironment.id, index)
    setLocalVariables(prev => {
      const copy = [...prev]
      copy[index].enabled = !copy[index].enabled
      return copy
    })
  }

  // Create Environment
  const handleCreateEnvironment = () => {
    if (newEnvironment.name.trim()) {
      createEnvironment(newEnvironment.name, newEnvironment.description, newEnvironment.variables)
      setNewEnvironment({ name: '', description: '', variables: [] })
      setShowCreateDialog(false)
    }
  }

  return (
    <div className="environment-view" style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* Header */}
      <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: '600', color: 'var(--text-primary)' }}>
              Environment Variables
            </h1>
            <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)' }}>
              Manage environment variables and secrets for your webhook requests
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowCreateDialog(true)} style={{ padding: '12px 24px', fontSize: '14px', fontWeight: '500' }}>
            + New Environment
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left Panel - Environment List */}
        <div style={{ width: '300px', borderRight: '1px solid var(--border-color)', background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-tertiary)' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>ENVIRONMENTS</h3>
            <p style={{ margin: '0', fontSize: '12px', color: 'var(--text-muted)' }}>Select an environment to manage its variables</p>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
            {environments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌍</div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '500' }}>No Environments</h3>
                <p style={{ margin: '0 0 20px 0', fontSize: '14px' }}>Create your first environment to get started</p>
                <button className="btn btn-primary" onClick={() => setShowCreateDialog(true)} style={{ padding: '8px 16px', fontSize: '13px' }}>Create Environment</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {environments.map((env) => (
                  <div key={env.id} onClick={() => setCurrentEnvironment(env)}
                    style={{
                      padding: '16px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      border: '1px solid var(--border-color)',
                      background: currentEnvironment?.id === env.id ? 'var(--primary-color)' : 'var(--bg-primary)',
                      color: currentEnvironment?.id === env.id ? 'white' : 'var(--text-primary)',
                      transition: 'all 0.2s ease',
                      position: 'relative'
                    }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '600' }}>{env.name}</h4>
                        <p style={{ margin: 0, fontSize: '12px', opacity: 0.8 }}>{env.description || 'No description'}</p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteEnvironment(env.id) }}
                        style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '16px', opacity: 0.7, padding: '4px' }}
                        title="Delete environment">×</button>
                    </div>
                    <div style={{ fontSize: '11px', opacity: 0.8 }}>
                      {env.variables.length} variables • Updated {new Date(env.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
          {currentEnvironment ? (
            <>
              {/* Header */}
              <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h2 style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: '600', color: 'var(--text-primary)' }}>{currentEnvironment.name}</h2>
                    <p style={{ margin: '0', fontSize: '14px', color: 'var(--text-muted)' }}>{currentEnvironment.description || 'No description'}</p>
                  </div>
                  <button className="btn btn-secondary" onClick={addVariableToCurrentEnv} style={{ padding: '8px 16px', fontSize: '13px' }}>+ Add Variable</button>
                </div>
              </div>

              {/* Variables Table */}
              <div style={{ flex: 1, padding: '24px 32px', overflowY: 'auto' }}>
                {localVariables.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔧</div>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '500' }}>No Variables</h3>
                    <p style={{ margin: '0 0 20px 0', fontSize: '14px' }}>Add variables to this environment to use them in your requests</p>
                    <button className="btn btn-secondary" onClick={addVariableToCurrentEnv} style={{ padding: '8px 16px', fontSize: '13px' }}>+ Add Variable</button>
                  </div>
                ) : (
                  <div style={{ background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                    {/* Table Header */}
                    <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 1fr 120px 80px', gap: '16px', padding: '16px 20px', background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)', fontWeight: '600', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      <div>Active</div><div>Variable</div><div>Initial Value</div><div>Type</div><div>Actions</div>
                    </div>

                    {/* Variables List */}
                    {localVariables.map((variable, index) => (
                      <div key={index} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 1fr 120px 80px', gap: '16px', padding: '16px 20px', borderBottom: '1px solid var(--border-color)', alignItems: 'center' }}>
                        {/* Active Toggle */}
                        <button onClick={() => toggleVariableInCurrentEnv(index)} style={{
                          width: '40px', height: '20px', borderRadius: '10px', border: 'none', background: variable.enabled ? 'var(--success-color)' : 'var(--bg-tertiary)',
                          cursor: 'pointer', position: 'relative', transition: 'background 0.2s ease'
                        }} title={variable.enabled ? 'Disable variable' : 'Enable variable'}>
                          <div style={{
                            width: '16px', height: '16px', borderRadius: '50%', background: 'white', position: 'absolute', top: '2px', left: variable.enabled ? '22px' : '2px', transition: 'left 0.2s ease'
                          }} />
                        </button>

                        {/* Variable Name */}
                        <input type="text" value={variable.key} onChange={(e) => handleVariableChange(index, 'key', e.target.value)} onBlur={() => handleVariableBlur(index)}
                          style={{ padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '13px', outline: 'none', width: '100%' }}
                          disabled={variable.key === 'ENV_CODE' || variable.key === 'base_URL'} />

                        {/* Variable Value */}
                        {variable.key === 'ENV_CODE' ? (
                          <select value={variable.value} onChange={(e) => handleVariableChange(index, 'value', e.target.value)} onBlur={() => handleVariableBlur(index)}>
                            <option value="dev">dev</option>
                            <option value="prod">prod</option>
                            <option value="test">test</option>
                          </select>
                        ) : (
                          <input type={variable.type === 'secret' ? 'password' : 'text'} value={variable.value} onChange={(e) => handleVariableChange(index, 'value', e.target.value)} onBlur={() => handleVariableBlur(index)} />
                        )}

                        {/* Type Dropdown */}
                        <select value={variable.type} onChange={(e) => handleVariableChange(index, 'type', e.target.value)} onBlur={() => handleVariableBlur(index)} disabled={variable.key === 'ENV_CODE' || variable.key === 'base_URL'}>
                          <option value="default">Default</option>
                          <option value="secret">Secret</option>
                        </select>

                        {/* Actions */}
                        {!(variable.key === 'ENV_CODE' || variable.key === 'base_URL') && (
                          <button onClick={() => removeVariableFromCurrentEnv(index)} style={{ background: 'var(--danger-color)', color: 'white', border: 'none', borderRadius: '4px', padding: '6px 8px', cursor: 'pointer', fontSize: '12px', fontWeight: '500' }}>×</button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '64px', marginBottom: '24px' }}>🌍</div>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: '500' }}>Select an Environment</h3>
                <p style={{ margin: '0', fontSize: '14px' }}>Choose an environment from the left panel to manage its variables</p>
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
