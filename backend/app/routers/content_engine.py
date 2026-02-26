from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from typing import Optional, List, Dict, Any
from app.core.auth import get_current_user, TokenData
from app.services.content_agent import content_agent

router = APIRouter()

@router.post("/generate")
async def generate_content(
    # Multi-Modal Support: Lists of files
    files: List[UploadFile] = File(...),
    
    # 1. High-Level Context (Optional - passed from "Magic" flow)
    niche: Optional[str] = Form(None),
    goal: Optional[str] = Form(None),
    
    # 2. Strict Parameters (Required per "Regeneration" flow and strict logic)
    # We provide defaults to avoid validation errors if frontend sends partial data during transition
    hook_type: str = Form("curiosity"),
    hook_length: str = Form("short"),
    tone: str = Form("professional"),
    cta: str = Form("Link in bio"),
    body_style: str = Form("list"),
    formatting: str = Form("clean"),
    emoji_in_hook: bool = Form(False),
    
    current_user: TokenData = Depends(get_current_user)
):
    """
    Generate High-Quality Content Caption from Images/Videos.
    Accepts:
    - Multiple files (carousel/video)
    - strict constraints
    - optional high-level context
    """
    try:
        # Delegate to the dedicated agent
        result = await content_agent.generate_caption(
            files=files,
            niche=niche,
            goal=goal,
            hook_type=hook_type,
            hook_length=hook_length,
            tone=tone,
            cta=cta,
            body_style=body_style,
            formatting=formatting,
            emoji_in_hook=emoji_in_hook
        )
        return result
        
    except Exception as e:
        print(f"Content Generation Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/feedback")
async def analyze_feedback(
    payload: Dict[str, Any],
    current_user: TokenData = Depends(get_current_user)
):
    """
    Record user feedback to improve future generations.
    Payload: { caption, feedback, metadata }
    """
    try:
        return await content_agent.analyze_feedback(
            caption=payload.get("caption", ""),
            feedback=payload.get("feedback", ""), # 'positive' | 'negative'
            metadata=payload.get("metadata", {})
        )
    except Exception as e:
        # Don't block UI on feedback error
        return {"status": "error", "message": str(e)}
