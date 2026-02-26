from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class User(BaseModel):
    """User model."""
    id: str
    email: EmailStr
    created_at: datetime


class UserCreate(BaseModel):
    """User creation model."""
    email: EmailStr
    password: str
    full_name: Optional[str] = None


class UserResponse(BaseModel):
    """User response model (safe for API)."""
    id: str
    email: EmailStr
    created_at: datetime
