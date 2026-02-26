from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class Metrics(BaseModel):
    """Metrics model."""
    id: str
    post_id: str
    likes: int = 0
    comments: int = 0
    shares: int = 0
    saves: int = 0
    reach: int = 0
    impressions: int = 0
    engagement_rate: float = 0.0
    views: int = 0
    watch_time_seconds: Optional[int] = None
    collected_at: datetime


class MetricsCreate(BaseModel):
    """Metrics creation model."""
    post_id: str
    likes: int = 0
    comments: int = 0
    shares: int = 0
    saves: int = 0
    reach: int = 0
    impressions: int = 0
    views: int = 0
    watch_time_seconds: Optional[int] = None


class MetricsResponse(BaseModel):
    """Metrics response model."""
    likes: int = 0
    comments: int = 0
    shares: int = 0
    reach: int = 0
    impressions: int = 0
    engagement_rate: float = 0.0
