# AgenticRAG — AI Research Assistant

An autonomous research assistant that retrieves multi-source data, grades information quality, and reasons across documents to provide grounded, cited answers.

## ✨ Features

- 🤖 **Agentic Pipeline** — Query rewriting → Retrieval → Grading → Answer synthesis
- 📄 **Document Upload** — PDF, DOCX, and TXT support with automatic chunking
- 🔗 **Knowledge Graph** — Entity & relationship visualization
- 📊 **Dashboard** — Usage stats and session analytics
- 🔐 **Auth** — Firebase Email/Password (with optional Demo Mode)
- ⚡ **Real-time** — Streaming step-by-step reasoning via SSE

## 🚀 Quick Start (Local Dev)

### 1. Clone the repo
```bash
git clone https://github.com/muhammadnouman911/AgenticRAG.git
cd AgenticRAG
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
```bash
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
```

### 4. Run the dev server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## 🐳 Docker Deployment

### Using Docker Compose (recommended)
```bash
cp .env.example .env
# Edit .env with your GEMINI_API_KEY and APP_URL

docker-compose up -d
```

### Using Docker directly
```bash
docker build -t agenticrag .
docker run -p 3000:3000 \
  -e GEMINI_API_KEY=your_key_here \
  -e APP_URL=http://localhost:3000 \
  -v agenticrag_data:/app/data \
  agenticrag
```

## ☁️ Cloud Run Deployment

1. Build and push the image (done automatically by GitHub Actions on push to `main`).
2. Deploy from the image:
```bash
gcloud run deploy agenticrag \
  --image ghcr.io/muhammadnouman911/agenticrag:latest \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=your_key,APP_URL=https://your-cloud-run-url
```

## 🔑 Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | ✅ | Google Gemini API key |
| `APP_URL` | ✅ | Public URL of your deployment |
| `VITE_ENABLE_DEMO_MODE` | ❌ | Set `true` to bypass Firebase Auth |

## 🏗️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, React Flow
- **Backend**: Express.js, TypeScript (tsx)
- **Database**: SQLite (better-sqlite3)
- **AI**: Google Gemini 2.5 Flash
- **Auth**: Firebase Auth
- **Build**: Vite 6
