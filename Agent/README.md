# Invoice Management AI - Backend

## System Design & Architecture

### Technology Stack & Rationale

#### **FastAPI**
**Why?** 
- High-performance async framework for Python (Starlette + Pydantic)
- Automatic API documentation (Swagger/OpenAPI)
- Type hints and validation out-of-the-box
- Native async/await support for I/O-heavy operations (file uploads, DB queries, AI calls)
- Perfect for building RESTful APIs with ML/AI integration

#### **MongoDB (Motor - async driver)**
**Why?**
- Schema flexibility for diverse invoice structures (different formats, fields)
- Nested document support matches invoice data model (line items, taxes, buyer/seller details)
- Horizontal scalability for growing invoice volumes
- Motor provides async MongoDB operations that don't block FastAPI event loop
- Natural JSON-like storage for API responses

#### **Qdrant (Vector Database)**
**Why?**
- Purpose-built for vector similarity search and RAG applications
- Stores embeddings of invoice content for semantic search
- Fast filtered queries (by invoice_id) for context retrieval
- HNSW algorithm for efficient nearest-neighbor search
- gRPC support for low-latency operations
- Perfect for "Ask questions about this invoice" feature

#### **Firebase Storage**
**Why?**
- Globally distributed CDN for fast file access
- Public URL generation for direct browser viewing
- Built-in security rules and access control
- No server infrastructure management
- Seamless integration with Google Cloud ecosystem
- Handles large binary files (PDFs, images) outside database

#### **OpenAI API**
**Why?**
- GPT models for intelligent invoice parsing and extraction
- Embedding models (text-embedding-3-small) for vectorization
- High accuracy in structured data extraction from unstructured text
- Context-aware question answering for chatbot
- JSON mode for reliable structured output

### Data Flow Architecture

```
┌─────────────┐
│   Client    │ (React Frontend)
└──────┬──────┘
       │ HTTP/REST
       ▼
┌─────────────────────────────────────────┐
│         FastAPI Backend                 │
├─────────────────────────────────────────┤
│  ┌────────────┐  ┌──────────────┐      │
│  │ Upload API │  │ Invoice API  │      │
│  └─────┬──────┘  └──────┬───────┘      │
│        │                 │               │
│        ▼                 ▼               │
│  ┌──────────────────────────────┐      │
│  │     Conversion Layer          │      │
│  │  (Office → PDF, Image prep)   │      │
│  └──────────┬────────────────────┘      │
│             │                            │
│             ▼                            │
│  ┌──────────────────────────────┐      │
│  │   Firebase Storage Upload    │      │
│  │   (Get public URL)           │      │
│  └──────────┬────────────────────┘      │
│             │                            │
│             ▼                            │
│  ┌──────────────────────────────┐      │
│  │   PDF/Image Processing       │      │
│  │   - Extract text/tables      │      │
│  │   - OpenAI structured parse  │      │
│  └──────────┬────────────────────┘      │
│             │                            │
│        ┌────┴────┐                      │
│        │         │                      │
│        ▼         ▼                      │
│  ┌─────────┐ ┌──────────┐             │
│  │ MongoDB │ │  Qdrant  │             │
│  │ (metadata)│ (vectors) │             │
│  └─────────┘ └──────────┘             │
└─────────────────────────────────────────┘
```

### Core Components

#### **1. Upload Pipeline (`rag_upload.py`)**
- Accepts multiple formats: PDF, DOCX, XLSX, PNG, JPG, JPEG
- Validates file types and size
- Converts Office documents to PDF using LibreOffice
- Generates unique `invoice_id` (UUID)
- Uploads to Firebase Storage
- Triggers processing pipeline

#### **2. Document Processing**
- **PDF Processing (`load_pdf.py`)**
  - Extracts text using PyPDF/pdfplumber
  - Sends to OpenAI for structured extraction
  - Validates against Pydantic schemas
  
- **Image Processing (`image_upload.py`)**
  - Direct image URL to OpenAI Vision API
  - OCR + structured extraction in one call
  
- **Structured Output**
  - Invoice number, dates, parties (buyer/seller)
  - Line items with quantities, prices, taxes
  - Payment terms, bank details, notes

#### **3. Vector Storage (`rag_retrive.py`)**
- Text chunking and embedding (OpenAI text-embedding-3-small)
- Store in Qdrant with metadata (invoice_id, source URL)
- Payload indexing for fast filtering
- Used for semantic search in chat

#### **4. Chat/RAG System**
- Filter vectors by `invoice_id`
- Retrieve top-k relevant chunks
- Build context prompt
- OpenAI completion with constrained context
- Returns answer + context metadata

#### **5. Invoice API (`invoice_api.py`)**
- List all invoices (sorted by updated_at)
- Get single invoice by `invoice_id`
- Serializes MongoDB documents to clean JSON
- Nested data (buyer, seller, line_items, taxes)

### Database Schema

#### MongoDB Document Structure
```json
{
  "_id": ObjectId,
  "invoice_id": "uuid-string",
  "doc_type": "invoice",
  "file_type": "pdf",
  "source": "https://storage.googleapis.com/...",
  "created_at": "ISO8601",
  "updated_at": "ISO8601",
  "buyer": {
    "name": "...",
    "address": "...",
    "tax_id": "...",
    "email": "...",
    "phone": "..."
  },
  "seller": { /* same structure */ },
  "amount": 123456,
  "amount_due": 123456,
  "status": "Pending",
  "currency": "INR",
  "line_items": [
    {
      "description": "...",
      "quantity": 100,
      "unit_price": 10.5,
      "tax_rate": 5,
      "total_amount": 1050
    }
  ],
  "metadata": {
    "text_format": "invoice",
    "structured_invoice": { /* detailed extraction */ }
  }
}
```

#### Qdrant Collection
- **Collection:** `invoice_data`
- **Vectors:** 1536-dim (text-embedding-3-small)
- **Distance:** Cosine similarity
- **Payload:** `{ metadata: { invoice_id, source, page_num } }`
- **Index:** Keyword index on `metadata.invoice_id`

### Security & Environment

#### Required Environment Variables
```bash
# Backend API
FRONTEND_ORIGIN=http://localhost:5173

# MongoDB
MONGODB_URI=mongodb+srv://...
MONGODB_DB=invoice_db

# Qdrant
QDRANT_URL=https://...
QDRANT_API_KEY=...

# OpenAI
OPENAI_API_KEY=sk-...

# Firebase (via serviceAccountKey.json)
```

#### CORS Configuration
- Allows frontend origin + localhost variants
- Credentials: true (for cookies/auth headers)
- Methods: All
- Headers: All

### Performance Optimizations

1. **Async Operations**
   - All I/O (DB, API calls, file ops) use async/await
   - Non-blocking concurrent request handling

2. **Vector Search**
   - Filtered search by invoice_id (indexed)
   - HNSW graph for fast approximate search
   - gRPC over HTTP for lower latency

3. **Caching Strategy**
   - Firebase CDN for file delivery
   - MongoDB indexes on invoice_id, updated_at

4. **Error Handling**
   - HTTPException for API errors
   - Validation at Pydantic model level
   - Fallback responses for AI failures

### Scalability Considerations

- **Horizontal Scaling:** FastAPI is stateless, can run multiple instances behind load balancer
- **Database:** MongoDB sharding by invoice_id range
- **Vector Store:** Qdrant collections can be distributed
- **File Storage:** Firebase handles CDN distribution automatically
- **AI Rate Limits:** Queue system for high-volume processing (future enhancement)

### Monitoring & Logging

- FastAPI automatic request logging
- Error traces in console/log files
- MongoDB query performance metrics
- OpenAI API usage tracking (cost monitoring)

---

## API Endpoints Reference

### Upload
- `POST /api/upload`
  - Body: multipart/form-data with `file`
  - Returns: `{ message, url }`

### Invoices
- `GET /api/invoices?limit=50`
  - Returns: Array of invoice summaries
- `GET /api/invoices/{invoice_id}`
  - Returns: Full invoice detail

### Chat
- `POST /api/chat/ask`
  - Body: `{ invoice_id, input_query, k }`
  - Returns: `{ status, response }`

### Health
- `GET /` - Welcome message
- `GET /health` - Health check

---

## Development Workflow

1. **Setup Environment**
   ```bash
   cd Agent
   python -m venv .venv
   source .venv/bin/activate  # or .venv\Scripts\activate on Windows
   pip install -r requirements.txt
   ```

2. **Configure Secrets**
   - Create `.env` with all required variables
   - Place `serviceAccountKey.json` in Agent directory

3. **Run Development Server**
   ```bash
   fastapi dev ./main.py
   ```

4. **Access API Docs**
   - Swagger: http://localhost:8000/docs
   - ReDoc: http://localhost:8000/redoc

---

## Deployment

### Docker (Recommended)
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Cloud Platforms
- **Google Cloud Run:** Serverless container deployment
- **AWS ECS/Fargate:** Container orchestration
- **Heroku:** Direct deployment with Procfile
- **Render/Railway:** Zero-config deployment

### Database Hosting
- **MongoDB Atlas:** Fully managed MongoDB
- **Qdrant Cloud:** Managed vector database

---

## Future Enhancements

1. **Authentication & Authorization**
   - JWT tokens for API access
   - User-based invoice access control

2. **Batch Processing**
   - Queue system for bulk uploads
   - Background workers for processing

3. **Advanced Analytics**
   - Invoice trend analysis
   - Spending patterns
   - Tax reporting

4. **Multi-tenancy**
   - Organization/user separation
   - Role-based access

5. **Webhook Notifications**
   - Processing completion alerts
   - Payment reminders

6. **Export Capabilities**
   - CSV/Excel export
   - PDF regeneration with templates
