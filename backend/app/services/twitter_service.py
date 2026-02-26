"""
Twitter API v2 service for fetching real Twitter statistics.
"""
import httpx
from typing import Optional
from datetime import datetime

from app.routers.oauth import get_tokens


TWITTER_API_BASE = "https://api.twitter.com/2"


async def get_twitter_user() -> Optional[dict]:
    """
    Get authenticated Twitter user info.
    """
    tokens = get_tokens("twitter")
    if not tokens:
        return None
    
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{TWITTER_API_BASE}/users/me",
            params={
                "user.fields": "id,name,username,description,profile_image_url,public_metrics,verified",
            },
            headers={"Authorization": f"Bearer {tokens['access_token']}"},
        )
    
    if response.status_code != 200:
        return None
    
    return response.json().get("data")


async def get_recent_tweets(max_results: int = 10) -> Optional[list]:
    """
    Get recent tweets from authenticated user.
    """
    tokens = get_tokens("twitter")
    if not tokens:
        return None
    
    user = await get_twitter_user()
    if not user:
        return None
    
    user_id = user.get("id")
    
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{TWITTER_API_BASE}/users/{user_id}/tweets",
            params={
                "max_results": max_results,
                "tweet.fields": "created_at,public_metrics,source",
            },
            headers={"Authorization": f"Bearer {tokens['access_token']}"},
        )
    
    if response.status_code != 200:
        return None
    
    tweets = []
    for tweet in response.json().get("data", []):
        metrics = tweet.get("public_metrics", {})
        tweets.append({
            "id": tweet.get("id"),
            "text": tweet.get("text"),
            "created_at": tweet.get("created_at"),
            "likes": metrics.get("like_count", 0),
            "retweets": metrics.get("retweet_count", 0),
            "replies": metrics.get("reply_count", 0),
            "impressions": metrics.get("impression_count", 0),
        })
    
    return tweets


async def get_twitter_analytics() -> Optional[dict]:
    """
    Get comprehensive Twitter analytics.
    """
    user = await get_twitter_user()
    tweets = await get_recent_tweets(10)
    
    if not user:
        return None
    
    metrics = user.get("public_metrics", {})
    
    # Calculate engagement from recent tweets
    total_impressions = sum(t.get("impressions", 0) for t in (tweets or []))
    total_likes = sum(t.get("likes", 0) for t in (tweets or []))
    total_retweets = sum(t.get("retweets", 0) for t in (tweets or []))
    total_replies = sum(t.get("replies", 0) for t in (tweets or []))
    
    engagement_rate = 0
    if total_impressions > 0:
        engagement_rate = ((total_likes + total_retweets + total_replies) / total_impressions) * 100
    
    return {
        "platform": "twitter",
        "connected": True,
        "user": {
            "id": user.get("id"),
            "name": user.get("name"),
            "username": user.get("username"),
            "bio": user.get("description"),
            "profile_image": user.get("profile_image_url"),
            "verified": user.get("verified", False),
        },
        "metrics": {
            "followers": metrics.get("followers_count", 0),
            "following": metrics.get("following_count", 0),
            "tweets": metrics.get("tweet_count", 0),
            "listed": metrics.get("listed_count", 0),
            "recent_impressions": total_impressions,
            "recent_likes": total_likes,
            "recent_retweets": total_retweets,
            "engagement_rate": round(engagement_rate, 2),
        },
        "recent_tweets": tweets,
        "fetched_at": datetime.utcnow().isoformat(),
    }
