from typing import Optional, List, Dict
from pydantic import BaseModel
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status, Depends
from app.services.ai_service import ai_service
from app.services.image_service import optimize_image
from app.core.auth import get_current_user_with_profile
from app.core.plan_access import assert_feature_access

router = APIRouter()

class PostPreviewResponse(BaseModel):
    caption: str
    hashtags: List[str]
    cta: str
    style: str
    optimized_image_paths: List[str]
    auto_post: bool

@router.post("/generate", response_model=PostPreviewResponse)
async def generate_post(
    images: List[UploadFile] = File(...),
    niche: Optional[str] = Form(None),
    tone: Optional[str] = Form(None),
    goal: Optional[str] = Form(None),
    cta: Optional[str] = Form(None),
    auto_post: bool = Form(False),
    profile: Dict = Depends(get_current_user_with_profile)
):
    """
    Generate an Instagram post (Caption + Optimized Images) from uploaded images.
    """
    assert_feature_access(profile, "create_post")
    try:
        # 1. Read all file bytes for AI
        image_bytes_list = []
        for img in images:
            image_bytes_list.append(await img.read())
            # Reset cursor for optimization later
            img.file.seek(0)

        # 2. Generate Caption (AI)
        ai_result = await ai_service.generate_instagram_caption(
            image_bytes_list=image_bytes_list,
            niche=niche,
            tone=tone,
            goal=goal,
            cta=cta
        )

        # 3. Optimize All Images
        optimized_paths = []
        for img in images:
            # optimize_image expects UploadFile and saves it
            print(f"Optimizing image: {img.filename}")
            # Run blocking CPU-bound task in threadpool
            from fastapi.concurrency import run_in_threadpool
            path = await run_in_threadpool(optimize_image, img)
            optimized_paths.append(path)

        # 4. Return Payload
        return PostPreviewResponse(
            caption=ai_result.get("caption", ""),
            hashtags=ai_result.get("hashtags", []),
            cta=ai_result.get("cta", ""),
            style=ai_result.get("style", "custom"),
            optimized_image_paths=optimized_paths,
            auto_post=auto_post
        )

    except Exception as e:
        print(f"Error in /post/generate: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
