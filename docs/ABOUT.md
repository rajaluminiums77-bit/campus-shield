# 📖 About Campus Shield

## What is Campus Shield?

Campus Shield is a **full-stack campus safety platform** designed to make college campuses safer by giving students a fast, reliable way to report incidents and call for help.

It solves three problems:

1. **Slow incident reporting** — No more waiting in line at the security office
2. **Lack of awareness** — Students and staff see live incident updates
3. **Poor tracking** — Security can see, assign, and resolve issues in real time

---

## 🎯 Who Uses It?

| Role | What they can do |
|------|------------------|
| **Student** | Report incidents, trigger SOS, view campus safety updates |
| **Security** | View all incidents, update status, respond to SOS alerts |
| **Admin** | Full access — manage users, view analytics, resolve cases |

---

## ✨ Features

### 🚨 SOS Emergency
- One-tap button that instantly alerts security
- Auto-captures location and timestamp
- Creates a **Critical** priority incident
- Notifies all security staff in real time

### 📝 Incident Reporting
- Report bullying, theft, fire, medical, harassment, ragging, and more
- Upload photos / videos as evidence
- AI-based priority assignment (Fire = Critical, Theft = High, etc.)
- Auto-generates alerts for security

### 📊 Dashboard
- Live incident counts (active, in progress, resolved)
- Average response time tracking
- Charts by incident type and priority
- 7-day trend view

### 🔔 Alerts System
- Real-time notifications for new incidents
- Unread badge count in navbar
- Filtered by role (students see student alerts, security sees all)
- Mark as read/unread

### 🗺️ Live Map
- Visual view of active incidents across campus
- Color-coded markers (red = active, orange = in progress, green = resolved)

### 👤 User Profile
- View personal details, department, room
- Logout functionality
- Profile data encrypted at rest

---

## 🛠️ Tech Stack

### Frontend
- **HTML5** — Structure
- **CSS3** — Styling (custom, no frameworks)
- **Vanilla JavaScript** — No React/Vue, keep it simple
- **Font Awesome** — Icons
- **Google Fonts** — Inter typeface

### Backend
- **Node.js** — Runtime
- **Express.js** — Web framework
- **Multer** — File uploads
- **JWT** — Authentication tokens
- **bcryptjs** — Password hashing
- **crypto-js** — AES-256 encryption
- **pg** — PostgreSQL client

### Database
- **PostgreSQL 16** — Relational database
- 6 tables: `users`, `incidents`, `incident_attachments`, `incident_updates`, `alerts`, `alert_reads`

---

## 🔐 Security Features

### 1. Password Hashing
Every password is hashed using **bcrypt** with 12 rounds. Even if the database leaks, passwords cannot be reversed.

### 2. AES-256 Encryption
Sensitive fields (like phone numbers) are encrypted using **AES-256** before being stored. They're decrypted only when needed.

### 3. JWT Authentication
Every API request (except login/register) requires a valid **JSON Web Token**. Tokens expire after 30 days.

### 4. Role-Based Access Control
Users can only perform actions allowed for their role. Students can't resolve incidents. Security can't manage users.

### 5. Parameterized SQL Queries
All database queries use **parameterized statements** to prevent SQL injection.

---

## 📁 Folder Structure
