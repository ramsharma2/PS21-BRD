# 🤖 AI-Powered BRD Generator

An AI-powered platform that generates comprehensive **Business Requirements Documents (BRDs)** from emails, transcripts, documents, CSV datasets, and manual text — using Google Gemini AI.

---

## ✨ Features

- 📄 **Multi-format ingestion** — Upload PDFs, TXT, CSVs, paste text, or import Enron-style email datasets
- 🤖 **AI-powered extraction** — Gemini classifies content, filters noise, and extracts requirements
- 📝 **Full BRD generation** — Executive summary, objectives, stakeholders, requirements, risks, timeline, RTM
- ✏️ **AI-assisted editing** — Natural language edits ("make it more concise", "add security requirements")
- ⚔️ **Conflict detection** — Detects contradictions between stakeholder inputs
- 📊 **Requirements Traceability Matrix (RTM)** — Links requirements back to source data
- 📤 **Export** — Download as PDF or DOCX

---

## ⚡ Quick Start (No Docker Required)

### Prerequisites
- **Node.js v18+** — [Download](https://nodejs.org/)
- **Google Gemini API Key** — [Get one free](https://aistudio.google.com/app/apikey)

> **No Docker, no PostgreSQL, no Redis, no Chroma needed.** The app uses SQLite for storage and runs entirely locally.

---

### Step 1 — Clone & Install

```bash
git clone https://github.com/ramsharma2/PS21-BRD.git
cd PS21-BRD

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

---

### Step 2 — Configure Backend

Create/edit `backend/.env` with the following:

```env
# ============================================
# AI CONFIGURATION (REQUIRED)
# ============================================
GEMINI_API_KEY=your_gemini_api_key_here
GOOGLE_EMBEDDING_MODEL=text-embedding-004
GEMINI_MODEL=gemini-1.5-pro

# Live mode: false = real AI (recommended), true = instant mock responses
MOCK_MODE=false

# ============================================
# DATABASE (SQLite - no setup needed)
# ============================================
DATABASE_URL=file:./dev.db

# ============================================
# VECTOR DATABASE (disabled — handled gracefully)
# ============================================
CHROMA_HOST=

# ============================================
# AUTHENTICATION (bypassed — no sign-in required)
# ============================================
CLERK_SECRET_KEY=sk_test_your_key_here
CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
SKIP_AUTH=true

# ============================================
# APPLICATION
# ============================================
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000
MAX_FILE_SIZE=2048
CHUNK_SIZE=500
CHUNK_OVERLAP=100
RELEVANCE_THRESHOLD=0.6
SIMILARITY_THRESHOLD=0.92
```

> **Only `GEMINI_API_KEY` is required.** Everything else is pre-configured.

---

### Step 3 — Configure Frontend

Create/edit `frontend/.env`:

```env
# Clerk (key is required to avoid startup errors even with auth bypassed)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here

# Backend API URL
VITE_API_URL=http://localhost:3001/api

# Skip sign-in — go straight to dashboard
VITE_SKIP_AUTH=true
```

---

### Step 4 — Initialize Database

```bash
cd backend
npx prisma generate
npx prisma db push
```

---

### Step 5 — Start the App

Open **two terminals**:

**Terminal 1 — Backend:**
```bash
cd backend
npx tsx watch src/index.ts
```
Wait for: `🚀 BRD Generator API Server running on port 3001`

**Terminal 2 — Frontend:**
```bash
cd frontend
npx vite
```
Visit `http://localhost:5173` — you land directly on the dashboard, **no sign-in required**.

---

## 🧪 Test the Full Flow

1. Click **"New Project"** → give it a name
2. Go to **"Import Dataset"** → upload a `.csv` or `.txt` file (or use the sample below)
3. Click **"Generate BRD"** — the AI processes and extracts requirements
4. View the generated BRD in the editor
5. Try **AI Edit**: click a section → type "add a risk about data privacy" → see it update live
6. Export as **PDF** or **DOCX**

### Sample Data
Drop any of these into the import screen:
- A CSV with columns like `From`, `Subject`, `Body` (email-style)
- Any `.txt` document with requirements, meeting notes, or stakeholder feedback

---

## ⚙️ Configuration Reference

| Variable | Default | Description |
|---|---|---|
| `GEMINI_API_KEY` | *(required)* | Google AI Studio API key |
| `GEMINI_MODEL` | `gemini-1.5-pro` | Gemini model for generation |
| `GOOGLE_EMBEDDING_MODEL` | `text-embedding-004` | Embedding model |
| `MOCK_MODE` | `false` | `true` = instant fake BRD (demo), `false` = real AI |
| `SKIP_AUTH` | `true` | `true` = no sign-in required |
| `VITE_SKIP_AUTH` | `true` | Frontend auth bypass |
| `DATABASE_URL` | `file:./dev.db` | SQLite path |
| `CHUNK_SIZE` | `500` | Words per document chunk |
| `RELEVANCE_THRESHOLD` | `0.6` | Min score to keep a chunk (0–1) |

---

## 🔄 Mock Mode vs Live Mode

| | Mock Mode (`MOCK_MODE=true`) | Live Mode (`MOCK_MODE=false`) |
|---|---|---|
| Speed | Instant | 30–90 seconds |
| Output | Pre-written demo BRD | AI-generated from your actual data |
| API calls | None | Uses Gemini API (free tier works) |
| Best for | UI demo, screenshot | Real usage |

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui |
| Backend | Node.js, Express, TypeScript, Prisma |
| Database | SQLite (dev) / PostgreSQL (prod) |
| AI | Google Gemini 1.5 Pro + text-embedding-004 |
| Vector Store | ChromaDB (optional, skipped gracefully if absent) |
| Auth | Clerk (optional, bypassable with `SKIP_AUTH=true`) |

---

## 🚨 Common Errors & Fixes

| Error | Fix |
|---|---|
| `Cannot find module` | Run `npm install` in both `backend/` and `frontend/` |
| `Database not found` | Run `npx prisma db push` in `backend/` |
| `401 Unauthorized` | Set `SKIP_AUTH=true` in `backend/.env` and `VITE_SKIP_AUTH=true` in `frontend/.env` |
| `BRD generation hangs` | Check that `GEMINI_API_KEY` is valid and has quota |
| `Embedding 404 error` | Already fixed — embeddings use the `v1` API endpoint automatically |
| `ChromaDB connection refused` | Normal — the app skips vector store gracefully, no action needed |
| Port already in use | Change `PORT=3002` in `backend/.env` and `VITE_API_URL=http://localhost:3002/api` in `frontend/.env` |

---

## 📁 Project Structure

```
PS21-BRD/
├── backend/
│   ├── src/
│   │   ├── routes/          # API routes (brd, ingestion, edit, projects)
│   │   ├── services/        # Business logic (brdGenerator, extraction, noiseFilter)
│   │   ├── middleware/       # Auth, error handling, rate limiting
│   │   ├── utils/           # Embeddings, prompts, parsers
│   │   └── db/schema.prisma # Database schema
│   └── .env                 # ← Your config lives here
├── frontend/
│   ├── src/
│   │   ├── pages/           # Dashboard, BRDEditor, DataImport, etc.
│   │   ├── components/      # UI components
│   │   └── services/api.ts  # API client
│   └── .env                 # ← Frontend config lives here
└── README.md
```
