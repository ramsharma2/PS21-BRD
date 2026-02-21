---
description: Tech Stack Overview and Local Database Setup Guide
---

# 🚀 Project Tech Stack & Setup Guide

Welcome to the project! This guide is designed for beginners to understand the technologies used in this project and how to get the databases running on your local machine using Docker.

## 📚 1. What is our Tech Stack?

A "Tech Stack" is the combination of programming languages, tools, and frameworks used to build the application. Here is what this project uses:

*   **Frontend (User Interface):** 
    *   **React & Vite:** Used to build the website you see in your browser.
    *   **TypeScript:** A stricter version of JavaScript that helps catch errors early.
    *   **Tailwind CSS & Shadcn/ui:** Used to style the website and make it look beautiful.
*   **Backend (Server Logic):** 
    *   **Node.js & Express:** The core server that processes requests from the frontend.
    *   **Prisma:** A tool that helps the backend easily communicate with the PostgreSQL database.
*   **AI (Artificial Intelligence):** 
    *   **Google Gemini Pro:** The AI model used for text generation.
    *   **LangChain:** A framework used to build applications powered by AI.
*   **Databases & Infrastructure:** 
    *   **PostgreSQL:** The main relational database where user data, projects, and structured information are stored.
    *   **ChromaDB:** A special "vector" database used by the AI to remember and understand the context of documents.
    *   **Redis:** A fast, temporary storage system used for caching data and managing background tasks/queues.
    *   **Docker:** A tool that packages software into standardized units called "containers." It makes setting up databases incredibly easy!

---

## 🐳 2. How to Setup PostgreSQL, ChromaDB, and Redis

Because we use **Docker**, you do not need to install these databases individually. Docker will download and run them for you automatically!

### Prerequisites
1.  **Install Docker Desktop:** Download and install it from [docker.com](https://www.docker.com/products/docker-desktop/).
2.  **Open Docker Desktop:** Make sure the application is running in the background (you should see the Docker whale icon in your taskbar/menu bar).

### Running the Databases
1.  Open your terminal (or command prompt).
2.  Navigate to your project folder (e.g., `/Users/vinayyadav/GencoftProjects/PS21-BRD`).
3.  Run the following magic command:
    ```bash
    docker-compose up -d
    ```
    *   `docker-compose up` tells Docker to read the `docker-compose.yml` file and start all the services (Postgres, Redis, ChromaDB).
    *   `-d` means "detached mode", meaning it runs in the background so you can continue using your terminal.

---

## 🔍 3. How to See Your Data in the Database

Since you mentioned you don't know much tech, the easiest way to view your data is using **Free Graphical User Interface (GUI) Tools** or **Docker Desktop itself**.

### A. Viewing PostgreSQL Data (Main Database)
PostgreSQL is where your main app data lives. The easiest way for beginners to see this data is by using a free tool called **DBeaver** or **pgAdmin**.

**Using DBeaver (Recommended for Beginners):**
1.  Download and install **DBeaver Community Edition** from [dbeaver.io](https://dbeaver.io/).
2.  Open DBeaver and click the **"New Database Connection"** icon (looks like a plug with a plus sign).
3.  Select **PostgreSQL** and click Next.
4.  Fill in the connection details (these are defined in your `docker-compose.yml` file):
    *   **Host:** `localhost`
    *   **Port:** `5432`
    *   **Database:** `brd_generator`
    *   **Username:** `brd_user`
    *   **Password:** `brd_password`
5.  Click **"Test Connection"**. If it succeeds, click **"Finish"**.
6.  You can now browse your tables and view data by expanding the connection tree on the left panel (Databases -> brd_generator -> Schemas -> public -> Tables).

**Using Docker Desktop Terminal (CLI Method):**
If you want to do it quickly without installing DBeaver:
1.  Open **Docker Desktop**.
2.  Go to the **"Containers"** tab.
3.  Find the container named `brd-postgres` and click on it.
4.  Click on the **"Exec"** tab (this opens a terminal inside the database).
5.  Type the following command and press Enter:
    ```bash
    psql -U brd_user -d brd_generator
    ```
6.  You are now inside the database! You can type `\dt` to list all tables, or `SELECT * FROM "User";` to see users (replace `"User"` with your actual table name).

### B. Viewing Redis Data
Redis stores temporary background data. It's usually not meant for human reading, but you can view it.

**Using Docker Desktop CLI:**
1.  Open **Docker Desktop** -> **Containers**.
2.  Find the `brd-redis` container and click it.
3.  Go to the **"Exec"** tab.
4.  Type `redis-cli` and press Enter.
5.  Type `KEYS *` to see all stored keys.

**GUI Method (Optional):**
You can download **RedisInsight**, a free official visual tool by Redis, and connect it to `localhost` on port `6379`.

### C. Viewing ChromaDB Data (AI Vector Database)
ChromaDB stores your text as "vectors" (lists of numbers) so the AI can understand it. Because it's a vector database, it doesn't have traditional tables you can look at easily.

Usually, you interact with ChromaDB through your backend code (LangChain). It is highly technical and mostly numbers, so there is no standard beginner-friendly database viewer for it. However, as long as the Docker container `brd-chromadb` is running (green in Docker Desktop), it is working perfectly!
