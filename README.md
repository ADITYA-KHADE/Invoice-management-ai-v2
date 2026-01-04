# Invoice Management AI

End-to-end system combining a FastAPI backend with a Vite/React frontend for ingesting, parsing, and exploring invoices with RAG-based chat.

## Architecture Overview
- **Backend (FastAPI)**
  - File upload pipeline (PDF/images/Office) → optional conversion → Firebase storage → MongoDB invoice record.
  - Invoice parsing via PDF/image loaders and structured extraction.
  - Vector store (Qdrant) for RAG over invoice content.
  - REST APIs under `/api` for uploads, invoice listing, invoice detail, and chat.
- **Frontend (Vite + React)**
  - Dashboard, uploads, buyers list, uploaded files, invoice preview, and per-invoice chatbot.
  - Tailwind-style utility classes for UI styling.
  - Uses `VITE_AGENT_API_BASE` to call backend APIs.

## Backend
- Stack: FastAPI, MongoDB (async motor), Firebase Storage, Qdrant, OpenAI.
- Key modules (folder: `Agent`):
  - `main.py` – app init, CORS, router includes
  - `RAG/rag_upload.py` – upload & persistence
  - `RAG/rag_retrive.py` – chat/RAG
  - `RAG/invoice_api.py` – invoice listing/detail
  - `database.py` – Mongo connection
  - `firebase.py` – Firebase bucket helper
- Important env vars (set in `Agent/.env`):
  - `FRONTEND_ORIGIN` (default http://localhost:5173)
  - `MONGODB_URI`, `MONGODB_DB`
  - `QDRANT_URL`, `QDRANT_API_KEY`
  - `OPENAI_API_KEY`
  - Firebase credentials (via `serviceAccountKey.json`)
- Run backend:
  ```bash
  cd Agent
  fastapi dev ./main.py
  # or: uvicorn main:app --reload
  ```
- Core endpoints:
  - `GET /` health message
  - `GET /health` health check
  - `POST /api/upload` upload an invoice file (pdf/png/jpg/jpeg/docx/xlsx)
  - `GET /api/invoices` list invoices
  - `GET /api/invoices/{invoice_id}` invoice detail
  - `POST /api/chat/ask` body: `{ invoice_id, input_query, k? }`

## Frontend
- Stack: React (Vite), React Router.
- Location: `frontend`.
- Env: `frontend/.env` → `VITE_AGENT_API_BASE=http://localhost:8000`
- Run frontend:
  ```bash
  cd frontend
  npm install
  npm run dev
  ```
- Key routes:
  - `/` dashboard
  - `/upload` upload invoice
  - `/uploaded-files` list
  - `/buyers` buyers list
  - `/invoice-preview?invoice_id=...` preview + chatbot

## System Design Notes
- **Data flow:** Upload → temp file → optional conversion → Firebase public URL → extracted/structured data → MongoDB invoice record → vectorization to Qdrant → served via API.
- **Chat:** Query filtered by `invoice_id` in Qdrant; OpenAI generates answer constrained to retrieved context.
- **Storage:** Firebase for files, MongoDB for metadata/structured invoice, Qdrant for embeddings.
- **Security/CORS:** Origins from `FRONTEND_ORIGIN` and localhost; adjust in `main.py` for deployment.
- **Error handling:** Backend returns HTTP errors for invalid uploads; frontend shows loading/empty/error states in pages.

## Useful Commands
- Backend: `fastapi dev ./main.py`
- Frontend: `npm run dev`

## Deployment Considerations
- Configure environment secrets for OpenAI, Qdrant, MongoDB, Firebase.
- Serve frontend build via CDN or static host; point `VITE_AGENT_API_BASE` to deployed API.
- Use HTTPS and restrict CORS to allowed domains.
