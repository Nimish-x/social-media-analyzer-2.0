from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any
from pydantic import BaseModel
from app.services.youtube import YouTubeService


router = APIRouter()

class CompetitorQuery(BaseModel):
    query: str

@router.post("/analyze")
async def analyze_competitor(query: CompetitorQuery):
    """
    Analyze a competitor's YouTube channel.
    Accepts: Channel ID, Handle (@name), or Search Term.
    """
    service = YouTubeService()
    
    # 1. Resolve ID
    channel_id = await service.resolve_channel_id(query.query)
    if not channel_id:
        raise HTTPException(status_code=404, detail="Channel not found")
        
    # 2. Get Stats
    stats = await service.get_public_channel_stats(channel_id)
    
    # 3. Get Recent Videos
    videos = await service.get_channel_videos_with_stats(channel_id, max_results=5)
    
    return {
        "channel": stats,
        "recent_videos": videos,
        "analysis": {
            "engagement_rate": _calculate_engagement(videos),
            "estimated_earnings": _estimate_earnings(stats["statistics"]["views"]),
            "virality_score": _calculate_virality(stats["statistics"]["subscribers"], videos)
        }
    }

def _calculate_engagement(videos):
    total_views = sum(v["statistics"]["views"] for v in videos)
    total_interactions = sum(v["statistics"]["likes"] + v["statistics"]["comments"] for v in videos)
    if total_views == 0: return 0
    return round((total_interactions / total_views) * 100, 2)

def _estimate_earnings(views):
    # Rough estimate: $3 per 1000 views (RPM)
    # This is lifetime views which is huge, maybe monthly?
    # Let's just return a generic 'High/Med/Low' or a raw number for 'Potential Lifetime Value'
    return round(views / 1000 * 3, 2)  

def _calculate_virality(subs, videos):
    if not videos or subs == 0: return 0
    avg_views = sum(v["statistics"]["views"] for v in videos) / len(videos)
    # If avg views > subscribers, high virality
    ratio = avg_views / subs
    return min(100, round(ratio * 50, 1)) # Scale up
