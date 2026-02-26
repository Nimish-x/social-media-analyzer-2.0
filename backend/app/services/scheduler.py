"""Background scheduler for syncing social media data.

Uses APScheduler for periodic data synchronization.
"""
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from datetime import datetime
from typing import Optional
import logging

from app.core.supabase import get_supabase

logger = logging.getLogger(__name__)

# Global scheduler instance
scheduler: Optional[AsyncIOScheduler] = None


async def sync_all_platforms():
    """
    Sync data for all connected platforms.
    
    This job runs periodically to fetch fresh data from all social APIs.
    """
    logger.info(f"[{datetime.now()}] Starting scheduled sync for all platforms...")
    
    supabase = get_supabase()
    
    try:
        # Get all connected platforms
        response = supabase.table("platforms").select("*").execute()
        
        if not response.data:
            logger.info("No connected platforms found")
            return
        
        for platform in response.data:
            try:
                await sync_platform(
                    user_id=platform["user_id"],
                    platform_name=platform["platform_name"],
                    access_token=platform["access_token"]
                )
            except Exception as e:
                logger.error(f"Error syncing {platform['platform_name']}: {e}")
        
        logger.info(f"Sync complete for {len(response.data)} platforms")
        
    except Exception as e:
        logger.error(f"Error in scheduled sync: {e}")


async def sync_platform(user_id: str, platform_name: str, access_token: str):
    """Sync data for a specific platform."""
    logger.info(f"Syncing {platform_name} for user {user_id[:8]}...")
    
    if platform_name == "youtube":
        from .youtube import sync_youtube_data
        # For YouTube, we'd need channel ID from user settings
        result = await sync_youtube_data(user_id, "channel_id_placeholder")
        
    elif platform_name == "instagram":
        from .instagram import sync_instagram_data
        result = await sync_instagram_data(user_id, access_token)
        
    else:
        logger.info(f"Sync not implemented for {platform_name}")
        return
    
    # Update last_synced_at
    supabase = get_supabase()
    supabase.table("platforms").update({
        "last_synced_at": datetime.now().isoformat()
    }).eq("user_id", user_id).eq("platform_name", platform_name).execute()
    
    logger.info(f"Sync complete for {platform_name}: {result}")


def init_scheduler():
    """Initialize the background scheduler."""
    global scheduler
    
    if scheduler is not None:
        return scheduler
    
    scheduler = AsyncIOScheduler()
    
    # Add jobs
    scheduler.add_job(
        sync_all_platforms,
        trigger=IntervalTrigger(hours=6),  # Sync every 6 hours
        id="sync_all_platforms",
        name="Sync all connected social platforms",
        replace_existing=True
    )
    
    logger.info("Background scheduler initialized")
    return scheduler


def start_scheduler():
    """Start the scheduler."""
    global scheduler
    if scheduler is None:
        init_scheduler()
    
    if not scheduler.running:
        scheduler.start()
        logger.info("Background scheduler started")


def stop_scheduler():
    """Stop the scheduler."""
    global scheduler
    if scheduler and scheduler.running:
        scheduler.shutdown()
        logger.info("Background scheduler stopped")
