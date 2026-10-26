# Setup Guide

Follow these steps in order to get Campus Shield running on your computer.

Total time: about 15 minutes (one-time setup)

---

## What You Need

Before starting, make sure you have:

- Node.js (version 18 or higher) - runs the backend server
- PostgreSQL 16 - stores all data
- A web browser - Chrome, Edge, or Firefox
- A text editor - VS Code recommended

Download links:

- Node.js: https://nodejs.org
- PostgreSQL: https://www.postgresql.org/download
- VS Code: https://code.visualstudio.com

---

## Step 1 - Install Node.js

1. Go to https://nodejs.org
2. Download the LTS version (green button on the page)
3. Run the installer and click Next through all screens
4. Restart your computer after installation

Verify installation:

Open PowerShell (Windows) or Terminal (Mac/Linux) and run:

```
node -v
npm -v
```

You should see version numbers like v20.11.0 and 10.2.4.

If you see version numbers, Node.js is ready.

---

## Step 2 - Install PostgreSQL

1. Go to https://www.postgresql.org/download
2. Choose your operating system (Windows, Mac, or Linux)
3. Download the installer
   For Windows: choose "Interactive installer by EDB"
4. Run the installer and follow these settings:
   - Password for postgres user: choose a password (example: admin@123)
     Remember this password. You will need it later.
   - Port: leave as 5432 (default)
   - Locale: leave default
5. Click Next through all screens and click Install

Verify installation:

Open PowerShell and run:

```
Get-Service -Name postgresql*
```

You should see a line with Status "Running" and Name "postgresql-x64-16".

If the status is Running, PostgreSQL is ready.

---

## Step 3 - Extract the Project

1. Extract the project zip file to a folder. Example:

```
C:\Projects\campus-shield\
```

2. Open the folder. You should see:

```
campus-shield/
  backend/
  docs/
  index.html
  style.css
  script.js
  api.js
  README.md
```

---

## Step 4 - Create the Database

Open PowerShell and run:

```
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres
```

It will ask for the password. Type the password you set in Step 2. Nothing shows on screen while typing. That is normal. Press Enter.

You will see this prompt:

```
postgres=#
```

Now create the database:

```
CREATE DATABASE campus_shield;
```

You should see:

```
CREATE DATABASE
```

Exit the database:

```
\q
```

The database is now created.

---

## Step 5 - Install Backend Dependencies

1. Open VS Code
2. Click File, then Open Folder
3. Select the folder: C:\Projects\campus-shield\backend
4. Open the terminal in VS Code by pressing Ctrl and the backtick key (`)

In the terminal, run:

```
npm install
```

Wait about 1 minute. You will see:

```
added 119 packages
found 0 vulnerabilities
```

Dependencies are installed.

---

## Step 6 - Create the .env File

In VS Code, inside the backend folder, create a new file named exactly:

```
.env
```

Paste this content:

```
PORT=5000
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD_HERE@localhost:5432/campus_shield
JWT_SECRET=campus_shield_jwt_secret_key_2024
ENCRYPTION_KEY=campus_shield_aes_256_key_2024
NODE_ENV=development
```

Replace YOUR_PASSWORD_HERE with your PostgreSQL password from Step 2.

Example: if your password is admin@123, the line becomes:

```
DATABASE_URL=postgresql://postgres:admin%40123@localhost:5432/campus_shield
```

Note: if your password contains the @ symbol, replace it with %40.
Same for other special characters: : becomes %3A, / becomes %2F, # becomes %23.

Save the file with Ctrl + S.

---

## Step 7 - Create Tables and Load Demo Data

In the VS Code terminal (still inside the backend folder), run:

```
npm run setup-db
```

You should see:

```
Setting up database...
Connected to PostgreSQL
Schema created
Database setup complete!
```

Then run:

```
npm run seed
```

You should see:

```
Seeding database...
Created 4 users
Created 6 incidents
Created 3 alerts
Database seeded successfully!
```

The database now has demo data.

---

## Step 8 - Start the Server

In the same terminal, run:

```
npm start
```

You should see:

```
CAMPUS SHIELD - Backend Running
Server:     http://localhost:5000
API:        http://localhost:5000/api/health
Frontend:   http://localhost:5000
Database:   campus_shield
```

Important: Do not close this terminal. The server keeps running here.

To stop the server, press Ctrl + C in the terminal.

---

## Step 9 - Open in Browser

Open Chrome, Edge, or Firefox and go to:

```
http://localhost:5000
```

You should see the Campus Shield login screen.

---

## Step 10 - Login with Demo Account

Use any of these accounts:

Student:
  Email: alex.johnson@campus.edu
  Password: password123

Student 2:
  Email: sarah.williams@campus.edu
  Password: password123

Security:
  Email: mike.chen@campus.edu
  Password: password123

Admin:
  Email: admin@campus.edu
  Password: admin123

Click Login.

You will see the dashboard with real data from the database.

Setup is complete.

---

## Daily Use

Once setup is done, running the project is easy.

To start:

1. Open VS Code and open the backend folder
2. Open the terminal with Ctrl and backtick (`)
3. Run:

```
npm start
```

4. Open browser and go to http://localhost:5000

To stop:

Press Ctrl + C in the terminal.

---

## Quick Reference

All commands run in the backend folder:

Install dependencies      npm install
Create tables             npm run setup-db
Load demo data            npm run seed
Start server              npm start
Stop server               Ctrl + C
Reset database            npm run setup-db then npm run seed

---

## Common Issues

Port 5000 already in use
  Change PORT=5000 to PORT=5001 in the .env file.

Database connection failed
  Check the password in .env. Make sure special characters are encoded.

npm is not recognized
  Restart your computer after installing Node.js.

Page will not load
  Make sure npm start is still running in the terminal.

For more help, see TROUBLESHOOTING.md.

---

## Checklist

Before saying "it works", confirm:

- node -v shows a version
- PostgreSQL service is Running
- campus_shield database exists
- npm install completed
- .env file created with correct password
- npm run setup-db succeeded
- npm run seed succeeded
- npm start shows the banner
- http://localhost:5000 loads
- Login works with a demo account

All checked? Setup is done.

---

## Still Stuck?

1. Read TROUBLESHOOTING.md
2. Check the terminal for error messages
3. Open browser DevTools with F12 and check the Console tab

---

Campus Shield 2026