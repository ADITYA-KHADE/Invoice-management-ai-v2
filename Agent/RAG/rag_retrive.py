import os
from typing import List, Dict
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from openai import AsyncOpenAI
from qdrant_client.http.models import Filter, FieldCondition, MatchValue, PayloadSchemaType
from langchain_openai import OpenAIEmbeddings
from langchain_qdrant import QdrantVectorStore
from qdrant_client import QdrantClient
from qdrant_client.http import models as qmodels


load_dotenv()
client = AsyncOpenAI()

router = APIRouter(prefix="/chat", tags=["chat"])

embeddings = OpenAIEmbeddings(model="text-embedding-3-small")

QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")

if not QDRANT_URL or not QDRANT_API_KEY:
    raise RuntimeError("QDRANT_URL or QDRANT_API_KEY missing")

qdrant_client = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY, prefer_grpc=True)


def ensure_collection(name: str = "invoice_data", vector_dim: int = 1536) -> None:
    if not qdrant_client.collection_exists(name):
        qdrant_client.create_collection(
            collection_name=name,
            vectors_config=qmodels.VectorParams(
                size=vector_dim,
                distance=qmodels.Distance.COSINE,
            ),
        )

    # ALWAYS ensure correct payload index exists
    collection = qdrant_client.get_collection(name)
    payload_indexes = collection.payload_schema or {}

    if "metadata.invoice_id" not in payload_indexes:
        qdrant_client.create_payload_index(
            collection_name=name,
            field_name="metadata.invoice_id",  # ✅ CORRECT
            field_schema=PayloadSchemaType.KEYWORD,
        )


ensure_collection()

vector_db = QdrantVectorStore.from_existing_collection(
    embedding=embeddings,
    collection_name="invoice_data",
    url=QDRANT_URL,
    prefer_grpc=True,
    api_key=QDRANT_API_KEY,
)


class ChatRequest(BaseModel):
    invoice_id: str
    input_query: str
    k: int = 4


def _build_context(docs) -> str:
    lines: List[str] = []
    for doc in docs:
        src = doc.metadata.get("source") or doc.metadata.get("invoice_id") or "unknown-source"
        lines.append(f"[source: {src}]\n{doc.page_content}\n")
    return "\n".join(lines)[:6000]


async def answer_invoice_question(question: str, invoice_id: str, k: int = 4) -> Dict[str, str | bool]:
    docs = vector_db.similarity_search(
        query=question,  # query not needed when filtering by ID
        k=k,
        filter=Filter(
            must=[
                FieldCondition(
                    key="metadata.invoice_id",
                    match=MatchValue(value=invoice_id)
                )
            ]
        )
    )
    
    if not docs:
        return {"answer": "I could not find any matching invoice context.", "context": ""}

    context = _build_context(docs)

    system_prompt = (
        "You are an invoice Q&A assistant. Answer using the provided context only. "
        "Keep it concise (<=150 words). If uncertain, say you do not know."
    )

    response = await client.responses.create(
        model="gpt-4.1-mini",
        input=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Context:\n{context}\n\nQuestion: {question}"},
        ],
        max_output_tokens=2000,
        temperature=0,
    )

    return {"status": True, "response": response.output_text}

async def answer_invoice_question_v2(question: str, invoice_id: str, websocket: WebSocket, k: int = 4) -> None:
    docs = vector_db.similarity_search(
        query=question,
        k=k,
        filter=Filter(
            must=[
                FieldCondition(
                    key="metadata.invoice_id",
                    match=MatchValue(value=invoice_id)
                )
            ]
        )
    )
    
    if not docs:
        await websocket.send_json({"error": "I could not find any matching invoice context."})
        return

    context = _build_context(docs)

    system_prompt = (
        "You are an invoice Q&A assistant. Answer using the provided context only. "
        "Keep it concise (<=150 words). If uncertain, say you do not know."
        "Answer in a single line format:"
    )

    response = await client.responses.create(
        model="gpt-4.1-mini",
        input=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Context:\n{context}\n\nQuestion: {question}"},
        ],
        max_output_tokens=2000,
        temperature=0,
        stream=True,
    )

    async for event in response:
        if event.type == "response.output_text.delta":
            await websocket.send_text(event.delta)

    await websocket.send_text("[DONE]")        



@router.post("/ask")
async def chat_endpoint(payload: ChatRequest):
    if not payload.input_query.strip() or not payload.invoice_id.strip():
        raise HTTPException(status_code=400, detail="Something is missing , Please Enter your Query again.")

    result = await answer_invoice_question(payload.input_query, payload.invoice_id, k=payload.k)
    return result


@router.websocket("/ws")
async def chat_websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_json()
            invoice_id = data.get("invoice_id", "").strip()
            input_query = data.get("input_query", "").strip()
            k = data.get("k", 4)

            if not invoice_id or not input_query:
                await websocket.send_json({"error": "invoice_id and input_query are required."})
                continue

            await answer_invoice_question_v2(input_query, invoice_id, websocket, k=k)

    except WebSocketDisconnect:
        print("WebSocket disconnected")
        