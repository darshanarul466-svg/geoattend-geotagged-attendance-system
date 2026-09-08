# NSCC Campus Systems

Welcome to the unified repository containing both full-stack campus management systems:

| System | Description | Folder / Path | Primary Port |
|---|---|---|---|
| **Task 1: LibraHub** | Central Library Circulation & Management System with SQLite, QR Badges, Sound FX, and AI assistant | [`./LibraHub`](./LibraHub) | `5174` (UI) / `5001` (API) |
| **Task 2: CheckIn / GeoAttend** | QR-Based Geo-Tagged Real-Time Attendance Management System with Leaflet GPS mapping & anti-spoofing | Root (`./frontend`, `./backend`) | `5173` (UI) / `5000` (API) |

---

### 🚀 Quick Links & How to Run Both Projects

#### 1. Running Task 2: CheckIn / GeoAttend (Root)
```bash
# Install dependencies & run both backend (5000) and frontend (5173)
npm run install:all
npm run dev
```
Open: **http://localhost:5173**

#### 2. Running Task 1: LibraHub
```bash
# Navigate to the LibraHub directory
cd LibraHub
npm run install:all
npm run dev
```
Open: **http://localhost:5174**

---

# Task 2: CheckIn — QR-Based Geo-Tagged Campus Attendance System

> A modern, full-stack, enterprise-grade attendance management system that enables event organizers and faculty to securely record attendance using high-contrast QR code scanning combined with sub-meter Haversine geolocation verification.

[![React 19](https://img.shields.io/badge/Frontend-React_19_+_Vite-00d8ff?style=for-the-badge&logo=react)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js_Express-339933?style=for-the-badge&logo=nodedotjs)](https://nodejs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Leaflet](https://img.shields.io/badge/Maps-Interactive_Leaflet-199900?style=for-the-badge&logo=leaflet)](https://leafletjs.com/)
[![Docker](https://img.shields.io/badge/Container-Docker_Compose-2496ed?style=for-the-badge&logo=docker)](https://www.docker.com/)

---

## 📖 Table of Contents
1. [Key Features Overview](#-key-features-overview)
2. [Architectural Overview & Geofencing Math](#-architectural-overview--geofencing-math)
3. [Technology Stack](#-technology-stack)
4. [Quickstart & Local Setup](#-quickstart--local-setup)
5. [Docker Production Deployment](#-docker-production-deployment)
6. [API Reference & Endpoints](#-api-reference--endpoints)
7. [Implementation Decisions & Anti-Spoofing](#-implementation-decisions--anti-spoofing)
8. [Automated Verification Suite](#-automated-verification-suite)

---

## 🌟 Key Features Overview

### 1. User / Attendee Portal
- **Authentication**: JWT-based session security with 1-click **Student Demo** and **Organizer Demo** logins for instant evaluator grading.
- **Active & Upcoming Events Directory**: Displays real-time campus sessions, venues, allowed geofence radiuses, and live distance indicators.
- **Hardware Camera QR Scanner**: Integrated webcam and mobile device camera QR scanning powered by `html5-qrcode`, with flashlight toggle and image upload fallback.
- **Live Geolocation Verification**: Real-time browser GPS tracking with accuracy estimation and live distance radar.
- **Simulated GPS Mode**: Built-in coordinate tester allowing evaluators to simulate being **Inside Geofence (12m)** or **Outside Geofence (450m)** without traveling physically.
- **Instant Verified Attendance Pass**: Confetti celebration, cryptographic verification hash, and digital ticket receipt.

### 2. Organizer / Faculty Portal
- **Full Event CRUD**: Create, edit, and delete events with venue coordinates, geofence radius slider (20m to 1000m), capacity limits, and categories.
- **Realistic QR Generator**: High-contrast, dynamic QR codes rendered with `qrcode.react`, downloadable as high-res PNG/SVG or printable event badges.
- **Dynamic QR Refresh**: 1-click rotation of event QR secrets to prevent screen replay or unauthorized sharing.
- **Interactive Leaflet Maps**: Embedded realistic CartoDB / OpenStreetMap tile layer displaying venue origins, user positions, and concentric radius boundary rings.
- **Manual Check-In Override**: Allows organizers to manually record attendees who faced device camera or battery issues.

### 3. Real-Time Dashboard (Brownie Subtask ⭐)
- **Live Turnout Gauges**: Total registrations, present count, absent count, and circular SVG donut progress rings.
- **Weekly Trend Bar Chart**: 7-day visual attendance progression comparing present vs absent ratios.
- **Live Check-In Ticker Feed**: Real-time stream showing attendees, departments, check-in timestamps, and verified distances.
- **Class-wise / Event-wise Breakdown**: Tabular overview with completion progress bars.

### 4. Data Export (CSV & Excel)
- **1-Click CSV Export**: Formatted CSV containing `Full Name`, `Registration ID`, `Email`, `Department`, `Attendance Status`, `Verification Method`, `Distance from Venue (m)`, `Geofence Radius (m)`, and `Timestamp`.
- **1-Click Excel (.xlsx) Export**: Formatted spreadsheet generated via SheetJS `xlsx` with auto-spaced column widths.

### 5. Gemini AI Assistant (Bonus Subtask 🤖)
- **Natural Language Event Assistant**: Conversational Q&A about event schedules, geofence limits, and turnout statistics.
- **Automated Event Description Generator**: Generates engaging promotional copy and attendance guidelines from event titles and keywords.

---

## 📐 Architectural Overview & Geofencing Math

### Server-Side Haversine Verification Formula
To prevent client-side coordinate tampering, the server recalculates the great-circle distance between the user's reported GPS coordinates $(\phi_1, \lambda_1)$ and the event venue coordinates $(\phi_2, \lambda_2)$ using the **Haversine Formula**:

$$\Delta\phi = \phi_2 - \phi_1, \quad \Delta\lambda = \lambda_2 - \lambda_1$$

$$a = \sin^2\left(\frac{\Delta\phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta\lambda}{2}\right)$$

$$c = 2 \cdot \text{atan2}\left(\sqrt{a}, \sqrt{1 - a}\right)$$

$$d = R \cdot c \quad (\text{where } R = 6,371,000 \text{ meters})$$

If $d \leq \text{geofenceRadius}$, the attendance is accepted (`201 Created`).  
If $d > \text{geofenceRadius}$, the submission is rejected (`403 Forbidden`).

---

## 🛠 Technology Stack

| Layer | Technologies Used |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS, Lucide Icons, Canvas Confetti |
| **Maps & QR** | Leaflet (OpenStreetMap / CartoDB Voyager), `html5-qrcode`, `qrcode.react` |
| **Backend** | Node.js, Express, JWT, bcryptjs |
| **Database** | Persistent atomic JSON storage with zero external setup |
| **Exports** | SheetJS `xlsx` for Excel, formatted CSV serializer |
| **AI Integration** | Google Generative AI (`@google/generative-ai`) with local heuristic fallback |
| **DevOps** | Docker, Docker Compose, Vercel Serverless Ready |

---

## 🚀 Quickstart & Local Setup

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### 1. Clone & Install Dependencies
```bash
# Clone the repository
git clone <your-repo-url>
cd NSCC

# Install all dependencies (root, backend, and frontend)
npm run install:all
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` inside `backend/`:
```bash
PORT=5000
NODE_ENV=development
JWT_SECRET=geoattend-super-secret-production-key-2026
GEMINI_API_KEY=your_gemini_api_key_here  # Optional: local heuristics engine used if omitted
```

### 3. Run in Development Mode
```bash
# Runs both backend (port 5000) and frontend (port 5173) concurrently
npm run dev
```

Open your browser at `http://localhost:5173`.

---

## 🐳 Docker Production Deployment

Run the complete multi-stage containerized production build with a single command:

```bash
docker compose up --build
```

- Multi-stage build compiles the React 19 frontend into static assets.
- Express server serves the REST API and the production frontend single-page bundle on `http://localhost:5000`.
- Includes automated container health checks and persistent volume storage.

---

## 📡 API Reference & Endpoints

### 1. Authentication
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new user account |
| `POST` | `/api/auth/login` | Sign in with email & password |
| `POST` | `/api/auth/demo-login` | 1-Click fast login (`organizer` or `attendee`) |
| `GET` | `/api/auth/me` | Retrieve profile of authenticated user |

### 2. Events Management
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/events` | List all events with turnout statistics |
| `GET` | `/api/events/:id` | Get details and geofence coordinates of an event |
| `POST` | `/api/events` | Create a new event with geofence radius |
| `PUT` | `/api/events/:id` | Update event parameters |
| `DELETE` | `/api/events/:id` | Delete event and related attendance logs |
| `POST` | `/api/events/:id/regenerate-qr` | Rotate dynamic cryptographic QR token |

### 3. Attendance Verification
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/attendance/verify-and-mark` | Verify QR token + GPS Haversine distance & record attendance |
| `GET` | `/api/attendance/event/:eventId` | Filterable attendee list for an event |
| `GET` | `/api/attendance/live/:eventId` | Real-time live attendance stats & check-in feed |
| `POST` | `/api/attendance/manual-checkin` | Organizer manual override entry |
| `GET` | `/api/attendance/my-history` | Personal check-in log for logged-in user |

### 4. Data Export
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/export/csv/:eventId` | Download attendance records as CSV file |
| `GET` | `/api/export/excel/:eventId` | Download attendance records as Excel (.xlsx) file |

### 5. Analytics & AI
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/analytics/dashboard` | Aggregated 7-day trend, class breakdowns, and KPIs |
| `POST` | `/api/ai/chat` | Natural language event & attendance assistant |
| `POST` | `/api/ai/generate-description` | Automated event description writer |

---

## 🔒 Implementation Decisions & Anti-Spoofing

1. **Server-Side Distance Calculation**: The client provides raw device coordinates, but the server calculates the spherical distance using the Haversine formula against the venue origin to enforce the geofence perimeter.
2. **Duplicate Submission Lock**: A combination index of `(userId, eventId)` and `(userEmail, eventId)` prevents double check-ins.
3. **Dynamic QR Token Nonce**: QR payloads include unique timestamps and nonces that organizers can rotate at any time.
4. **Offline Heuristics Fallback for AI**: If a Gemini API key is not supplied, the AI endpoints transition to local semantic analyzers so the system works 100% out of the box.

---

## 🧪 Automated Verification Suite

Run the end-to-end automated test suite:

```bash
npm test
# or
node test-api-e2e.js
```

The test script automatically spins up the server in-process and tests:
1. Health check endpoint status.
2. 1-click organizer & student JWT authentication.
3. Geofenced event creation.
4. Successful check-in inside the geofence (201 Created).
5. Duplicate check-in rejection (409 Conflict).
6. Out-of-bounds check-in rejection (403 Forbidden).
7. Live attendance statistics aggregation.
8. CSV and Excel export stream validity.
9. AI Assistant prompt generation.

---

## 📄 License
MIT License. Built for enterprise and campus event attendance workflows.
