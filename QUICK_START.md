# 🚀 Quick Start Commands (No-Docker)

## Prerequisites
- ✅ Get Gemini API Key: https://aistudio.google.com/app/apikey
- ✅ Get Clerk Keys: https://dashboard.clerk.com/

---

## Backend Setup

```bash
cd backend

# 1. Create .env file
# Copy the template and fill in your keys:
# - GEMINI_API_KEY=AIza...
# - CLERK_SECRET_KEY=sk_test_...
# - CLERK_PUBLISHABLE_KEY=pk_test_...

# 2. Install dependencies
npm install

# 3. Setup database
npx prisma generate
npx prisma db push

# 4. Start server
npm run dev
```

---

## Frontend Setup

```bash
cd frontend

# 1. Create .env file
# Add: VITE_CLERK_PUBLISHABLE_KEY=pk_test_...

# 2. Install dependencies
npm install

# 3. Start server
npm run dev
```

---

## Test the App

1. Open: http://localhost:5173
2. Sign up with your email
3. Create a new project
4. Add requirements via "Manual Text" tab
5. Click "Process Sources" → "Generate BRD"
6. Watch the AI generate your BRD!

---

## What Works Without Docker

✅ Authentication
✅ Project creation
✅ Manual text input
✅ File uploads
✅ AI BRD generation
✅ Natural language editing
✅ Export (PDF/DOCX/Markdown)
✅ Version history
✅ Analytics

⚠️ Limited: Vector search, deduplication
❌ Not working: OAuth integrations (use manual paste instead)
