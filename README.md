# 🎓 Alumni Intelligence Platform

A full-stack web application that transforms traditional alumni listings into a **dynamic intelligence system** with blind bidding, analytics, and secure API access.

---

## 📖 About

The **Alumni Intelligence Platform** is developed to replace static alumni directories with a **data-driven, interactive system**.

It allows:
- Alumni to create professional profiles
- A blind bidding system to select featured alumni
- Secure API access for external clients
- A React-based analytics dashboard

---

## ✨ Core Features

### 🔐 Authentication System
- Email-based registration (university domain validation)
- Secure login using JWT tokens
- Email verification with expiry
- Password reset functionality

---

### 👤 Alumni Profile Management
- Personal details and biography
- Degrees, certifications, courses, licenses
- Employment history
- LinkedIn profile integration
- Profile image support

---

### 💰 Blind Bidding System
- Place bids without seeing others (blind bidding)
- View bid status (winning / losing)
- Update bids (increase only)
- Cancel bids
- Monthly win limit enforcement (3 or 4)
- Automatic status recalculation

---

### 📊 Analytics Dashboard (Frontend)
- Built using React + Vite
- Filter alumni by:
  - Programme
  - Graduation year
  - Industry sector
- Export alumni data to CSV
- Responsive UI

---

## 🏗 System Architecture

Frontend (React + Vite)
↓
REST API (Express.js)
↓
Controllers (Business Logic)
↓
Sequelize ORM
↓
MySQL Database




---

## 🛠 Technology Stack

| Layer | Technology |
|------|-----------|
| Backend | Node.js, Express.js |
| Database | MySQL |
| ORM | Sequelize |
| Frontend | React (Vite) |
| Authentication | JWT |
| Email | Nodemailer (Mailtrap) |
| Security | Helmet, Rate Limiting |

---

## 🔐 Security Features

- Password hashing using bcrypt
- JWT-based authentication
- Input validation & sanitization
- Rate limiting for API endpoints
- Secure headers using Helmet.js
- Token expiry (verification & reset)

---

## 🔑 API Key System

Allows secure access for external applications.

### Features:
- Generate API keys per user
- Assign client types (e.g., dashboard)
- Track usage (timestamp + count)
- Revoke keys
- Middleware-based protection

---

## 💸 Blind Bidding System

### Logic:
- Users bid for **tomorrow’s slot**
- Bidding closes at **6:00 PM**
- Highest bid becomes **winning**
- Others are **losing**

### Rules:
- Only one active bid per user per day
- Bid updates must be higher
- Monthly win limits enforced
- Bid amounts are hidden (blind system)

---

## ⚙️ Environment Variables

Create a `.env` file in backend:

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASS=yourpassword
DB_NAME=alumni_db

JWT_SECRET=your_secret_key

EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=587
EMAIL_USER=your_user
EMAIL_PASS=your_pass

APP_URL=http://localhost:3000
