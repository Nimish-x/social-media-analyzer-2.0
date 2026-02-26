from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from app.services.instagram_service import create_media_container, publish_media

router = APIRouter()

class PublishRequest(BaseModel):
    image_url: str
    caption: str

class PublishResponse(BaseModel):
    status: str
    creation_id: str
    instagram_post_id: str

@router.post("/publish", response_model=PublishResponse)
async def publish_to_instagram(payload: PublishRequest):
    """
    Publish a post to Instagram (Steps 5 & 6).
    """
    try:
        # Step 1: Create Container
        creation_id = await create_media_container(payload.image_url, payload.caption)

        # Step 2: Publish
        result = await publish_media(creation_id)
        
        return PublishResponse(
            status="PUBLISHED",
            creation_id=creation_id,
            instagram_post_id=result.get("id")
        )

    except RuntimeError as e:
        # Catch explicit errors from service
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        # Catch unexpected errors
        print(f"Unexpected error in /instagram/publish: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal Server Error: {str(e)}"
        )
