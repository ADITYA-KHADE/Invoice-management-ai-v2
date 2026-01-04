from typing import Union
from contextlib import asynccontextmanager
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from RAG import rag_upload, rag_retrive, invoice_api
import firebase


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.firebase_bucket = firebase.get_bucket()
    yield


app = FastAPI(lifespan=lifespan)

allowed_origins = [
    os.getenv("FRONTEND_ORIGIN", "http://localhost:5173"),
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#---------------------------------------------------------------
# Basic Routes
#---------------------------------------------------------------

@app.get("/")
def read_root():
    return {"message": "Welcome to the Invoice Management AI API"}

@app.get("/health")
def health_check(): 
    return {"status": "healthy"}


# Invoice extraction routes
app.include_router(rag_upload.router, prefix="/api")
app.include_router(rag_retrive.router, prefix="/api")
app.include_router(invoice_api.router, prefix="/api")
