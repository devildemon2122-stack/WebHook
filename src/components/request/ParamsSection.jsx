import React from 'react'

const ParamsSection = ({
  pathParams = [],
  queryParams = [],
  toggleParameter,
  handlePathParamChange,
  handleQueryParamChange,
  addQueryParameter,
  PARAMETER_TYPES
}) => (
  <div>
    {pathParams.length > 0 && (
      <div style={{ marginBottom: '24px' }}>
        <div className="section-header" style={{ margin: '0 -16px 16px -16px', borderRadius: '0' }}>
          <span>Path Parameters</span>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Automatically detected from URL
          </div>
        </div>
        <div style={{ background: 'var(--bg-secondary)', borderRadius: '8px', padding: '16px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 1fr 80px 60px', gap: '12px', marginBottom: '12px', fontWeight: '600', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            <div>ON/OFF</div>
            <div>Key</div>
            <div>Value</div>
            <div>Required</div>
            <div>Type</div>
          </div>
          {pathParams.map((param, index) => (
            <div key={index} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 1fr 80px 60px', gap: '12px', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
              <button className="btn btn-secondary" onClick={() => toggleParameter(PARAMETER_TYPES.PATH, index)} style={{ padding: '6px 8px', background: param.enabled ? 'var(--success-color)' : 'var(--bg-tertiary)', color: param.enabled ? 'white' : 'var(--text-muted)', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                {param.enabled ? 'ON' : 'OFF'}
              </button>
              <input type="text" className="form-input" placeholder="Parameter name" value={param.key} onChange={(e) => handlePathParamChange(index, 'key', e.target.value)} disabled={param.isTemplate} style={{ background: param.isTemplate ? 'var(--bg-tertiary)' : 'var(--bg-primary)', color: param.isTemplate ? 'var(--text-muted)' : 'var(--text-primary)', fontSize: '12px', padding: '6px 8px', cursor: param.isTemplate ? 'not-allowed' : 'text' }} />
              <input type="text" className="form-input" placeholder="Parameter value" value={param.value} onChange={(e) => handlePathParamChange(index, 'value', e.target.value)} style={{ fontSize: '12px', padding: '6px 8px' }} />
              <div style={{ padding: '4px 8px', background: param.required ? 'var(--warning-color)' : 'var(--bg-tertiary)', borderRadius: '4px', fontSize: '11px', color: param.required ? 'white' : 'var(--text-muted)', textAlign: 'center' }}>
                {param.required ? 'Required' : 'Optional'}
              </div>
              <div style={{ padding: '4px 8px', background: param.isTemplate ? 'var(--primary-color)' : 'var(--secondary-color)', borderRadius: '4px', fontSize: '11px', color: 'white', textAlign: 'center' }}>
                {param.isTemplate ? 'Template' : 'Real'}
              </div>
            </div>
          ))}
        </div>
      </div>
    )}

    <div>
      <div className="section-header" style={{ margin: '0 -16px 16px -16px', borderRadius: '0' }}>
        <span>Query Parameters</span>
        <button className="btn btn-secondary" onClick={addQueryParameter}>+ Add Parameter</button>
      </div>
      <div style={{ background: 'var(--bg-secondary)', borderRadius: '8px', padding: '16px', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 1fr 80px 60px', gap: '12px', marginBottom: '12px', fontWeight: '600', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          <div>ON/OFF</div>
          <div>Key</div>
          <div>Value</div>
          <div>Required</div>
          <div>Type</div>
        </div>
        {queryParams.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
            No query parameters detected. Add some or they will be parsed automatically from the URL.
          </div>
        ) : (
          queryParams.map((param, index) => (
            <div key={index} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 1fr 80px 60px', gap: '12px', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
              <button className="btn btn-secondary" onClick={() => toggleParameter(PARAMETER_TYPES.QUERY, index)} style={{ padding: '6px 8px', background: param.enabled ? 'var(--success-color)' : 'var(--bg-tertiary)', color: param.enabled ? 'white' : 'var(--text-muted)', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                {param.enabled ? 'ON' : 'OFF'}
              </button>
              <input type="text" className="form-input" placeholder="Parameter name" value={param.key} onChange={(e) => handleQueryParamChange(index, 'key', e.target.value)} style={{ fontSize: '12px', padding: '6px 8px' }} />
              <input type="text" className="form-input" placeholder="Parameter value" value={param.value} onChange={(e) => handleQueryParamChange(index, 'value', e.target.value)} style={{ fontSize: '12px', padding: '6px 8px' }} />
              <div style={{ padding: '4px 8px', background: 'var(--bg-tertiary)', borderRadius: '4px', fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center' }}>
                Optional
              </div>
              <div style={{ padding: '4px 8px', background: 'var(--secondary-color)', borderRadius: '4px', fontSize: '11px', color: 'white', textAlign: 'center' }}>
                Query
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  </div>
)

export default ParamsSection 