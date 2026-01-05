import uuid
from datetime import datetime, timezone
from pathlib import Path
import tempfile
from fastapi import APIRouter, UploadFile, File, HTTPException, Request, status
from RAG import Converter, load_pdf, image_upload
from database import get_db
import firebase

router = APIRouter()

ALLOWED_IMAGE_EXTS = {"jpg", "jpeg", "png", "webp"}
OFFICE_EXTS = {"docx", "xlsx"}
PDF_EXTS = {"pdf"}

def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()

async def save_upload_to_temp(upload_file: UploadFile) -> str:
    suffix = Path(upload_file.filename or "").suffix
    if not suffix:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Filename with extension is required")

    data = await upload_file.read()
    if not data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded file is empty")

    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(data)
        return tmp.name


def upload_to_firebase(bucket, local_path: str, dest_name: str) -> str:
    blob = bucket.blob(dest_name)
    blob.upload_from_filename(local_path)
    blob.make_public()
    return blob.public_url


@router.post("/upload")
async def upload_file(request: Request, file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No file provided")

    ext = Path(file.filename).suffix.lower().lstrip(".")
    if ext not in ALLOWED_IMAGE_EXTS | OFFICE_EXTS | PDF_EXTS:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported file type")

    local_path = await save_upload_to_temp(file)
    final_path = local_path
    final_ext = ext

    if ext in OFFICE_EXTS:
        try:
            final_path = Converter.convert_to_pdf(local_path)
            final_ext = "pdf"
        except Exception as exc:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Conversion failed: {exc}") from exc

    invoice_id = str(uuid.uuid4())
    created_at = utc_now()
    updated_at = created_at
    blob_name = f"uploads/{invoice_id}.{final_ext}"

    bucket = getattr(request.app.state, "firebase_bucket", None) or firebase.get_bucket()
    public_url = upload_to_firebase(bucket, final_path, blob_name)

    metadata = {
        "invoice_id": invoice_id,
        "doc_type": "invoice",
        "file_type": final_ext,
        "source": public_url,
        "created_at": created_at,
        "updated_at": updated_at,
    }
    metadata_with_format = {**metadata, "text_format": "invoice"}

    structured_invoice = None
    if final_ext == "pdf":
        structured_invoice = load_pdf.load_and_store_pdf(final_path, metadata_with_format, public_url)
    elif final_ext in ALLOWED_IMAGE_EXTS:
        structured_invoice = image_upload.process_image(public_url, metadata_with_format)

    invoice_record = {**metadata_with_format, "structured_invoice": structured_invoice}

    db = get_db()
    try:
        await db.invoices.insert_one(invoice_record)
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to store invoice: {exc}") from exc

    return {"message": "Invoice uploaded successfully", "url": public_url}
   