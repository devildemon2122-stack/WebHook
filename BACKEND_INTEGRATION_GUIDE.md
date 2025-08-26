# WebHooks Backend Integration Guide

## Overview
This guide provides complete instructions for integrating the WebHooks frontend application with your backend APIs. The application is designed to work with a RESTful API backend that handles request management, collections, environments, and logging.

## Backend API Endpoints

### Base Configuration
- **Base URL**: Configure in `src/services/api.js`
- **Authentication**: Bearer Token (configure in environment variables)
- **Content-Type**: `application/json`

### 1. Request Management APIs

#### Save Request
```http
POST /api/requests
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "string",
  "description": "string",
  "method": "GET|POST|PUT|DELETE|PATCH",
  "url": "string",
  "headers": [
    {
      "key": "string",
      "value": "string"
    }
  ],
  "body": "string",
  "params": [
    {
      "key": "string",
      "value": "string",
      "type": "path|query",
      "required": boolean
    }
  ],
  "auth": {
    "type": "no-auth|api-key|bearer-token|basic-auth",
    "config": {}
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "description": "string",
    "createdAt": "ISO-8601",
    "updatedAt": "ISO-8601"
  }
}
```

#### Get All Requests
```http
GET /api/requests
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "method": "string",
      "url": "string",
      "headers": [],
      "body": "string",
      "params": [],
      "auth": {},
      "createdAt": "ISO-8601",
      "updatedAt": "ISO-8601"
    }
  ]
}
```

#### Get Request by ID
```http
GET /api/requests/{id}
Authorization: Bearer <token>
```

#### Update Request
```http
PUT /api/requests/{id}
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "string",
  "description": "string",
  "method": "string",
  "url": "string",
  "headers": [],
  "body": "string",
  "params": [],
  "auth": {}
}
```

#### Delete Request
```http
DELETE /api/requests/{id}
Authorization: Bearer <token>
```

### 2. Collections Management APIs

#### Create Collection
```http
POST /api/collections
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "string",
  "description": "string",
  "requests": ["request-id-1", "request-id-2"]
}
```

#### Get All Collections
```http
GET /api/collections
Authorization: Bearer <token>
```

#### Get Collection by ID
```http
GET /api/collections/{id}
Authorization: Bearer <token>
```

#### Update Collection
```http
PUT /api/collections/{id}
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "string",
  "description": "string",
  "requests": ["request-id-1", "request-id-2"]
}
```

#### Delete Collection
```http
DELETE /api/collections/{id}
Authorization: Bearer <token>
```

### 3. Environment Management APIs

#### Create Environment
```http
POST /api/environments
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "string",
  "description": "string",
  "variables": [
    {
      "key": "string",
      "value": "string",
      "enabled": boolean
    }
  ]
}
```

#### Get All Environments
```http
GET /api/environments
Authorization: Bearer <token>
```

#### Get Environment by ID
```http
GET /api/environments/{id}
Authorization: Bearer <token>
```

#### Update Environment
```http
PUT /api/environments/{id}
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "string",
  "description": "string",
  "variables": [
    {
      "key": "string",
      "value": "string",
      "enabled": boolean
    }
  ]
}
```

#### Delete Environment
```http
DELETE /api/environments/{id}
Authorization: Bearer <token>
```

### 4. Request Execution & Logging APIs

#### Execute Request
```http
POST /api/requests/{id}/execute
Authorization: Bearer <token>

{
  "environmentId": "string", // optional
  "overrides": {
    "url": "string", // optional
    "headers": [], // optional
    "body": "string", // optional
    "params": [] // optional
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "requestId": "string",
    "status": "number",
    "statusText": "string",
    "headers": {},
    "body": "string",
    "responseTime": "number",
    "timestamp": "ISO-8601"
  }
}
```

#### Get Request Logs
```http
GET /api/logs
Authorization: Bearer <token>

Query Parameters:
- page: number (default: 1)
- limit: number (default: 20)
- requestId: string (optional)
- status: number (optional)
- method: string (optional)
- startDate: ISO-8601 (optional)
- endDate: ISO-8601 (optional)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": "string",
        "requestId": "string",
        "requestName": "string",
        "method": "string",
        "url": "string",
        "status": "number",
        "statusText": "string",
        "responseTime": "number",
        "timestamp": "ISO-8601",
        "request": {
          "headers": {},
          "body": "string"
        },
        "response": {
          "headers": {},
          "body": "string"
        }
      }
    ],
    "pagination": {
      "page": "number",
      "limit": "number",
      "total": "number",
      "totalPages": "number"
    }
  }
}
```

#### Get Log Details
```http
GET /api/logs/{id}
Authorization: Bearer <token>
```

### 5. Authentication APIs

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "string",
    "user": {
      "id": "string",
      "email": "string",
      "name": "string"
    }
  }
}
```

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "string",
  "email": "string",
  "password": "string"
}
```

#### Refresh Token
```http
POST /api/auth/refresh
Authorization: Bearer <token>
```

## Frontend Configuration

### 1. API Service Configuration

Update `src/services/api.js`:

```javascript
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api'
const API_TOKEN = process.env.REACT_APP_API_TOKEN || ''

// Add your API functions here
export const saveRequestToBackend = async (name, description, requestData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`
      },
      body: JSON.stringify({
        name,
        description,
        ...requestData
      })
    })
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error saving request:', error)
    return { success: false, error: error.message }
  }
}

// Add other API functions...
```

### 2. Environment Variables

Create `.env` file in the root directory:

```env
REACT_APP_API_BASE_URL=http://localhost:3000/api
REACT_APP_API_TOKEN=your_api_token_here
REACT_APP_ENVIRONMENT=development
```

### 3. WebhookContext Integration

Update `src/contexts/WebhookContext.jsx` to use backend APIs:

```javascript
// Add backend integration functions
const saveRequestToBackend = async (name, description) => {
  // Implementation using the API service
}

const loadRequestsFromBackend = async () => {
  // Implementation to load saved requests
}

const loadCollectionsFromBackend = async () => {
  // Implementation to load collections
}
```

## Database Schema (Reference)

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Requests Table
```sql
CREATE TABLE requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  method VARCHAR(10) NOT NULL,
  url TEXT NOT NULL,
  headers JSONB DEFAULT '[]',
  body TEXT,
  params JSONB DEFAULT '[]',
  auth JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Collections Table
```sql
CREATE TABLE collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Collection_Requests Table
```sql
CREATE TABLE collection_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
  request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Environments Table
```sql
CREATE TABLE environments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  variables JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Request_Logs Table
```sql
CREATE TABLE request_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  request_id UUID REFERENCES requests(id) ON DELETE SET NULL,
  method VARCHAR(10) NOT NULL,
  url TEXT NOT NULL,
  status INTEGER,
  status_text VARCHAR(255),
  response_time INTEGER,
  request_data JSONB,
  response_data JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Error Handling

### Standard Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "string",
    "message": "string",
    "details": {}
  }
}
```

### Common Error Codes
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

## Security Considerations

1. **Authentication**: Use JWT tokens with proper expiration
2. **Authorization**: Implement user-based access control
3. **Input Validation**: Validate all request inputs
4. **Rate Limiting**: Implement API rate limiting
5. **CORS**: Configure CORS properly for production
6. **HTTPS**: Use HTTPS in production
7. **Environment Variables**: Store sensitive data in environment variables

## Testing

### API Testing Endpoints
```http
GET /api/health
GET /api/status
```

### Example Test Request
```bash
curl -X POST http://localhost:3000/api/requests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_token" \
  -d '{
    "name": "Test Request",
    "description": "A test request",
    "method": "GET",
    "url": "https://api.example.com/test"
  }'
```

## Deployment Checklist

- [ ] Configure environment variables
- [ ] Set up database and run migrations
- [ ] Configure CORS settings
- [ ] Set up authentication
- [ ] Test all API endpoints
- [ ] Configure logging
- [ ] Set up monitoring
- [ ] Deploy to production server
- [ ] Update frontend API base URL
- [ ] Test end-to-end functionality

## Support

For backend integration support:
1. Check the API documentation
2. Review error logs
3. Test endpoints with tools like Postman
4. Verify database connectivity
5. Check authentication configuration
