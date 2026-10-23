# 🏥 Hospital Management & Telemedicine Mobile Platform

A modern, full-stack hospital management and patient appointment mobile application built with **React Native (Expo SDK 54, React 19)**, **Node.js (Express 5)**, and **MongoDB (Mongoose 9)**.

---

## 🌟 Key Features

- **Multi-Role Access Control**: Tailored workflows and role-specific dashboards for **Patients**, **Doctors**, **Receptionists**, and **Admins**.
- **Real-Time Appointment Scheduling**: Book, view, reschedule, and manage doctor consultations with departmental filtering.
- **Secure Authentication & Token Management**: JWT-based access and refresh tokens stored safely with `expo-secure-store`.
- **In-App Messaging & Consultation**: Chat functionality allowing direct communication between patients and hospital practitioners.
- **Prescription & Billing Overview**: Access digital prescriptions and track medical fee payments directly inside the app.
- **Dynamic LAN Discovery**: Automatic Metro IP resolution and configurable environment variables for zero-friction local mobile device testing over Wi-Fi.
- **Comprehensive Audit Logging & Rate Limiting**: Security-focused backend with Helmet headers, brute-force login limiter, and audit tracking.

---

## 🏗️ Project Architecture & Directory Structure

```text
Hospital-App/
├── .env                      # Expo frontend environment variables (API URL)
├── .env.example              # Template for frontend environment variables
├── App.js                    # Root React Native application entry
├── app.json                  # Expo project configuration
├── babel.config.js           # Babel preset config
├── index.js                  # App registry entry point
├── package.json              # Frontend dependencies and root development scripts
├── tsconfig.json             # TypeScript configuration for Expo
│
├── backend/                  # Node.js + Express backend service
│   ├── .env                  # Backend environment secrets (PORT, MONGODB_URI, JWT_SECRET)
│   ├── .env.example          # Template for backend secrets
│   ├── package.json          # Backend dependencies & scripts
│   └── src/
│       ├── app.js            # Express app middleware, security, and route mounts
│       ├── server.js         # HTTP server initialization and database bootstrapping
│       ├── controllers/      # Business logic (auth, appointments)
│       ├── middleware/       # JWT auth verification, rate limiting
│       ├── models/           # Mongoose schemas (User, Appointment, Department, Message, AuditLog, RefreshToken)
│       ├── routes/           # REST endpoints (/auth, /users, /appointments, /departments, /chat)
│       └── utils/            # DB connection, seed scripts, audit utilities
│
└── src/                      # React Native frontend source
    ├── components/           # Reusable UI elements (SoftButton, StatCard, StatusPill, TabChip)
    ├── context/              # Global state providers (AuthContext, AppDataContext)
    ├── data/                 # Fallback mockup datasets (departments, doctors, users)
    ├── navigation/           # React Navigation stacks & bottom tabs (RootNavigator, AppTabs, AuthStack, ChatStack)
    ├── screens/
    │   ├── admin/            # Admin screens (UsersScreen, SettingsScreen, ReportsScreen)
    │   ├── auth/             # Authentication screens (AuthScreen, SignupDetailsScreen, ForgotPasswordScreen)
    │   ├── chat/             # Messaging screens (ChatListScreen, ChatRoomScreen)
    │   ├── role/             # Role-specific views (DoctorHomeScreen, ReceptionHomeScreen, PaymentsScreen, etc.)
    │   └── tabs/             # Core tabs (HomeScreen, FindDoctorScreen, BookAppointmentScreen, ProfileScreen)
    ├── services/             # API HTTP client with auto IP fallback and SecureStore storage
    └── utils/                # UI helpers and formatters
```

---

## 📋 Prerequisites

Before setting up the project, ensure you have the following installed:

| Tool | Recommended Version | Description |
| :--- | :--- | :--- |
| **Node.js** | `>= 20.x` (Tested on `v24.11.1`) | JavaScript runtime |
| **npm** | `>= 10.x` (Tested on `11.14.1`) | Package manager |
| **Git** | Any recent version | Version control |
| **Expo Go** | Latest (from App Store or Google Play) | Required to run the app on a physical phone |
| **MongoDB** | MongoDB Atlas (Cloud) or Local MongoDB | Database instance |

---

## 🚀 Step-by-Step Setup & Installation

### 1. Clone the Repository
```bash
git clone https://github.com/unscriptedl871-star/Hospital-App.git
cd Hospital-App
```

### 2. Install Dependencies
Install dependencies for both the frontend and the backend:

```bash
# Install frontend (Expo) dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

---

### 3. Configure Environment Variables

#### A. Backend Configuration (`backend/.env`)
Copy `backend/.env.example` to `backend/.env` (or update existing):
```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:
```env
PORT=4000
MONGODB_URI=mongodb+srv://<USER>:<PASSWORD>@<CLUSTER>.mongodb.net/hospital?retryWrites=true&w=majority
JWT_SECRET=your-secure-random-jwt-secret
CORS_ORIGIN=http://localhost:8081,http://localhost:19006,http://192.168.1.6:8081
NODE_ENV=development
MONGODB_CONNECT_TIMEOUT_MS=15000
```
> **Note on MongoDB**: Replace `MONGODB_URI` with your MongoDB Atlas connection string or local MongoDB instance (`mongodb://127.0.0.1:27017/hospital`). Make sure your IP is allowlisted in MongoDB Atlas Network Access.

#### B. Frontend Configuration (`.env`)
Create or edit `.env` in the root directory:
```env
# Point to your machine's LAN IP address so your phone can reach the backend
EXPO_PUBLIC_API_URL=http://<YOUR_LOCAL_IP>:4000
```
*Tip: On Windows, run `ipconfig` (or on macOS/Linux run `ifconfig`) to find your Wi-Fi IPv4 address (e.g. `192.168.1.6`).*

---

## 🏃 Running the Application

### 1. Start the Backend API
From the project root:
```bash
npm run backend
```
*(Alternatively: `cd backend && npm run dev`)*

When successfully connected to MongoDB, the backend will auto-seed initial department records and log:
```
✅ MongoDB connected
Departments initialized: 6
API running on http://0.0.0.0:4000
```

### 2. Start the Frontend (Expo Metro Bundler)
In a separate terminal at the project root:
```bash
npm start
```

### 3. Open on Your Device
- **Physical Device**: Open the **Expo Go** app on your phone and scan the QR code displayed in the terminal. *(Ensure your phone and computer are on the same Wi-Fi network).*
- **Android Emulator**: Press `a` in the terminal with an active Android emulator.
- **iOS Simulator**: Press `i` in the terminal (macOS only).
- **Web Browser**: Press `w` in the terminal to open the web view (`http://localhost:8081`).

---

## 📸 Screenshots

*Real screenshots will be added here.*

> **To contribute screenshots:**
> Capture screenshots of the following views and place them in an `assets/screenshots/` folder:
> 1. **Authentication Screen** (`AuthScreen`) — Login and Role Selector
> 2. **Patient Dashboard** (`HomeScreen`) — Quick Actions, Department Carousel & Upcoming Appointments
> 3. **Doctor Search & Booking** (`FindDoctorScreen` & `BookAppointmentScreen`)
> 4. **Chat & Telemedicine Consultation** (`ChatRoomScreen`)
> 5. **Admin / Staff Dashboard** (`AdminHomeScreen` / `ReceptionHomeScreen`)

---

## 🔒 Security Best Practices Implemented

1. **Helmet & Security Headers**: Protections enabled on all HTTP responses.
2. **Brute Force Protection**: Rate limiting on sensitive `/auth/login` and `/auth/register` endpoints.
3. **Encrypted Passwords**: `bcrypt` hashing with salt rounds.
4. **JWT Expiry & Refresh Cycle**: Short-lived access tokens with rotating refresh tokens stored in secure device keystores.
5. **No Secrets in Source Control**: Sensitive credentials and environment configurations strictly git-ignored.
