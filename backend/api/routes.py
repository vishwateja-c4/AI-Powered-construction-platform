from fastapi import APIRouter
from typing import Dict
from .auth import router as auth_router
from .plan_generator import router as plan_router
from .cost_estimator import router as cost_router
from .chatbot import router as chat_router

router = APIRouter()

router.include_router(auth_router, prefix="/auth", tags=["auth"])
router.include_router(plan_router, prefix="/plans", tags=["plans"])
router.include_router(cost_router, prefix="/costs", tags=["costs"])
router.include_router(chat_router, prefix="/chat", tags=["chat"])

@router.get("/health")
def health_check() -> Dict[str, str]:
    """
    Check if the API is running correctly.
    """
    return {"status": "ok", "service": "BuildWise API"}

