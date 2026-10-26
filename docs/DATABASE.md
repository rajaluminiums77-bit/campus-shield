# Database Guide

This document explains what data is in the database and how to view, add, edit, or delete it.

---

## Database Info

Name: campus_shield
Type: PostgreSQL 16
Tables: 6

Tables:
- users
- incidents
- incident_attachments
- incident_updates
- alerts
- alert_reads

---

## Demo Data Overview

The demo data is loaded by running `npm run seed`.

It contains:

- 4 users
- 6 incidents
- 3 alerts

Here is the full list.

---

## Users (4)

| ID | Name | Email | Password | Role | Department |
|----|------|-------|----------|------|------------|
| 1 | Alex Johnson | alex.johnson@campus.edu | password123 | student | Computer Science |
| 2 | Sarah Williams | sarah.williams@campus.edu | password123 | student | Electrical Engineering |
| 3 | Mike Chen | mike.chen@campus.edu | password123 | security | Campus Security |
| 4 | Admin User | admin@campus.edu | admin123 | admin | Administration |

Extra details:

Alex Johnson
  Student ID: CS-2024-078
  Phone: +1 (555) 234-5678 (encrypted in DB)
  Room: Block C, Room 204

Sarah Williams
  Student ID: EE-2024-112
  Phone: +1 (555) 345-6789 (encrypted in DB)
  Room: Block A, Room 315

Mike Chen
  Student ID: SEC-001
  Phone: +1 (555) 456-7890 (encrypted in DB)
  Room: Security Office

Admin User
  Student ID: ADM-001
  Phone: +1 (555) 567-8901 (encrypted in DB)
  Room: Admin Block

Note: passwords are stored as bcrypt hashes. You cannot read them. They are listed above in plain text only for demo purposes.

---

## Incidents (6)

| ID | Title | Type | Priority | Status | Reported By |
|----|-------|------|----------|--------|-------------|
| 1 | Bullying near Block C | Bullying | Medium | In Progress | Alex Johnson |
| 2 | Fire alarm triggered at Block A | Fire | Critical | Resolved | Sarah Williams |
| 3 | Theft in parking lot | Theft | High | In Progress | Sarah Williams |
| 4 | Medical emergency at Gym | Medical Emergency | Critical | Resolved | Alex Johnson |
| 5 | Suspicious person near Gate 2 | Suspicious Person | Medium | Active | Alex Johnson |
| 6 | Harassment reported in library | Harassment | High | Resolved | Sarah Williams |

Full details:

Incident 1
  Title: Bullying near Block C
  Type: Bullying
  Location: Block C, near cafeteria
  Description: A group of seniors were verbally harassing a junior near the cafeteria entrance.
  Priority: Medium
  Status: In Progress
  Reported by: Alex Johnson (user 1)
  Assigned to: Mike Chen (user 3)

Incident 2
  Title: Fire alarm triggered at Block A
  Type: Fire
  Location: Block A, 3rd Floor
  Description: Fire alarm triggered. Smoke detected near laboratory area.
  Priority: Critical
  Status: Resolved
  Response time: 3 minutes
  Reported by: Sarah Williams (user 2)
  Assigned to: Mike Chen (user 3)

Incident 3
  Title: Theft in parking lot
  Type: Theft
  Location: Main Parking Lot, Zone B
  Description: Bike stolen from parking lot. Lock was broken.
  Priority: High
  Status: In Progress
  Reported by: Sarah Williams (user 2)
  Assigned to: Mike Chen (user 3)

Incident 4
  Title: Medical emergency at Gym
  Type: Medical Emergency
  Location: Campus Gymnasium
  Description: Student fainted during workout. Ambulance called immediately.
  Priority: Critical
  Status: Resolved
  Response time: 4 minutes
  Reported by: Alex Johnson (user 1)
  Assigned to: Mike Chen (user 3)

Incident 5
  Title: Suspicious person near Gate 2
  Type: Suspicious Person
  Location: Gate 2, near parking
  Description: Unidentified person loitering near gate 2 for over an hour.
  Priority: Medium
  Status: Active
  Reported by: Alex Johnson (user 1)
  Assigned to: none

Incident 6
  Title: Harassment reported in library
  Type: Harassment
  Location: Central Library, 2nd floor
  Description: Student reported verbal harassment by another student.
  Priority: High
  Status: Resolved
  Response time: 6 minutes
  Reported by: Sarah Williams (user 2)
  Assigned to: Mike Chen (user 3)

---

## Alerts (3)

| ID | Title | Severity | Target Role | Linked Incident |
|----|-------|----------|-------------|-----------------|
| 1 | Fire alarm triggered | Critical | security | Incident 2 |
| 2 | Medical emergency | Critical | security | Incident 4 |
| 3 | Suspicious activity | Medium | security | Incident 5 |

---

## How to Open the Database

There are two ways to open the database.

### Method 1 - psql (command line)

Open PowerShell and run:

```
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -d campus_shield
```

Enter your PostgreSQL password.

You will see:

```
campus_shield=#
```

Now you can run SQL commands.

To exit, type:

```
\q
```

### Method 2 - pgAdmin (visual)

If you installed pgAdmin along with PostgreSQL:

1. Open pgAdmin from Start Menu
2. In the left sidebar, expand Servers
3. Click on PostgreSQL 16
4. Enter your password
5. Expand Databases
6. Click on campus_shield
7. Expand Schemas, then Tables
8. Right-click any table, choose View/Edit Data

You can now see and edit rows in a spreadsheet-like view.

---

## How to View Data

### List all users

```
SELECT id, name, email, role, department FROM users;
```

### List all incidents

```
SELECT id, title, type, priority, status FROM incidents;
```

### List all alerts

```
SELECT id, title, severity, target_role FROM alerts;
```

### Count incidents by status

```
SELECT status, COUNT(*) FROM incidents GROUP BY status;
```

### Count incidents by type

```
SELECT type, COUNT(*) FROM incidents GROUP BY type;
```

### Show full detail of one incident

```
SELECT * FROM incidents WHERE id = 1;
```

---

## How to Add Data

### Add a new user

```
INSERT INTO users (name, email, password, role, student_id, department, room)
VALUES ('Test User', 'test@campus.edu', 'placeholder', 'student', 'CS-2024-999', 'Computer Science', 'Block D, Room 501');
```

Note: the password above is a placeholder. In the app, passwords are hashed with bcrypt before storing. Do not insert real users this way. Use the /api/auth/register endpoint instead.

### Add a new incident

```
INSERT INTO incidents (title, type, location, description, priority, status, reported_by, reporter_name)
VALUES ('Test incident', 'Theft', 'Test location', 'Testing', 'High', 'Active', 1, 'Alex Johnson');
```

### Add a new alert

```
INSERT INTO alerts (title, message, type, severity, target_role)
VALUES ('Test alert', 'This is a test', 'System', 'Low', 'all');
```

---

## How to Edit Data

### Change a user's role

```
UPDATE users SET role = 'security' WHERE email = 'test@campus.edu';
```

### Change an incident's status

```
UPDATE incidents SET status = 'Resolved' WHERE id = 5;
```

### Change an incident's priority

```
UPDATE incidents SET priority = 'Critical' WHERE id = 3;
```

### Change a user's department

```
UPDATE users SET department = 'Mechanical Engineering' WHERE id = 1;
```

### Mark an incident as resolved with response time

```
UPDATE incidents
SET status = 'Resolved',
    resolved_at = NOW(),
    response_time = 15
WHERE id = 5;
```

---

## How to Delete Data

### Delete one incident

```
DELETE FROM incidents WHERE id = 6;
```

### Delete one user

```
DELETE FROM users WHERE email = 'test@campus.edu';
```

### Delete all incidents

```
DELETE FROM incidents;
```

### Delete all data (fresh start)

```
TRUNCATE alert_reads, alerts, incident_updates, incident_attachments, incidents, users RESTART IDENTITY CASCADE;
```

Note: TRUNCATE removes all rows and resets IDs back to 1.

---

## How to Reset the Database

If you want to start fresh with the original demo data:

Step 1: Stop the server with Ctrl + C

Step 2: In the backend folder, run:

```
npm run setup-db
```

This drops all tables and creates them again.

Step 3: Run:

```
npm run seed
```

This loads the original 4 users, 6 incidents, and 3 alerts.

Step 4: Start the server:

```
npm start
```

The database is now back to its original demo state.

---

## Switching to Real Data

The demo data is only for testing.

To use the app with real users:

Step 1: Do not run `npm run seed` again. It will wipe real data.

Step 2: Users create accounts through the app's register feature.

Step 3: Incidents are reported through the app's report form.

Step 4: SOS incidents are created when the SOS button is pressed.

Step 5: Alerts are generated automatically by the backend.

To remove the demo data but keep the tables:

```
TRUNCATE alert_reads, alerts, incident_updates, incident_attachments, incidents, users RESTART IDENTITY CASCADE;
```

The tables stay, but all rows are deleted. New users can then register normally.

---

## Table Structure Reference

### users

| Column | Type | Notes |
|--------|------|-------|
| id | serial | primary key |
| name | varchar | required |
| email | varchar | unique, required |
| password | varchar | bcrypt hash |
| role | varchar | student, security, admin |
| student_id | varchar | optional |
| phone | varchar | AES-256 encrypted |
| department | varchar | optional |
| room | varchar | optional |
| is_active | boolean | default true |
| last_login | timestamp | updated on login |
| joined_at | timestamp | default now |
| created_at | timestamp | default now |

### incidents

| Column | Type | Notes |
|--------|------|-------|
| id | serial | primary key |
| title | varchar | required |
| type | varchar | required |
| location | varchar | required |
| description | text | required |
| priority | varchar | auto-assigned by type |
| status | varchar | default Active |
| reported_by | integer | foreign key to users.id |
| reporter_name | varchar | cached name |
| assigned_to | integer | foreign key to users.id |
| lat | decimal | optional |
| lng | decimal | optional |
| response_time | integer | minutes to resolve |
| resolved_at | timestamp | set when resolved |
| created_at | timestamp | default now |
| updated_at | timestamp | updated on change |

### alerts

| Column | Type | Notes |
|--------|------|-------|
| id | serial | primary key |
| title | varchar | required |
| message | text | required |
| type | varchar | SOS, Incident, System, Security |
| severity | varchar | Critical, High, Medium, Low |
| incident_id | integer | foreign key to incidents.id |
| target_role | varchar | all, student, security, admin |
| created_at | timestamp | default now |

---

## Priority and Status Values

Valid incident types:
Bullying, Theft, Fire, Medical Emergency, Ragging, Suspicious Person, Harassment, Lost Item, Other

Valid priorities:
Critical, High, Medium, Low

Valid statuses:
Active, In Progress, Resolved, Closed

Valid user roles:
student, security, admin

Valid alert target roles:
all, student, security, admin

---

Campus Shield 2026