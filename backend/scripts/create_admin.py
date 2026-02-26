
import asyncio
import os
import sys

# Add parent directory to path to import app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.config import get_settings
from app.core.supabase import get_supabase_admin

async def create_admin():
    email = "admin@socialleaf.com"
    password = "12349876"
    
    print(f"🚀 Setting up Admin User: {email}")
    
    supabase = get_supabase_admin()
    if not supabase:
        print("❌ Error: SUPABASE_SERVICE_ROLE_KEY not found in .env")
        return

    user_id = None

    # 1. Try to Create User
    try:
        print("Attempting to create user...")
        att = supabase.auth.admin.create_user({
            "email": email,
            "password": password,
            "email_confirm": True,
            "user_metadata": {"role": "admin", "name": "Admin"}
        })
        user_id = att.user.id
        print(f"✅ User created with ID: {user_id}")
    except Exception as e:
        print(f"ℹ️ User creation returned: {e}")
        # Proceed to update logic assuming user exists

    # 2. If creation failed (or just to be sure), ensure password and metadata are set
    if not user_id:
        print("Fetching existing user ID from profiles...")
        try:
            # We trust profiles table has the user. 
            res = supabase.table("profiles").select("id").eq("email", email).execute()
            if res.data and len(res.data) > 0:
                user_id = res.data[0]['id']
                print(f"Found User ID: {user_id}")
            else:
                # Fallback: List users via Admin API (pagination might be needed but for 1 user ok)
                print("Profile not found. Searching via Auth Admin list_users...")
                # Note: list_users might not be available in all py versions easily, but let's try
                # Since we know the email, we can't search directly in some versions without listing.
                # But we really should have a profile if they signed up.
                print("❌ Could not find user ID. Please ensure the user has signed up at least once or check DB.")
                return
        except Exception as e2:
            print(f"❌ Error fetching user ID: {e2}")
            return

    # 3. Update User Password & Metadata (Force update)
    if user_id:
        try:
            print(f"Updating password to '{password}' for ID {user_id}...")
            supabase.auth.admin.update_user_by_id(
                user_id, 
                {"password": password, "user_metadata": {"role": "admin"}}
            )
            print("✅ Password and Auth Metadata updated.")
        except Exception as e:
            print(f"❌ Error updating password: {e}")

        # 4. Update Profile Role in DB
        print(f"Updating Profile role in DB...")
        try:
            profile_data = {
                "role": "admin",
                "plan": "business", 
                "plan_status": "active"
            }
            res = supabase.table("profiles").update(profile_data).eq("id", user_id).execute()
            if res.data:
                print("✅ Public Profile updated to role='admin'.")
            else:
                print("⚠️ Profile not found during update? Inserting...")
                supabase.table("profiles").insert({
                    "id": user_id,
                    "email": email,
                    "role": "admin",
                    "plan": "business",
                    "plan_status": "active"
                }).execute()
                print("✅ Profile inserted.")
                
        except Exception as e:
            print(f"❌ Error updating profile: {e}")

    print("\n🎉 Done! Admin setup complete.")
    print(f"Email: {email}")
    print(f"Password: {password}")

if __name__ == "__main__":
    asyncio.run(create_admin())
