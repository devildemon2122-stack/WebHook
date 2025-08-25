/**
 * Request templates for common webhook scenarios
 * 
 * Backend Integration Point:
 * - Replace static templates with dynamic templates from your backend
 * - Add template management (create, edit, delete templates)
 * - Add user-specific and team-specific templates
 */

export const REQUEST_TEMPLATES = {
  // Payment webhook template
  PAYMENT_WEBHOOK: {
    name: 'Payment Webhook',
    description: 'Standard payment notification webhook',
    method: 'POST',
    url: 'https://api.example.com/webhooks/payment',
    headers: [
      { key: 'Content-Type', value: 'application/json' },
      { key: 'X-Webhook-Signature', value: 'sha256=...' },
      { key: 'User-Agent', value: 'WebHook-Pro/1.0' }
    ],
    body: JSON.stringify({
      event: 'payment.succeeded',
      data: {
        payment_id: 'pi_123456789',
        amount: 2999,
        currency: 'usd',
        status: 'succeeded',
        customer_id: 'cus_123456789',
        created_at: '2024-01-15T10:30:00Z'
      }
    }, null, 2),
    params: [],
    category: 'payments'
  },

  // User registration webhook
  USER_REGISTRATION: {
    name: 'User Registration',
    description: 'New user account creation webhook',
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
        username: 'newuser',
        created_at: '2024-01-15T10:30:00Z',
        profile: {
          first_name: 'John',
          last_name: 'Doe'
        }
      }
    }, null, 2),
    params: [],
    category: 'users'
  },

  // Order update webhook
  ORDER_UPDATE: {
    name: 'Order Update',
    description: 'Order status change notification',
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
        tracking_number: 'TRK123456789',
        updated_at: '2024-01-15T10:30:00Z',
        items: [
          {
            product_id: 'prod_123',
            quantity: 2,
            price: 29.99
          }
        ]
      }
    }, null, 2),
    params: [],
    category: 'orders'
  },

  // GitHub webhook
  GITHUB_WEBHOOK: {
    name: 'GitHub Push Event',
    description: 'GitHub repository push notification',
    method: 'POST',
    url: 'https://api.example.com/webhooks/github',
    headers: [
      { key: 'Content-Type', value: 'application/json' },
      { key: 'X-GitHub-Event', value: 'push' },
      { key: 'X-Hub-Signature-256', value: 'sha256=...' }
    ],
    body: JSON.stringify({
      ref: 'refs/heads/main',
      before: '6113728f27ae82c7b1a177c8d03f9e96e0adf246',
      after: '76c8ed4c4c42c1c7c4c4c4c4c4c4c4c4c4c4c4c4c',
      repository: {
        id: 123456789,
        name: 'example-repo',
        full_name: 'username/example-repo'
      },
      commits: [
        {
          id: '76c8ed4c4c42c1c7c4c4c4c4c4c4c4c4c4c4c4c4c',
          message: 'Update README.md',
          author: {
            name: 'John Doe',
            email: 'john@example.com'
          }
        }
      ]
    }, null, 2),
    params: [],
    category: 'development'
  },

  // Slack notification webhook
  SLACK_WEBHOOK: {
    name: 'Slack Notification',
    description: 'Send notification to Slack channel',
    method: 'POST',
    url: 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK',
    headers: [
      { key: 'Content-Type', value: 'application/json' }
    ],
    body: JSON.stringify({
      text: 'Hello from WebHook Pro!',
      attachments: [
        {
          color: '#36a64f',
          title: 'Webhook Notification',
          text: 'This is a test notification from WebHook Pro',
          fields: [
            {
              title: 'Priority',
              value: 'High',
              short: true
            },
            {
              title: 'Status',
              value: 'Success',
              short: true
            }
          ],
          footer: 'WebHook Pro',
          ts: Math.floor(Date.now() / 1000)
        }
      ]
    }, null, 2),
    params: [],
    category: 'notifications'
  }
}

/**
 * Get templates by category
 * @param {string} category - Category to filter by
 * @returns {Array} Filtered templates
 */
export const getTemplatesByCategory = (category) => {
  if (!category) return Object.values(REQUEST_TEMPLATES)
  
  return Object.values(REQUEST_TEMPLATES).filter(
    template => template.category === category
  )
}

/**
 * Get template by name
 * @param {string} name - Template name
 * @returns {Object|null} Template object or null
 */
export const getTemplateByName = (name) => {
  return Object.values(REQUEST_TEMPLATES).find(
    template => template.name === name
  ) || null
}

/**
 * Get all available categories
 * @returns {Array} Array of unique categories
 */
export const getAvailableCategories = () => {
  const categories = Object.values(REQUEST_TEMPLATES).map(
    template => template.category
  )
  return [...new Set(categories)]
}

/**
 * Apply template to request data
 * @param {Object} template - Template to apply
 * @returns {Object} Request data with template applied
 */
export const applyTemplate = (template) => {
  return {
    method: template.method,
    url: template.url,
    headers: [...template.headers],
    body: template.body,
    params: [...template.params]
  }
} 