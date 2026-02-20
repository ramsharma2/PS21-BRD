# 🎯 Quick Start Guide - BRD Generator Backend

This guide will help you get the backend up and running quickly.

## Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] Docker Desktop installed and running
- [ ] Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))
- [ ] Clerk account created ([Sign up](https://clerk.com))

## Step-by-Step Setup

### 1. Install Dependencies

```bash
# From the project root
cd c:\Users\sram4\OneDrive\Desktop\BRD

# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install
```

### 2. Configure Environment

```bash
# Copy the example file
cp .env.example .env
```

Edit `.env` and add your API keys:

```env
# REQUIRED
GEMINI_API_KEY=your_actual_gemini_api_key_here
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key

# Optional - use defaults for local development
DATABASE_URL=postgresql://brd_user:brd_password@localhost:5432/brd_generator
REDIS_URL=redis://localhost:6379
CHROMA_HOST=http://localhost:8000

# For testing without API calls
MOCK_MODE=true
```

### 3. Start Infrastructure

```bash
# From the root directory
npm run docker:up
```

Wait for all services to be healthy (about 30 seconds):
- ✅ PostgreSQL
- ✅ Redis  
- ✅ ChromaDB

Verify with:
```bash
docker ps
```

### 4. Set Up Database

```bash
cd backend

# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed with demo data (optional but recommended)
npm run db:seed
```

### 5. Start Backend Server

```bash
# From backend directory
npm run dev
```

You should see:
```
╔═══════════════════════════════════════════════════════════╗
║   🚀 BRD Generator API Server                            ║
║   Environment: development                                ║
║   Port:        3001                                       ║
║   Mock Mode:   ENABLED                                    ║
╚═══════════════════════════════════════════════════════════╝
```

### 6. Test the API

```bash
# Health check
curl http://localhost:3001/health

# Should return:
# {"success":true,"data":{"status":"healthy",...}}
```

## 🧪 Testing the Full Pipeline

If you ran the seed script, you have a demo project ready to test:

### 1. Get the Demo Project ID

The seed script output shows the project ID, or query it:

```bash
# Using Prisma Studio (visual database browser)
npm run db:studio
```

### 2. Process Sources (Noise Filtering + Extraction)

```bash
curl -X POST http://localhost:3001/api/brd/process/PROJECT_ID_HERE \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN"
```

### 3. Generate BRD

```bash
# Non-streaming
curl -X POST http://localhost:3001/api/brd/generate/PROJECT_ID_HERE \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN"

# With streaming (see progress in real-time)
curl -X POST "http://localhost:3001/api/brd/generate/PROJECT_ID_HERE?stream=true" \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN"
```

### 4. Get the Generated BRD

```bash
curl http://localhost:3001/api/brd/PROJECT_ID_HERE \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN"
```

### 5. Export as Markdown

```bash
curl http://localhost:3001/api/brd/PROJECT_ID_HERE/export/md \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -o BRD.md
```

## 📊 Available API Endpoints

### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project details
- `PATCH /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Data Ingestion
- `POST /api/ingestion/upload` - Upload document (PDF, DOCX, TXT, CSV, XLSX)
- `POST /api/ingestion/text` - Submit manual text
- `GET /api/ingestion/sources/:projectId` - List sources
- `DELETE /api/ingestion/sources/:sourceId` - Delete source

### BRD Processing & Generation
- `POST /api/brd/process/:projectId` - Process sources (filter + extract)
- `POST /api/brd/generate/:projectId` - Generate BRD
- `GET /api/brd/:projectId` - Get BRD
- `GET /api/brd/:projectId/stats` - Get statistics
- `GET /api/brd/:projectId/export/:format` - Export (json, md)

## 🐛 Troubleshooting

### Docker services won't start
```bash
npm run docker:down
docker system prune -a
npm run docker:up
```

### Database migration errors
```bash
cd backend
npm run db:push  # Force push schema
```

### "Cannot find module" errors
```bash
cd backend
npm install
npm run db:generate  # Regenerate Prisma client
```

### Gemini API errors
- Verify your API key is correct
- Check quota at https://makersuite.google.com
- Enable `MOCK_MODE=true` for testing without API calls

## 🎯 Next Steps

1. **Test with your own data**: Upload documents via `/api/ingestion/upload`
2. **Build the frontend**: React UI to visualize the BRD
3. **Add integrations**: Gmail, Slack, Fireflies
4. **Implement editing**: Natural language BRD editing

## 📚 Architecture Overview

```
User uploads document
    ↓
Document Parser (PDF/DOCX/etc)
    ↓
Text Chunking (500 tokens, 100 overlap)
    ↓
Noise Filtering (Gemini AI)
    ↓
Information Extraction (Gemini AI)
    ↓
Deduplication (Vector similarity)
    ↓
BRD Generation (12 sections, Gemini AI)
    ↓
Structured BRD Document
```

## 🔑 Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GEMINI_API_KEY` | ✅ Yes | - | Google Gemini API key |
| `CLERK_SECRET_KEY` | ✅ Yes | - | Clerk auth secret |
| `MOCK_MODE` | No | false | Use mock AI (no API calls) |
| `DATABASE_URL` | ✅ Yes | - | PostgreSQL connection |
| `REDIS_URL` | ✅ Yes | - | Redis connection |
| `CHROMA_HOST` | ✅ Yes | - | ChromaDB host |

See `.env.example` for complete list.
