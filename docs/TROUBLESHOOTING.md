# Troubleshooting

Common problems and how to fix them.

If something is not working, find the error message below and follow the fix.

---

## Server will not start

### Error: "EADDRINUSE: address already in use :::5000"

Something else is using port 5000.

Fix:

1. Open the backend/.env file
2. Change the line PORT=5000 to PORT=5001
3. Save the file
4. Run npm start again
5. Open browser at http://localhost:5001

Alternative fix (find what is using port 5000):

Open PowerShell as Administrator and run:

```
netstat -ano | findstr :5000
```

Note the PID (last number) and run:

```
taskkill /PID <PID> /F
```

Replace <PID> with the number.

---

### Error: "Cannot find module 'express'"

Dependencies are not installed.

Fix:

1. Make sure you are inside the backend folder in the terminal
2. Run:

```
npm install
```

3. Then run npm start

---

### Error: "Cannot find module './config/database'"

A file is missing or the folder structure is wrong.

Fix:

Check that the backend folder contains:

- config/database.js
- db/schema.sql
- db/setup.js
- db/seed.js
- middleware/auth.js
- routes/auth.js
- routes/incidents.js
- routes/alerts.js
- utils/encryption.js
- server.js
- package.json
- .env

If any file is missing, the project was not extracted correctly. Extract the zip again.

---

### Error: "npm is not recognized"

Node.js is not installed or not in PATH.

Fix:

1. Install Node.js from https://nodejs.org (LTS version)
2. Restart your computer
3. Open PowerShell and run node -v to confirm

---

## Database connection problems

### Error: "connect ECONNREFUSED 127.0.0.1:5432"

PostgreSQL is not running.

Fix on Windows:

Open PowerShell as Administrator and run:

```
Get-Service -Name postgresql*
```

If the Status is Stopped:

```
Start-Service postgresql-x64-16
```

Fix on Mac:

```
brew services start postgresql
```

Fix on Linux:

```
sudo systemctl start postgresql
```

Then run npm start again.

---

### Error: "password authentication failed for user postgres"

The password in .env is wrong.

Fix:

1. Open backend/.env
2. Check the DATABASE_URL line
3. Make sure the password is correct

Example:

If your password is admin@123, the line must be:

```
DATABASE_URL=postgresql://postgres:admin%40123@localhost:5432/campus_shield
```

Note: the @ symbol inside the password must be written as %40.

Other special characters:
- : becomes %3A
- / becomes %2F
- # becomes %23
- ? becomes %3F

---

### Error: "database campus_shield does not exist"

The database was not created.

Fix:

Open PowerShell and run:

```
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres
```

Enter your password. Then run:

```
CREATE DATABASE campus_shield;
```

You should see CREATE DATABASE. Then exit:

```
\q
```

Run npm start again.

---

### Error: "relation users does not exist"

Tables were not created.

Fix:

In the backend folder, run:

```
npm run setup-db
```

You should see Schema created. Then run:

```
npm run seed
```

You should see Database seeded successfully.

---

## Login problems

### Error: "Invalid credentials"

Email or password is wrong.

Fix:

Check that you are using one of the demo accounts:

Student: alex.johnson@campus.edu / password123
Student: sarah.williams@campus.edu / password123
Security: mike.chen@campus.edu / password123
Admin: admin@campus.edu / admin123

If you created your own account, make sure the email is spelled exactly right.

Note: passwords are case-sensitive.

---

### Login screen does not appear

Fix:

1. Open browser DevTools with F12
2. Go to Console tab
3. Look for red error messages
4. Common causes:
   - api.js not loaded (check Network tab for 404 on api.js)
   - script.js has a syntax error
   - Browser cached old files

Fix for caching:

Press Ctrl + Shift + R to hard refresh.

---

### "Network error. Is the server running?"

The backend is not reachable.

Fix:

1. Check the VS Code terminal. Is npm start still running?
2. If not, run npm start again
3. Check that the URL is http://localhost:5000 (not https)
4. Check that no firewall is blocking port 5000

---

### Login works but dashboard shows "0" and "87"

Dashboard is showing hardcoded values instead of real data.

Fix:

1. Open browser DevTools with F12
2. Go to Console tab
3. Look for errors related to fetch or API

Common causes:
- The token is missing or expired
- api.js not loaded
- server.js not running

Fix:

1. Clear localStorage: open Console and run:

```
localStorage.clear();
location.reload();
```

2. Login again

---

## Frontend problems

### Page is blank or unstyled

Fix:

1. Check that style.css exists in the root folder
2. Open browser DevTools with F12
3. Go to Network tab and reload the page
4. Look for 404 errors on CSS or JS files

If style.css returns 404, the file is missing or in the wrong folder.

---

### Login form appears twice

Fix:

The index.html file has a duplicate login modal.

1. Open index.html in VS Code
2. Press Ctrl + F and search for: loginModal
3. There should be only one match with id="loginModal"
4. If there are two, delete the second one
5. Save the file and refresh the browser

---

### "Campus Shield loaded" prints twice in the console

Fix:

script.js is loaded twice in index.html.

1. Open index.html
2. Press Ctrl + F and search for: script.js
3. There should be one line like:

```
<script src="script.js"></script>
```

4. If there are two, delete the duplicate line
5. Save the file and refresh

---

### SOS button does not work

Fix:

1. Open browser DevTools with F12
2. Go to Console tab
3. Click the SOS button
4. Look for red errors

Common causes:
- Not logged in (token missing)
- Server not running

Fix:

1. Check that you are logged in (nav shows your name)
2. Check that the server is running
3. Refresh and try again

---

### Report form does not submit

Fix:

1. Make sure all fields are filled:
   - Title
   - Incident type (not "Select incident type")
   - Location
   - Description
2. Check browser Console for errors
3. Check terminal for backend errors

If you uploaded files, make sure they are under 10 MB each and no more than 5 files.

---

## Port and process problems

### How to check what is running on port 5000

Open PowerShell:

```
netstat -ano | findstr :5000
```

The last number is the process ID. To kill it:

```
taskkill /PID <PID> /F
```

Replace <PID> with the number.

---

### How to check what is running on port 5432 (PostgreSQL)

```
netstat -ano | findstr :5432
```

If nothing shows, PostgreSQL is not running. See "PostgreSQL is not running" above.

---

## Reset and recovery

### How to reset everything

If you want a clean start:

1. Stop the server with Ctrl + C
2. In the backend folder, run:

```
npm run setup-db
```

This drops all tables and recreates them.

3. Then run:

```
npm run seed
```

This loads fresh demo data.

4. Start the server:

```
npm start
```

---

### How to completely remove the project

1. Stop the server with Ctrl + C
2. Delete the folder C:\Projects\campus-shield
3. Nothing else was installed on your system
4. To remove PostgreSQL later, uninstall it from Windows Settings

---

## Browser-specific issues

### Chrome shows "Your connection is not private"

You are accessing https:// instead of http://

Fix: use http://localhost:5000 (not https).

---

### Firefox blocks the request

Firefox sometimes blocks requests to localhost.

Fix:

1. Open about:config in Firefox
2. Search for: network.file.disable_unc_paths
3. Set it to false

Or simply use Chrome or Edge.

---

## Still not working?

If nothing above helped:

1. Check the terminal where npm start is running. Look at the last error.
2. Open browser DevTools with F12. Check the Console tab for red errors.
3. Check the Network tab to see which request failed and its status code.

Common status codes:
- 401 - Not logged in or token expired. Log out and log in again.
- 403 - Your role does not have permission for this action.
- 404 - Wrong URL or endpoint does not exist.
- 500 - Server error. Check the terminal for the full error message.

Copy the exact error message and search for it online, or ask for help with the full error.

---

## Quick checklist when something breaks

1. Is the server running? Check the terminal for the CAMPUS SHIELD banner.
2. Is PostgreSQL running? Run Get-Service -Name postgresql*
3. Are you logged in? Check the nav bar shows your name, not "Student".
4. Any red errors in browser Console (F12)?
5. Any errors in the VS Code terminal?
6. Try restarting: Ctrl + C in terminal, then npm start again.
7. Try a hard refresh in browser: Ctrl + Shift + R.

Most problems are one of these.

---

Campus Shield 2026