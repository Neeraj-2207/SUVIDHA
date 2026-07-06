import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from routes.chat_routes import router as chat_router
from routes.ocr_routes import router as ocr_router 
from services.rag_service import initialize_rag

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Starting SUVIDHA AI Service...")
    initialize_rag()
    yield
    print("👋 Shutting down AI Service...")

app = FastAPI(
    title="SUVIDHA AI Service",
    description="RAG-powered civic assistant for Vijayawada",
    version="1.0.0",
    lifespan=lifespan
)

origins = [
    os.getenv("CLIENT_URL", "http://localhost:5173"),
    os.getenv("BACKEND_URL", "http://localhost:5000"),
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router)
app.include_router(ocr_router)

@app.get("/health")
def health_check():
    return {
        "success": True,
        "message": "SUVIDHA AI Service is running!",
        "model":   "gemini-2.0-flash",
        "vectorstore": "FAISS"
    }