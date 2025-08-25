import React, { useEffect, useState } from 'react'
import { useNavigation } from '../contexts/NavigationContext'
import { useWebhook } from '../contexts/WebhookContext'

/**
 * Sidebar Component
 * 
 * Responsibilities:
 * - Display navigation menu
 * - Handle navigation state
 * - Show favorites and environment
 */
const Sidebar = () => {
  const { navigationItems, activeTab, setActiveTab } = useNavigation()
  const { updateRequestData } = useWebhook()

  const handleNavigationClick = (tabId) => {
    setActiveTab(tabId)
  }

  const handleFavoriteClick = (favorite) => {
    updateRequestData({
      method: favorite.method,
      url: favorite.url,
      headers: favorite.headers || [],
      body: favorite.body || '',
      params: favorite.params || []
    })
    setActiveTab('request')
  }

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-title">
          <span>🔗</span>
          WebHooks
        </div>
      </div>
      
      <nav className="sidebar-nav">
        {navigationItems.map((item) => (
          <div
            key={item.id}
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => handleNavigationClick(item.id)}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </nav>

      {/* Favorites Section */}
      <div style={{ padding: '20px', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
          FAVORITES
        </div>
        <div 
          className="collection-item" 
          onClick={() => handleFavoriteClick({
            method: 'POST',
            url: 'https://api.example.com/webhooks/payment',
            headers: [
              { key: 'Content-Type', value: 'application/json' },
              { key: 'X-Webhook-Signature', value: 'sha256=...' }
            ],
            body: JSON.stringify({
              event: 'payment.succeeded',
              data: {
                payment_id: 'pi_123456789',
                amount: 2999,
                currency: 'usd',
                status: 'succeeded'
              }
            }, null, 2),
            params: []
          })}
          style={{ cursor: 'pointer' }}
        >
          <span>🔗</span>
          <span>Payment Webhook</span>
        </div>
        <div 
          className="collection-item"
          onClick={() => handleFavoriteClick({
            method: 'POST',
            url: 'https://api.example.com/webhooks/users',
            headers: [
              { key: 'Content-Type', value: 'application/json' },
              { key: 'Authorization', value: 'Bearer your_api_key_here' }
            ],
            body: JSON.stringify({
              event: 'user.created',
              data: {
                user_id: 'usr_123456789',
                email: 'user@example.com',
                username: 'newuser'
              }
            }, null, 2),
            params: []
          })}
          style={{ cursor: 'pointer' }}
        >
          <span>🔗</span>
          <span>User Registration</span>
        </div>
        <div 
          className="collection-item"
          onClick={() => handleFavoriteClick({
            method: 'POST',
            url: 'https://api.example.com/webhooks/orders',
            headers: [
              { key: 'Content-Type', value: 'application/json' },
              { key: 'X-Webhook-Version', value: 'v2' }
            ],
            body: JSON.stringify({
              event: 'order.updated',
              data: {
                order_id: 'ord_123456789',
                status: 'shipped',
                tracking_number: 'TRK123456789'
              }
            }, null, 2),
            params: []
          })}
          style={{ cursor: 'pointer' }}
        >
          <span>🔗</span>
          <span>Order Update</span>
        </div>
        <div 
          className="collection-item"
          onClick={() => handleFavoriteClick({
            method: 'POST',
            url: 'https://api.example.com/webhooks/github',
            headers: [
              { key: 'Content-Type', value: 'application/json' },
              { key: 'X-GitHub-Event', value: 'push' },
              { key: 'X-Hub-Signature-256', value: 'sha256=...' }
            ],
            body: JSON.stringify({
              ref: 'refs/heads/main',
              repository: {
                id: 123456789,
                name: 'example-repo',
                full_name: 'username/example-repo'
              }
            }, null, 2),
            params: []
          })}
          style={{ cursor: 'pointer' }}
        >
          <span>🔗</span>
          <span>GitHub Push Event</span>
        </div>
        <div 
          className="collection-item"
          onClick={() => handleFavoriteClick({
            method: 'POST',
            url: 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK',
            headers: [
              { key: 'Content-Type', value: 'application/json' }
            ],
            body: JSON.stringify({
              text: 'Hello from WebHooks!',
              attachments: [
                {
                  color: '#36a64f',
                  title: 'Webhook Notification',
                  text: 'This is a test notification from WebHooks'
                }
              ]
            }, null, 2),
            params: []
          })}
          style={{ cursor: 'pointer' }}
        >
          <span>🔗</span>
          <span>Slack Notification</span>
        </div>
      </div>
    </div>
  )
}

export default Sidebar 