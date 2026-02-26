"""
Plan-based feature access control.
Single source of truth for feature permissions.
"""

from fastapi import HTTPException, status
from typing import Dict, Any


# Central feature map - mirrors frontend planPermissions.ts
PLAN_FEATURES: Dict[str, Dict[str, bool]] = {
    "starter": {
        "voice_coach": False,
        "vlm": False,
        "create_post": False,
    },
    "professional": {
        "voice_coach": True,
        "vlm": False,
        "create_post": False,
    },
    "business": {
        "voice_coach": True,
        "vlm": True,
        "create_post": True,
    },
}


def get_plan_features(plan: str) -> Dict[str, bool]:
    """Get feature access map for a plan."""
    return PLAN_FEATURES.get(plan, PLAN_FEATURES["starter"])


def can_access_feature(plan: str, role: str, feature: str) -> bool:
    """
    Check if a user can access a feature based on plan and role.
    Developers bypass all restrictions.
    """
    if role == "developer":
        return True
    # Normalize plan to lowercase for comparison
    normalized_plan = (plan or "").lower()
    print(f"[DEBUG] can_access_feature - plan: '{plan}', normalized: '{normalized_plan}', role: '{role}', feature: '{feature}'")
    return PLAN_FEATURES.get(normalized_plan, {}).get(feature, False)


def assert_feature_access(profile: Dict[str, Any], feature: str) -> None:
    """
    Assert that user can access a feature. Raises 403 if not allowed.
    
    Args:
        profile: User profile dict with 'plan' and 'role' fields
        feature: Feature key (e.g., 'voice_coach', 'vlm')
    
    Raises:
        HTTPException: 403 if user cannot access the feature
    """
    plan = (profile.get("plan") or "starter").lower()  # Normalize to lowercase
    role = profile.get("role", "user")
    
    if not can_access_feature(plan, role, feature):
        feature_names = {
            "voice_coach": "AI Voice Coach",
            "vlm": "Hook Detector (VLM)",
            "create_post": "AI Post Generator",
        }
        feature_display = feature_names.get(feature, feature)
        
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": "plan_restriction",
                "message": f"Upgrade your plan to access {feature_display}",
                "feature": feature,
                "current_plan": plan,
                "required_plans": [
                    p for p, features in PLAN_FEATURES.items() 
                    if features.get(feature, False)
                ]
            }
        )
