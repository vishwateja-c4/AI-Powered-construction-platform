from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from services.claude_service import ClaudeService

router = APIRouter()
claude = ClaudeService()


class CostRequest(BaseModel):
    plan: Dict[str, Any]
    location: str = Field(default="General")
    quality: str = Field(default="standard")  # standard, premium, luxury


class CostResponse(BaseModel):
    costs: Dict[str, Any]
    message: str


@router.post("/estimate", response_model=CostResponse)
async def estimate_costs(request: CostRequest):
    """
    Generate cost estimates for a construction plan.
    FR-2.1: Calculate costs for all plan items
    FR-2.2: Provide cost ranges
    """
    if not request.plan:
        raise HTTPException(status_code=400, detail="Plan data is required.")

    costs = await claude.estimate_costs(
        plan=request.plan,
        location=request.location,
        quality=request.quality,
    )
    return CostResponse(costs=costs, message="Cost estimate generated successfully.")
