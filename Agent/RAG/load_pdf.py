from pathlib import Path
from dotenv import load_dotenv
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import CharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_qdrant import QdrantVectorStore
import os, re, json
from openai import OpenAI
from typing import cast, Dict, Any
from openai.types.responses import ResponseInputParam
from . import model_schema

load_dotenv()

QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")

client = OpenAI()

def clean_json(text: str):
    text = text.strip()
    text = re.sub(r"^```json|```$", "", text, flags=re.MULTILINE)
    return json.loads(text)


def normalize_invoice(inv: Dict[str, Any]) -> Dict[str, Any]:
    """Derive subtotal/total_tax/total_amount/amount_due from line items for consistency."""
    if not isinstance(inv, dict):
        return inv

    line_items = inv.get("line_items") or []
    subtotal = sum((item.get("taxable_amount") or 0) for item in line_items)
    total_tax = sum((item.get("tax_amount") or 0) for item in line_items)
    total_amount = subtotal + total_tax

    inv.setdefault("subtotal", round(subtotal, 2) if subtotal else subtotal)
    inv.setdefault("total_tax", round(total_tax, 2) if total_tax else total_tax)
    inv.setdefault("total_amount", round(total_amount, 2) if total_amount else total_amount)
    if inv.get("amount_due") is None:
        inv["amount_due"] = inv.get("total_amount")
    return inv


def extract_invoice_json(pdf_url: str) -> dict:
    response = client.responses.parse(
        model="gpt-4.1-mini",
        instructions="Extract all info from invoice as JSON only",
        temperature=0,
        input=cast(
            ResponseInputParam,
            [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "input_file",
                            "file_url": pdf_url,
                        },
                    ],
                }
            ],
        ),
        text_format=model_schema.Invoice
    )

    return normalize_invoice(clean_json(response.output_text))


def load_and_store_pdf(file_path: str, metadata: Dict[str, Any], url: str) -> Dict[str, Any]:
        """Load a PDF, attach metadata to chunks, store in Qdrant, and return parsed invoice."""
        pdf_path = Path(file_path)
        loader = PyPDFLoader(str(pdf_path))
        docs = loader.load()

        parsed = extract_invoice_json(url)
        parsed = normalize_invoice(parsed)

        text_splitter = CharacterTextSplitter.from_tiktoken_encoder(
                encoding_name="cl100k_base", chunk_size=1000, chunk_overlap=400
        )

        chunks = text_splitter.split_documents(docs)
        for chunk in chunks:
                chunk.metadata.update(metadata)

        embeddings = OpenAIEmbeddings(model="text-embedding-3-small")

        QdrantVectorStore.from_documents(
                documents=chunks,
                embedding=embeddings,
                collection_name="invoice_data",
                url=QDRANT_URL,
                prefer_grpc=True,
                api_key=QDRANT_API_KEY,
        )

        return {
                "source": url,
                "data": parsed,
        }



