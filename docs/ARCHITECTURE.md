# Architecture

This document explains how Campus Shield works internally.

It is meant for developers who want to understand the design and extend the project.

---

## Overview

Campus Shield has three layers:

1. Frontend - runs in the browser, sends requests to the backend
2. Backend - Node.js server, handles logic and talks to the database
3. Database - PostgreSQL, stores all data

Here is the overall flow:

```
  Browser (Frontend)
        |
        |  HTTP request with JWT token
        v
  Node.js Server (Backend)
        |
        |  SQL query
        v
  PostgreSQL (Database)
        |
        |  Result rows
        v
  Node.js Server
        |
        |  JSON response
        v
  Browser (Frontend)
```

---

## Components

### Frontend Files

index.html
  The main page. Contains all UI elements including login modal, dashboard, profile modal, and pages for map, alerts, and analytics.

style.css
  All styling for the UI. No CSS frameworks used. Custom classes for cards, buttons, forms, modals, etc.

api.js
  Wraps all fetch calls. Adds JWT token to headers. Handles 401 errors by clearing session and showing login.

script.js
  UI logic. Handles login, logout, loading data, SOS button, report form, navigation, notifications.

### Backend Files

server.js
  Entry point. Sets up Express, loads middleware, mounts routes, serves static frontend, starts listening on port 5000.

config/database.js
  Creates a PostgreSQL connection pool. Exports a query function used by all routes.

middleware/auth.js
  Two functions:
  - protect - verifies JWT token and attaches user to request
  - authorize - checks if user role is allowed to access a route

utils/encryption.js
  Two functions:
  - encrypt - AES-256 encrypts a string
  - decrypt - reverses encryption

routes/auth.js
  Handles register, login, and profile endpoints.

routes/incidents.js
  Handles incident create, list, stats, SOS, and status update.

routes/alerts.js
  Handles alert list, unread count, and mark as read.

db/schema.sql
  SQL statements to create all tables and indexes.

db/setup.js
  Reads schema.sql and runs it against the database.

db/seed.js
  Inserts demo users, incidents, and alerts.

---

## Database Schema

Six tables:

### users

Stores all users (students, security, admin).

Columns:
- id - primary key
- name - full name
- email - unique, used for login
- password - bcrypt hash
- role - student, security, or admin
- student_id - optional ID
- phone - AES-256 encrypted
- department
- room
- is_active - soft delete flag
- last_login
- joined_at
- created_at

### incidents

Stores all incident reports.

Columns:
- id - primary key
- title
- type - Bullying, Theft, Fire, etc.
- location
- description
- priority - Critical, High, Medium, Low
- status - Active, In Progress, Resolved, Closed
- reported_by - foreign key to users.id
- reporter_name - cached name for speed
- assigned_to - foreign key to users.id (security who handled it)
- lat, lng - optional coordinates
- response_time - minutes to resolve
- resolved_at
- created_at, updated_at

### incident_attachments

Stores uploaded files linked to incidents.

Columns:
- id
- incident_id - foreign key
- filename
- path
- mimetype
- size
- uploaded_at

### incident_updates

Timeline of changes to an incident.

Columns:
- id
- incident_id - foreign key
- message
- status
- updated_by - foreign key to users.id
- created_at

### alerts

Notifications shown to users.

Columns:
- id
- title
- message
- type - SOS, Incident, System, Security
- severity - Critical, High, Medium, Low
- incident_id - optional link to an incident
- target_role - all, student, security, admin
- created_at

### alert_reads

Tracks which user has read which alert.

Columns:
- id
- alert_id - foreign key
- user_id - foreign key
- read_at

Unique constraint on (alert_id, user_id) so each user can only mark an alert as read once.

---

## Data Flow Example - Reporting an Incident

1. Student fills the report form on the dashboard.
2. script.js builds a FormData object with title, type, location, description, and any files.
3. script.js calls IncidentsAPI.create(formData).
4. api.js attaches the JWT token to the request header.
5. Request goes to POST /api/incidents.
6. middleware/auth.js verifies the token and attaches the user to req.user.
7. routes/incidents.js:
   - Validates the input
   - Assigns priority based on type
   - Inserts a row into incidents
   - Saves any uploaded files to uploads/ and inserts rows into incident_attachments
   - Creates a new alert in the alerts table with target_role = security
   - Returns the new incident as JSON
8. Frontend receives the response.
9. script.js shows a success notification and reloads dashboard stats and alerts.

---

## Data Flow Example - SOS

1. Student clicks the red SOS button.
2. A confirmation dialog appears.
3. On confirm, script.js tries to get GPS coordinates using the browser API.
4. script.js calls IncidentsAPI.sos(location).
5. Request goes to POST /api/incidents/sos.
6. Backend creates a Critical priority incident of type Medical Emergency.
7. Backend creates a Critical alert for security.
8. Frontend shows a red emergency notification.
9. Dashboard numbers update automatically.

---

## Security Layers

### Passwords

Passwords are hashed with bcrypt using 12 salt rounds.

Hashing is one-way. Even the server cannot recover the original password.

When a user logs in, the entered password is hashed again and compared with the stored hash.

### Sensitive Fields

Phone numbers are encrypted with AES-256 before being stored.

The encryption key lives in the .env file and is never committed to git.

When data is needed, decrypt is called to reverse the encryption.

### JWT Tokens

On login, the server creates a JWT containing the user's id.

The token is signed with JWT_SECRET from .env.

Every protected request sends this token in the Authorization header.

The server verifies the signature before processing the request.

Tokens expire after 30 days.

### Role-Based Access

Some routes are restricted by role:
- Only security and admin can update incident status
- Students can only see their own incidents
- Alerts are filtered by target_role

### SQL Injection Protection

All queries use parameterized statements. For example:

```
SELECT * FROM users WHERE email = $1
```

The $1 placeholder is replaced safely by the pg driver. User input is never concatenated into SQL strings.

---

## Priority Assignment Logic

Priority is assigned automatically when an incident is created.

Fire, Medical Emergency       - Critical
Theft, Harassment, Ragging    - High
Bullying, Suspicious Person   - Medium
Lost Item, Other              - Low

This logic lives in routes/incidents.js in the priorityMap object.

---

## Response Time Calculation

When an incident is marked as Resolved or Closed:

1. resolved_at is set to the current timestamp
2. response_time is calculated as:

   response_time = (resolved_at - created_at) / 60000

   This gives the number of minutes.

3. The value is stored in the incidents table.

The dashboard averages all non-null response_time values to show the average.

---

## File Uploads

Uploaded files are handled by Multer.

Files are saved to backend/uploads/ with a unique filename based on timestamp and random number.

The original filename is not preserved to avoid conflicts.

A row is inserted into incident_attachments for each file, linking it to the incident.

Files are served at http://localhost:5000/uploads/FILENAME.

Maximum file size: 10 MB.
Maximum files per incident: 5.

---

## Frontend State

The frontend stores login state in localStorage:

- token - the JWT token
- user - the logged-in user object as JSON

On page load, script.js checks if a token exists:
- If yes - loads user data, dashboard, alerts
- If no - shows login screen

On logout, both keys are removed and the page reloads.

---

## Error Handling

Backend
  All routes are wrapped in try/catch. Errors return JSON with success:false and a message.

Frontend
  API calls are wrapped in try/catch. Errors are shown as notifications to the user.

Auth errors
  If the backend returns 401, the frontend clears the session and shows the login screen again.

---

## Extending the Project

Ideas for adding features:

New incident type
  1. Add it to the enum in db/schema.sql
  2. Add it to the priorityMap in routes/incidents.js
  3. Add it to the select dropdown in index.html

New API endpoint
  1. Create a new file in routes/
  2. Import it in server.js with app.use
  3. Add a frontend helper in api.js

New role
  1. Add it to the role list in schema.sql
  2. Update authorize() calls in routes
  3. Update frontend to show different UI for that role

Real map integration
  Replace the map placeholder in index.html with a Leaflet or Google Maps iframe.
  Use the lat/lng values from incidents to place markers.

---

## Performance Notes

Indexes are added on frequently queried columns:
- users.email
- incidents.status
- incidents.type
- incidents.created_at
- alerts.target_role
- alerts.created_at

The connection pool reuses database connections instead of creating new ones per request.

Pagination is supported on the incident list via page and limit query parameters.

---

Campus Shield 2026