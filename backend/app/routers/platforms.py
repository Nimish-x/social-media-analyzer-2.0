from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from app.core.auth import get_current_user, TokenData
from app.core.supabase import get_supabase

router = APIRouter()


class PlatformConnection(BaseModel):
    """Platform connection model."""
    id: Optional[str] = None
    platform_name: str
    access_token: str
    refresh_token: Optional[str] = None
    connected_at: Optional[datetime] = None


class PlatformStatus(BaseModel):
    """Platform connection status."""
    platform_name: str
    is_connected: bool
    connected_at: Optional[datetime] = None


@router.get("/", response_model=List[PlatformStatus])
async def get_connected_platforms(
    current_user: TokenData = Depends(get_current_user)
):
    """
    Get all connected platforms for the current user.
    """
    supabase = get_supabase()
    
    try:
        response = supabase.table("platforms").select(
            "platform_name, connected_at"
        ).eq("user_id", current_user.user_id).execute()
        
        connected = {p["platform_name"]: p["connected_at"] for p in response.data}
        
        all_platforms = ["instagram", "youtube", "twitter", "linkedin"]
        
        return [
            PlatformStatus(
                platform_name=platform,
                is_connected=platform in connected,
                connected_at=connected.get(platform)
            )
            for platform in all_platforms
        ]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/connect")
async def connect_platform(
    connection: PlatformConnection,
    current_user: TokenData = Depends(get_current_user)
):
    """
    Connect a social media platform.
    
    In production, this would handle OAuth flow completion.
    For hackathon, we simulate the connection.
    """
    supabase = get_supabase()
    
    try:
        # Check if already connected
        existing = supabase.table("platforms").select("id").eq(
            "user_id", current_user.user_id
        ).eq("platform_name", connection.platform_name).execute()
        
        if existing.data:
            # Update existing connection
            response = supabase.table("platforms").update({
                "access_token": connection.access_token,
                "refresh_token": connection.refresh_token,
                "connected_at": datetime.now().isoformat()
            }).eq("id", existing.data[0]["id"]).execute()
        else:
            # Create new connection
            response = supabase.table("platforms").insert({
                "user_id": current_user.user_id,
                "platform_name": connection.platform_name,
                "access_token": connection.access_token,
                "refresh_token": connection.refresh_token,
                "connected_at": datetime.now().isoformat()
            }).execute()
        
        return {"message": f"{connection.platform_name} connected successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{platform_name}")
async def disconnect_platform(
    platform_name: str,
    current_user: TokenData = Depends(get_current_user)
):
    """
    Disconnect a social media platform.
    """
    supabase = get_supabase()
    
    try:
        response = supabase.table("platforms").delete().eq(
            "user_id", current_user.user_id
        ).eq("platform_name", platform_name).execute()
        
        return {"message": f"{platform_name} disconnected successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/sync/{platform_name}")
async def sync_platform_data(
    platform_name: str,
    current_user: TokenData = Depends(get_current_user)
):
    """
    Manually trigger data sync for a platform.
    
    In production, this would fetch data from the social media API.
    For hackathon, we can simulate this or implement real API calls.
    """
    # TODO: Implement actual API sync in Phase 3
    return {
        "message": f"Sync triggered for {platform_name}",
        "status": "in_progress"
    }
