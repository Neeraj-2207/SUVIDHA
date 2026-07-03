from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.rag_service import get_answer

router = APIRouter()


# Request Model
class ChatRequest(BaseModel):
    message: str


# Source Model
class Source(BaseModel):
    source: str | None = None
    preview: str


# Response Model
class ChatResponse(BaseModel):
    success: bool
    answer: str
    sources: list[Source]


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        # Validate input
        if not request.message or not request.message.strip():
            raise HTTPException(
                status_code=400,
                detail="Message cannot be empty."
            )

        if len(request.message) > 500:
            raise HTTPException(
                status_code=400,
                detail="Message too long. Maximum 500 characters."
            )

        # Get answer from RAG
        result = get_answer(request.message)

        return ChatResponse(
            success=True,
            answer=result["answer"],
            sources=result["sources"]
        )

    except HTTPException:
        raise

    except Exception as e:
        print(f"Chat error: {e}")
        raise HTTPException(
            status_code=500,
            detail="AI service error. Please try again."
        )