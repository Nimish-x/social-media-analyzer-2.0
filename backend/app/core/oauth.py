"""
OAuth configuration for all social media platforms.
"""
from pydantic_settings import BaseSettings
from typing import Optional
import os


class OAuthSettings(BaseSettings):
    """OAuth credentials for all platforms."""
    
    # YouTube (Google)
    YOUTUBE_CLIENT_ID: Optional[str] = None
    YOUTUBE_CLIENT_SECRET: Optional[str] = None
    YOUTUBE_REDIRECT_URI: str = "http://localhost:8000/auth/youtube/callback"
    YOUTUBE_SCOPES: list = [
        "https://www.googleapis.com/auth/youtube.readonly",
        "https://www.googleapis.com/auth/yt-analytics.readonly",
    ]
    
    # Instagram (Facebook)
    INSTAGRAM_APP_ID: Optional[str] = None
    INSTAGRAM_APP_SECRET: Optional[str] = None
    INSTAGRAM_REDIRECT_URI: str = "http://localhost:8000/auth/instagram/callback"
    INSTAGRAM_SCOPES: list = [
        "instagram_basic",
        "instagram_manage_insights",
        "pages_show_list",
    ]
    
    # Twitter/X
    TWITTER_CLIENT_ID: Optional[str] = None
    TWITTER_CLIENT_SECRET: Optional[str] = None
    TWITTER_REDIRECT_URI: str = "http://localhost:8000/auth/twitter/callback"
    TWITTER_SCOPES: list = [
        "tweet.read",
        "users.read",
        "offline.access",
    ]
    
    # LinkedIn
    LINKEDIN_CLIENT_ID: Optional[str] = None
    LINKEDIN_CLIENT_SECRET: Optional[str] = None
    LINKEDIN_REDIRECT_URI: str = "http://localhost:8000/auth/linkedin/callback"
    LINKEDIN_SCOPES: list = [
        "r_liteprofile",
        "r_emailaddress",
        "w_member_social",
    ]
    
    # Frontend redirect after OAuth
    FRONTEND_URL: str = "http://localhost:8080"
    
    class Config:
        env_file = ".env"
        extra = "ignore"


oauth_settings = OAuthSettings()


# OAuth URLs
OAUTH_URLS = {
    "youtube": {
        "auth": "https://accounts.google.com/o/oauth2/v2/auth",
        "token": "https://oauth2.googleapis.com/token",
        "api": "https://www.googleapis.com/youtube/v3",
    },
    "instagram": {
        "auth": "https://www.facebook.com/v18.0/dialog/oauth",
        "token": "https://graph.facebook.com/v18.0/oauth/access_token",
        "api": "https://graph.facebook.com/v18.0",
    },
    "twitter": {
        "auth": "https://twitter.com/i/oauth2/authorize",
        "token": "https://api.twitter.com/2/oauth2/token",
        "api": "https://api.twitter.com/2",
    },
    "linkedin": {
        "auth": "https://www.linkedin.com/oauth/v2/authorization",
        "token": "https://www.linkedin.com/oauth/v2/accessToken",
        "api": "https://api.linkedin.com/v2",
    },
}


def get_oauth_url(platform: str, state: str) -> str:
    """Generate OAuth authorization URL for a platform."""
    
    if platform == "youtube":
        params = {
            "client_id": oauth_settings.YOUTUBE_CLIENT_ID,
            "redirect_uri": oauth_settings.YOUTUBE_REDIRECT_URI,
            "response_type": "code",
            "scope": " ".join(oauth_settings.YOUTUBE_SCOPES),
            "access_type": "offline",
            "prompt": "consent",
            "state": state,
        }
        base_url = OAUTH_URLS["youtube"]["auth"]
        
    elif platform == "instagram":
        params = {
            "client_id": oauth_settings.INSTAGRAM_APP_ID,
            "redirect_uri": oauth_settings.INSTAGRAM_REDIRECT_URI,
            "response_type": "code",
            "scope": ",".join(oauth_settings.INSTAGRAM_SCOPES),
            "state": state,
        }
        base_url = OAUTH_URLS["instagram"]["auth"]
        
    elif platform == "twitter":
        params = {
            "client_id": oauth_settings.TWITTER_CLIENT_ID,
            "redirect_uri": oauth_settings.TWITTER_REDIRECT_URI,
            "response_type": "code",
            "scope": " ".join(oauth_settings.TWITTER_SCOPES),
            "state": state,
            "code_challenge": "challenge",  # PKCE
            "code_challenge_method": "plain",
        }
        base_url = OAUTH_URLS["twitter"]["auth"]
        
    elif platform == "linkedin":
        params = {
            "client_id": oauth_settings.LINKEDIN_CLIENT_ID,
            "redirect_uri": oauth_settings.LINKEDIN_REDIRECT_URI,
            "response_type": "code",
            "scope": " ".join(oauth_settings.LINKEDIN_SCOPES),
            "state": state,
        }
        base_url = OAUTH_URLS["linkedin"]["auth"]
    else:
        raise ValueError(f"Unknown platform: {platform}")
    
    query = "&".join(f"{k}={v}" for k, v in params.items() if v)
    return f"{base_url}?{query}"
