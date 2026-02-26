from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class Platform(BaseModel):
    """Platform connection model."""
    id: str
    user_id: str
    platform_name: str
    connected_at: datetime
    last_synced_at: Optional[datetime] = None


class PlatformCreate(BaseModel):
    """Platform creation model."""
    platform_name: str
    access_token: str
    refresh_token: Optional[str] = None


class PlatformResponse(BaseModel):
    """Platform response model (safe for API)."""
    id: str
    platform_name: str
    connected_at: datetime
    last_synced_at: Optional[datetime] = None
