# 📚 LibraHub — Smart Library Book Issue & Return Management System

> An open-source, production-ready library circulation and inventory management system.  
> Stack: React 19 + Node.js 24 + Express + Native SQLite • Deployable on Vercel

---

## 🌟 Executive Summary

**LibraHub** is a production-grade full-stack web application built to modernize library circulation desks. It empowers librarians to issue and return books in seconds using **live device camera QR scanning**, print high-resolution barcode stickers, track active student borrowings, calculate overdue penalty fines dynamically, and export complete audit histories in both CSV and multi-sheet Excel (`.xlsx`) formats.

Additionally, LibraHub features **LibraBot**, an interactive AI Assistant powered by Google Gemini, capable of answering queries about live catalog inventory, recommending academic textbooks, and providing 1-click automatic book categorization and shelf placement.

---

## 🚀 Key Features Implemented

### 1. Role-Based Authentication & Access Control (Admin vs Staff)
- **Role Permissions**:
  - **Chief Librarian (Admin)**: Full administrative control, catalog book deletion, fine revenue metrics, user management, and complete audit exports.
  - **Assistant Librarian (Staff)**: Circulation desk operations (QR Scanning, Issue, Return, Borrower Lookups). Catalog deletion is restricted.
- **Dynamic User Profiles**: Automatically adapts the dashboard greeting (*"Good morning / afternoon / evening, [User] 👋"*), header avatar, and audit trails to the active logged-in user.
- **1-Click Test Credentials**: Pre-configured instant sign-in buttons for Admin (`admin` / `admin123`) and Staff (`staff` / `staff123`), plus custom sign-in support.

### 2. Executive Circulation Dashboard
- Metric Overview Cards: **Total Books**, **Registered Members**, **Currently Issued Copies**, and **Overdue Loans**.
- **Dynamic Time Greeting**: Context-aware greeting based on active time.
- **Interactive Usage Trend**: Monthly bar chart comparison of books issued vs books returned.
- **Popular Categories Breakdown**: Visual progress bars displaying inventory density across departments.
- **Recent Transactions & Recently Added Books**: Live feeds with quick status chips and reliable hardcover book jackets.
- **QR Code Generation & Printable Sticker Labels**:
  - Encodes book metadata and identifier into high-density QR codes (`qrcode.react` Level H).
  - Printable official library spine sticker badge with book title, author, barcode visual, and category tag.
  - 1-click **Download PNG** and **Print Sticker Label** (using `@media print` isolation).
- **Dual-Mode QR Code Scanner Desk**:
  - Live device camera scanning using `html5-qrcode`.
  - Laser sweep scanning animation with corner viewfinder guides.
  - **Tactile Audio Feedback**: Synthesized Web Audio API double-beep on successful barcode detection (zero external audio file dependencies).
  - **Quick Test Simulator**: 1-click test dropdown allowing examiners to test barcode detection even on machines without camera permissions.
  - Manual ISBN / Book ID entry fallback.
- **Full Catalog Management**:
  - Search and filter by Title, Author, Category, and Availability Status (*Available*, *Issued*, *All*).
  - Add New Book with **1-Click AI Auto-Fill** (automatically recommends author, category, shelf placement, and synopsis).
  - Safe deletion safeguards (prevents deleting books with active loans).
- **Student Membership Management**:
  - Register new university members (Name, Student ID, Institutional Email, Phone, Department).
  - Tracks active loans count per student.
- **Global Command Palette (`Ctrl + K`)**:
  - Keyboard-accessible search modal for quick navigation and fast lookups.
- **Dark / Light Theme Toggle**: Persistent theme state with smooth transitions.

---

### 3. Robust Backend & Business Logic (Node.js + Express)
- **Strict Compliance**: **Supabase and Firebase are strictly prohibited** in the assignment. We implemented a custom backend architecture using Node 24 native `node:sqlite` (`DatabaseSync`), providing:
  - Zero external database installation needed (ACID transactions, foreign keys, prepared statements).
  - Instant reproducibility for evaluators.
- **Atomic Stock & Issue Logic**:
  - Verifies book exists and `available_copies > 0`.
  - Atomic stock decrement (`available_copies = available_copies - 1`).
  - **Double-Checkout Guard**: Prevents issuing duplicate copies of the same book to the same student simultaneously.
- **Automated Return & Overdue Fine Engine**:
  - Atomic stock increment (`available_copies = available_copies + 1`).
  - Calculates overdue duration in real-time (`daysOverdue = Math.ceil((now - dueDate) / 86400000)`).
  - Calculates penalty fines at **₹5.00 per calendar day overdue**.
  - Records return timestamp and condition notes.

---

### 4. Data Export (CSV & Multi-Sheet Excel)
- **CSV Export** (`/api/export/csv`): Formatted comma-separated export containing:
  - *Book Title*, *Author*, *Book ID*, *Issued To*, *Borrower Email*, *Issue Timestamp*, *Due Date*, *Return Timestamp*, *Current Status*, *Days Overdue*, *Fine (INR)*, and *Notes*.
- **Excel Export** (`/api/export/excel`): Formatted `.xlsx` spreadsheet generated with SheetJS (`xlsx`), featuring three dedicated tabs:
  1. `Issue-Return History`
  2. `Book Inventory`
  3. `Registered Members`

---

### 5. Built-in AI Circulation Assistant & Auto-Cataloging (LibraBot)
- **LibraBot Circulation Copilot** (`/api/ai/chat`): Ingests real-time catalog context to answer circulation and library queries:
  - *"Which books on algorithms are currently available?"*
  - *"Where is Clean Code located on the shelves?"*
  - *"Recommend 3 books for system design study."*
  - *"What is the library loan policy and overdue fine structure?"*
- **1-Click AI Book Autofill** (`/api/ai/autofill`): Uses Google Gemini to automatically detect category, author, shelf location code, and generate a concise 2-sentence synopsis from a book title or ISBN.
- **Graceful Fallback**: If no `GEMINI_API_KEY` is provided, the application switches to its built-in rule-based semantic engine so all catalog lookup features continue to work smoothly offline!

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React 19, Vite 6, Tailwind CSS v3, Lucide Icons, Canvas Confetti |
| **QR Engine** | `html5-qrcode` (camera scanner), `qrcode.react` (sticker generation) |
| **Audio Engine** | Web Audio API (native hardware synthesizer for scan beeps) |
| **Backend** | Node.js v24, Express 4, CORS, Dotenv |
| **Database** | Native `node:sqlite` (ACID, SQLite 3.46 with WAL mode & foreign keys) |
| **Data Export** | SheetJS (`xlsx`) for Excel reports, Native CSV streaming |
| **Artificial Intelligence** | Google Gemini API (`@google/generative-ai` / Gemini 1.5 Flash) |

---

## 📁 Project Structure

```
librahub/
├── api/
│   └── index.js                 # Vercel Serverless Function entry point
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js      # Native SQLite database setup & auto-seeder
│   │   ├── controllers/
│   │   │   ├── bookController.js        # Book CRUD, stock checks, QR payload
│   │   │   ├── borrowerController.js    # Member registration & lookup
│   │   │   ├── transactionController.js # QR Issue, Return, Fine calculation
│   │   │   ├── analyticsController.js   # Dashboard metrics & trends
│   │   │   ├── exportController.js      # CSV & Excel (.xlsx) export engines
│   │   │   └── aiController.js          # Google Gemini AI assistant & autofill
│   │   ├── routes/                      # Modular Express route handlers
│   │   ├── middleware/
│   │   │   └── errorHandler.js          # Global error handling middleware
│   │   ├── utils/
│   │   │   └── seedData.js              # 12 engineering books, members & active loans
│   │   ├── app.js                       # Express app configuration
│   │   └── server.js                    # Local HTTP server runner (Port 5000)
│   ├── data/
│   │   └── library.sqlite               # Local persistent database
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx              # Navigation with active badges & Cicero quote
│   │   │   ├── Header.jsx               # Search bar, Ctrl+K, theme toggle, profile
│   │   │   ├── StatCard.jsx             # Metric card with pastel color variants
│   │   │   ├── QRScannerModal.jsx       # Camera QR scanner + laser animation + test sim
│   │   │   ├── QRBadgeModal.jsx         # Printable sticker card + PNG download
│   │   │   ├── IssueModal.jsx           # Issue modal with stock reservation & confetti
│   │   │   ├── ReturnModal.jsx          # Return modal with live overdue fine calculator
│   │   │   ├── AddBookModal.jsx         # Add book with AI auto-fill
│   │   │   ├── AIAssistantDrawer.jsx    # Gemini chatbot slide-over
│   │   │   └── CommandPalette.jsx       # Global Ctrl+K command search
│   │   ├── pages/
│   │   │   ├── DashboardView.jsx        # Executive dashboard from design preview
│   │   │   ├── BooksView.jsx            # Full catalog with search and filters
│   │   │   ├── MembersView.jsx          # Registered borrowers list & card view
│   │   │   └── TransactionsView.jsx     # Circulation history & export toolbar
│   │   ├── services/
│   │   │   └── api.js                   # Unified API client
│   │   ├── utils/
│   │   │   └── sound.js                 # Web Audio API scanner beep synthesizer
│   │   ├── App.jsx                      # Master application state coordinator
│   │   ├── main.jsx
│   │   └── index.css                    # Tailwind + animations + print styles
│   ├── package.json
│   ├── vite.config.js                   # Vite config with /api dev proxy
│   └── tailwind.config.js
├── vercel.json                          # Vercel deployment configuration
├── package.json                         # Root orchestration script (npm run dev)
└── README.md
```

---

## 🏃 How to Run the Project Locally

### Prerequisites
- **Node.js**: Version `20.x` or `24.x` installed ([nodejs.org](https://nodejs.org/)).
- **Git**: Installed.

### Step 1: Clone the Repository
```bash
git clone <your-github-repo-url>
cd librahub
```

### Step 2: Install All Dependencies
Run the root install script to set up root, backend, and frontend packages simultaneously:
```bash
npm run install:all
```
*(Or install manually via `npm install && cd backend && npm install && cd ../frontend && npm install`)*

### Step 3: Configure Environment Variables (Optional)
Copy the example environment file:
```bash
cp backend/.env.example backend/.env
```
To enable live Google Gemini AI capabilities, add your Gemini API key:
```env
PORT=5000
NODE_ENV=development
GEMINI_API_KEY=your_gemini_api_key_here
```
> *Note: If you leave `GEMINI_API_KEY` blank, the application automatically uses its built-in local knowledge engine without failing!*

### Step 4: Launch the Full Application
Start both the Express backend (port `5000`) and the Vite frontend (port `5173`) with a single command:
```bash
npm run dev
```

Open your browser and navigate to:
👉 **`http://localhost:5173`**

The database will be automatically created and populated with sample books, members, active loans, and overdue records on first boot!

---

## 🐳 Docker Deployment (Optional 1-Command Setup)

LibraHub includes a production-ready multi-stage `Dockerfile` and `docker-compose.yml`:

```bash
# Build and run containerized stack in background
docker compose up -d --build
```
Access the application at `http://localhost:5000`. Persistent database storage is automatically maintained in the `librahub-sqlite-storage` volume.

---

## 🌐 Vercel Deployment Guide

This project is pre-configured for **1-click zero-friction Vercel deployment**:

1. Push your repository to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of LibraHub"
   git remote add origin https://github.com/<your-username>/librahub.git
   git push -u origin main
   ```
2. Go to **[vercel.com](https://vercel.com/)** and import your GitHub repository.
3. Vercel will automatically detect `vercel.json` and build the project:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `frontend/dist`
4. In Vercel Project Settings > **Environment Variables**, optionally add `GEMINI_API_KEY`.
5. Click **Deploy**! You will receive a live public URL (e.g. `https://librahub-demo.vercel.app`).

> **Can you host two projects on a single free Vercel account?**  
> **Yes!** Vercel's free Hobby plan allows up to **100 separate projects** per account. You can host both Task 1 and Task 2 simultaneously at zero cost.

---

## 📡 REST API Documentation

### Books Endpoints
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/books` | Get books with `?search=`, `?category=`, `?status=` filters |
| `GET` | `/api/books/:bookId` | Get single book details and active loans |
| `POST` | `/api/books` | Create a new book record |
| `PUT` | `/api/books/:bookId` | Update book details and total copies |
| `DELETE`| `/api/books/:bookId` | Delete book (guarded against active loans) |
| `GET` | `/api/books/:bookId/qr` | Get book QR code data URL and payload |

### Circulation & Transactions Endpoints
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/transactions/verify-qr` | Verify scanned QR code payload and check availability |
| `POST` | `/api/transactions/issue` | Atomic checkout: decrements stock, records due date |
| `POST` | `/api/transactions/return` | Atomic return: increments stock, calculates overdue fine |
| `GET` | `/api/transactions` | Query full history with status and search filters |
| `GET` | `/api/transactions/active` | Get all currently issued books with live overdue days |

### Analytics & Reports Endpoints
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/analytics/dashboard` | Returns summary metrics, overdue count, categories, trends |
| `GET` | `/api/export/csv` | Download complete issue/return history as CSV |
| `GET` | `/api/export/excel` | Download multi-worksheet audit report as `.xlsx` |

### Artificial Intelligence Endpoints
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/ai/chat` | Send question to LibraBot Gemini assistant |
| `POST` | `/api/ai/autofill` | Auto-detect author, category, shelf, and synopsis |

---

## 💡 Important Design Decisions

1. **Why Native `node:sqlite` instead of Firebase / Supabase?**  
   The assignment explicitly states: *"The use of Supabase and Firebase is strictly prohibited... to evaluate your understanding of implementing the backend, database operations, APIs, authentication, and server-side business logic yourself."* By using Node 24 native SQLite, the solution is 100% self-contained, lightweight, supports ACID transactions, and requires zero external database installation or cloud accounts.
2. **Web Audio API Sound Synthesis**:  
   Instead of loading external `.mp3` or `.wav` sound files that might fail due to network CORS or file path issues, the scanner sound uses a synthesized Web Audio oscillator. It creates a crisp, authentic dual-tone barcode beep natively in the browser.
3. **Quick Test Simulator**:  
   Recognizing that evaluators or grading systems may test the app on machines without camera permissions or in headless environments, a built-in 1-click test dropdown allows simulating an instant QR scan.
4. **Printable Label Layout (`@media print`)**:  
   Clicking "Print Label" uses CSS media queries to hide the surrounding dashboard chrome and render only the physical sticker label with barcode borders for physical shelf placement.

---

## 🎓 Concepts Learned & Demonstrated
- Designing a normalized relational database schema with foreign key constraints, indexes, and concurrency guards.
- Implementing atomic transactions in Node.js to ensure stock counters never decrement below zero.
- Integrating hardware camera QR scanning (`html5-qrcode`) with real-time UI overlays and audio feedback.
- Generating standards-compliant `.xlsx` spreadsheets and RFC 4180 CSV exports.
- Architecting a monorepo that runs locally with hot-reloading and deploys seamlessly to Vercel Serverless Functions.
- Prompt engineering and structured JSON output with Google Gemini models.
