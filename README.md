# 🏥 Hospital Management & Telemedicine Mobile Platform

A modern, full-stack hospital management and patient appointment mobile application built with **React Native (Expo SDK 58, React Native 0.88, React 19.3)**, **Node.js (Express 5)**, and **MongoDB (Mongoose 9)**.

---

## 🌟 Recent Updates: Aesthetic UI/UX Overhaul & Custom SVG Icon Suite

The mobile interface has been upgraded with a **clinical design system** and a **handcrafted SVG vector icon library** using `react-native-svg`:

- 🎨 **Cohesive Medical Design System (`src/theme/`)**:
  - **Color Palette**: Clinical Royal Blue (`#0D6EFD`), Crisp Cyan (`#00B4D8`), Mint Emerald (`#10B981`), Warning Amber (`#F59E0B`), and Alert Coral (`#EF4444`) on Slate Neutral backgrounds (`#F8FAFC`).
  - **Standardized Typography & Spacing Tokens**: Consistent type scales, soft multi-layer shadow elevations, and ergonomic corner radii.
- ⚡ **Handcrafted Custom SVG Icon Library (`src/components/icons/`)**:
  - Replaced all raw unicode emojis (`👨‍⚕️`, `📅`, `🧾`, `💬`, `⭐`, `💳`, `🚪`) with over 25 scalable, stroke-based vector icons (`HomeIcon`, `StethoscopeIcon`, `CalendarIcon`, `ChatBubbleIcon`, `UserIcon`, `HospitalBuildingIcon`, `PillIcon`, `PrescriptionIcon`, `ReportHeartIcon`, `MicrophoneIcon`, `SendIcon`, `PlayIcon`, `StopIcon`, `StarFilledIcon`, `ClockIcon`, `ShieldCheckIcon`, `CreditCardIcon`, `ChevronRightIcon`, etc.).
- 📱 **Sleek Bottom Tab Navigation (`AppTabs.js`)**:
  - Custom SVG tab icons with active state tinting and stroke emphasis.
  - Streamlined patient navigation: 5 core tabs (Home, Doctors, Appointments, Chat, Profile) with secondary screens accessible via stack transitions.
- ✨ **Hero Dashboard (`HomeScreen.js`)**:
  - Welcoming avatar header with role badge and discreet logout trigger.
  - Next Appointment Hero Card with doctor credentials, verified shield badge, rating, and immediate reschedule/cancel controls.
  - Interactive 4-grid healthcare services section with colored icon backgrounds.
  - Live doctor & department search with instant dropdown results.
- 💬 **Enhanced Telemedicine Chat (`ChatRoomScreen.js`)**:
  - Custom SVG audio playback controls (`PlayIcon`, `StopIcon`) with dynamic waveform track.
  - Media composer equipped with SVG Attachment (`+`), Microphone (`mic`), and Send vector buttons.
  - Visual read receipts with SVG single and double checkmarks (`CheckIcon`, `CheckDoubleIcon`).

---

## 🌟 Core System Features

- **Multi-Role Access Control**: Tailored workflows and role-specific dashboards for **Patients**, **Doctors**, **Receptionists**, and **Admins**.
- **Real-Time Appointment Scheduling**: Book, view, reschedule, and manage doctor consultations with departmental filtering.
- **Secure Authentication & Token Management**: JWT-based access and refresh tokens stored safely with `expo-secure-store`.
- **In-App Messaging & Consultation**: Chat functionality with audio voice notes and attachment support between patients and medical staff.
- **Prescription & Billing Overview**: Access digital prescriptions with real-time note saving and fee tracking.
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
│       ├── controllers/      # Business logic (auth, appointments, chat)
│       ├── middleware/       # JWT auth verification, rate limiting
│       ├── models/           # Mongoose schemas (User, Appointment, Department, Message, AuditLog, RefreshToken)
│       ├── routes/           # REST endpoints (/auth, /users, /appointments, /departments, /chat)
│       └── utils/            # DB connection, seed scripts, audit utilities
│
└── src/                      # React Native frontend source
    ├── theme/                # Central design system (colors, typography, radii, shadows)
    │   └── index.js
    ├── components/
    │   ├── icons/            # Scalable custom SVG Icon Library (react-native-svg)
    │   │   └── index.js      # StethoscopeIcon, CalendarIcon, ChatBubbleIcon, HomeIcon, etc.
    │   └── common/           # Reusable UI components
    │       ├── GlassCard.js  # Frosted glass elevated container
    │       ├── SoftButton.js # Multi-variant action button (primary, danger, ghost)
    │       ├── StatCard.js   # Metric stat box with SVG icon badge
    │       ├── StatusPill.js # Colored status tag with dot indicator
    │       └── TabChip.js    # Interactive pill filter with icon support
    ├── context/              # Global state providers (AuthContext, AppDataContext)
    ├── data/                 # Fallback mockup datasets (departments, doctors, users)
    ├── navigation/           # React Navigation stacks & bottom tabs
    │   ├── RootNavigator.js  # AppStack and AuthStack router
    │   ├── AppTabs.js        # Bottom tabs with custom SVG icons
    │   ├── AuthStack.js      # Authentication flow
    │   └── ChatStack.js      # Telemedicine chat flow
    ├── screens/
    │   ├── admin/            # Admin screens (UsersScreen, SettingsScreen, ReportsScreen)
    │   ├── auth/             # Authentication screens (AuthScreen, SignupDetailsScreen, ForgotPasswordScreen)
    │   ├── chat/             # Messaging screens (ChatListScreen, ChatRoomScreen)
    │   ├── role/             # Role-specific views (DoctorHomeScreen, ReceptionHomeScreen, PrescriptionsScreen, etc.)
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
| **MongoDB** | Built-in in-memory fallback (zero-setup), local MongoDB, or MongoDB Atlas | Database instance |

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
> **Zero-Setup Database Out of the Box**: If no external MongoDB instance is running, the backend automatically boots a local in-memory MongoDB instance (`mongodb-memory-server`) so you can test and develop immediately without creating cloud accounts or installing local database services. When ready for persistent cloud storage, simply update `MONGODB_URI` with your MongoDB Atlas connection string.

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

*Real screenshots will be displayed below.*

> **To contribute real screenshots:**
> Capture screenshots of the upgraded views and place them in `assets/screenshots/`:
> 1. **HomeScreen**: Dashboard with custom SVG icon cards, Next Appointment hero, and stats.
> 2. **Bottom Navigation**: Floating tab bar showing custom SVG vector icons.
> 3. **FindDoctorScreen**: Verified doctors with ratings, fee chips, and booking buttons.
> 4. **ChatRoomScreen**: Media composer with SVG microphone, attachments, and waveform audio playback.
> 5. **ProfileScreen**: User credentials with role badges and sign-out controls.

---

## 🔒 Security Best Practices Implemented

1. **Helmet & Security Headers**: Protections enabled on all HTTP responses.
2. **Brute Force Protection**: Rate limiting on sensitive `/auth/login` and `/auth/register` endpoints.
3. **Encrypted Passwords**: `bcrypt` hashing with salt rounds.
4. **JWT Expiry & Refresh Cycle**: Short-lived access tokens with rotating refresh tokens stored in secure device keystores.
5. **No Secrets in Source Control**: Sensitive credentials and environment configurations strictly git-ignored.
