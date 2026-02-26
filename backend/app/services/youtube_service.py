"""
YouTube Data API service for fetching real channel and video statistics.
"""
import httpx
from typing import Optional
from datetime import datetime

from app.routers.oauth import get_tokens


YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3"


async def get_channel_stats() -> Optional[dict]:
    """
    Fetch YouTube channel statistics.
    Returns subscriber count, view count, video count.
    """
    tokens = get_tokens("youtube")
    if not tokens:
        return None
    
    async with httpx.AsyncClient() as client:
        # Get channel info for authenticated user
        response = await client.get(
            f"{YOUTUBE_API_BASE}/channels",
            params={
                "part": "snippet,statistics,contentDetails",
                "mine": "true",
            },
            headers={"Authorization": f"Bearer {tokens['access_token']}"},
        )
    
    if response.status_code != 200:
        return None
    
    data = response.json()
    if not data.get("items"):
        return None
    
    channel = data["items"][0]
    stats = channel.get("statistics", {})
    snippet = channel.get("snippet", {})
    
    return {
        "channel_id": channel.get("id"),
        "title": snippet.get("title"),
        "description": snippet.get("description", "")[:200],
        "thumbnail": snippet.get("thumbnails", {}).get("medium", {}).get("url"),
        "subscribers": int(stats.get("subscriberCount", 0)),
        "total_views": int(stats.get("viewCount", 0)),
        "video_count": int(stats.get("videoCount", 0)),
        "hidden_subscriber_count": stats.get("hiddenSubscriberCount", False),
    }


async def get_recent_videos(max_results: int = 10) -> Optional[list]:
    """
    Fetch recent videos from the authenticated channel.
    """
    tokens = get_tokens("youtube")
    if not tokens:
        return None
    
    async with httpx.AsyncClient() as client:
        # First get channel's uploads playlist
        channel_response = await client.get(
            f"{YOUTUBE_API_BASE}/channels",
            params={
                "part": "contentDetails",
                "mine": "true",
            },
            headers={"Authorization": f"Bearer {tokens['access_token']}"},
        )
        
        if channel_response.status_code != 200:
            return None
        
        channel_data = channel_response.json()
        if not channel_data.get("items"):
            return None
        
        uploads_playlist = channel_data["items"][0]["contentDetails"]["relatedPlaylists"]["uploads"]
        
        # Get videos from uploads playlist
        playlist_response = await client.get(
            f"{YOUTUBE_API_BASE}/playlistItems",
            params={
                "part": "snippet,contentDetails",
                "playlistId": uploads_playlist,
                "maxResults": max_results,
            },
            headers={"Authorization": f"Bearer {tokens['access_token']}"},
        )
        
        if playlist_response.status_code != 200:
            return None
        
        playlist_data = playlist_response.json()
        video_ids = [item["contentDetails"]["videoId"] for item in playlist_data.get("items", [])]
        
        if not video_ids:
            return []
        
        # Get video statistics
        videos_response = await client.get(
            f"{YOUTUBE_API_BASE}/videos",
            params={
                "part": "snippet,statistics,contentDetails",
                "id": ",".join(video_ids),
            },
            headers={"Authorization": f"Bearer {tokens['access_token']}"},
        )
        
        if videos_response.status_code != 200:
            return None
        
        videos_data = videos_response.json()
        
        videos = []
        for video in videos_data.get("items", []):
            snippet = video.get("snippet", {})
            stats = video.get("statistics", {})
            content = video.get("contentDetails", {})
            
            # Check if it's a Short (duration < 60s)
            duration = content.get("duration", "PT0S")
            is_short = _parse_duration(duration) <= 60
            
            videos.append({
                "video_id": video.get("id"),
                "title": snippet.get("title"),
                "description": snippet.get("description", "")[:100],
                "thumbnail": snippet.get("thumbnails", {}).get("medium", {}).get("url"),
                "published_at": snippet.get("publishedAt"),
                "views": int(stats.get("viewCount", 0)),
                "likes": int(stats.get("likeCount", 0)),
                "comments": int(stats.get("commentCount", 0)),
                "duration": duration,
                "is_short": is_short,
            })
        
        return videos


def _parse_duration(duration: str) -> int:
    """Parse ISO 8601 duration to seconds."""
    # PT1H2M3S -> 3723 seconds
    import re
    match = re.match(r'PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?', duration)
    if not match:
        return 0
    hours = int(match.group(1) or 0)
    minutes = int(match.group(2) or 0)
    seconds = int(match.group(3) or 0)
    return hours * 3600 + minutes * 60 + seconds


async def get_youtube_analytics() -> Optional[dict]:
    """
    Get comprehensive YouTube analytics.
    """
    channel = await get_channel_stats()
    videos = await get_recent_videos(10)
    
    if not channel:
        return None
    
    # Calculate engagement metrics
    total_views = sum(v.get("views", 0) for v in (videos or []))
    total_likes = sum(v.get("likes", 0) for v in (videos or []))
    total_comments = sum(v.get("comments", 0) for v in (videos or []))
    
    engagement_rate = 0
    if total_views > 0:
        engagement_rate = ((total_likes + total_comments) / total_views) * 100
    
    # Separate Shorts from regular videos
    shorts = [v for v in (videos or []) if v.get("is_short")]
    regular_videos = [v for v in (videos or []) if not v.get("is_short")]
    
    return {
        "platform": "youtube",
        "connected": True,
        "channel": channel,
        "recent_videos": videos,
        "shorts_count": len(shorts),
        "regular_video_count": len(regular_videos),
        "metrics": {
            "subscribers": channel.get("subscribers", 0),
            "total_views": channel.get("total_views", 0),
            "video_count": channel.get("video_count", 0),
            "recent_views": total_views,
            "recent_likes": total_likes,
            "recent_comments": total_comments,
            "engagement_rate": round(engagement_rate, 2),
        },
        "fetched_at": datetime.utcnow().isoformat(),
    }
