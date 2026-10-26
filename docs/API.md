# API Reference

Campus Shield backend exposes a REST API for the frontend.

Base URL: http://localhost:5000/api

All requests and responses use JSON.

For endpoints marked "Protected", you must send a JWT token in the request header.

---

## Authentication

Protected endpoints need this header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

You get the token by calling the login endpoint.

Tokens expire after 30 days.

---

## Health Check

### GET /api/health

Check that the server and database are running.

Authentication: Not required

Response (200 OK):

```json
{
  "success": true,
  "message": "Campus Shield API is running",
  "database": "connected",
  "time": "2026-09-21T12:04:28.293Z"
}
```

---

## Auth Endpoints

### POST /api/auth/register

Create a new user account.

Authentication: Not required

Request body:

```json
{
  "name": "John Doe",
  "email": "john@campus.edu",
  "password": "mypassword123",
  "role": "student",
  "studentId": "CS-2024-099",
  "phone": "+1 555 123 4567",
  "department": "Computer Science",
  "room": "Block A, Room 101"
}
```

Only name, email, and password are required. Role defaults to "student".

Response (201 Created):

```json
{
  "success": true,
  "message": "User registered successfully.",
  "data": {
    "user": {
      "id": 5,
      "name": "John Doe",
      "email": "john@campus.edu",
      "role": "student",
      "student_id": "CS-2024-099",
      "department": "Computer Science",
      "room": "Block A, Room 101",
      "joined_at": "2026-09-21T12:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

Errors:
- 400 - Missing fields or user already exists

---

### POST /api/auth/login

Login with email and password.

Authentication: Not required

Request body:

```json
{
  "email": "alex.johnson@campus.edu",
  "password": "password123"
}
```

Response (200 OK):

```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "user": {
      "id": 1,
      "name": "Alex Johnson",
      "email": "alex.johnson@campus.edu",
      "role": "student",
      "student_id": "CS-2024-078",
      "department": "Computer Science",
      "room": "Block C, Room 204",
      "phone": "+1 (555) 234-5678"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

Errors:
- 400 - Missing email or password
- 401 - Invalid credentials

---

### GET /api/auth/me

Get the current logged-in user's profile.

Authentication: Required

Response (200 OK):

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Alex Johnson",
    "email": "alex.johnson@campus.edu",
    "role": "student",
    "student_id": "CS-2024-078",
    "phone": "+1 (555) 234-5678",
    "department": "Computer Science",
    "room": "Block C, Room 204",
    "joined_at": "2024-08-15T00:00:00.000Z",
    "last_login": "2026-09-21T12:04:28.293Z"
  }
}
```

Errors:
- 401 - Missing or invalid token

---

## Incident Endpoints

### POST /api/incidents

Create a new incident report.

Authentication: Required

Request body (multipart/form-data when uploading files):

```
title: "Bullying near Block C"
type: "Bullying"
location: "Block C, near cafeteria"
description: "A group of seniors were harassing a junior."
lat: 28.6139
lng: 77.209
attachments: [file1.jpg, file2.mp4]
```

Field types:
- title - string, required
- type - string, required
- location - string, required
- description - string, required
- lat - number, optional
- lng - number, optional
- attachments - files, optional (max 5 files, max 10MB each)

Incident types accepted:
Bullying, Theft, Fire, Medical Emergency, Ragging, Suspicious Person, Harassment, Lost Item, Other

Priority is auto-assigned:
- Fire, Medical Emergency - Critical
- Theft, Harassment, Ragging - High
- Bullying, Suspicious Person - Medium
- Lost Item, Other - Low

Response (201 Created):

```json
{
  "success": true,
  "message": "Incident reported successfully.",
  "data": {
    "id": 7,
    "title": "Bullying near Block C",
    "type": "Bullying",
    "location": "Block C, near cafeteria",
    "description": "A group of seniors were harassing a junior.",
    "priority": "Medium",
    "status": "Active",
    "reported_by": 1,
    "reporter_name": "Alex Johnson",
    "assigned_to": null,
    "lat": 28.6139,
    "lng": 77.209,
    "response_time": null,
    "resolved_at": null,
    "created_at": "2026-09-21T12:00:00.000Z",
    "updated_at": "2026-09-21T12:00:00.000Z"
  }
}
```

Errors:
- 400 - Missing required fields

---

### GET /api/incidents

List incidents.

Authentication: Required

Role behavior:
- Students see only their own incidents
- Security and Admin see all incidents

Query parameters (optional):
- status - filter by status (Active, In Progress, Resolved, Closed)
- type - filter by incident type
- priority - filter by priority
- page - page number (default 1)
- limit - items per page (default 20)

Response (200 OK):

```json
{
  "success": true,
  "count": 6,
  "total": 6,
  "page": 1,
  "pages": 1,
  "data": [
    {
      "id": 1,
      "title": "Bullying near Block C",
      "type": "Bullying",
      "location": "Block C, near cafeteria",
      "priority": "Medium",
      "status": "In Progress",
      "reporter_name": "Alex Johnson",
      "created_at": "2026-09-21T10:00:00.000Z"
    }
  ]
}
```

---

### GET /api/incidents/stats

Get dashboard statistics.

Authentication: Required

Response (200 OK):

```json
{
  "success": true,
  "data": {
    "totalIncidents": 6,
    "activeIncidents": 1,
    "inProgress": 2,
    "resolved": 3,
    "avgResponseTime": 4.3,
    "byType": [
      { "type": "Medical Emergency", "count": 1 },
      { "type": "Fire", "count": 1 },
      { "type": "Theft", "count": 1 },
      { "type": "Bullying", "count": 1 },
      { "type": "Harassment", "count": 1 },
      { "type": "Suspicious Person", "count": 1 }
    ],
    "byPriority": [
      { "priority": "Critical", "count": 2 },
      { "priority": "High", "count": 2 },
      { "priority": "Medium", "count": 2 }
    ],
    "dailyTrend": [
      { "date": "2026-09-15", "count": 1 },
      { "date": "2026-09-18", "count": 2 }
    ]
  }
}
```

---

### POST /api/incidents/sos

Trigger an SOS emergency. Creates a Critical priority incident and notifies security.

Authentication: Required

Request body:

```json
{
  "location": "Central Library, 2nd floor",
  "lat": 28.6139,
  "lng": 77.209
}
```

Response (201 Created):

```json
{
  "success": true,
  "message": "SOS activated. Security notified.",
  "data": {
    "id": 8,
    "title": "SOS EMERGENCY",
    "type": "Medical Emergency",
    "location": "Central Library, 2nd floor",
    "priority": "Critical",
    "status": "Active",
    "reported_by": 1,
    "reporter_name": "Alex Johnson",
    "created_at": "2026-09-21T12:10:00.000Z"
  }
}
```

---

### PUT /api/incidents/:id/status

Update incident status.

Authentication: Required (Security or Admin only)

Request body:

```json
{
  "status": "Resolved",
  "message": "Security team handled the situation."
}
```

Status values: Active, In Progress, Resolved, Closed

When status is set to Resolved or Closed:
- resolved_at is set to current time
- response_time is calculated in minutes

Response (200 OK):

```json
{
  "success": true,
  "message": "Status updated.",
  "data": {
    "id": 1,
    "status": "Resolved",
    "response_time": 15,
    "resolved_at": "2026-09-21T12:15:00.000Z",
    "updated_at": "2026-09-21T12:15:00.000Z"
  }
}
```

Errors:
- 403 - Student tried to update status
- 404 - Incident not found

---

## Alert Endpoints

### GET /api/alerts

List alerts for the current user.

Authentication: Required

Alerts are filtered by role:
- Students see alerts with target_role "all"
- Security sees alerts with target_role "all" or "security"
- Admin sees alerts with target_role "all" or "admin"

Response (200 OK):

```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": 1,
      "title": "Fire alarm triggered",
      "message": "Fire detected at Block A, 3rd Floor",
      "type": "Incident",
      "severity": "Critical",
      "incident_id": 2,
      "target_role": "security",
      "is_read": false,
      "created_at": "2026-09-21T10:05:00.000Z"
    }
  ]
}
```

---

### GET /api/alerts/unread-count

Get count of unread alerts.

Authentication: Required

Response (200 OK):

```json
{
  "success": true,
  "data": {
    "unreadCount": 3
  }
}
```

---

### PUT /api/alerts/:id/read

Mark an alert as read.

Authentication: Required

Response (200 OK):

```json
{
  "success": true,
  "message": "Marked as read."
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "Description of the error"
}
```

Common status codes:
- 400 - Bad request (missing or invalid data)
- 401 - Not authenticated (missing or invalid token)
- 403 - Forbidden (logged in but not allowed)
- 404 - Resource not found
- 500 - Server error

---

## Testing with Browser Console

Open http://localhost:5000 in browser, press F12, go to Console tab.

Example: Test login

```javascript
fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'alex.johnson@campus.edu',
    password: 'password123'
  })
})
.then(r => r.json())
.then(d => console.log(d));
```

Example: Test a protected endpoint (after login)

```javascript
const token = localStorage.getItem('token');

fetch('http://localhost:5000/api/incidents/stats', {
  headers: { 'Authorization': 'Bearer ' + token }
})
.then(r => r.json())
.then(d => console.log(d));
```

---

Campus Shield 2026