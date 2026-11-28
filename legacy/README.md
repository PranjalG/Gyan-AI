# GyanAI | Enterprise Agentic Knowledge Platform

**Agentic Premier League — Udaipur**

**GyanAI** is a full-stack Retrieval-Augmented Generation platform: ingest government health schemes and hospital documents, store embeddings in **Supabase pgvector**, and chat with **grounded, cited answers** powered by **Google Gemini**.

![Stack](https://img.shields.io/badge/React-Tailwind-61DAFB)
![Stack](https://img.shields.io/badge/Node-Express-339933)
![Stack](https://img.shields.io/badge/Supabase-pgvector-3ECF8E)
![Stack](https://img.shields.io/badge/Gemini-1.5_Flash-4285F4)

---

<img width="1672" height="941" alt="GyanAI Healthcare Data Platform" src="https://github.com/user-attachments/assets/d256083c-9e7e-4cbf-8f93-25272c4a8017" />

---

## YouTube Demo Links

- Demo Video 1: [https://www.youtube.com/watch?v=rUcBEQO7k-8](https://www.youtube.com/watch?v=rUcBEQO7k-8)
- Demo Video 2: [https://www.youtube.com/watch?v=dhTX5heMs4E](https://www.youtube.com/watch?v=dhTX5heMs4E)

---

## Quick start

### 1. Supabase setup

1. Create a free project at [supabase.com](https://supabase.com)
2. Open **SQL Editor** and run `supabase/schema.sql`
3. Copy **Project URL** and **anon public key** from Settings → API

### 2. Gemini API key

Get a key from [Google AI Studio](https://aistudio.google.com/apikey)

### 3. Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your keys
npm install
npm run dev
```

Server runs at `http://localhost:3001`

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:5173` (proxies `/api` to backend)

---

## Demo flow (for judges)

1. Open **Chat** tab — empty state shows the hospital health-scheme use case
2. Go to **Ingest** → **Paste Text** (sample PM-JAY / Ayushman Bharat text pre-loaded) → **Ingest**
3. Watch progress: Chunking → Embedding → Storing
4. Return to **Chat** → ask: *"Is a BPL family covered for cancer surgery?"* (or use **Voice**)
5. See answer with `[Source 1]` citations, similarity badges, and **HIGH** confidence
6. Open **Architecture** tab — animated pipeline + live stats + Powered by Google
7. Use **Sources Explorer** sidebar to view/delete documents

---

## Environment variables

| Variable | Description |
|----------|-------------|
| `GEMINI_API_KEY` | Google Gemini API key |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anon key (used server-side only) |
| `PORT` | Backend port (default 3001) |

**Security:** Keys live in `backend/.env` only. The frontend never sees API keys.

---

## Architecture

```
[Upload/Paste] → [Chunker] → [Gemini Embeddings] → [Supabase pgvector]
                                                          ↓
[Answer] ← [Gemini Flash] ← [Top-3 Retrieval] ← [Query Embedding]
```

---

## API routes

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/ingest` | Chunk, embed, store document |
| POST | `/api/chat` | Grounded Q&A with citations |
| GET | `/api/documents` | List documents + chunk counts |
| GET | `/api/history` | Last 20 chats |
| GET | `/api/stats` | Aggregate stats |
| DELETE | `/api/documents/:id` | Delete document (cascades chunks) |

---

## Project structure

```
gyanaai/  (or rag-revolution/)
├── backend/          # Express API
├── frontend/         # React + Vite + Tailwind
├── supabase/         # SQL schema
└── README.md
```

---

## For judges — 30-second pitch

**GyanAI** (*Gyan* = knowledge in Hindi) helps hospital staff answer eligibility questions **only from uploaded government health schemes** — no hallucinated PM-JAY rules or made-up coverage.

We ingest text or PDFs, chunk and embed them with Gemini, persist vectors in **Supabase pgvector** (free tier, no credit card), and at query time retrieve the top 3 similar chunks before Gemini generates a **cited, confidence-scored** answer.

### Unique selling points (USP)

1. **Fully grounded answers** — Strict system prompt forces citations `[Source 1]` or an honest “I don’t have enough information” response.
2. **Zero-cost stack** — Supabase free tier + Gemini free tier; PDF parsing runs **client-side** (no server file upload).
3. **Transparent retrieval** — Every answer shows source document name, similarity %, and HIGH/MEDIUM/LOW confidence from vector scores.
4. **Judge-ready demo** — India health-scheme use case, voice input, animated pipeline, mobile-responsive dark theme.
5. **Production-shaped architecture** — Modular Express routes, backend proxy for all secrets, pgvector `match_chunks` RPC, and persistent chat history.

---

## License

MIT — built for Agentic Premier League, Udaipur.
