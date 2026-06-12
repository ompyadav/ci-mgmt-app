# CIMS - API Documentation

**Version**: 1.0.0  
**Base URL**: http://localhost:8080  
**API Prefix**: /api

---

## 📚 Table of Contents

1. [Authentication APIs](#authentication-apis)
2. [User Management APIs](#user-management-apis-planned)
3. [Idea Management APIs](#idea-management-apis-planned)
4. [Dashboard APIs](#dashboard-apis-planned)
5. [Notification APIs](#notification-apis-planned)
6. [Report APIs](#report-apis-planned)
7. [Category APIs](#category-apis-planned)
8. [Error Responses](#error-responses)

---

## 🔐 Authentication

All API endpoints (except authentication endpoints) require a valid JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

## ✅ Authentication APIs (IMPLEMENTED)

### 1. User Login

**Endpoint**: `POST /api/auth/login`

**Description**: Authenticate user and receive JWT tokens

**Request Body**:
```json
{
  "email": "admin@cims.com",
  "password": "Admin@123",
  "rememberMe": false
}
```

**Response** (200 OK):
```json
{
  "accessToken": "eyJhbGciOiJIUzUxMiJ9...",
  "refreshToken": "eyJhbGciOiJIUzUxMiJ9...",
  "tokenType": "Bearer",
  "expiresIn": 86400,
  "user": {
    "id": 1,
    "employeeId": "ADMIN001",
    "firstName": "System",
    "lastName": "Administrator",
    "email": "admin@cims.com",
    "department": "IT",
    "businessUnit": null,
    "location": null,
    "phoneNumber": null,
    "profilePictureUrl": null,
    "status": "ACTIVE",
    "roles": ["ROLE_ADMIN"],
    "lastLogin": "2026-06-10T15:30:00",
    "emailVerified": true,
    "mfaEnabled": false,
    "createdAt": "2026-06-10T10:00:00",
    "updatedAt": "2026-06-10T15:30:00"
  }
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid credentials
- `400 Bad Request`: Validation errors

---

### 2. Refresh Token

**Endpoint**: `POST /api/auth/refresh`

**Description**: Refresh access token using refresh token

**Query Parameters**:
- `refreshToken` (required): The refresh token

**Response** (200 OK):
```json
{
  "accessToken": "eyJhbGciOiJIUzUxMiJ9...",
  "refreshToken": "eyJhbGciOiJIUzUxMiJ9...",
  "tokenType": "Bearer",
  "expiresIn": 86400,
  "user": { ... }
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid or expired refresh token

---

### 3. User Logout

**Endpoint**: `POST /api/auth/logout`

**Description**: Logout user and clear security context

**Headers**:
```
Authorization: Bearer <access_token>
```

**Response** (200 OK):
```
"Logged out successfully"
```

---

### 4. Health Check

**Endpoint**: `GET /api/auth/health`

**Description**: Check if authentication service is running

**Response** (200 OK):
```
"Authentication service is running"
```

---

## 👥 User Management APIs (PLANNED)

### Get All Users
`GET /api/users`

### Get User by ID
`GET /api/users/{id}`

### Create User
`POST /api/users`

### Update User
`PUT /api/users/{id}`

### Delete User
`DELETE /api/users/{id}`

### Search Users
`GET /api/users/search?q={searchTerm}`

### Get Users by Department
`GET /api/users/department/{department}`

### Get Users by Role
`GET /api/users/role/{roleName}`

### Change Password
`POST /api/users/{id}/change-password`

### Reset Password
`POST /api/users/{id}/reset-password`

### Assign Roles
`POST /api/users/{id}/roles`

---

## 💡 Idea Management APIs (PLANNED)

### Get All Ideas
`GET /api/ideas`

### Get Idea by ID
`GET /api/ideas/{id}`

### Create Idea
`POST /api/ideas`

### Update Idea
`PUT /api/ideas/{id}`

### Delete Idea
`DELETE /api/ideas/{id}`

### Approve Idea
`POST /api/ideas/{id}/approve`

### Reject Idea
`POST /api/ideas/{id}/reject`

### Get Ideas by Status
`GET /api/ideas/status/{status}`

### Get Ideas by Category
`GET /api/ideas/category/{category}`

### Get My Ideas
`GET /api/ideas/my-ideas`

### Search Ideas
`GET /api/ideas/search?q={searchTerm}`

### Add Comment
`POST /api/ideas/{id}/comments`

### Add Attachment
`POST /api/ideas/{id}/attachments`

---

## 📊 Dashboard APIs (PLANNED)

### Get User Dashboard
`GET /api/dashboard/user`

### Get Manager Dashboard
`GET /api/dashboard/manager`

### Get Executive Dashboard
`GET /api/dashboard/executive`

### Get Statistics
`GET /api/dashboard/statistics`

### Get KPIs
`GET /api/dashboard/kpis`

---

## 🔔 Notification APIs (PLANNED)

### Get My Notifications
`GET /api/notifications`

### Get Unread Count
`GET /api/notifications/unread-count`

### Mark as Read
`PUT /api/notifications/{id}/read`

### Mark All as Read
`PUT /api/notifications/read-all`

### Delete Notification
`DELETE /api/notifications/{id}`

---

## 📈 Report APIs (PLANNED)

### Generate Report
`POST /api/reports/generate`

### Export to Excel
`GET /api/reports/export/excel`

### Export to PDF
`GET /api/reports/export/pdf`

### Export to CSV
`GET /api/reports/export/csv`

### Get Report Templates
`GET /api/reports/templates`

---

## 🏷️ Category APIs (PLANNED)

### Get All Categories
`GET /api/categories`

### Get Categories by Type
`GET /api/categories/type/{type}`

### Create Category
`POST /api/categories`

### Update Category
`PUT /api/categories/{id}`

### Delete Category
`DELETE /api/categories/{id}`

---

## ❌ Error Responses

All error responses follow a standard format:

```json
{
  "timestamp": "2026-06-10T15:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/users",
  "validationErrors": {
    "email": "Email is required",
    "firstName": "First name must be between 2 and 100 characters"
  }
}
```

### Common HTTP Status Codes

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required or failed
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource already exists
- `500 Internal Server Error`: Server error

---

## 🔒 Security

### Roles

1. **ROLE_ADMIN**: System Administrator
   - Full system access
   - User management
   - System configuration

2. **ROLE_MANAGER**: Manager/Reviewer
   - Review and approve ideas
   - Team management
   - Reports access

3. **ROLE_USER**: Standard User
   - Submit ideas
   - View own ideas
   - Basic dashboard

4. **ROLE_EXECUTIVE**: Executive/Leadership
   - Executive dashboard
   - Organization-wide reports
   - KPI monitoring

5. **ROLE_REVIEWER**: Reviewer
   - Review ideas
   - Provide feedback
   - Track progress

### Permissions

18 granular permissions control access to specific operations:

**User Management**:
- USER_CREATE
- USER_READ
- USER_UPDATE
- USER_DELETE

**Idea Management**:
- IDEA_CREATE
- IDEA_READ
- IDEA_UPDATE
- IDEA_DELETE
- IDEA_APPROVE
- IDEA_REJECT

**Dashboard**:
- DASHBOARD_VIEW
- DASHBOARD_EXECUTIVE

**Reports**:
- REPORT_VIEW
- REPORT_EXPORT

**Configuration**:
- CONFIG_MANAGE
- ROLE_MANAGE

**Audit**:
- AUDIT_VIEW

---

## 📝 Request/Response Examples

### Create User Request
```json
{
  "employeeId": "EMP001",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@company.com",
  "password": "SecurePass123!",
  "department": "Engineering",
  "businessUnit": "Technology",
  "location": "New York",
  "phoneNumber": "+1234567890",
  "roles": ["ROLE_USER"]
}
```

### Create Idea Request
```json
{
  "category": "Automation",
  "identifiedBy": "IBM",
  "identifiedOn": "2026-06-10",
  "podTeam": "DevOps Team",
  "title": "Automate deployment process",
  "problemStatement": "Manual deployment takes 2 hours",
  "proposedSolution": "Implement CI/CD pipeline",
  "expectedQuantitativeBenefitsHours": 40,
  "expectedQuantitativeBenefitsValue": 5000,
  "benefitType": "Recurring",
  "priority": "HIGH"
}
```

---

## 🚀 Getting Started

### 1. Start the Application

```bash
# Using Docker
cd docker
docker-compose up -d

# Or using Maven
cd backend
mvn spring-boot:run
```

### 2. Access API Documentation

- Swagger UI: http://localhost:8080/swagger-ui.html
- API Docs JSON: http://localhost:8080/api-docs

### 3. Test Authentication

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@cims.com",
    "password": "Admin@123"
  }'
```

### 4. Use the Token

```bash
curl -X GET http://localhost:8080/api/users \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 📊 Implementation Status

### ✅ Completed (60%)
- Authentication APIs (4 endpoints)
- Security layer (JWT, RBAC)
- Error handling
- Database schema
- Core services

### ⏳ In Progress (40%)
- User Management APIs
- Idea Management APIs
- Dashboard APIs
- Notification APIs
- Report APIs
- Category APIs

---

## 🔗 Related Documentation

- [Setup Guide](./SETUP_GUIDE.md)
- [Project Status](./PROJECT_STATUS.md)
- [Implementation Progress](./IMPLEMENTATION_PROGRESS.md)
- [Final Summary](./FINAL_SUMMARY.md)

---

**Last Updated**: 2026-06-10  
**API Version**: 1.0.0  
**Status**: 🟢 Active Development