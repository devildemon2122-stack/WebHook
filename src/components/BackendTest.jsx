/**
 * Backend Test Component
 * Simple component to test backend API integration
 */

import React, { useState } from 'react'
import { useWebhook } from '../contexts/WebhookContext'

const BackendTest = () => {
  const [testResults, setTestResults] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const { 
    fetchCollections, 
    fetchCollectionItems, 
    fetchLogs, 
    fetchLogsByWebhook,
    updateWebhook,
    deleteWebhook,
    getWebhookById
  } = useWebhook()

  const runTest = async (testName, testFunction) => {
    setIsLoading(true)
    try {
      const result = await testFunction()
      setTestResults(prev => ({
        ...prev,
        [testName]: result
      }))
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [testName]: { success: false, error: error.message }
      }))
    } finally {
      setIsLoading(false)
    }
  }

  const runAllTests = async () => {
    await runTest('getAllWebhooks', fetchCollections)
    await runTest('getLogs', fetchLogs)
    await runTest('getWebhookById', () => getWebhookById(1))
  }

  return (
    <div style={{ 
      padding: '20px', 
      background: 'var(--bg-secondary)', 
      borderRadius: '8px',
      margin: '20px 0'
    }}>
      <h3 style={{ margin: '0 0 16px 0', color: 'var(--text-primary)' }}>
        🔧 Backend API Integration Test
      </h3>
      
      <div style={{ marginBottom: '16px' }}>
        <button 
          onClick={runAllTests}
          disabled={isLoading}
          style={{
            padding: '8px 16px',
            background: 'var(--primary-color)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            marginRight: '8px'
          }}
        >
          {isLoading ? 'Testing...' : 'Run All Tests'}
        </button>
        
        <button 
          onClick={() => setTestResults({})}
          style={{
            padding: '8px 16px',
            background: 'var(--secondary-color)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Clear Results
        </button>
      </div>

      {Object.keys(testResults).length > 0 && (
        <div>
          <h4 style={{ margin: '0 0 12px 0', color: 'var(--text-primary)' }}>
            Test Results:
          </h4>
          {Object.entries(testResults).map(([testName, result]) => (
            <div key={testName} style={{
              marginBottom: '12px',
              padding: '12px',
              background: result.success ? 'var(--success-color)' : 'var(--error-color)',
              color: 'white',
              borderRadius: '6px',
              fontSize: '14px'
            }}>
              <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                {testName}: {result.success ? '✅ PASS' : '❌ FAIL'}
              </div>
              {result.success ? (
                <div style={{ fontSize: '12px' }}>
                  Data: {JSON.stringify(result.data, null, 2)}
                </div>
              ) : (
                <div style={{ fontSize: '12px' }}>
                  Error: {result.error}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div style={{ 
        marginTop: '16px', 
        padding: '12px', 
        background: 'var(--bg-tertiary)', 
        borderRadius: '6px',
        fontSize: '12px',
        color: 'var(--text-muted)'
      }}>
        <strong>Note:</strong> This component tests the backend API integration. 
        Make sure the backend server is running on 10.22.1.98:8082 before running tests.
      </div>
    </div>
  )
}

export default BackendTest
