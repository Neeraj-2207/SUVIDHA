# app.py - Entry point for the Python FastAPI AI Service
# FastAPI is like Express.js but for Python

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Create the FastAPI application instance
app = FastAPI(
    title="SUVIDHA AI Service",
    description="AI Microservice for Civic Assistance - RAG, OCR, and Chatbot",
    version="1.0.0"
)

# ─────────────────────────────────────────
# CORS MIDDLEWARE
# Allow our Node.js backend to call this service
# ─────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────
# HEALTH CHECK ENDPOINT
# ─────────────────────────────────────────
@app.get("/health")
def health_check():
    return {
        "success": True,
        "message": "SUVIDHA AI Service is running!",
        "services": ["chatbot", "ocr", "rag"]
    }

# We will add AI routes here in later modules
# Example: app.include_router(chatbot_router)