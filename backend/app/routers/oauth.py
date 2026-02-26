"""
OAuth routes for social media platform authentication.
"""
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import RedirectResponse
import httpx
import secrets
from datetime import datetime, timedelta
from typing import Optional

from app.core.oauth import oauth_settings, OAUTH_URLS, get_oauth_url
from app.core.config import get_settings

router = APIRouter(prefix="/auth", tags=["OAuth"])

# In-memory state storage (use Redis in production)
oauth_states: dict = {}

# In-memory token storage (use Supabase in production)
user_tokens: dict = {}


def store_state(state: str, platform: str) -> None:
    """Store OAuth state for verification."""
    oauth_states[state] = {
        "platform": platform,
        "created_at": datetime.utcnow(),
    }


def verify_state(state: str, platform: str) -> bool:
    """Verify OAuth state matches."""
    if state not in oauth_states:
        return False
    if oauth_states[state]["platform"] != platform:
        return False
    # Check expiry (10 minutes)
    if datetime.utcnow() - oauth_states[state]["created_at"] > timedelta(minutes=10):
        del oauth_states[state]
        return False
    del oauth_states[state]
    return True


def store_tokens(platform: str, tokens: dict) -> None:
    """Store OAuth tokens for a platform."""
    user_tokens[platform] = {
        "access_token": tokens.get("access_token"),
        "refresh_token": tokens.get("refresh_token"),
        "expires_in": tokens.get("expires_in"),
        "token_type": tokens.get("token_type", "Bearer"),
        "stored_at": datetime.utcnow().isoformat(),
    }


def get_tokens(platform: str) -> Optional[dict]:
    """
    Get stored tokens for a platform.
    Checks in-memory store first, then falls back to environment variables.
    """
    # 1. Check in-memory first (for OAuth flow)
    tokens = user_tokens.get(platform)
    if tokens:
        return tokens
        
    # 2. Check environment variables (for direct dev access)
    settings = get_settings()
    
    if platform == "instagram" and settings.instagram_access_token:
        # Fallback for Instagram
        return {
            "access_token": settings.instagram_access_token,
            "token_type": "Bearer",
            "is_env_fallback": True
        }
        
    if platform == "youtube" and settings.youtube_access_token:
        # Fallback for YouTube
        return {
            "access_token": settings.youtube_access_token,
            "token_type": "Bearer",
            "is_env_fallback": True
        }
        
    return None


# =============================================================================
# YOUTUBE OAuth Routes
# =============================================================================

@router.get("/youtube")
async def youtube_auth():
    """Initiate YouTube OAuth flow."""
    if not oauth_settings.YOUTUBE_CLIENT_ID:
        raise HTTPException(status_code=400, detail="YouTube OAuth not configured. Add YOUTUBE_CLIENT_ID to .env")
    
    state = secrets.token_urlsafe(32)
    store_state(state, "youtube")
    auth_url = get_oauth_url("youtube", state)
    return RedirectResponse(url=auth_url)


@router.get("/youtube/callback")
async def youtube_callback(code: str = Query(...), state: str = Query(...)):
    """Handle YouTube OAuth callback."""
    if not verify_state(state, "youtube"):
        raise HTTPException(status_code=400, detail="Invalid or expired state")
    
    # Exchange code for tokens
    async with httpx.AsyncClient() as client:
        response = await client.post(
            OAUTH_URLS["youtube"]["token"],
            data={
                "client_id": oauth_settings.YOUTUBE_CLIENT_ID,
                "client_secret": oauth_settings.YOUTUBE_CLIENT_SECRET,
                "code": code,
                "grant_type": "authorization_code",
                "redirect_uri": oauth_settings.YOUTUBE_REDIRECT_URI,
            },
        )
    
    if response.status_code != 200:
        raise HTTPException(status_code=400, detail=f"Token exchange failed: {response.text}")
    
    tokens = response.json()
    store_tokens("youtube", tokens)
    
    # Redirect to frontend settings with success
    return RedirectResponse(url=f"{oauth_settings.FRONTEND_URL}/settings?connected=youtube")


# =============================================================================
# INSTAGRAM OAuth Routes
# =============================================================================

@router.get("/instagram")
async def instagram_auth():
    """Initiate Instagram OAuth flow."""
    if not oauth_settings.INSTAGRAM_APP_ID:
        raise HTTPException(status_code=400, detail="Instagram OAuth not configured. Add INSTAGRAM_APP_ID to .env")
    
    state = secrets.token_urlsafe(32)
    store_state(state, "instagram")
    auth_url = get_oauth_url("instagram", state)
    return RedirectResponse(url=auth_url)


@router.get("/instagram/callback")
async def instagram_callback(code: str = Query(...), state: str = Query(...)):
    """Handle Instagram OAuth callback."""
    if not verify_state(state, "instagram"):
        raise HTTPException(status_code=400, detail="Invalid or expired state")
    
    # Exchange code for tokens
    async with httpx.AsyncClient() as client:
        response = await client.get(
            OAUTH_URLS["instagram"]["token"],
            params={
                "client_id": oauth_settings.INSTAGRAM_APP_ID,
                "client_secret": oauth_settings.INSTAGRAM_APP_SECRET,
                "code": code,
                "grant_type": "authorization_code",
                "redirect_uri": oauth_settings.INSTAGRAM_REDIRECT_URI,
            },
        )
    
    if response.status_code != 200:
        raise HTTPException(status_code=400, detail=f"Token exchange failed: {response.text}")
    
    tokens = response.json()
    store_tokens("instagram", tokens)
    
    return RedirectResponse(url=f"{oauth_settings.FRONTEND_URL}/settings?connected=instagram")


# =============================================================================
# TWITTER OAuth Routes
# =============================================================================

@router.get("/twitter")
async def twitter_auth():
    """Initiate Twitter OAuth flow."""
    if not oauth_settings.TWITTER_CLIENT_ID:
        raise HTTPException(status_code=400, detail="Twitter OAuth not configured. Add TWITTER_CLIENT_ID to .env")
    
    state = secrets.token_urlsafe(32)
    store_state(state, "twitter")
    auth_url = get_oauth_url("twitter", state)
    return RedirectResponse(url=auth_url)


@router.get("/twitter/callback")
async def twitter_callback(code: str = Query(...), state: str = Query(...)):
    """Handle Twitter OAuth callback."""
    if not verify_state(state, "twitter"):
        raise HTTPException(status_code=400, detail="Invalid or expired state")
    
    # Exchange code for tokens (Twitter requires Basic Auth)
    import base64
    credentials = base64.b64encode(
        f"{oauth_settings.TWITTER_CLIENT_ID}:{oauth_settings.TWITTER_CLIENT_SECRET}".encode()
    ).decode()
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            OAUTH_URLS["twitter"]["token"],
            headers={
                "Authorization": f"Basic {credentials}",
                "Content-Type": "application/x-www-form-urlencoded",
            },
            data={
                "code": code,
                "grant_type": "authorization_code",
                "redirect_uri": oauth_settings.TWITTER_REDIRECT_URI,
                "code_verifier": "challenge",  # PKCE
            },
        )
    
    if response.status_code != 200:
        raise HTTPException(status_code=400, detail=f"Token exchange failed: {response.text}")
    
    tokens = response.json()
    store_tokens("twitter", tokens)
    
    return RedirectResponse(url=f"{oauth_settings.FRONTEND_URL}/settings?connected=twitter")


# =============================================================================
# LINKEDIN OAuth Routes
# =============================================================================

@router.get("/linkedin")
async def linkedin_auth():
    """Initiate LinkedIn OAuth flow."""
    if not oauth_settings.LINKEDIN_CLIENT_ID:
        raise HTTPException(status_code=400, detail="LinkedIn OAuth not configured. Add LINKEDIN_CLIENT_ID to .env")
    
    state = secrets.token_urlsafe(32)
    store_state(state, "linkedin")
    auth_url = get_oauth_url("linkedin", state)
    return RedirectResponse(url=auth_url)


@router.get("/linkedin/callback")
async def linkedin_callback(code: str = Query(...), state: str = Query(...)):
    """Handle LinkedIn OAuth callback."""
    if not verify_state(state, "linkedin"):
        raise HTTPException(status_code=400, detail="Invalid or expired state")
    
    # Exchange code for tokens
    async with httpx.AsyncClient() as client:
        response = await client.post(
            OAUTH_URLS["linkedin"]["token"],
            data={
                "client_id": oauth_settings.LINKEDIN_CLIENT_ID,
                "client_secret": oauth_settings.LINKEDIN_CLIENT_SECRET,
                "code": code,
                "grant_type": "authorization_code",
                "redirect_uri": oauth_settings.LINKEDIN_REDIRECT_URI,
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
    
    if response.status_code != 200:
        raise HTTPException(status_code=400, detail=f"Token exchange failed: {response.text}")
    
    tokens = response.json()
    store_tokens("linkedin", tokens)
    
    return RedirectResponse(url=f"{oauth_settings.FRONTEND_URL}/settings?connected=linkedin")


# =============================================================================
# Connection Status Endpoints
# =============================================================================

@router.get("/status")
async def get_connection_status():
    """Get connection status for all platforms."""
    settings = get_settings()
    return {
        "youtube": {
            "connected": "youtube" in user_tokens,
            "has_credentials": bool(oauth_settings.YOUTUBE_CLIENT_ID),
            "api_key_available": bool(settings.youtube_api_key),
        },
        "instagram": {
            "connected": "instagram" in user_tokens,
            "has_credentials": bool(oauth_settings.INSTAGRAM_APP_ID),
        },
        "twitter": {
            "connected": "twitter" in user_tokens,
            "has_credentials": bool(oauth_settings.TWITTER_CLIENT_ID),
        },
        "linkedin": {
            "connected": "linkedin" in user_tokens,
            "has_credentials": bool(oauth_settings.LINKEDIN_CLIENT_ID),
        },
    }


@router.delete("/{platform}")
async def disconnect_platform(platform: str):
    """Disconnect a platform by removing stored tokens."""
    if platform in user_tokens:
        del user_tokens[platform]
        return {"status": "disconnected", "platform": platform}
    raise HTTPException(status_code=404, detail=f"Platform {platform} not connected")
