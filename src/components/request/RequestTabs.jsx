import React from 'react'
import { REQUEST_TAB_TYPES } from '../../utils/constants'

/**
 * RequestTabs Component
 * 
 * Responsibilities:
 * - Display request tabs (Body, Authorization, Params, Headers)
 * - Handle tab switching
 * - Show active tab state
 */
const RequestTabs = ({ activeRequestTab, handleTabChange }) => {
  return (
    <div className="request-section">
      <div className="request-tabs">
        <button 
          className={`request-tab ${activeRequestTab === REQUEST_TAB_TYPES.BODY ? 'active' : ''}`}
          onClick={() => handleTabChange(REQUEST_TAB_TYPES.BODY)}
        >
          Body
        </button>
        <button 
          className={`request-tab ${activeRequestTab === REQUEST_TAB_TYPES.AUTH ? 'active' : ''}`}
          onClick={() => handleTabChange(REQUEST_TAB_TYPES.AUTH)}
        >
          Authorization
        </button>
        <button 
          className={`request-tab ${activeRequestTab === REQUEST_TAB_TYPES.PARAMS ? 'active' : ''}`}
          onClick={() => handleTabChange(REQUEST_TAB_TYPES.PARAMS)}
        >
          Params
        </button>
        <button 
          className={`request-tab ${activeRequestTab === REQUEST_TAB_TYPES.HEADERS ? 'active' : ''}`}
          onClick={() => handleTabChange(REQUEST_TAB_TYPES.HEADERS)}
        >
          Headers
        </button>
      </div>
    </div>
  )
}

export default RequestTabs
