"""
Admin service for analytics and user management.
"""

from typing import Dict, Any, List, Optional
import os
import httpx
import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.supabase import get_supabase_admin

class AdminService:
    """Service for admin-only operations."""
    
    def __init__(self):
        # Always use admin client to bypass RLS for analytics
        self.supabase = get_supabase_admin()
    
    async def get_analytics_overview(self) -> Dict[str, Any]:
        """
        Get high-level analytics overview.
        """
        try:
            # Get total users count
            # Note: count='exact' is more efficient than fetching all rows
            users_res = self.supabase.table("profiles").select("id", count="exact").execute()
            total_users = users_res.count if users_res.count is not None else 0
            
            # Get active subscriptions (simplified: non-null plan or plan_status='active')
            # Adjust query based on your exact business logic for "active"
            active_res = self.supabase.table("profiles")\
                .select("id", count="exact")\
                .neq("plan", "starter")\
                .execute()
            active_subs = active_res.count if active_res.count is not None else 0
            
            # Calculate MRR (Estimated)
            # Starter: $0, Pro: $29, Business: $99
            # In a real app, you'd sum actual subscription values
            # Here we just estimate based on plan counts
            
            plans_res = self.supabase.table("profiles").select("plan").execute()
            mrr = 0
            for row in plans_res.data:
                p = row.get("plan")
                if p == "professional": mrr += 399
                elif p == "business": mrr += 799
            
            return {
                "total_users": total_users,
                "active_subscriptions": active_subs,
                "mrr": mrr
            }
        except Exception as e:
            print(f"Error fetching admin analytics: {e}")
            return {"total_users": 0, "active_subscriptions": 0, "mrr": 0}

    async def get_plan_distribution(self) -> List[Dict[str, Any]]:
        """
        Get distribution of users across different plans.
        """
        try:
            res = self.supabase.table("profiles").select("plan").execute()
            
            plans = {}
            for row in res.data:
                plan = row.get("plan") or "starter" 
                plans[plan] = plans.get(plan, 0) + 1
            
            return [
                {"name": k.capitalize(), "value": v} 
                for k, v in plans.items()
            ]
        except Exception as e:
            print(f"Error fetching plan distribution: {e}")
            return []

    async def get_platform_stats(self) -> List[Dict[str, Any]]:
        """
        Get platform connection stats.
        NOTE: Since OAuth tokens are currently in-memory (hackathon mode),
        we will simulate this distribution based on total users.
        """
        try:
            # Mock distribution logic
            # In real prod: COUNT(social_connections) GROUP BY platform
            # Here: Simulate 60% YT, 40% IG, 20% Twitter
            
            users_res = self.supabase.table("profiles").select("id", count="exact").execute()
            total = users_res.count or 1
            
            return [
                {"platform": "YouTube", "connected_users": int(total * 0.6), "percentage": 60},
                {"platform": "Instagram", "connected_users": int(total * 0.4), "percentage": 40},
                {"platform": "Twitter", "connected_users": int(total * 0.2), "percentage": 20},
                {"platform": "LinkedIn", "connected_users": int(total * 0.15), "percentage": 15},
            ]
        except Exception as e:
            print(f"Error fetching platform stats: {e}")
            return []

    async def get_recent_users(self) -> List[Dict[str, Any]]:
        """
        Get list of 10 most recently signed up users.
        """
        try:
            # Fetch profiles sorted by created_at desc
            res = self.supabase.table("profiles")\
                .select("id, email, role, plan, created_at")\
                .order("created_at", desc=True)\
                .limit(10)\
                .execute()
                
            return res.data
        except Exception as e:
             print(f"Error fetching recent users: {e}")
             return []

    async def get_all_users(self, page: int = 1, per_page: int = 20, search: str = None) -> Dict[str, Any]:
        """
        Get paginated list of users with optional search.
        """
        try:
            query = self.supabase.table("profiles").select("*", count="exact")
            
            if search:
                # Search by email or id
                query = query.ilike("email", f"%{search}%")
            
            start = (page - 1) * per_page
            end = start + per_page - 1
            
            res = query.range(start, end).order("created_at", desc=True).execute()
            
            return {
                "data": res.data,
                "total": res.count or 0,
                "page": page,
                "per_page": per_page
            }
        except Exception as e:
            print(f"Error fetching users: {e}")
            return {"data": [], "total": 0, "page": page, "per_page": per_page}

    async def update_user_role(self, user_id: str, role: str) -> bool:
        """Update user role (e.g. to 'banned' or 'admin')."""
        try:
            self.supabase.table("profiles").update({"role": role}).eq("id", user_id).execute()
            return True
        except Exception as e:
            print(f"Error updating user role: {e}")
            return False

    async def update_user_plan(self, user_id: str, plan: str) -> bool:
        """Update user plan."""
        try:
            self.supabase.table("profiles").update({"plan": plan}).eq("id", user_id).execute()
            return True
        except Exception as e:
            print(f"Error updating user plan: {e}")
            return False

    # Simple JSON persistence for global settings
    SETTINGS_FILE = "system_settings.json"

    def _load_settings(self):
        try:
            import json
            import os
            if os.path.exists(self.SETTINGS_FILE):
                with open(self.SETTINGS_FILE, "r") as f:
                    return json.load(f)
        except Exception:
            pass
        return {
            "announcement": "",
            "announcement_active": False,
            "feature_flags": {
                "beta_features": False,
                "maintenance_mode": False
            },
            "maintenance_start": "",
            "maintenance_end": ""
        }

    def _save_settings(self, settings):
        try:
            import json
            with open(self.SETTINGS_FILE, "w") as f:
                json.dump(settings, f)
        except Exception as e:
            print(f"Error saving settings: {e}")

    async def notify_maintenance(self, start_time: str, end_time: str) -> Dict[str, Any]:
        """
        Send real emails using Gmail SMTP (Hackathon friendly - no domain needed).
        """
        smtp_user = os.getenv("SMTP_USER")
        smtp_pass = os.getenv("SMTP_PASS") # This must be a Gmail "App Password"

        if not smtp_user or not smtp_pass:
            return {"status": "error", "message": "SMTP_USER or SMTP_PASS not configured in .env"}

        try:
            # Fetch all user emails from profiles
            res = self.supabase.table("profiles").select("email").execute()
            emails = [row.get("email") for row in res.data if row.get("email")]
            
            if not emails:
                return {"status": "success", "users_notified": 0, "message": "No users found"}

            # Email Content
            subject = f"⚠️ Scheduled Maintenance: {start_time}"
            body = f"""
            <html>
                <body style="font-family: sans-serif; padding: 20px; color: #333;">
                    <div style="max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden;">
                        <div style="background: #4f46e5; padding: 20px; text-align: center; color: white;">
                            <h2 style="margin: 0;">Social Leaf</h2>
                        </div>
                        <div style="padding: 30px;">
                            <h3 style="color: #4f46e5;">Under Maintenance</h3>
                            <p>Hi there,</p>
                            <p>We've scheduled a quick maintenance window to improve the platform. Access will be limited during the following time:</p>
                            
                            <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4f46e5;">
                                <p style="margin: 5px 0;"><strong>Start:</strong> {start_time}</p>
                                <p style="margin: 5px 0;"><strong>End:</strong> {end_time}</p>
                            </div>
                            
                            <p>Thank you for your cooperation and patience while we grow!</p>
                            <br>
                            <p style="margin: 0;">Best,</p>
                            <p style="margin: 0; font-weight: bold;">The Social Leaf Team</p>
                        </div>
                        <div style="background: #f9fafb; padding: 15px; text-align: center; font-size: 11px; color: #9ca3af;">
                            This is an automated notification for hackers and students. 🚀
                        </div>
                    </div>
                </body>
            </html>
            """

            # Handle sending in a separate thread to not block FastAPI (async compatibility)
            import asyncio
            import traceback

            def send_smtp():
                try:
                    # Using port 587 with STARTTLS (more reliable than 465)
                    server = smtplib.SMTP("smtp.gmail.com", 587)
                    server.starttls(context=ssl.create_default_context())
                    server.login(smtp_user, smtp_pass)
                    
                    # Send to everyone
                    msg = MIMEMultipart()
                    msg["From"] = f"Social Leaf <{smtp_user}>"
                    msg["Subject"] = subject
                    msg["To"] = smtp_user # To sender
                    msg.attach(MIMEText(body, "html"))
                    
                    # Ensure emails are valid and not empty
                    recipients = [e for e in emails if e and "@" in e]
                    
                    # Send message
                    # Use sendmail for BCC to ensure it's not in headers of the received email
                    server.sendmail(smtp_user, recipients + [smtp_user], msg.as_string())
                    server.quit()
                except Exception:
                    traceback.print_exc()
                    raise

            await asyncio.to_thread(send_smtp)
            
            return {"status": "success", "users_notified": len(emails)}
        except Exception as e:
            traceback.print_exc()
            return {"status": "error", "message": f"SMTP Error: {str(e)}"}

    async def get_settings(self) -> Dict[str, Any]:
        return self._load_settings()

    async def update_settings(self, settings: Dict[str, Any]) -> bool:
        current = self._load_settings()
        print(f"UpdateSettings: Received {settings}")
        print(f"UpdateSettings: Current {current}")
        
        # Deep merge for feature_flags if present
        if "feature_flags" in settings and isinstance(settings["feature_flags"], dict):
            if "feature_flags" not in current or not isinstance(current["feature_flags"], dict):
                current["feature_flags"] = {}
            current["feature_flags"].update(settings["feature_flags"])
            # Remove from top-level to avoid shallow overwrite below
            remaining_settings = {k: v for k, v in settings.items() if k != "feature_flags"}
            current.update(remaining_settings)
        else:
            current.update(settings)
            
        print(f"UpdateSettings: Final {current}")
        self._save_settings(current)
        return True

admin_service = AdminService()
