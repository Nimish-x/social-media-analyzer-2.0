"""
LinkedIn API service for fetching real LinkedIn statistics.
"""
import httpx
from typing import Optional
from datetime import datetime

from app.routers.oauth import get_tokens


LINKEDIN_API_BASE = "https://api.linkedin.com/v2"


async def get_linkedin_profile() -> Optional[dict]:
    """
    Get authenticated LinkedIn profile info.
    """
    tokens = get_tokens("linkedin")
    if not tokens:
        return None
    
    async with httpx.AsyncClient() as client:
        # Get basic profile
        profile_response = await client.get(
            f"{LINKEDIN_API_BASE}/me",
            headers={"Authorization": f"Bearer {tokens['access_token']}"},
        )
        
        if profile_response.status_code != 200:
            return None
        
        profile = profile_response.json()
        
        # Get profile picture
        picture_response = await client.get(
            f"{LINKEDIN_API_BASE}/me",
            params={"projection": "(profilePicture(displayImage~:playableStreams))"},
            headers={"Authorization": f"Bearer {tokens['access_token']}"},
        )
        
        picture_url = None
        if picture_response.status_code == 200:
            picture_data = picture_response.json()
            elements = picture_data.get("profilePicture", {}).get("displayImage~", {}).get("elements", [])
            if elements:
                picture_url = elements[-1].get("identifiers", [{}])[0].get("identifier")
        
        return {
            "id": profile.get("id"),
            "first_name": profile.get("localizedFirstName"),
            "last_name": profile.get("localizedLastName"),
            "profile_picture": picture_url,
        }


async def get_linkedin_connections() -> Optional[int]:
    """
    Get LinkedIn connection count.
    Note: LinkedIn API has limited access to connection data.
    """
    tokens = get_tokens("linkedin")
    if not tokens:
        return None
    
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{LINKEDIN_API_BASE}/connections",
            params={"q": "viewer", "count": 0},
            headers={"Authorization": f"Bearer {tokens['access_token']}"},
        )
        
        if response.status_code != 200:
            # LinkedIn restricts this endpoint, return None
            return None
        
        return response.json().get("_total", 0)


async def get_linkedin_analytics() -> Optional[dict]:
    """
    Get comprehensive LinkedIn analytics.
    """
    profile = await get_linkedin_profile()
    connections = await get_linkedin_connections()
    
    if not profile:
        return None
    
    return {
        "platform": "linkedin",
        "connected": True,
        "profile": {
            "id": profile.get("id"),
            "name": f"{profile.get('first_name', '')} {profile.get('last_name', '')}".strip(),
            "profile_picture": profile.get("profile_picture"),
        },
        "metrics": {
            "connections": connections or 0,
            # LinkedIn has limited API access for analytics
            # These would require Marketing API or ads account
            "post_impressions": 0,
            "profile_views": 0,
        },
        "fetched_at": datetime.utcnow().isoformat(),
        "note": "LinkedIn restricts most analytics data to Marketing API (requires LinkedIn Ads account).",
    }
