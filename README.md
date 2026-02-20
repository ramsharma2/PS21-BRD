# AI-Powered BRD Generator

A full-stack platform that uses AI to generate comprehensive Business Requirements Documents (BRDs) from uploaded files, manual text, and integrations.

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18+
- **Docker Desktop** (for PostgreSQL, Redis, ChromaDB)
- **Gemini API Key** (Get one from Google AI Studio)
- **Clerk Account** (For authentication)

### 1. Environment Setup

Copy the example `.env` file and fill in your keys:

```bash
cp .env.example .env
```

**Required Variables:**
- `GEMINI_API_KEY`: Your Google Gemini API Key.
- `DATABASE_URL`: `postgresql://...` (Default provided is fine if using Docker).
- `CLERK_SECRET_KEY`: Your Clerk Secret Key.
- `CLERK_PUBLISHABLE_KEY`: Your Clerk Publishable Key.

### 2. Infrastructure (Docker)

Start the database, queue, and vector store:

```bash
docker-compose up -d
```

### 3. Backend Setup

Open a terminal in the `backend` folder:

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

### 4. Frontend Setup

Open a new terminal in the `frontend` folder:

```bash
cd frontend
npm install
npm run dev
```

Navigate to `http://localhost:5173` to use the app.

---

## 🧪 Testing Workflow

To verify the application works correctly without manually uploading files every time, follow this workflow:

### Step 1: Seed the Database
We provided a seed script to create a demo project with pre-populated data (Sources, BRD, RTM, Conflicts).

**Run this in the `backend` folder:**
```bash
npm run db:seed
```
*Note: You may need to update the `userId` in `backend/src/utils/seed.ts` to match your clerk user ID if you want to see the project in your dashboard.*

### Step 2: Test the UI
1.  **Login:** Use the Clerk authentication to sign in.
2.  **Dashboard:** You should see "Demo E-Commerce BRD".
3.  **Features:**
    *   Click the project card.
    *   Go to **Conflict Detection** to see the simulated conflict.
    *   Go to **Traceability (RTM)** to see the requirements matrix.
    *   Go to **Editor**, click "Edit", and try the "Export" dropdown to test PDF/DOCX generation.

### Step 3: Verify Connectors
1.  Create a **New Project**.
2.  Go to **Ingest Data**.
3.  Test the **Manual Text** tab.
4.  Test the **Slack** and **Fireflies** tabs (mock integration will show a toast notification).

---

## 🛠 Tech Stack

- **Frontend:** React, Vite, TypeScript, Tailwind CSS, Shadcn/ui
- **Backend:** Node.js, Express, Prisma
- **AI:** Google Gemini Pro, LangChain
- **Database:** PostgreSQL (Data), ChromaDB (Vectors), Redis (Queue)
