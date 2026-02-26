"""Mock data service for demo purposes."""
import random
from datetime import datetime, timedelta
from typing import List, Dict, Any


def generate_mock_posts(user_id: str, count: int = 20) -> List[Dict[str, Any]]:
    """Generate mock social media posts."""
    platforms = ["instagram", "youtube", "twitter", "linkedin"]
    content_types = {
        "instagram": ["reel", "carousel", "image", "story"],
        "youtube": ["video", "short"],
        "twitter": ["post", "thread"],
        "linkedin": ["post", "article"]
    }
    
    posts = []
    titles = [
        "Product Launch Carousel",
        "Behind the Scenes Reel",
        "Industry Insights Thread",
        "Company Culture Post",
        "Tutorial: Getting Started",
        "Customer Success Story",
        "Weekly Tips & Tricks",
        "Q&A Session Recap",
        "New Feature Announcement",
        "Team Spotlight",
    ]
    
    for i in range(count):
        platform = random.choice(platforms)
        post = {
            "id": f"post_{i}_{user_id[:8]}",
            "user_id": user_id,
            "platform": platform,
            "platform_post_id": f"{platform[:2]}_{random.randint(10000, 99999)}",
            "content_type": random.choice(content_types[platform]),
            "title": random.choice(titles),
            "posted_at": (datetime.now() - timedelta(days=random.randint(1, 60))).isoformat(),
        }
        posts.append(post)
    
    return posts


def generate_mock_metrics(posts: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Generate mock metrics for posts."""
    metrics = []
    
    for post in posts:
        # Content type affects engagement
        base_multiplier = {
            "reel": 3.0,
            "video": 2.5,
            "short": 2.8,
            "carousel": 2.0,
            "image": 1.0,
            "story": 0.8,
            "post": 1.2,
            "thread": 1.5,
            "article": 1.3,
        }.get(post.get("content_type", "post"), 1.0)
        
        likes = int(random.randint(500, 5000) * base_multiplier)
        comments = int(random.randint(20, 300) * base_multiplier)
        shares = int(random.randint(10, 200) * base_multiplier)
        reach = int(random.randint(5000, 50000) * base_multiplier)
        impressions = int(reach * random.uniform(1.2, 2.0))
        
        engagement_rate = ((likes + comments + shares) / reach) * 100 if reach > 0 else 0
        
        metric = {
            "id": f"metric_{post['id']}",
            "post_id": post["id"],
            "likes": likes,
            "comments": comments,
            "shares": shares,
            "saves": int(likes * 0.1),
            "reach": reach,
            "impressions": impressions,
            "engagement_rate": round(engagement_rate, 2),
            "views": int(impressions * 0.7),
            "collected_at": datetime.now().isoformat(),
        }
        metrics.append(metric)
    
    return metrics


def get_mock_analytics_overview(user_id: str) -> Dict[str, Any]:
    """Get mock analytics overview."""
    return {
        "total_impressions": 2547831,  # ~2.5M - obviously different from 1.2M
        "engagement_rate": 11.7,       # 11.7% - different from 8.4%
        "total_comments": 45678,       # ~45K - different from 23.4K
        "total_shares": 18234,         # ~18K - different from 8.9K
        "growth_rate": 23.8,           # 23.8% - different from 12.5%
    }


def get_mock_platform_metrics(platform: str) -> Dict[str, Any]:
    """Get mock metrics for a specific platform."""
    base = {
        "instagram": {"mult": 1.5, "engagement": 8.5},
        "youtube": {"mult": 2.0, "engagement": 5.2},
        "twitter": {"mult": 0.8, "engagement": 3.8},
        "linkedin": {"mult": 1.0, "engagement": 4.5},
    }.get(platform, {"mult": 1.0, "engagement": 5.0})
    
    return {
        "platform": platform,
        "impressions": int(random.randint(200000, 500000) * base["mult"]),
        "likes": int(random.randint(50000, 150000) * base["mult"]),
        "comments": int(random.randint(5000, 20000) * base["mult"]),
        "shares": int(random.randint(2000, 8000) * base["mult"]),
        "engagement_rate": round(base["engagement"] + random.uniform(-1.0, 1.0), 2),
    }


def get_mock_insights() -> List[Dict[str, Any]]:
    """Get mock AI insights."""
    insights = [
        {
            "type": "tip",
            "summary": "Your Reels perform 3.2x better than static posts. Consider creating more video content.",
        },
        {
            "type": "alert",
            "summary": "Engagement dropped 15% this week on Twitter. Try posting during peak hours (9-11 AM).",
        },
        {
            "type": "success",
            "summary": "Your carousel about 'Industry Trends' had the highest reach this month with 45K impressions.",
        },
        {
            "type": "tip",
            "summary": "Posts with questions in captions get 2.1x more comments. Engage your audience!",
        },
        {
            "type": "growth",
            "summary": "Your LinkedIn following grew 23% this month. Great B2B content strategy!",
        },
    ]
    return insights


def get_mock_best_times() -> Dict[str, Any]:
    """Get mock best posting times."""
    return {
        "instagram": {
            "reel": ["7:00 PM", "9:00 PM", "12:00 PM"],
            "carousel": ["9:00 AM", "6:00 PM", "8:00 PM"],
            "image": ["11:00 AM", "3:00 PM", "7:00 PM"],
        },
        "youtube": {
            "video": ["5:00 PM", "8:00 PM", "2:00 PM"],
            "short": ["12:00 PM", "6:00 PM", "9:00 PM"],
        },
        "twitter": {
            "post": ["9:00 AM", "12:00 PM", "5:00 PM"],
            "thread": ["8:00 AM", "1:00 PM"],
        },
        "linkedin": {
            "post": ["8:00 AM", "12:00 PM", "5:00 PM"],
            "article": ["10:00 AM", "2:00 PM"],
        },
    }


def get_mock_recommendations() -> List[Dict[str, Any]]:
    """Get mock content recommendations."""
    return [
        {
            "type": "content",
            "content": "Create more Reels/Shorts - your short-form video content gets 3x more engagement than images.",
            "priority": 1,
        },
        {
            "type": "timing",
            "content": "Post on Instagram between 7-9 PM IST for maximum reach. Avoid posting before 9 AM.",
            "priority": 2,
        },
        {
            "type": "format",
            "content": "Use carousel posts for educational content - they have 40% higher save rate.",
            "priority": 3,
        },
        {
            "type": "hashtag",
            "content": "Use 5-7 niche hashtags instead of popular ones. Your posts with specific hashtags perform better.",
            "priority": 4,
        },
        {
            "type": "strategy",
            "content": "Start a weekly content series. Consistency builds audience expectation and loyalty.",
            "priority": 5,
        },
    ]
