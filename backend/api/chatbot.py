from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from services.claude_service import ClaudeService

router = APIRouter()
claude = ClaudeService()


class ChatRequest(BaseModel):
    message: str = Field(..., max_length=2000)
    context: Optional[Dict[str, Any]] = None
    history: Optional[List[Dict[str, str]]] = None


class ChatResponse(BaseModel):
    response: str
    message: str


@router.post("/send", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Send a message to the BuildWise AI chatbot.
    FR-3.1: Responds within 3 seconds
    FR-3.2: Maintains conversation context
    """
    reply = await claude.chat(
        message=request.message,
        context=request.context,
        history=request.history,
    )
    return ChatResponse(response=reply, message="ok")
