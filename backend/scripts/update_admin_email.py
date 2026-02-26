
import asyncio
import os
import sys

# Add parent directory to path to import app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.supabase import get_supabase_admin

async def update_admin_email():
    old_email = "admin@sociallife.com"
    new_email = "admin@socialleaf.com"
    
    print(f"🔄 Updating admin email from {old_email} to {new_email}...")
    
    supabase = get_supabase_admin()
    if not supabase:
        print("❌ Error: SUPABASE_SERVICE_ROLE_KEY not found")
        return

    # 1. Get User ID
    res = supabase.table("profiles").select("id").eq("email", old_email).execute()
    if not res.data:
        print(f"❌ User {old_email} not found in profiles.")
        return
    
    user_id = res.data[0]['id']
    print(f"Found User ID: {user_id}")

    # 2. Update Auth User
    try:
        # Using Supabase Admin Auth API
        auth_res = supabase.auth.admin.update_user_by_id(
            user_id, 
            {"email": new_email, "email_confirm": True}
        )
        print("✅ Auth user updated successfully.")
    except Exception as e:
        print(f"❌ Failed to update Auth user: {e}")
        # Note: even if this fails, we should try updating the profile if they are mismatched

    # 3. Update Profile
    try:
        profile_res = supabase.table("profiles").update({"email": new_email}).eq("id", user_id).execute()
        print("✅ Profile table updated successfully.")
    except Exception as e:
        print(f"❌ Failed to update Profile table: {e}")

    print("🎉 Email update process complete!")

if __name__ == "__main__":
    asyncio.run(update_admin_email())
