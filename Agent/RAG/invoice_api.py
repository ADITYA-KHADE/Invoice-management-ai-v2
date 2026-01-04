from typing import Any, Dict, List

from fastapi import APIRouter, HTTPException

from database import get_db


router = APIRouter(prefix="/invoices", tags=["invoices"])


def _serialize_invoice(doc: Dict[str, Any]) -> Dict[str, Any]:
    structured = doc.get("structured_invoice") or {}
    data = structured.get("data") or {}
    buyer = data.get("buyer") or {}
    seller = data.get("seller") or {}

    return {
        "id": str(doc.get("_id")),
        "invoice_id": doc.get("invoice_id"),
        "source": doc.get("source"),
        "file_type": doc.get("file_type"),
        "created_at": doc.get("created_at"),
        "updated_at": doc.get("updated_at"),
        "buyer": buyer,
        "seller": seller,
        "amount": data.get("total_amount") or data.get("amount_due"),
        "amount_due": data.get("amount_due"),
        "status": "Pending" if data.get("amount_due") else "Unknown",
        "currency": data.get("currency"),
        "line_items": data.get("line_items") or [],
        "metadata": {k: v for k, v in doc.items() if k not in {"_id"}},
    }


@router.get("/")
@router.get("")
async def list_invoices(limit: int = 50) -> List[Dict[str, Any]]:
    db = get_db()
    cursor = (
        db.invoices.find({})
        .sort("updated_at", -1)
        .limit(limit)
    )
    docs = await cursor.to_list(length=limit)
    return [_serialize_invoice(doc) for doc in docs]


@router.get("/{invoice_id}")
async def get_invoice(invoice_id: str) -> Dict[str, Any]:
    db = get_db()
    doc = await db.invoices.find_one({"invoice_id": invoice_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return _serialize_invoice(doc)