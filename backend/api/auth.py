from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from config import settings
from models.user import User
from utils.security import verify_password, create_access_token
from pydantic import BaseModel
from typing import Dict

# Note: In a real app we'd have a DB dependency, but we'll mock it here until we wire up dependency injection
router = APIRouter()

class Token(BaseModel):
    access_token: str
    token_type: str

@router.post("/login", response_model=Token)
def login_access_token(form_data: OAuth2PasswordRequestForm = Depends()) -> Dict[str, str]:
    """
    OAuth2 compatible token login, getting an access token for future requests.
    (Currently mocked logic for Phase 1 structure verification)
    """
    # Pseudo-logic for Phase 1
    if form_data.username == "test@buildwise.com" and form_data.password == "password":
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        return {
            "access_token": create_access_token(
                form_data.username, expires_delta=access_token_expires
            ),
            "token_type": "bearer",
        }
    raise HTTPException(status_code=400, detail="Incorrect email or password")
