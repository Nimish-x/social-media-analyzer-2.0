"""
User profile service for Supabase.
Handles profile CRUD operations.
Uses service role key to bypass RLS.
"""

from typing import Optional, Dict, Any
from datetime import datetime, timedelta
from supabase import Client

from app.core.supabase import get_supabase, get_supabase_admin


class UserService:
    """Service for managing user profiles in Supabase."""
    
    def __init__(self):
        # Use admin client (bypasses RLS) if available, otherwise fall back to regular client
        admin = get_supabase_admin()
        self.supabase: Client = admin if admin else get_supabase()
    
    async def get_profile(self, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Fetch user profile from Supabase.
        
        Args:
            user_id: Supabase auth user ID (UUID)
            
        Returns:
            Profile dict or None if not found
        """
        try:
            response = self.supabase.table("profiles").select("*").eq("id", user_id).single().execute()
            return response.data
        except Exception as e:
            print(f"Error fetching profile: {e}")
            return None
    
    async def get_or_create_profile(
        self, 
        user_id: str, 
        email: str, 
        name: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Get existing profile or create a new one.
        Used during login/signup flow.
        
        Args:
            user_id: Supabase auth user ID
            email: User's email
            name: User's display name (optional)
            
        Returns:
            Profile dict
        """
        # Try to get existing profile
        profile = await self.get_profile(user_id)
        if profile:
            return profile
        
        # Create new profile
        new_profile = {
            "id": user_id,
            "email": email,
            "name": name,
            "plan": None,  # Will be set during plan selection
            "plan_status": None,
            "trial_ends_at": None,
            "role": "user",
        }
        
        try:
            response = self.supabase.table("profiles").insert(new_profile).execute()
            return response.data[0] if response.data else new_profile
        except Exception as e:
            print(f"Error creating profile: {e}")
            # Return the profile data even if insert fails (might already exist)
            return new_profile
    
    async def update_plan(
        self, 
        user_id: str, 
        plan: str
    ) -> Optional[Dict[str, Any]]:
        """
        Update user's plan.
        
        - Starter: plan_status = 'active' (always free)
        - Professional/Business: plan_status = 'trial', trial_ends_at = 7 days
        
        Args:
            user_id: Supabase auth user ID
            plan: Plan name ('starter', 'professional', 'business')
            
        Returns:
            Updated profile dict
        """
        update_data = {
            "plan": plan,
            "updated_at": datetime.utcnow().isoformat(),
        }
        
        if plan == "starter":
            update_data["plan_status"] = "active"
            update_data["trial_ends_at"] = None
        else:
            # Paid plans start with trial
            update_data["plan_status"] = "trial"
            update_data["trial_ends_at"] = (datetime.utcnow() + timedelta(days=7)).isoformat()
        
        try:
            response = self.supabase.table("profiles").update(update_data).eq("id", user_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error updating plan: {e}")
            return None
    
    async def update_profile(
        self, 
        user_id: str, 
        data: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """
        Update profile fields.
        
        Args:
            user_id: Supabase auth user ID
            data: Fields to update
            
        Returns:
            Updated profile dict
        """
        data["updated_at"] = datetime.utcnow().isoformat()
        
        try:
            response = self.supabase.table("profiles").update(data).eq("id", user_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error updating profile: {e}")
            return None
    
    async def save_onboarding_preferences(
        self,
        user_id: str,
        preferences: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """
        Save user onboarding preferences.
        
        Args:
            user_id: Supabase auth user ID
            preferences: Onboarding data (user_type, platforms, goals, etc.)
            
        Returns:
            Updated profile dict
        """
        update_data = {
            "user_type": preferences.get("user_type"),
            "primary_platforms": preferences.get("primary_platforms"),
            "content_formats": preferences.get("content_formats"),
            "primary_goals": preferences.get("primary_goals"),
            "posting_frequency": preferences.get("posting_frequency"),
            "experience_level": preferences.get("experience_level"),
            "onboarding_completed": True,
            "onboarding_completed_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
        }
        
        try:
            response = self.supabase.table("profiles").update(update_data).eq("id", user_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error saving onboarding preferences: {e}")
            return None


# Singleton instance
user_service = UserService()
