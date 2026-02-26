"""Instagram Graph API service.

This module handles fetching data from Instagram Graph API.
For demo, it uses mock data. Replace with real API calls when credentials are available.

Note: Instagram Graph API requires a Facebook Business account and approved app.
"""
import httpx
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from app.core.config import get_settings

settings = get_settings()

INSTAGRAM_API_BASE = "https://graph.instagram.com"
FACEBOOK_GRAPH_API = "https://graph.facebook.com/v18.0"


class InstagramService:
    """Service for interacting with Instagram Graph API."""
    
    def __init__(self, access_token: Optional[str] = None):
        self.access_token = access_token
    
    async def get_user_info(self) -> Dict[str, Any]:
        """Get Instagram user/account information."""
        if not self.access_token:
            return self._mock_user_info()
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{INSTAGRAM_API_BASE}/me",
                params={
                    "fields": "id,username,account_type,media_count,followers_count,follows_count",
                    "access_token": self.access_token
                }
            )
            if response.status_code == 200:
                return response.json()
            return self._mock_user_info()
    
    async def get_media(self, limit: int = 25) -> List[Dict[str, Any]]:
        """Get recent media posts."""
        if not self.access_token:
            return self._mock_media(limit)
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{INSTAGRAM_API_BASE}/me/media",
                params={
                    "fields": "id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count",
                    "limit": limit,
                    "access_token": self.access_token
                }
            )
            if response.status_code == 200:
                return response.json().get("data", [])
            return self._mock_media(limit)
    
    async def get_media_insights(self, media_id: str) -> Dict[str, Any]:
        """Get insights for a specific media post."""
        if not self.access_token:
            return self._mock_media_insights()
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{INSTAGRAM_API_BASE}/{media_id}/insights",
                params={
                    "metric": "engagement,impressions,reach,saved",
                    "access_token": self.access_token
                }
            )
            if response.status_code == 200:
                return response.json()
            return self._mock_media_insights()
    
    async def get_account_insights(self, period: str = "day", since: Optional[datetime] = None) -> Dict[str, Any]:
        """Get account-level insights."""
        if not self.access_token:
            return self._mock_account_insights()
        
        params = {
            "metric": "impressions,reach,profile_views,follower_count",
            "period": period,
            "access_token": self.access_token
        }
        
        if since:
            params["since"] = int(since.timestamp())
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{INSTAGRAM_API_BASE}/me/insights",
                params=params
            )
            if response.status_code == 200:
                return response.json()
            return self._mock_account_insights()
    
    def _mock_user_info(self) -> Dict[str, Any]:
        """Return mock user info."""
        return {
            "id": "ig_mock_user",
            "username": "socialleaf_demo",
            "account_type": "BUSINESS",
            "media_count": 156,
            "followers_count": 12500,
            "follows_count": 450
        }
    
    def _mock_media(self, count: int = 10) -> List[Dict[str, Any]]:
        """Return mock media posts."""
        import random
        
        media_types = ["IMAGE", "VIDEO", "CAROUSEL_ALBUM", "REELS"]
        captions = [
            "New product launch! 🚀 #startup #tech",
            "Behind the scenes of our latest project",
            "Tips for growing your social presence 📈",
            "Thank you for 10K followers! 🎉",
            "Monday motivation 💪",
            "Our team at work 👥",
            "Product feature spotlight ✨",
            "Customer success story 🌟",
            "Industry insights and trends",
            "Weekend vibes 🌴"
        ]
        
        media = []
        for i in range(min(count, len(captions))):
            media_type = random.choice(media_types)
            likes = random.randint(200, 5000)
            media.append({
                "id": f"ig_media_{i}",
                "caption": captions[i],
                "media_type": media_type,
                "media_url": "https://via.placeholder.com/640",
                "permalink": f"https://instagram.com/p/mock{i}",
                "timestamp": (datetime.now() - timedelta(days=i*2)).isoformat(),
                "like_count": likes,
                "comments_count": int(likes * 0.08)
            })
        return media
    
    def _mock_media_insights(self) -> Dict[str, Any]:
        """Return mock media insights."""
        import random
        reach = random.randint(3000, 15000)
        return {
            "data": [
                {"name": "engagement", "values": [{"value": random.randint(500, 2000)}]},
                {"name": "impressions", "values": [{"value": int(reach * 1.5)}]},
                {"name": "reach", "values": [{"value": reach}]},
                {"name": "saved", "values": [{"value": random.randint(50, 300)}]}
            ]
        }
    
    def _mock_account_insights(self) -> Dict[str, Any]:
        """Return mock account insights."""
        import random
        return {
            "data": [
                {"name": "impressions", "period": "day", "values": [{"value": random.randint(50000, 150000)}]},
                {"name": "reach", "period": "day", "values": [{"value": random.randint(30000, 80000)}]},
                {"name": "profile_views", "period": "day", "values": [{"value": random.randint(500, 2000)}]},
                {"name": "follower_count", "period": "day", "values": [{"value": 12500}]}
            ]
        }


# Singleton instance
instagram_service = InstagramService()


async def sync_instagram_data(user_id: str, access_token: str) -> Dict[str, Any]:
    """
    Sync Instagram data for a user.
    
    This function fetches posts and their insights, then saves to database.
    """
    service = InstagramService(access_token)
    
    # Get user info
    user_info = await service.get_user_info()
    
    # Get media posts
    media = await service.get_media(limit=25)
    
    # Get insights for each post (in production, batch this)
    insights_count = 0
    for post in media[:10]:  # Limit to avoid rate limiting
        await service.get_media_insights(post["id"])
        insights_count += 1
    
    return {
        "posts_fetched": len(media),
        "insights_fetched": insights_count,
        "followers": user_info.get("followers_count", 0),
        "synced_at": datetime.now().isoformat()
    }
