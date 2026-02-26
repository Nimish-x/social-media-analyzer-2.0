# 🌿 Social Leaf Insights

> An AI-powered social media analysis and content creation platform with viral hook detection, an immersive voice coach, and cross-platform analytics to help creators grow faster.

![Frontend](https://img.shields.io/badge/frontend-React%20%2B%20Vite%20%2B%20Tailwind-61DAFB)
![Backend](https://img.shields.io/badge/backend-FastAPI-009688)
![Auth](https://img.shields.io/badge/auth-Supabase-3FCF8E)
![AI](https://img.shields.io/badge/AI-Gemini%20%26%20pyttsx3-FF3366)

## ✨ Core Features

- **🎯 Hook Detector (VLM)** - Uses advanced AI vision models to analyze your video frames, finding the exact scroll-stopping moments to boost retention.
- **🎙️ AI Voice Coach** - Instantly analyzes your script, offers retention-boosting feedback out-loud, and dynamically guides you using local voice synthesis (via `pyttsx3`).
- **📊 Cross-Platform Analytics** - Deep insights and performance metrics across your social media platforms in a beautifully designed, 100% responsive dashboard.
- **🔍 Competitor Spyglass** - Benchmark your channel against competitors using real-time API data and smart caching.
- **📈 Trend Analysis** - Discover emerging niches, topics, and styles before they go mainstream.
- **📄 Pro PDF Reporting** - Export beautiful, data-rich reports directly from the dashboard to share with sponsors or teams.
- **💳 Tiered Access** - Built-in secure authentication (Supabase) and role-based feature gating for Starter, Professional, and Business users.

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** 18+ 
- **Python** 3.10+
- **Git**
- **Supabase** Free Tier Account

### 1. Clone & Setup Supabase
1. Clone the repo:
   ```bash
   git clone https://github.com/KaranTulsani/social-leaf-insights.git
   cd social-leaf-insights
   ```
2. Create a project at [supabase.com](https://supabase.com).
3. Run the SQL migration using the provided `backend/supabase/profiles.sql`.
4. Copy your **URL** and **Anon Key**.

### 2. Backend Installation (FastAPI)
```bash
cd backend
python -m venv venv
# Activate the venv (Mac/Linux: `source venv/bin/activate`, Windows: `venv\Scripts\activate`)
pip install -r requirements.txt

# Copy example env
cp .env.example .env
```
*(Configure `.env` using your API Keys. Do NOT share your `.env` file publicly!)*

### 3. Frontend Installation (React/Vite)
```bash
cd frontend
npm install

# Create local environment config
echo "VITE_SUPABASE_URL=your-supabase-url" > .env
echo "VITE_SUPABASE_ANON_KEY=your-anon-key" >> .env
echo "VITE_API_URL=http://localhost:8000" >> .env
```

### 4. Fire It Up 🔥

Run the **backend** (Terminal 1):
```bash
cd backend
# With virtual environment activated
uvicorn app.main:app --reload --port 8000
```

Run the **frontend** (Terminal 2):
```bash
cd frontend
npm run dev
```
Open **http://localhost:8080** and start analyzing!

## 🛠️ Technology Stack
- **Frontend GUI**: React 18, TypeScript, Vite, TailwindCSS, Shadcn/UI, Framer Motion
- **Backend API**: Python FastAPI, Uvicorn, OpenCV (for frame data)
- **Database & Auth**: Supabase (PostgreSQL), JWT, Row Level Security (RLS)
- **Intelligence**: Google Gemini 1.5, OpenRouter VLM, local `pyttsx3` for lightning-fast voice generation.

## 🔒 Security Note
**Never push your `.env` files.** The repo is properly configured to ignore local `.env` variables to keep API keys for Gemini, OpenRouter, and Supabase safe. Use the provided `.env.example` to know what keys you need.

---
Built to help creators thrive. By [@KaranTulsani](https://github.com/KaranTulsani).
