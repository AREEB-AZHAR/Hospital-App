# 🏥 Hospital Management & Telemedicine Mobile Platform

A modern, full-stack hospital management and patient appointment mobile application built with **React Native (Expo SDK 58, React Native 0.88, React 19.3)**, **Node.js (Express 5)**, and **MongoDB (Mongoose 9)**.

---

## 🌟 Recent Updates: Dark Mode Engine & Aesthetic Custom SVG Suite

The mobile platform now features a **persistent Dark Mode theme system** and a **handcrafted SVG vector icon library** designed specifically for high-contrast healthcare applications:

- 🌙 **Persistent Dark Mode Engine (`src/context/ThemeContext.js` & `src/theme/`)**:
  - **Medical Obsidian & Midnight Navy Palette**: Deep dark background (`#0B0F19`), elevated card surfaces (`#131B2E`), electric royal blue accents (`#3B82F6`), mint emerald (`#10B981`), and crisp typography (`#F8FAFC`).
  - **Persistent Storage**: Theme preference (`light`, `dark`, `system`) is stored in `@react-native-async-storage/async-storage` under key `@hospital_app_theme_mode` and persists across app restarts.
  - **Dynamic System Adaptation**: Automatically synchronizes with OS dark mode preference via `useColorScheme()` as a default baseline.
  - **Interactive Appearance Toggle Card (`ProfileScreen.js`)**: An ergonomic **Appearance** card with a smooth switch, live state indicator, and custom SVG icons (`MoonIcon`, `SunIcon`).
  - **Navigation & Status Bar Synchronization**: `RootNavigator.js` dynamically syncs `NavigationContainer` theme tokens and OS `StatusBar` (`light-content` vs `dark-content`). `AppTabs.js` dynamically adjusts tab bar surface, borders, and header colors.
  - **Universal Reactive Components**: Core controls (`SoftButton`, `TabChip`, `ProfileScreen`, `MyAppointmentScreen`, `ChatListScreen`) instantly re-render with dark-mode contrasts.

- 🎨 **Cohesive Medical Design System (`src/theme/index.js`)**:
  - **Dual Token Palettes**: Full token exports for `lightColors`, `darkColors`, `lightShadows`, and `darkShadows`, alongside backward-compatible defaults.
  - **Standardized Typography & Radii**: Harmonious scales with ergonomic corner radii (`radii.md`, `radii.lg`, `radii.xl`, `radii.full`).

- ⚡ **Handcrafted Custom SVG Icon Library (`src/components/icons/index.js`)**:
  - Replaced raw unicode emojis with over 28 scalable, stroke-based vector icons (`HomeIcon`, `StethoscopeIcon`, `CalendarIcon`, `ChatBubbleIcon`, `UserIcon`, `HospitalBuildingIcon`, `PillIcon`, `PrescriptionIcon`, `ReportHeartIcon`, `MicrophoneIcon`, `SendIcon`, `PlayIcon`, `StopIcon`, `StarFilledIcon`, `ClockIcon`, `ShieldCheckIcon`, `CreditCardIcon`, `ChevronRightIcon`, `MoonIcon`, `SunIcon`, `EditIcon`, `CheckIcon`, etc.).

- 📱 **Sleek Bottom Tab Navigation & Safe Area Adaptability (`AppTabs.js`)**:
  - Custom SVG tab icons with active state tinting and stroke emphasis.
  - Dynamically adapts height and bottom padding via `useSafeAreaInsets()` to prevent overlap with Android 3-button system bars and gesture handles.
  - Generous `paddingBottom: 120` clearance applied across all screens so action buttons ("Confirm Booking", "Sign Out", "Discard") are never covered by navigation bars.

- 📅 **Live Appointment Synchronization & Filter Tabs (`HomeScreen.js` & `MyAppointmentScreen.js`)**:
  - `useFocusEffect` integration ensures appointment and doctor lists refresh immediately when switching tabs.
  - Dedicated patient tabs: **Upcoming** (including active and pending requests), **All**, and **History**.
  - Immediate reflection of new bookings on the Next Appointment hero card.

- 💬 **Enhanced Telemedicine Chat (`ChatRoomScreen.js` & `ChatListScreen.js`)**:
  - Custom SVG audio playback controls (`PlayIcon`, `StopIcon`) with dynamic waveform track.
  - Media composer equipped with SVG Attachment (`+`), Microphone (`mic`), and Send vector buttons.
  - Visual read receipts with SVG single and double checkmarks (`CheckIcon`, `CheckDoubleIcon`).
  - Bulletproof keyboard handling with safe navigation header offset.

- 🛡️ **Session Self-Healing & Automated Token Refresh (`api.js` & `AuthContext.js`)**:
  - Transparent access token refreshing via refresh tokens on 401 responses.
  - Graceful token expiration handling: auto-clears expired or invalidated tokens when backend restarts and smoothly returns to the login screen instead of throwing unhandled exceptions.
  - Zero-friction testing: instant "Fill Demo Patient" and "Fill Demo Doctor" one-tap buttons on the authentication screen.
  - Automatic doctor & demo patient seeding on backend startup (`seedUsers.js`).

- ⚡ **Module Boot & React Navigation 7 Theme Fix (`RootNavigator.js`)**:
  - Resolved `TypeError: Cannot read property 'regular' of undefined` by inheriting and spreading `DefaultTheme` / `DarkTheme` fonts required by React Navigation 7 stack navigators.
  - Eliminated un-scoped StyleSheet references to guarantee error-free initial bootstrapping and instant rendering on physical devices.

---

## 🔑 Ready-to-Test Demo Accounts

| Role | Name | Phone Number | Password | Department / Specialization |
| :--- | :--- | :--- | :--- | :--- |
| **Patient** | Alex Morgan | `03001234567` | `123456` | General Consultations |
| **Doctor** | Dr. Sarah Jenkins | `03001112233` | `123456` | Cardiology (Senior Interventional) |
| **Doctor** | Dr. Marcus Vance | `03002223344` | `123456` | Neurology (Consultant Neurosurgeon) |
| **Doctor** | Dr. Elena Rostova | `03003334455` | `123456` | Pediatrics (Child Healthcare) |
| **Doctor** | Dr. Tariq Al-Mansoor | `03004445566` | `123456` | Orthopedics (Joint Surgeon) |
| **Doctor** | Dr. Aisha Patel | `03005556677` | `123456` | Dermatology (Aesthetic & Clinical) |
| **Doctor** | Dr. James Wilson | `03006667788` | `123456` | General Medicine (Internal Medicine) |

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
> 2. **Bottom Navigation**: Floating tab bar showing custom SVG vector icons in light and dark mode.
> 3. **FindDoctorScreen**: Verified doctors with ratings, fee chips, and booking buttons.
> 4. **ChatRoomScreen**: Media composer with SVG microphone, attachments, and waveform audio playback.
> 5. **ProfileScreen (Light & Dark Appearance)**: User credentials, role badges, and the interactive **Appearance** switch in both Obsidian Dark and Daylight modes.

---

## 🔒 Security Best Practices Implemented

1. **Helmet & Security Headers**: Protections enabled on all HTTP responses.
2. **Brute Force Protection**: Rate limiting on sensitive `/auth/login` and `/auth/register` endpoints.
3. **Encrypted Passwords**: `bcrypt` hashing with salt rounds.
4. **JWT Expiry & Refresh Cycle**: Short-lived access tokens with rotating refresh tokens stored in secure device keystores.
5. **No Secrets in Source Control**: Sensitive credentials and environment configurations strictly git-ignored.
