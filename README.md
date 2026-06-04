# 🎟️ EventSphere — Smart Event & Ticket Booking Platform

A production-ready **REST API** backend for a full-featured event management and ticket booking platform. Built with **Node.js**, **Express**, and **MongoDB**, with integrated **Razorpay** payment processing and **OTP-based email verification**.

🌐 **Live API:** https://backend-event-management-anh2.onrender.com

---

## 🚀 Features

- **Role-based access control** — Three distinct roles: `admin`, `organizer`, and `user`
- **JWT Authentication** — Secure token-based auth with configurable expiry
- **OTP Email Verification** — Email OTP for signup and password reset via Nodemailer
- **Event Management** — Organizers can create, update, and delete events with image uploads
- **Admin Approval Workflow** — Admins approve/reject events before they go public
- **Ticket Booking** — Users browse approved events and book tickets
- **Razorpay Payment Integration** — Full payment flow: order creation → signature verification
- **Dashboard APIs** — Role-specific dashboards with stats and summaries
- **Global Error Handling** — Centralised error middleware with structured JSON responses

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js (ES Modules) |
| Framework | Express.js |
| Database | MongoDB + Mongoose |
| Authentication | JSON Web Tokens (JWT) |
| File Uploads | Multer |
| Email | Nodemailer (Gmail SMTP) |
| Payments | Razorpay |
| Deployment | Render |

---

## 📁 Project Structure

```
├── config/
│   ├── db.js            # MongoDB connection
│   └── multer.js        # Multer upload configuration
├── controllers/
│   ├── authController.js
│   ├── adminController.js
│   ├── eventController.js
│   ├── bookingController.js
│   ├── paymentController.js
│   └── dashboardController.js
├── middlewares/
│   ├── auth.js          # JWT authentication middleware
│   ├── role.js          # Role-based authorization middleware
│   └── errorHandler.js  # Global error handler
├── models/
│   ├── User.js
│   ├── Event.js
│   ├── Booking.js
│   ├── Payment.js
│   └── OTP.js
├── routes/
│   ├── authRoutes.js
│   ├── adminRoutes.js
│   ├── eventRoutes.js
│   ├── bookingRoutes.js
│   ├── paymentRoutes.js
│   └── dashboardRoutes.js
├── services/
├── seedAdmin.js         # Seeds initial admin user
├── server.js            # App entry point
└── package.json
```

---

## 📡 API Endpoints

### 🔐 Auth — `/api/auth`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/signup` | Register a new user | Public |
| POST | `/login` | Login (all roles) | Public |
| POST | `/verify-otp` | Verify email OTP after signup | Public |
| POST | `/resend-otp` | Resend signup OTP | Public |
| POST | `/forgot-password` | Request password reset OTP | Public |
| POST | `/verify-password-otp` | Verify password reset OTP | Public |
| POST | `/resend-password-otp` | Resend password reset OTP | Public |
| POST | `/reset-password` | Set new password | Public |

---

### 🎭 Events — `/api/events`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/approved` | List all approved events | Public |
| GET | `/:id` | Get single event detail | Public |
| POST | `/` | Create a new event (with image) | Organizer |
| GET | `/organizer/my-events` | List organizer's own events | Organizer |
| PUT | `/:id` | Update event (with image) | Organizer |
| DELETE | `/:id` | Delete event | Organizer |
| GET | `/admin/all` | List all events | Admin |
| PATCH | `/:id/approve` | Approve an event | Admin |
| PATCH | `/:id/reject` | Reject an event | Admin |

---

### 🎟️ Bookings — `/api/bookings`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/` | Book tickets for an event | User |
| GET | `/` | Get user's booking history | User |
| GET | `/:id` | Get single booking detail | User / Organizer |
| PATCH | `/:id/cancel` | Cancel a booking | User |
| GET | `/organizer/bookings` | View bookings for organizer's events | Organizer |

---

### 💳 Payments — `/api/payments`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/create-order` | Create a Razorpay payment order | User |
| POST | `/verify` | Verify payment signature | User |
| GET | `/booking/:bookingId` | Get payment details for a booking | User / Organizer |

---

### 🛡️ Admin — `/api/admin`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/organizer` | Create a new organizer account | Admin |
| GET | `/organizers` | List all organizers | Admin |
| GET | `/organizer/:id` | Get single organizer | Admin |
| DELETE | `/organizer/:id` | Delete an organizer | Admin |

---

### 📊 Dashboard — `/api/dashboard`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/admin` | Admin stats overview | Admin |
| GET | `/admin/users` | List all users | Admin |
| GET | `/organizer` | Organizer stats & events | Organizer |
| GET | `/user` | User booking summary | User |

---

## ⚙️ Local Setup

### Prerequisites
- Node.js v18+
- MongoDB (local or [Atlas](https://cloud.mongodb.com))

### 1. Clone the repository
```bash
git clone https://github.com/marsion77/Backend-Event-Management.git
cd Backend-Event-Management
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root directory:

```env
# Server
PORT=4000
NODE_ENV=development

# MongoDB
MONGO_URI=mongodb://localhost:27017/eventsphere

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# Email (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
FROM_EMAIL=your_email@gmail.com

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Admin Seed
ADMIN_NAME=Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin@123
ADMIN_PHONE=9999999999
```

### 4. Seed the admin user
```bash
npm run seed
```

### 5. Start the development server
```bash
npm run dev
```

The API will be running at `http://localhost:4000`

---

## 🔑 Authentication

This API uses **JWT Bearer Token** authentication.

Include the token in the `Authorization` header for all protected routes:
```
Authorization: Bearer <your_token>
```

Tokens are issued on login and expire based on `JWT_EXPIRES_IN`.

---

## 👥 User Roles

| Role | Capabilities |
|------|-------------|
| `admin` | Manage organizers, approve/reject events, view all dashboards |
| `organizer` | Create and manage events, view bookings for their events |
| `user` | Browse events, book tickets, make payments, manage own bookings |

> **Note:** Admin accounts are seeded via `npm run seed`. Organizer accounts are created by the admin. Users self-register via `/api/auth/signup`.

---

## 🌐 Deployment

This project is deployed on **Render** with the following configuration:

- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Environment:** All secrets configured via Render's Environment Variables dashboard

Live URL: https://backend-event-management-anh2.onrender.com

---

## 📄 License

ISC
