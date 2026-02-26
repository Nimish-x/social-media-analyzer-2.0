from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class Post(BaseModel):
    """Post model."""
    id: str
    user_id: str
    platform: str
    platform_post_id: str
    content_type: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    media_url: Optional[str] = None
    permalink: Optional[str] = None
    posted_at: Optional[datetime] = None
    created_at: datetime


class PostCreate(BaseModel):
    """Post creation model."""
    platform: str
    platform_post_id: str
    content_type: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    media_url: Optional[str] = None
    permalink: Optional[str] = None
    posted_at: Optional[datetime] = None


class PostResponse(BaseModel):
    """Post response model."""
    id: str
    platform: str
    content_type: Optional[str] = None
    title: Optional[str] = None
    posted_at: Optional[datetime] = None
