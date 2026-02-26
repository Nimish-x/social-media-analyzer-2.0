from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import openai

from app.core.auth import get_current_user, TokenData
from app.core.config import get_settings
from app.core.supabase import get_supabase

router = APIRouter()
settings = get_settings()


class QueryRequest(BaseModel):
    """Natural language query request."""
    question: str
    platform: Optional[str] = "all"  # 'all', 'instagram', 'youtube', 'twitter', 'linkedin'
    handle: Optional[str] = None # For public account fallback


class QueryResponse(BaseModel):
    """AI query response."""
    answer: str
    data: Optional[dict] = None


class InsightResponse(BaseModel):
    """AI-generated insight."""
    id: str
    summary: str
    generated_at: datetime


class RecommendationResponse(BaseModel):
    """AI-generated recommendation."""
    id: str
    recommendation_type: str
    content: str
    generated_at: datetime


@router.post("/query", response_model=QueryResponse)
async def natural_language_query(
    request: QueryRequest,
    current_user: TokenData = Depends(get_current_user)
):
    """
    Process a natural language query about analytics.
    
    Examples:
    - "Which post performed best last month?"
    - "Why did my reach drop this week?"
    - "Do reels outperform images?"
    """
    supabase = get_supabase()
    
    try:
        # Base queries
        posts_query = supabase.table("posts").select(
            "id, platform, content_type, posted_at"
        ).eq("user_id", current_user.user_id).order(
            "posted_at", desc=True
        ).limit(50)

        metrics_query = supabase.table("metrics").select(
            "post_id, likes, comments, shares, engagement_rate, collected_at"
        ).order("collected_at", desc=True).limit(100)

        # Apply platform filter if not 'all'
        if request.platform and request.platform.lower() != 'all':
            posts_query = posts_query.eq("platform", request.platform.lower())
            # For metrics, we'd ideally filter by post platform too, but metrics table might not have platform directly
            # assuming metrics are linked to posts which have platform. 
            # For simplicity in this iteration, we might just filter posts data which is most critical for context.
            # If metrics table has platform column (it likely should), we filter it too.
            # Let's check schema assumption. Assuming metrics table might NOT have platform, 
            # but usually it's passed or can be inferred. 
            # To be safe, we will just filter the posts for now which give the content context.
            
        posts_response = posts_query.execute()
        metrics_response = metrics_query.execute()
        
        if request.platform.lower() in ['all', 'youtube']:
            real_youtube_data = {}
            from app.routers.oauth import get_tokens
            from app.services.youtube_service import get_youtube_analytics
            
            # 1. Try OAuth first
            if get_tokens("youtube"):
                try:
                    yt_analytics = await get_youtube_analytics()
                    if yt_analytics:
                        real_youtube_data = {
                            "source": "oauth",
                            "channel_stats": yt_analytics.get("metrics"),
                            "recent_videos": [
                                {
                                    "title": v.get("title"),
                                    "views": v.get("views"),
                                    "likes": v.get("likes")
                                } 
                                for v in yt_analytics.get("recent_videos", [])[:5]
                            ]
                        }
                except Exception as e:
                    print(f"Error fetching YouTube OAuth context: {e}")
            
            # 2. Fallback to Public Handle if no OAuth data and handle provided
            if not real_youtube_data and request.handle:
                try:
                    from app.services.youtube import YouTubeService
                    service = YouTubeService() # Uses API Key
                    
                    # Resolve handle if needed
                    handle_to_use = request.handle
                    if not handle_to_use.startswith('@') and not handle_to_use.startswith('UC'):
                         handle_to_use = f"@{handle_to_use}"

                    channel_id = await service.resolve_channel_id(handle_to_use)
                    if channel_id:
                        stats = await service.get_public_channel_stats(channel_id)
                        videos = await service.get_channel_videos_with_stats(channel_id, max_results=5)
                        
                        real_youtube_data = {
                            "source": "public_api",
                            "channel_stats": {
                                "subscribers": stats['statistics']['subscribers'],
                                "total_views": stats['statistics']['views'],
                                "video_count": stats['statistics']['videos']
                            },
                             "recent_videos": [
                                {
                                    "title": v.get("title"),
                                    "views": v['statistics']['views'],
                                    "likes": v['statistics']['likes']
                                } 
                                for v in videos
                            ]
                        }
                except Exception as e:
                    print(f"Error fetching YouTube Public context: {e}")

        # Fetch Instagram Data for Context
        real_instagram_data = {}
        if request.platform.lower() in ['all', 'instagram'] and request.handle:
            try:
                from app.services.instagram_service import get_simulated_stats
                # This will now use the REAL API if the handle matches the connected user
                ig_data = await get_simulated_stats(request.handle)
                if ig_data:
                    real_instagram_data = {
                        "username": ig_data.get("account", {}).get("username"),
                        "followers": ig_data.get("metrics", {}).get("followers"),
                        "engagement": ig_data.get("metrics", {}).get("engagement", "N/A"),
                        "recent_media_count": len(ig_data.get("recent_media", []))
                    }
                    # Flatten recent media for context
                    if ig_data.get("recent_media"):
                        real_instagram_data["recent_posts"] = [
                            {
                                "caption": m.get("caption", "")[:50],
                                "likes": m.get("likes") or m.get("like_count"),
                                "comments": m.get("comments") or m.get("comments_count")
                            }
                            for m in ig_data.get("recent_media")[:5]
                        ]
            except Exception as e:
                print(f"Error fetching Instagram context: {e}")

        # Build context for AI
        context_dict = {
            "platform_filter": request.platform,
            "db_posts_count": len(posts_response.data),
            "db_recent_metrics": metrics_response.data[:10] if metrics_response.data else [],
            "engagement_rate": sum(m['engagement_rate'] for m in metrics_response.data)/len(metrics_response.data) if metrics_response.data else 0,
            "engagement_rate": sum(m['engagement_rate'] for m in metrics_response.data)/len(metrics_response.data) if metrics_response.data else 0,
            "real_youtube_data": real_youtube_data,
            "real_instagram_data": real_instagram_data
        }
        
        # Call AI Service (Centralized Logic)
        from app.services.ai_service import ai_service
        answer = await ai_service.answer_query(request.question, context_dict)
        
        return QueryResponse(answer=answer, data={"posts_analyzed": len(posts_response.data)})
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/insights", response_model=List[InsightResponse])
async def get_insights(
    current_user: TokenData = Depends(get_current_user)
):
    """
    Get AI-generated insights for the user.
    """
    supabase = get_supabase()
    
    try:
        response = supabase.table("insights").select("*").eq(
            "user_id", current_user.user_id
        ).order("generated_at", desc=True).limit(10).execute()
        
        return [
            InsightResponse(
                id=insight["id"],
                summary=insight["summary"],
                generated_at=insight["generated_at"]
            )
            for insight in response.data
        ]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate-insights")
async def generate_insights(
    current_user: TokenData = Depends(get_current_user)
):
    """
    Generate new AI insights based on recent data.
    """
    supabase = get_supabase()
    
    try:
        # Get recent metrics
        metrics = supabase.table("metrics").select("*").order(
            "collected_at", desc=True
        ).limit(100).execute()
        
        # Generate insight using AI
        if settings.openai_api_key:
            client = openai.OpenAI(api_key=settings.openai_api_key)
            
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": "Generate a brief, actionable insight about social media performance. Be specific and data-driven."
                    },
                    {
                        "role": "user",
                        "content": f"Analyze this data and provide one key insight: {metrics.data[:20]}"
                    }
                ],
                max_tokens=200
            )
            
            summary = response.choices[0].message.content
        else:
            summary = "Your Reels receive 43% higher engagement than images, especially when posted after 8 PM. Consider creating more short-form video content."
        
        # Save insight
        result = supabase.table("insights").insert({
            "user_id": current_user.user_id,
            "summary": summary,
            "generated_at": datetime.now().isoformat()
        }).execute()
        
        return {"message": "Insight generated", "insight": summary}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/recommendations", response_model=List[RecommendationResponse])
async def get_recommendations(
    current_user: TokenData = Depends(get_current_user)
):
    """
    Get AI-generated content recommendations.
    """
    supabase = get_supabase()
    
    try:
        response = supabase.table("recommendations").select("*").eq(
            "user_id", current_user.user_id
        ).order("generated_at", desc=True).limit(10).execute()
        
        return [
            RecommendationResponse(
                id=rec["id"],
                recommendation_type=rec["recommendation_type"],
                content=rec["content"],
                generated_at=rec["generated_at"]
            )
            for rec in response.data
        ]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/best-time-to-post")
async def get_best_time_to_post(
    platform: Optional[str] = None,
    content_type: Optional[str] = None,
    current_user: TokenData = Depends(get_current_user)
):
    """
    Get the best time to post based on historical engagement.
    """
    # For hackathon, return mock data
    # In production, this would analyze posts.posted_at vs engagement
    
    best_times = {
        "instagram": {
            "reel": ["7:00 PM", "9:00 PM", "12:00 PM"],
            "carousel": ["9:00 AM", "6:00 PM"],
            "image": ["11:00 AM", "3:00 PM"]
        },
        "youtube": {
            "video": ["5:00 PM", "8:00 PM"]
        },
        "twitter": {
            "post": ["9:00 AM", "12:00 PM", "5:00 PM"]
        },
        "linkedin": {
            "post": ["8:00 AM", "12:00 PM", "5:00 PM"]
        }
    }
    
    if platform and platform in best_times:
        result = best_times[platform]
        if content_type and content_type in result:
            return {
                "platform": platform,
                "content_type": content_type,
                "best_times": result[content_type],
                "timezone": "IST"
            }
        return {
            "platform": platform,
            "best_times": result,
            "timezone": "IST"
        }
    
    return {
        "all_platforms": best_times,
        "timezone": "IST"
    }


@router.get("/audience-persona")
async def get_audience_persona(
    current_user: TokenData = Depends(get_current_user)
):
    """
    Generate AI-powered audience persona analysis based on real YouTube data.
    """
    from app.services.ai_service import ai_service
    from app.services.youtube_service import YouTubeService
    
    supabase = get_supabase()
    
    # Get YouTube connection
    youtube_conn = supabase.table("platform_connections").select("*").eq(
        "user_id", current_user.user_id
    ).eq("platform", "youtube").maybe_single().execute()
    
    if not youtube_conn.data:
        raise HTTPException(status_code=404, detail="YouTube not connected")
    
    # Fetch real YouTube data
    youtube_service = YouTubeService(youtube_conn.data.get("access_token"))
    channel_data = await youtube_service.get_channel_data()
    
    # Generate AI persona
    persona = await ai_service.generate_audience_persona(channel_data)
    
    return persona
