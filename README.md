# VedaAI - AI-Powered Assessment Generator

VedaAI is a production-hardened platform for teachers to generate, curate, and distribute high-quality question papers and assignments using advanced LLM models (Groq).

## 🚀 Architecture Overview

VedaAI follows a modern, scalable **Client-Server-Worker** architecture:

- **Frontend (Next.js 14)**: Uses the App Router, Redux Toolkit for state management, and Tailwind CSS for a premium "Glassmorphism" UI. Real-time updates are handled via Socket.io-client.
- **Backend (Node.js/Express)**: A hardened RESTful API with centralized error handling, JWT-based HTTP-only cookie authentication, and security middleware (Helmet, Rate Limiter, Mongo Sanitize).
- **Background Worker (BullMQ + Redis)**: AI generation and PDF rendering are offloaded to asynchronous background jobs to ensure the main API remains responsive.
- **Real-time Pipeline**: Uses Socket.io to stream job statuses ("Pending" -> "Processing" -> "Done") directly to the user's dashboard.

## 🛠️ Setup Instructions

### Prerequisites
- **Node.js** (v18+)
- **MongoDB** (Local or Atlas)
- **Redis** (Local or Cloud)
- **API Key** (OpenAI or Groq)

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env # Ensure you fill in the keys below
npm run dev
```

**Required `.env` Variables:**
- `PORT=8000`
- `MONGODB_URI`
- `REDIS_URL`
- `OPENAI_API_KEY`
- `FRONTEND_URL=http://localhost:3000`
- `JWT_SECRET`
- `LLM_BASE_URL` (Optional for Groq/Custom)
- `LLM_MODEL`

### 2. Frontend Setup
```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

**Required `.env.local` Variables:**
- `NEXT_PUBLIC_BACKEND_URL=http://localhost:8000`

## 🔐 Authentication

VedaAI uses **JWT stored in HTTP-only cookies** for authentication.

- Cookies are `httpOnly` and `secure` in production — inaccessible to JavaScript
- `sameSite: 'none'` is set for cross-origin requests (Vercel → Render)
- All `/api/assignments` and `/api/results` routes are protected
- Frontend axios instance sends `withCredentials: true` on every request

**Auth Endpoints:**

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/auth/signup` | Register new teacher account |
| `POST` | `/api/auth/login` | Login, sets HTTP-only cookie |
| `POST` | `/api/auth/logout` | Clears cookie |
| `GET` | `/api/auth/me` | Get current user |

**Protected API Endpoints:**

| Method | Path | Metadata |
|--------|------|-------------|
| `POST` | `/api/assignments` | 🔒 Create assignment + enqueue job |
| `GET` | `/api/assignments` | 🔒 List all assignments |
| `GET` | `/api/assignments/:id` | 🔒 Get single assignment |
| `DELETE` | `/api/assignments/:id` | 🔒 Delete assignment + result |
| `GET` | `/api/results/:assignmentId` | 🔒 Get generated paper |

## 🧠 Approach

### Production Hardening
- **Security**: Implemented `helmet` CSP policies specifically tailored for WebSocket handshakes and `express-mongo-sanitize` for NoSQL injection protection.
- **Reliability**: Centralized Express Error Handler ensures stack traces are never leaked in production and all 401/404/500 errors follow a standard `{ success, message }` JSON schema.
- **UX**: Added `animate-pulse` skeleton loaders to handle network latency and React `ErrorBoundary` to gracefully recover from App Router crashes.

### Scaling AI
- **Worker Pattern**: We use BullMQ with Redis to manage AI generation queues. This allows the system to handle multiple heavy LLM requests simultaneously without blocking the event loop.
- **PDF Generation**: Question papers are converted to PDF using Headless Puppeteer for pixel-perfect printing/downloads directly from the browser.

## 📁 Project Structure
```text
.
├── backend/          # Express API & BullMQ Workers
│   ├── src/
│   │   ├── routes/    # Standardized API Endpoints
│   │   ├── services/  # LLM (AI) & PDF generation logic
│   │   └── workers/   # Background paper generation
├── frontend/         # Next.js Application
│   ├── app/           # AppRouter pages & layouts
│   ├── components/    # Atomic UI components & Skeletons
│   └── store/         # Redux Toolkit slices
└── README.md         # You are here
```
