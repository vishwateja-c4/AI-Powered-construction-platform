from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from services.claude_service import ClaudeService

router = APIRouter()
claude = ClaudeService()


class PlanRequest(BaseModel):
    description: str = Field(..., max_length=2000)
    project_type: str = Field(default="residential")
    location: str = Field(default="General")
    budget: Optional[float] = None
    timeline: Optional[str] = None


class PlanResponse(BaseModel):
    plan: Dict[str, Any]
    message: str


@router.post("/generate", response_model=PlanResponse)
async def generate_plan(request: PlanRequest):
    """
    Generate a construction plan from a natural language description.
    FR-1.1: Accepts up to 2000 characters
    FR-1.2: Returns structured plan
    """
    if not request.description.strip():
        raise HTTPException(status_code=400, detail="Description cannot be empty.")

    plan = await claude.generate_plan(
        description=request.description,
        project_type=request.project_type,
        location=request.location,
        budget=request.budget,
        timeline=request.timeline,
    )
    return PlanResponse(plan=plan, message="Plan generated successfully.")
