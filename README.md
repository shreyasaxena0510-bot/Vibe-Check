# Startup Vibe Check

Gen Z startup idea analyzer powered by Google Gemini, deployed on Vercel.

## Project structure

```
├── api/vibe-check.js   # Serverless API (Gemini calls happen here)
├── public/index.html   # Frontend UI
├── vercel.json
└── .env.example
```

The Gemini API key stays on the server — it is never exposed to the browser.

## Setup

### 1. Get a Gemini API key

1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Create an API key

### 2. Local development

```bash
cp .env.example .env.local
# Edit .env.local and set GEMINI_API_KEY=your_key

npx vercel dev
```

Open [http://localhost:3000](http://localhost:3000).

### 3. Deploy to Vercel

**Option A — Vercel CLI**

```bash
npm i -g vercel
vercel login
vercel
# Add GEMINI_API_KEY when prompted, or set it in the Vercel dashboard
vercel --prod
```

**Option B — GitHub + Vercel dashboard**

1. Push this repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo
3. Add environment variable: `GEMINI_API_KEY` = your key
4. Deploy

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Google Gemini API key |
| `GEMINI_MODEL` | No | Model name (default: `gemini-2.0-flash`) |
