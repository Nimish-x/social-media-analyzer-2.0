from fastapi import APIRouter
from app.services.admin_service import admin_service

router = APIRouter(
    prefix="/system",
    tags=["System"],
    responses={404: {"description": "Not found"}},
)

@router.get("/status")
async def get_system_status():
    """Get public system status (maintenance mode, announcements)."""
    settings = await admin_service.get_settings()
    # Only return public fields
    return {
        "announcement": settings.get("announcement", ""),
        "announcement_active": settings.get("announcement_active", False),
        "maintenance_mode": settings.get("feature_flags", {}).get("maintenance_mode", False),
        "maintenance_start": settings.get("maintenance_start", ""),
        "maintenance_end": settings.get("maintenance_end", "")
    }
