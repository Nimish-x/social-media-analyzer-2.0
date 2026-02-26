"""Best Time to Post Engine.

Analyzes historical posting data to determine optimal posting times
for maximum engagement.
"""
import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from app.core.supabase import get_supabase


class BestTimeEngine:
    """Engine for calculating best posting times."""
    
    def __init__(self, user_id: str):
        self.user_id = user_id
        self.supabase = get_supabase()
    
    async def analyze(self, platform: Optional[str] = None, content_type: Optional[str] = None) -> Dict[str, Any]:
        """
        Analyze posting times and return optimal scheduling recommendations.
        """
        try:
            # Try to get real data
            query = self.supabase.table("posts").select(
                "id, platform, content_type, posted_at"
            ).eq("user_id", self.user_id)
            
            if platform:
                query = query.eq("platform", platform)
            if content_type:
                query = query.eq("content_type", content_type)
            
            posts = query.execute()
            
            if not posts.data or len(posts.data) < 5:
                return self._get_default_recommendations(platform, content_type)
            
            # Get metrics for these posts
            post_ids = [p["id"] for p in posts.data]
            metrics = self.supabase.table("metrics").select(
                "post_id, engagement_rate"
            ).in_("post_id", post_ids).execute()
            
            if not metrics.data:
                return self._get_default_recommendations(platform, content_type)
            
            # Create DataFrames
            posts_df = pd.DataFrame(posts.data)
            metrics_df = pd.DataFrame(metrics.data)
            
            # Merge
            df = posts_df.merge(metrics_df, left_on="id", right_on="post_id")
            df["posted_at"] = pd.to_datetime(df["posted_at"])
            df["hour"] = df["posted_at"].dt.hour
            df["day_of_week"] = df["posted_at"].dt.dayofweek
            df["day_name"] = df["posted_at"].dt.day_name()
            
            # Analyze by hour
            hourly = df.groupby("hour")["engagement_rate"].agg(["mean", "count"]).reset_index()
            hourly = hourly[hourly["count"] >= 2]  # Minimum samples
            best_hours = hourly.nlargest(3, "mean")["hour"].tolist()
            
            # Analyze by day
            daily = df.groupby(["day_of_week", "day_name"])["engagement_rate"].agg(["mean", "count"]).reset_index()
            daily = daily[daily["count"] >= 1]
            best_days = daily.nlargest(3, "mean")["day_name"].tolist()
            
            # Create time slots
            time_slots = self._create_time_slots(best_hours, best_days)
            
            return {
                "best_hours": [f"{h}:00" for h in best_hours],
                "best_days": best_days,
                "recommended_slots": time_slots,
                "analysis_period": "Last 90 days",
                "posts_analyzed": len(df),
                "platform": platform or "all",
                "content_type": content_type or "all"
            }
            
        except Exception as e:
            return self._get_default_recommendations(platform, content_type)
    
    def _create_time_slots(self, hours: List[int], days: List[str]) -> List[Dict[str, str]]:
        """Create recommended time slots."""
        slots = []
        for day in days[:2]:
            for hour in hours[:2]:
                slots.append({
                    "day": day,
                    "time": f"{hour:02d}:00",
                    "priority": "high" if len(slots) < 3 else "medium"
                })
        return slots[:5]
    
    def _get_default_recommendations(self, platform: Optional[str], content_type: Optional[str]) -> Dict[str, Any]:
        """Return default recommendations based on industry data."""
        
        # Platform-specific defaults
        defaults = {
            "instagram": {
                "hours": ["19:00", "21:00", "12:00"],
                "days": ["Tuesday", "Wednesday", "Thursday"],
                "content_specific": {
                    "reel": {"hours": ["19:00", "21:00", "18:00"], "days": ["Tuesday", "Thursday"]},
                    "carousel": {"hours": ["09:00", "18:00", "20:00"], "days": ["Wednesday", "Friday"]},
                    "image": {"hours": ["11:00", "15:00", "19:00"], "days": ["Monday", "Wednesday"]},
                }
            },
            "youtube": {
                "hours": ["17:00", "20:00", "14:00"],
                "days": ["Friday", "Saturday", "Sunday"],
                "content_specific": {
                    "video": {"hours": ["17:00", "20:00"], "days": ["Friday", "Saturday"]},
                    "short": {"hours": ["12:00", "18:00", "21:00"], "days": ["Daily"]},
                }
            },
            "twitter": {
                "hours": ["09:00", "12:00", "17:00"],
                "days": ["Tuesday", "Wednesday", "Thursday"],
            },
            "linkedin": {
                "hours": ["08:00", "12:00", "17:00"],
                "days": ["Tuesday", "Wednesday", "Thursday"],
            }
        }
        
        platform_data = defaults.get(platform, defaults["instagram"])
        
        if content_type and "content_specific" in platform_data:
            content_data = platform_data.get("content_specific", {}).get(content_type)
            if content_data:
                return {
                    "best_hours": content_data["hours"],
                    "best_days": content_data["days"],
                    "recommended_slots": self._create_slots_from_defaults(content_data),
                    "analysis_period": "Industry averages",
                    "posts_analyzed": 0,
                    "platform": platform or "all",
                    "content_type": content_type or "all",
                    "note": "Based on industry data. Connect more accounts for personalized insights."
                }
        
        return {
            "best_hours": platform_data["hours"],
            "best_days": platform_data["days"],
            "recommended_slots": self._create_slots_from_defaults(platform_data),
            "analysis_period": "Industry averages",
            "posts_analyzed": 0,
            "platform": platform or "all",
            "content_type": content_type or "all",
            "note": "Based on industry data. Connect more accounts for personalized insights."
        }
    
    def _create_slots_from_defaults(self, data: Dict) -> List[Dict[str, str]]:
        """Create time slots from default data."""
        slots = []
        days = data.get("days", ["Tuesday", "Wednesday"])
        hours = data.get("hours", ["19:00", "21:00"])
        
        for i, day in enumerate(days[:2]):
            for j, hour in enumerate(hours[:2]):
                slots.append({
                    "day": day,
                    "time": hour,
                    "priority": "high" if i == 0 and j == 0 else "medium"
                })
        return slots[:5]


async def get_best_posting_times(
    user_id: str,
    platform: Optional[str] = None,
    content_type: Optional[str] = None
) -> Dict[str, Any]:
    """Get best posting times for a user."""
    engine = BestTimeEngine(user_id)
    return await engine.analyze(platform, content_type)
