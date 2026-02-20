# 🚀 Quick Setup Guide - BRD Generator

## Prerequisites Check

✅ **Node.js**: v21.1.0 (Installed)  
✅ **npm**: v10.2.0 (Installed)  
❌ **Docker**: Not installed

## Setup Options

### Option A: Full Setup (Recommended - Requires Docker)

Docker is needed for PostgreSQL, Redis, and ChromaDB. Install Docker Desktop:
- Download: https://www.docker.com/products/docker-desktop

### Option B: Quick Start (Without Docker - For Frontend Development)

You can run the frontend and test the UI without the backend services.

---

## Installation Steps

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Configuration

#### Backend (.env)
```bash
cd backend
copy .env.example .env
```

Edit `backend/.env` and add:
```env
# Minimum required for testing
GEMINI_API_KEY=your_gemini_api_key_here
CLERK_SECRET_KEY=your_clerk_secret_key_here
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here

# Database (if using Docker)
DATABASE_URL=postgresql://brd_user:brd_password@localhost:5432/brd_generator
REDIS_URL=redis://localhost:6379
CHROMA_HOST=http://localhost:8000

# Development mode (set to true to skip AI API calls)
MOCK_MODE=true
```

#### Frontend (.env)
```bash
cd frontend
copy .env.example .env
```

Edit `frontend/.env` and add:
```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
VITE_API_URL=http://localhost:3001/api
```

### 3. Get API Keys

#### Gemini API Key
1. Go to https://makersuite.google.com/app/apikey
2. Create a new API key
3. Copy to `GEMINI_API_KEY` in backend/.env

#### Clerk Keys
1. Go to https://clerk.com
2. Create a free account
3. Create a new application
4. Copy the keys from the API Keys section:
   - `CLERK_SECRET_KEY` → backend/.env
   - `CLERK_PUBLISHABLE_KEY` → both backend/.env and frontend/.env

---

## Running the Application

### With Docker (Full Stack)

```bash
# Start infrastructure
npm run docker:up

# Setup database
cd backend
npm run db:generate
npm run db:migrate
npm run db:seed  # Optional: adds demo data

# Start both frontend and backend
cd ..
npm run dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:3001

### Without Docker (Frontend Only)

```bash
# Start frontend only
cd frontend
npm run dev
```

- Frontend: http://localhost:3000
- Note: Backend features won't work without Docker services

---

## Quick Test

### Frontend UI Test (No Backend Required)

1. Start frontend: `cd frontend && npm run dev`
2. Open http://localhost:3000
3. You'll see the UI but backend calls will fail (expected)

### Full Stack Test (Requires Docker)

1. Start all services: `npm run dev`
2. Open http://localhost:3000
3. Sign in with Clerk
4. Create a new project
5. Upload a sample document
6. Process and generate BRD

---

## Troubleshooting

### "Cannot find module" errors
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
cd backend && npm install
cd ../frontend && npm install
```

### Port already in use
```bash
# Frontend (3000)
# Backend (3001)
# Change ports in vite.config.ts and backend/src/index.ts
```

### Docker issues
```bash
# Stop all containers
docker-compose down

# Restart
docker-compose up -d
```

---

## Next Steps

1. **Install Docker Desktop** (if not already installed)
2. **Get API keys** (Gemini + Clerk)
3. **Run setup commands** above
4. **Test the application**

Need help? Check the full [README.md](file:///c:/Users/sram4/OneDrive/Desktop/BRD/README.md)
