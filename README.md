# WebHooks 🔗

A modern webhook testing and management application with a Postman-like interface, built with React and custom CSS.

## Features

- **Modern UI**: Clean, intuitive interface similar to Postman and APIDog
- **Request Builder**: Support for all HTTP methods (GET, POST, PUT, PATCH, DELETE)
- **Headers Management**: Add, edit, and remove custom headers with multiple options
- **Path Parameters**: Automatic detection and management of URL path parameters
- **Request Body**: Multiple body format support (JSON, XML, Form Data, Raw, Binary)
- **Environment Management**: Template-based environment configuration
- **Response Viewer**: Tabbed response display with body, headers, and info
- **Collections**: Organize and manage webhook collections
- **Logs**: Client-specific logging with authentication support
- **History**: Recent 5 request entries with pagination support
- **Responsive Design**: Works on desktop and mobile devices

## Screenshots

The application features:
- Left sidebar with navigation and default collections
- Main request builder with URL bar, path parameters, headers, and body
- Response panel showing status, body, headers, and metrics
- Modern color scheme with hover effects and smooth transitions

## Backend Integration Points

The application is designed with clear integration points for your backend:

### 1. Request Handling
```javascript
// TODO: Replace with actual backend API call
const handleSendRequest = async () => {
  // Integrate with your backend here
  const result = await sendWebhookRequest(requestData)
}
```

### 2. Collections Management
- Save/load webhook collections
- User authentication and authorization
- Persistent storage

### 3. Environment Management
- Environment variable configuration
- Base URL management
- Template-based setup

### 4. Authentication
- OAuth integration
- API key management
- Bearer token support

### 5. Response Tracking
- Response time metrics
- Request/response logging
- Error tracking and analytics

### 6. Logs System
- Client-specific logging
- Authentication required
- Webhook ID and environment parameter tracking

## Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd webhooks
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── Sidebar.jsx          # Navigation sidebar
│   ├── Header.jsx           # Top header with actions
│   ├── RequestBuilder.jsx   # Main request interface
│   └── ResponsePanel.jsx    # Response display
├── App.jsx                  # Main application component
├── main.jsx                 # React entry point
└── index.css                # Custom CSS styles
```

## Customization

The application uses CSS custom properties for easy theming:

```css
:root {
  --primary-color: #3b82f6;
  --bg-primary: #ffffff;
  --text-primary: #1e293b;
  /* ... more variables */
}
```

## Backend Development

To integrate with your backend:

1. **API Endpoints**: Create RESTful endpoints for webhook management
2. **Database**: Store webhook collections, user data, and request history
3. **Authentication**: Implement user login and session management
4. **Webhook Execution**: Handle actual webhook sending and response capture
5. **Environment Management**: Store and manage environment variables
6. **Logs System**: Implement client-specific logging with authentication
7. **Real-time Updates**: Consider WebSocket integration for live updates

## API Requirements

Based on the frontend implementation, you'll need these backend endpoints:

### Core Webhook Management
- `POST /api/webhooks/send` - Send webhook request
- `GET /api/webhooks/history` - Get request history (paginated, max 5)
- `POST /api/webhooks/save` - Save webhook request
- `GET /api/webhooks/saved` - Get saved requests
- `DELETE /api/webhooks/saved/:id` - Delete saved request

### Environment Management
- `GET /api/environments` - Get environment templates
- `POST /api/environments` - Create environment configuration
- `PUT /api/environments/:id` - Update environment
- `DELETE /api/environments/:id` - Delete environment

### Logs System
- `GET /api/logs` - Get client-specific logs (authenticated)
- `POST /api/logs` - Create log entry
- `GET /api/logs/:webhookId` - Get logs for specific webhook

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Collections Management
- `GET /api/collections` - Get user collections
- `POST /api/collections` - Create new collection
- `PUT /api/collections/:id` - Update collection
- `DELETE /api/collections/:id` - Delete collection
- `POST /api/collections/:id/requests` - Add request to collection

## Backend Integration Guide

### 1. Request Saving & Logging
When a webhook request is sent, your backend should automatically:
- **Save to History**: Store request/response data with timestamps
- **Create Log Entry**: Generate structured log entries for monitoring
- **Update Collections**: If user chooses to save, add to their collections

**Database Schema for Requests:**
```sql
CREATE TABLE webhook_requests (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  method VARCHAR(10) NOT NULL,
  url TEXT NOT NULL,
  headers JSONB,
  body TEXT,
  params JSONB,
  response_status INTEGER,
  response_body TEXT,
  response_time INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 2. Environment Configuration
Implement role-based environment management:

**Database Schema for Environments:**
```sql
CREATE TABLE environments (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  base_url TEXT NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('client', 'admin', 'author')),
  variables JSONB,
  user_id UUID REFERENCES users(id),
  is_shared BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Role-Based Access Control:**
- **Client**: Basic webhook access, limited environment variables
- **Admin**: Full system access, can manage all environments
- **Author**: Content creation access, can create and edit environments

### 3. Logs System
Implement comprehensive logging with authentication:

**Database Schema for Logs:**
```sql
CREATE TABLE webhook_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  webhook_id VARCHAR(255),
  level VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  details JSONB,
  timestamp TIMESTAMP DEFAULT NOW()
);
```

**Log Levels:**
- `INFO`: Successful operations
- `ERROR`: Failed operations
- `WARN`: Warning conditions
- `DEBUG`: Debug information

### 4. Collections Management
Implement CRUD operations for webhook collections:

**Database Schema for Collections:**
```sql
CREATE TABLE collections (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  user_id UUID REFERENCES users(id),
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE collection_requests (
  id UUID PRIMARY KEY,
  collection_id UUID REFERENCES collections(id),
  request_id UUID REFERENCES webhook_requests(id),
  added_at TIMESTAMP DEFAULT NOW()
);
```

### 5. Authentication & Authorization
Implement secure user management:

**Required Features:**
- JWT or session-based authentication
- Role-based access control (RBAC)
- User registration and login
- Password hashing and security
- API key management for webhook authentication

**Security Considerations:**
- HTTPS enforcement
- Input validation and sanitization
- Rate limiting
- CORS configuration
- SQL injection prevention

### 6. Real-time Features (Optional)
Consider implementing:
- WebSocket connections for live updates
- Real-time collaboration on collections
- Live webhook monitoring
- Push notifications for failed webhooks

## Implementation Priority

### Phase 1 (Essential)
1. User authentication system
2. Basic webhook sending and response handling
3. Request history storage
4. Simple logging system

### Phase 2 (Core Features)
1. Environment management
2. Collections CRUD operations
3. Enhanced logging with filtering
4. Role-based access control

### Phase 3 (Advanced Features)
1. Real-time monitoring
2. Advanced analytics
3. Team collaboration
4. API documentation generation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For questions or support, please contact the development team.

---

**WebHooks** - Making webhook testing simple and beautiful! 🚀 