<div align="center">
  <img src="frontend/public/leaf-favicon.svg" alt="Social Leaf Logo" width="120" />

  # Social Leaf Insights

  **An Enterprise-Grade Social Media Intelligence & AI Coaching Platform** <br>
  *Built with React 18, FastAPI, Supabase, and Multi-Modal AI Agents.*

  [![Frontend](https://img.shields.io/badge/Frontend-React%2018%20%7C%20Vite-61DAFB?logo=react&logoColor=black)](#frontend)
  [![Backend](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python%203.11-009688?logo=fastapi&logoColor=white)](#backend)
  [![Auth](https://img.shields.io/badge/Auth_&_DB-Supabase%20%7C%20PostgreSQL-3FCF8E?logo=supabase&logoColor=black)](#database--authentication)
  [![AI](https://img.shields.io/badge/AI-Gemini%201.5%20%7C%20VLM-FF3366?logo=google-gemini&logoColor=white)](#ai--ml-infrastructure)

</div>

<br/>

Social Leaf Insights is a robust, full-stack application engineered to provide creators and agencies with deep analytical insights and AI-driven content coaching. It bridges the gap between raw social media metrics and actionable content strategies through advanced data aggregation, machine learning capabilities, and real-time processing.

---

## ⚡ Core Architecture & Engineering Highlights

### 🧠 Advanced AI & Multi-Modal Capabilities
*   **VLM Hook Detection System**: Utilizes OpenRouter's vision-language models to perform frame-by-frame analysis of short-form video content, pinpointing psychological "hooks" to optimize viewer retention curves.
*   **Interactive Voice Coaching (pyttsx3)**: Features a locally synthesized, dynamically adapting voice agent that analyzes script semantics and delivers out-loud, pacing-aware feedback on content structure.
*   **Intelligent Trend Forecasting**: Leverages Google Gemini 1.5 to process large datasets of competitor metadata, identifying sentiment shifts and emerging algorithmic content patterns.

### 🔌 Powerful Data & Analytics Infrastructure
*   **Cross-Platform Aggregation**: Unified API architecture standardizing data from YouTube (Data API v3) and Instagram (Graph API patterns), complete with proactive rate-limiting and intelligent caching layers.
*   **Competitor Spyglass Dashboard**: Real-time benchmarking tools providing comparative velocity metrics, graphical performance overlays, and tag analysis against industry rivals.
*   **Automated Pro PDF Reporting**: Client-side document generation using highly customized `jspdf` and `html2canvas` pipelines for pixel-perfect, exportable executive summaries.

### 🛡️ Enterprise-Ready Security & Auth
*   **Row-Level Security (RLS)**: Enforced database isolation ensuring multi-tenant data privacy across different connected social accounts.
*   **RBAC Tiered Gating**: Automated middleware authorization handling complex feature-flagging for Starter, Professional, and Business tiers.

---

## �️ Comprehensive Technology Stack

### Frontend Ecosystem
*   **Core**: React 18, TypeScript, Vite
*   **State & Fetching**: React Query (@tanstack/react-query), Zustand (Implicit via context)
*   **Styling & UI**: TailwindCSS, Shadcn/UI, Radix UI Primitives, Lucide Icons
*   **Animation**: Framer Motion
*   **Routing**: React Router DOM v6
*   **Forms & Validation**: Hook Form, Zod

### Backend Ecosystem
*   **Framework**: Python 3.10+, FastAPI, Uvicorn (ASGI Server)
*   **Data Processing**: Pandas, NumPy, OpenCV (Headless)
*   **External Communications**: HTTPX (Asynchronous HTTP requests)
*   **Security**: python-jose, passlib, bcrypt
*   **Background Tasks**: APScheduler

### Database & Authentication
*   **Provider**: Supabase
*   **Database**: PostgreSQL
*   **Security**: JWT tokens, OAuth providers

### AI & ML Infrastructure
*   **LLMs**: Google Gemini 1.5 Pro/Flash
*   **Vision Model**: Qwen-VL (via OpenRouter integration)
*   **TTS Simulation**: pyttsx3 (local subprocess execution for zero-latency TTS)

---

## 🚀 Development Setup & Deployment

### Prerequisites Installation
Ensure you have Node.js (v18+) and Python (v3.10+) installed on your machine.
A free-tier Supabase project is required for authentication and database services.

### 1. Supabase Initialization
1.  Navigate to your Supabase project dashboard.
2.  Execute the migration script located at `backend/supabase/profiles.sql` in the SQL Editor.
3.  Secure your `URL` and `Anon Key`. Disable "Confirm Email" in Auth providers for local development ease.

### 2. Backend Environment (FastAPI)
Initialize the Python virtual environment and install dependencies.

```bash
cd backend
python -m venv venv

# Target environment activation
source venv/bin/activate  # UNIX Systems
venv\Scripts\activate     # Windows Systems

pip install -r requirements.txt
cp .env.example .env
```
*Action Required: Populate the newly created `backend/.env` file with your specific API credentials (OpenRouter, Gemini, YouTube, etc).*

### 3. Frontend Environment (React/Vite)
Initialize the Node modules and establish environment variables.

```bash
cd frontend
npm install

# Generate environment configurations
echo "VITE_SUPABASE_URL=<YOUR_URL>" > .env
echo "VITE_SUPABASE_ANON_KEY=<YOUR_ANON_KEY>" >> .env
echo "VITE_API_URL=http://localhost:8000" >> .env
```

### 4. Running the Stack
The application utilizes a decoupled architecture. Both servers must run concurrently.

**Terminal A (ASGI Backend):**
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

**Terminal B (Vite Frontend):**
```bash
cd frontend
npm run dev
```
Navigate to `http://localhost:8080` to access the hot-reloaded development environment.

<<<<<<< HEAD

=======
---

## 🔒 Security Best Practices

This repository incorporates strict `.gitignore` matrices tailored for cloud-native deployment. 
**Never commit `.env` files to version control.** Secrets scanning tools will temporarily suspend the repository if production keys (e.g., Stripe, Supabase Service Roles) are detected in untracked blobs.

---

<div align="center">
  <i>Architected and Maintained by Karan Tulsani</i>
</div>
>>>>>>> 3eccc68 (docs: overhaul README with enterprise-grade tech stack details)
