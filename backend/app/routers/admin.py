from fastapi import APIRouter, Depends, HTTPException, status, Body
from typing import Dict, Any, List, Optional

from app.services.admin_service import admin_service
from app.services.user_service import user_service
from app.core.auth import get_current_user, TokenData

router = APIRouter(
    prefix="/admin",
    tags=["admin"],
    responses={404: {"description": "Not found"}},
)

async def require_admin(user: TokenData = Depends(get_current_user)):
    """Dependency to ensure user is an admin."""
    # We need to fetch the full profile to check the role, 
    # as get_current_user might just return the auth user, not the profile with role
    # optimizing: get_current_user implementation details matter here. 
    # Assuming get_current_user returns the profile or we fetch it.
    
    # In `routers/auth.py`, get_current_user usually verifies the token.
    # We should fetch the profile role.
    
    profile = await user_service.get_profile(user.user_id)
    if not profile or profile.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return user

@router.get("/analytics/overview")
async def get_analytics_overview(
    user: Dict[str, Any] = Depends(require_admin)
) -> Dict[str, Any]:
    """Get overview analytics for admin dashboard."""
    return await admin_service.get_analytics_overview()

@router.get("/analytics/plans")
async def get_plan_distribution(
    user: Dict[str, Any] = Depends(require_admin)
) -> List[Dict[str, Any]]:
    """Get user plan distribution."""
    return await admin_service.get_plan_distribution()

@router.get("/analytics/platform-stats")
async def get_platform_stats(
    user: TokenData = Depends(require_admin)
) -> List[Dict[str, Any]]:
    """Get platform connection stats."""
    return await admin_service.get_platform_stats()

@router.get("/analytics/recent-users")
async def get_recent_users(
    user: TokenData = Depends(require_admin)
) -> List[Dict[str, Any]]:
    """Get recent users."""
    return await admin_service.get_recent_users()

@router.get("/users")
async def get_users(
    page: int = 1, 
    per_page: int = 20, 
    search: Optional[str] = None,
    user: TokenData = Depends(require_admin)
):
    """Get paginated list of users."""
    return await admin_service.get_all_users(page, per_page, search)

@router.post("/users/{id}/role")
async def update_user_role(
    id: str, 
    role: str = Body(..., embed=True),
    user: TokenData = Depends(require_admin)
):
    """Update a user's role (e.g. 'banned', 'admin', 'user')."""
    success = await admin_service.update_user_role(id, role)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to update role")
    return {"status": "success"}

@router.post("/users/{id}/plan")
async def update_user_plan(
    id: str, 
    plan: str = Body(..., embed=True),
    user: TokenData = Depends(require_admin)
):
    """Update a user's plan."""
    success = await admin_service.update_user_plan(id, plan)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to update plan")
    return {"status": "success"}

@router.get("/settings")
async def get_settings(user: TokenData = Depends(require_admin)):
    """Get global settings."""
    return await admin_service.get_settings()

@router.post("/settings")
async def update_settings(
    settings: Dict[str, Any] = Body(...),
    user: TokenData = Depends(require_admin)
):
    """Update global settings."""
    success = await admin_service.update_settings(settings)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to update settings")
    return {"status": "success"}

@router.post("/system/notify-maintenance")
async def notify_maintenance(
    payload: Dict[str, str] = Body(...),
    user: TokenData = Depends(require_admin)
):
    """Notify users about scheduled maintenance."""
    start = payload.get("start")
    end = payload.get("end")
    if not start or not end:
        raise HTTPException(status_code=400, detail="Start and end times required")
        
    result = await admin_service.notify_maintenance(start, end)
    if result["status"] == "error":
        raise HTTPException(status_code=500, detail=result["message"])
    return result
