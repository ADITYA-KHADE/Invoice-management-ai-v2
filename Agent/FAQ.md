# Backend FAQ - Invoice Management AI

## Architecture & Design Decisions

### Q: Why use FastAPI instead of Flask or Django?
**A:** FastAPI provides:
- Native async support (critical for I/O-heavy operations like file uploads, DB queries, AI API calls)
- Automatic API documentation (Swagger/OpenAPI)
- Built-in request/response validation via Pydantic
- Better performance than Flask/Django for concurrent requests
- Type hints enable better IDE support and fewer bugs

### Q: Why MongoDB over PostgreSQL?
**A:** Invoice data is:
- Semi-structured (different vendors = different fields)
- Nested (line items, taxes as arrays)
- Schema may evolve (adding new fields without migrations)
- MongoDB's document model naturally fits JSON-like invoice structure
- Easier to scale horizontally for high write loads

### Q: Why separate file storage (Firebase) from database?
**A:** 
- PDFs/images are binary blobs (inefficient in database)
- Firebase provides CDN for fast global access
- Direct browser viewing via public URLs (no proxy needed)
- Keeps database lightweight and fast
- Firebase handles security, versioning, lifecycle policies

### Q: What is the role of Qdrant? Why not just store text in MongoDB?
**A:** 
- Qdrant enables semantic search (not just keyword matching)
- Vector embeddings capture meaning, not just words
- Fast similarity search for RAG (Retrieval Augmented Generation)
- Filtered queries by invoice_id for context-specific chat
- HNSW algorithm is optimized for high-dimensional vectors

---

## Data Processing

### Q: How are different file formats handled?
**A:**
- **PDF:** Direct text extraction → OpenAI structured parsing
- **Images (PNG/JPG):** OpenAI Vision API for OCR + extraction
- **Office (DOCX/XLSX):** LibreOffice conversion to PDF → same as PDF flow
- **Validation:** File type checked, max size enforced, unsupported types rejected

### Q: What happens if OpenAI API fails during processing?
**A:**
- Upload still succeeds (file saved to Firebase)
- Invoice record created in MongoDB (with partial data)
- Structured extraction field may be empty/null
- Frontend shows "processing" or "incomplete" status
- Can retry processing via background job (future enhancement)

### Q: How accurate is invoice extraction?
**A:**
- GPT-4 models achieve 95%+ accuracy on standard invoices
- Structured output mode enforces schema compliance
- Pydantic validation catches malformed data
- Manual review/editing can be added in frontend

### Q: Can the system handle non-English invoices?
**A:**
- OpenAI models are multilingual (supports 50+ languages)
- No code changes needed for different languages
- Currency symbols, tax formats automatically detected
- Language-specific formatting handled in extraction prompt

---

## RAG & Chat System

### Q: How does the invoice chatbot work?
**A:**
1. User asks question about invoice
2. Query embedding generated (OpenAI text-embedding-3-small)
3. Qdrant retrieves top-k similar chunks (filtered by invoice_id)
4. Chunks combined as context
5. OpenAI generates answer constrained to context
6. Response returned to user

### Q: Why filter by invoice_id in vector search?
**A:**
- Prevents cross-contamination (answers from wrong invoice)
- Faster search (smaller search space)
- More relevant context (all chunks from same document)
- Security: user can't query invoices they shouldn't see

### Q: What if vector database is empty?
**A:**
- Upload process automatically populates Qdrant
- If Qdrant fails, MongoDB still has invoice data
- Chat returns "no context found" but invoice display works
- Vector store can be rebuilt from MongoDB + Firebase files

### Q: Can multiple users query the same invoice simultaneously?
**A:**
- Yes, Qdrant supports concurrent reads
- Each query is independent (no shared state)
- FastAPI async handles multiple requests efficiently
- No locking or race conditions

---

## API & Integration

### Q: Why use `/api` prefix for all endpoints?
**A:**
- Namespace separation (future: /admin, /webhook routes)
- Easier reverse proxy configuration
- Consistent with REST best practices
- Frontend can easily configure API base URL

### Q: How is CORS configured?
**A:**
- Whitelist: FRONTEND_ORIGIN from .env + localhost variants
- Credentials: Allowed (for cookies/JWT in future)
- Methods/Headers: All allowed (simplifies development)
- Production: Restrict to specific frontend domain

### Q: Can the API be versioned?
**A:**
- Yes, use `/api/v1/invoices`, `/api/v2/invoices` pattern
- Current: No versioning (single frontend, rapid iteration)
- Future: Version prefix when breaking changes needed

### Q: How are errors communicated to frontend?
**A:**
- HTTP status codes (400 validation, 404 not found, 500 server error)
- JSON body with `{ detail: "error message" }`
- FastAPI automatic exception handling
- Frontend can parse and display user-friendly messages

---

## Performance & Scalability

### Q: How many invoices can the system handle?
**A:**
- MongoDB: Scales to millions of documents (with sharding)
- Qdrant: Handles billions of vectors (with collections)
- Firebase: Unlimited storage (pay-as-you-go)
- Bottleneck: OpenAI API rate limits (can be mitigated with batching)

### Q: What's the average processing time per invoice?
**A:**
- File upload: 1-2 seconds (network + Firebase)
- PDF extraction: 2-5 seconds (depends on pages)
- OpenAI parsing: 3-10 seconds (API latency)
- Vector embedding: 1-2 seconds
- Total: ~10-20 seconds for standard invoice

### Q: Can processing be done asynchronously?
**A:**
- Current: Synchronous (upload waits for processing)
- Future: Background workers (Celery/RQ) for async processing
- Frontend can poll status endpoint
- Webhook notification when complete

### Q: How to handle high concurrent upload volume?
**A:**
- FastAPI async handles many connections (thousands)
- Add queue system (Redis + worker pool)
- Horizontal scaling: Multiple FastAPI instances
- Load balancer distributes requests

---

## Security & Data Privacy

### Q: How are uploaded files secured?
**A:**
- Firebase: ACL rules restrict access
- Public URLs for frontend preview (can add signed URLs)
- MongoDB: Connection encrypted (TLS)
- Qdrant: API key authentication
- Future: User authentication, file-level permissions

### Q: Is invoice data encrypted at rest?
**A:**
- MongoDB Atlas: Encryption enabled by default
- Firebase: Encrypted storage
- Qdrant Cloud: Encrypted volumes
- API keys in .env (never committed)

### Q: Can users delete invoices?
**A:**
- Current: No delete API (append-only for audit)
- Future: Soft delete (mark as deleted, don't show in UI)
- Hard delete: Remove from MongoDB + Qdrant + Firebase

### Q: How to handle PII/GDPR compliance?
**A:**
- Data retention policies (auto-delete after N days)
- User consent tracking in metadata
- Export functionality (right to data portability)
- Anonymization for training/testing datasets

---

## Development & Debugging

### Q: How to test API endpoints locally?
**A:**
- FastAPI auto-generates docs: http://localhost:8000/docs
- Use "Try it out" in Swagger UI
- Or: curl/Postman with example payloads
- pytest for automated tests (tests/test_api.py)

### Q: How to debug OpenAI API issues?
**A:**
- Check `.env` for valid OPENAI_API_KEY
- Monitor OpenAI dashboard for rate limits/errors
- Log raw API responses (in load_pdf.py, image_upload.py)
- Use `response.usage` to track token consumption

### Q: How to reset the database?
**A:**
- MongoDB: Drop collection `db.invoices.drop()`
- Qdrant: Delete collection via client or UI
- Firebase: Delete bucket files (careful!)
- Script: `python scripts/reset_db.py` (future)

### Q: How to run tests?
**A:**
```bash
pytest tests/ -v
pytest tests/test_upload.py::test_pdf_upload
```
- Mock external APIs (OpenAI, Firebase) in tests
- Use test MongoDB/Qdrant instances
- CI/CD: Run on every commit

---

## Deployment & Production

### Q: What's the recommended deployment setup?
**A:**
- **API:** Docker container on Cloud Run/ECS
- **MongoDB:** Atlas M10+ cluster (replica set)
- **Qdrant:** Qdrant Cloud or self-hosted cluster
- **Firebase:** Production project with quotas
- **Secrets:** Environment variables (not .env file)

### Q: How to monitor production health?
**A:**
- `/health` endpoint for load balancer checks
- Logging: stdout/stderr to Cloud Logging
- Metrics: Request count, latency, error rate
- Alerts: OpenAI API quota, MongoDB connection failures

### Q: How to handle OpenAI API rate limits?
**A:**
- Retry with exponential backoff
- Queue system for non-urgent processing
- Use batching endpoints (future OpenAI feature)
- Caching: Store parsed invoices, avoid re-processing

### Q: What's the estimated monthly cost?
**A:** (for 1000 invoices/month)
- OpenAI: ~$50 (embeddings + completions)
- MongoDB Atlas: ~$60 (M10 cluster)
- Qdrant Cloud: ~$30 (1GB starter)
- Firebase: ~$10 (storage + bandwidth)
- Compute: ~$20 (Cloud Run/ECS)
- **Total: ~$170/month**

---

## Troubleshooting

### Q: Upload returns 400 "Unsupported file type"
**A:** Check `ALLOWED_IMAGE_EXTS`, `OFFICE_EXTS`, `PDF_EXTS` in `rag_upload.py`. Ensure extension is lowercase.

### Q: Chat returns "No context found"
**A:** 
- Invoice not vectorized (check Qdrant collection)
- `invoice_id` mismatch (UUID format)
- Qdrant connection failed (check QDRANT_URL/API_KEY)

### Q: MongoDB connection timeout
**A:**
- Verify `MONGODB_URI` in .env
- Check network/firewall (Atlas IP whitelist)
- Ensure database name matches `MONGODB_DB`

### Q: Firebase upload fails
**A:**
- `serviceAccountKey.json` missing/invalid
- Bucket permissions incorrect
- Storage quota exceeded (check Firebase console)

### Q: OpenAI API 401 Unauthorized
**A:**
- Invalid `OPENAI_API_KEY` in .env
- Key expired or revoked
- Billing issue on OpenAI account

---

## Best Practices

### Q: How to structure invoice metadata?
**A:**
- Store raw extraction in `metadata.structured_invoice`
- Flatten critical fields (amount, buyer, seller) to top level
- Keep MongoDB queryable without deep nesting
- Use ISO8601 for dates, currency codes (ISO 4217)

### Q: How to version the structured invoice schema?
**A:**
- Add `schema_version` field to metadata
- Support multiple versions in parsing code
- Migrate old records via background job
- Deprecate old versions gradually

### Q: Should I cache API responses?
**A:**
- Invoice list: Cache 5-10 seconds (low mutation)
- Invoice detail: Cache 60 seconds (rarely changes)
- Chat: No cache (user-specific, non-deterministic)
- Use Redis for distributed cache (multi-instance setup)

### Q: How to handle duplicate uploads?
**A:**
- Hash file content (SHA256)
- Store hash in MongoDB
- Check hash before processing
- Return existing invoice_id if duplicate
- UI: Show "Already uploaded" message
