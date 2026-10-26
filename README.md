# 🛡️ Campus Shield

> A full-stack campus safety and incident management system for students, security staff, and administrators.

![Status](https://img.shields.io/badge/status-active-success)
![Node](https://img.shields.io/badge/node-%3E%3D18-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 📖 What is Campus Shield?

Campus Shield is a web-based safety platform that helps students report incidents, trigger SOS emergencies, and stay informed about campus safety — all in real time.

**Built for:** College campuses, hostels, and educational institutions.

---

## ✨ Features

- 🚨 **One-tap SOS** — Instantly alerts campus security with your location
- 📝 **Incident Reporting** — Report bullying, theft, fire, medical, harassment with photos
- 📊 **Live Dashboard** — Real-time incident statistics and analytics
- 🔔 **Smart Alerts** — Get notified about incidents near you
- 🗺️ **Live Map** — See active incidents across campus
- 👤 **Role-Based Access** — Student, Security, and Admin roles
- 🔐 **Secure by Default** — JWT auth, bcrypt passwords, AES-256 encryption

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend | Node.js, Express.js |
| Database | PostgreSQL 16 |
| Authentication | JWT (JSON Web Tokens) |
| Encryption | bcrypt (passwords) + AES-256 (sensitive data) |
| File Uploads | Multer |

---

## 🚀 Quick Start

**For complete setup instructions, see [`docs/02-SETUP.md`](docs/02-SETUP.md).**

```bash
# 1. Clone or extract the project
cd campus-shield/backend

# 2. Install dependencies
npm install

# 3. Create database tables
npm run setup-db

# 4. Load demo data
npm run seed

# 5. Start the server
npm start