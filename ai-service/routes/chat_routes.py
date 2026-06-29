from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.rag_service import get_answer

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    success: bool
    answer:  str
    sources: int

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        if not request.message or len(request.message.strip()) == 0:
            raise HTTPException(
                status_code=400,
                detail="Message cannot be empty"
            )

        if len(request.message) > 500:
            raise HTTPException(
                status_code=400,
                detail="Message too long. Maximum 500 characters."
            )

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