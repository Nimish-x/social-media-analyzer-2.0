"""Report generation service.

Generates PDF reports and CSV exports for analytics data.
"""
import io
import csv
from typing import Dict, Any, List, Optional
from datetime import datetime
from app.core.supabase import get_supabase
from app.services.mock_data import (
    get_mock_analytics_overview,
    get_mock_platform_metrics,
    get_mock_insights,
    get_mock_recommendations
)


class ReportGenerator:
    """Generate analytics reports in various formats."""
    
    def __init__(self, user_id: str):
        self.user_id = user_id
        self.supabase = get_supabase()
    
    async def generate_summary(self, days: int = 30) -> Dict[str, Any]:
        """Generate a summary report."""
        overview = get_mock_analytics_overview(self.user_id)
        insights = get_mock_insights()
        recommendations = get_mock_recommendations()
        
        platforms = ["instagram", "youtube", "twitter", "linkedin"]
        platform_data = [get_mock_platform_metrics(p) for p in platforms]
        
        return {
            "report_type": "summary",
            "generated_at": datetime.now().isoformat(),
            "period": f"Last {days} days",
            "overview": overview,
            "platforms": platform_data,
            "insights": insights[:3],
            "recommendations": recommendations[:3],
            "executive_summary": self._generate_executive_summary(overview, platform_data)
        }
    
    def _generate_executive_summary(self, overview: Dict, platforms: List[Dict]) -> str:
        """Generate an AI-style executive summary."""
        best_platform = max(platforms, key=lambda x: x.get("engagement_rate", 0))
        
        return f"""## Executive Summary

**Overall Performance**: Your social media presence generated {overview.get('total_impressions', 0):,} impressions with an overall engagement rate of {overview.get('engagement_rate', 0)}%.

**Top Platform**: {best_platform.get('platform', 'Instagram').title()} performed best with {best_platform.get('engagement_rate', 0)}% engagement rate.

**Growth**: Your account grew {overview.get('growth_rate', 0)}% compared to the previous period.

**Key Recommendations**:
1. Focus on short-form video content (Reels/Shorts)
2. Post during peak hours (7-9 PM)
3. Increase posting frequency to 4-5 times per week
"""
    
    async def export_csv(self, data_type: str = "analytics") -> str:
        """Export data to CSV format."""
        output = io.StringIO()
        
        if data_type == "analytics":
            writer = csv.writer(output)
            writer.writerow(["Platform", "Impressions", "Likes", "Comments", "Shares", "Engagement Rate"])
            
            for platform in ["instagram", "youtube", "twitter", "linkedin"]:
                metrics = get_mock_platform_metrics(platform)
                writer.writerow([
                    platform.title(),
                    metrics.get("impressions", 0),
                    metrics.get("likes", 0),
                    metrics.get("comments", 0),
                    metrics.get("shares", 0),
                    f"{metrics.get('engagement_rate', 0)}%"
                ])
        
        elif data_type == "posts":
            writer = csv.writer(output)
            writer.writerow(["Post ID", "Platform", "Content Type", "Likes", "Comments", "Shares", "Posted At"])
            # Would populate with actual post data
            writer.writerow(["post_1", "Instagram", "Reel", "3500", "120", "85", "2024-01-20"])
            writer.writerow(["post_2", "Instagram", "Carousel", "2800", "95", "60", "2024-01-18"])
            writer.writerow(["post_3", "YouTube", "Video", "4200", "180", "110", "2024-01-15"])
        
        return output.getvalue()
    
    async def generate_pdf_data(self, days: int = 30) -> Dict[str, Any]:
        """
        Generate data structure for PDF report.
        
        Note: Actual PDF generation would use a library like ReportLab or WeasyPrint.
        For hackathon, we return structured data that frontend can render as PDF.
        """
        summary = await self.generate_summary(days)
        
        return {
            "title": "Social Leaf Analytics Report",
            "subtitle": f"Performance Report - Last {days} Days",
            "generated_at": datetime.now().isoformat(),
            "sections": [
                {
                    "name": "Overview",
                    "data": summary["overview"]
                },
                {
                    "name": "Platform Performance",
                    "data": summary["platforms"]
                },
                {
                    "name": "Key Insights",
                    "data": summary["insights"]
                },
                {
                    "name": "Recommendations",
                    "data": summary["recommendations"]
                }
            ],
            "executive_summary": summary["executive_summary"],
            "charts": [
                {"type": "bar", "title": "Engagement by Platform"},
                {"type": "line", "title": "Engagement Over Time"},
                {"type": "pie", "title": "Content Type Distribution"}
            ]
        }


async def generate_report(user_id: str, report_type: str = "summary", days: int = 30) -> Dict[str, Any]:
    """Generate a report for a user."""
    generator = ReportGenerator(user_id)
    
    if report_type == "summary":
        return await generator.generate_summary(days)
    elif report_type == "pdf":
        return await generator.generate_pdf_data(days)
    else:
        return await generator.generate_summary(days)


async def export_to_csv(user_id: str, data_type: str = "analytics") -> str:
    """Export user data to CSV."""
    generator = ReportGenerator(user_id)
    return await generator.export_csv(data_type)
