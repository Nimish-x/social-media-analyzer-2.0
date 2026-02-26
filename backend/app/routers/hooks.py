"""
Hooks Router
API endpoints for video hook analysis.
Protected by authentication and plan-based access control.
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import JSONResponse
import os
from typing import Optional, Dict

from app.core.auth import get_current_user_with_profile
from app.core.plan_access import assert_feature_access
from app.services.video_processor import (
    extract_frames,
    save_temp_video,
    cleanup_temp_file
)
from app.services.hook_detector import analyze_hook, get_hook_summary


router = APIRouter(prefix="/api/hooks", tags=["hooks"])


ALLOWED_EXTENSIONS = {".mp4", ".mov", ".avi", ".webm", ".mkv"}
MAX_FILE_SIZE = 100 * 1024 * 1024  # 100MB


@router.post("/analyze")
async def analyze_video_hook(
    video: UploadFile = File(...),
    interval: float = 1.0,
    max_frames: int = 30,
    profile: Dict = Depends(get_current_user_with_profile)
):
    """
    Analyze a video to find the best hook moment.
    Requires Business plan.
    
    - **video**: Video file (mp4, mov, avi, webm, mkv)
    - **interval**: Seconds between frame captures (default: 1.0)
    - **max_frames**: Maximum frames to analyze (default: 30)
    
    Returns hook analysis with timestamp, reason, and frame image.
    """
    # Debug logging
    print(f"[DEBUG] Hook analyze called by user - profile: {profile}")
    print(f"[DEBUG] Plan: {profile.get('plan')}, Role: {profile.get('role')}")
    
    # Check plan access - VLM requires Business plan
    assert_feature_access(profile, "vlm")
    
    # Validate file extension
    file_ext = os.path.splitext(video.filename or "")[1].lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Read and save video to temp file
    try:
        video_bytes = await video.read()
        if len(video_bytes) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"File too large. Maximum size: {MAX_FILE_SIZE // (1024*1024)}MB"
            )
        
        temp_path = save_temp_video(video_bytes, suffix=file_ext)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving video: {str(e)}")
    
    try:
        from fastapi.concurrency import run_in_threadpool
        
        # Extract frames in threadpool (CPU bound)
        frames = await run_in_threadpool(
            extract_frames,
            temp_path,
            interval_seconds=interval,
            max_frames=max_frames
        )
        
        if not frames:
            raise HTTPException(
                status_code=400,
                detail="Could not extract frames from video"
            )
        
        # Analyze with Gemini (smart batching - 1 API call)
        analysis = await analyze_hook(frames)
        
        if not analysis:
            raise HTTPException(
                status_code=500,
                detail="Hook analysis failed"
            )
        
        # Add metadata
        analysis["total_frames_analyzed"] = len(frames)
        analysis["video_filename"] = video.filename
        analysis["summary"] = get_hook_summary(analysis)
        
        return JSONResponse(content=analysis)
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis error: {str(e)}")
    finally:
        # Cleanup temp file
        cleanup_temp_file(temp_path)


@router.get("/health")
async def health_check():
    """Check if hook analysis service is available."""
    gemini_configured = bool(os.getenv("GEMINI_API_KEY"))
    return {
        "status": "ok",
        "gemini_configured": gemini_configured
    }
