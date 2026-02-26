
import asyncio
import os
import sys
import json
from dotenv import load_dotenv

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
load_dotenv()

from app.services.ai_service import ai_service

async def main():
    print("🤖 Testing AI Context with MOCKED Data (Bypassing Rate Limits)...")
    
    # Mock Data representing what the API WOULD return if it wasn't rate limited
    mock_ig_data = {
        "username": "instagram",
        "followers": 699000000,
        "engagement": "0.1%",
        "recent_media_count": 8324,
        "recent_posts": [
            {"caption": "Tom Brady interview", "likes": 500000, "comments": 2000},
            {"caption": "Weekly recap", "likes": 300000, "comments": 1500}
        ]
    }

    mock_yt_data = {
        "source": "public_api",
        "channel_stats": {
            "subscribers": 2480000,
            "total_views": 1010000000,
            "video_count": 500
        },
        "recent_videos": [
            {"title": "Tech Review 2024", "views": 74000, "likes": 5000},
            {"title": "Phone Unboxing", "views": 120000, "likes": 8000}
        ]
    }

    # Build Context
    context_dict = {
        "platform_filter": "all",
        "db_posts_count": 5,
        "engagement_rate": 4.5,
        "real_youtube_data": mock_yt_data,
        "real_instagram_data": mock_ig_data 
    }
    
    # Call AI Service
    print("\n2. Calling AI Service with INJECTED context...")
    answer = await ai_service.answer_query("Analyze my performance on Instagram and YouTube.", context_dict)
    
    print("\n✅ AI Answer Received:")
    print(answer)

if __name__ == "__main__":
    asyncio.run(main())
