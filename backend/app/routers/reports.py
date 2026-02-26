"""Reports router for generating and exporting analytics reports."""
from fastapi import APIRouter, Depends, Response
from typing import Optional
from datetime import datetime

from app.core.auth import get_current_user, TokenData
from app.services.reports import generate_report, export_to_csv
from app.services.best_time import get_best_posting_times
from app.services.ai_service import ai_service
from typing import Dict, Any
from pydantic import BaseModel

router = APIRouter()


@router.get("/summary")
async def get_report_summary(
    days: int = 30,
    current_user: TokenData = Depends(get_current_user)
):
    """
    Get a summary report of analytics.
    """
    return await generate_report(current_user.user_id, "summary", days)


@router.get("/pdf-data")
async def get_pdf_report_data(
    days: int = 30,
    current_user: TokenData = Depends(get_current_user)
):
    """
    Get data structure for PDF report generation.
    Frontend can use this to render a PDF.
    """
    return await generate_report(current_user.user_id, "pdf", days)


@router.get("/export/csv")
async def export_analytics_csv(
    data_type: str = "analytics",
    current_user: TokenData = Depends(get_current_user)
):
    """
    Export analytics data as CSV.
    
    - **data_type**: Type of data to export (analytics, posts)
    """
    csv_data = await export_to_csv(current_user.user_id, data_type)
    
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename=social_leaf_{data_type}_{datetime.now().strftime('%Y%m%d')}.csv"
        }
    )


@router.get("/best-time")
async def get_best_time_to_post(
    platform: Optional[str] = None,
    content_type: Optional[str] = None,
    current_user: TokenData = Depends(get_current_user)
):
    """
    Get best posting times based on historical engagement.
    
    - **platform**: Filter by platform (instagram, youtube, etc.)
    - **content_type**: Filter by content type (reel, carousel, video, etc.)
    """
    return await get_best_posting_times(current_user.user_id, platform, content_type)


class AnalysisRequest(BaseModel):
    metrics: Dict[str, Any]


@router.post("/analysis")
async def get_report_analysis(
    request: AnalysisRequest,
    current_user: TokenData = Depends(get_current_user)
):
    """
    Generate AI-powered analysis for a report based on provided metrics.
    """
    # Normalize keys to snake_case for backend consistency
    metrics = {}
    for k, v in request.metrics.items():
        # Convert camelCase to snake_case (e.g., totalImpressions -> total_impressions)
        snake_key = ''.join(['_' + c.lower() if c.isupper() else c for c in k]).lstrip('_')
        metrics[snake_key] = v
        
    return {
        "analysis": await ai_service.generate_detailed_report_analysis(metrics)
    }
