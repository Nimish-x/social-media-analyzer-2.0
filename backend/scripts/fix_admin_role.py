
import asyncio
import os
import sys

# Add parent directory to path to import app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.config import get_settings
from app.core.supabase import get_supabase_admin

async def fix_admin_role():
    email = "admin@socialleaf.com"
    print(f"🔧 Fixing role for: {email}")
    
    supabase = get_supabase_admin()
    if not supabase:
        print("❌ Error: SUPABASE_SERVICE_ROLE_KEY not found")
        return

    # 1. Get User ID from profiles
    res = supabase.table("profiles").select("id, role").eq("email", email).execute()
    
    if not res.data:
        print("❌ User not found in 'profiles' table.")
        return
        
    user = res.data[0]
    user_id = user['id']
    current_role = user['role']
    print(f"Found User ID: {user_id}")
    print(f"Current Role: {current_role}")

    # 2. Force Update
    print("Force updating role to 'admin'...")
    try:
        update_res = supabase.table("profiles").update({
            "role": "admin",
            "plan": "business",
            "plan_status": "active"
        }).eq("id", user_id).execute()
    except Exception as e:
        print(f"❌ UPDATE FAILED. Error details:")
        print(e)
        if hasattr(e, 'details'):
             print(e.details)
        if hasattr(e, 'message'):
             print(e.message)
        return
    
    # 3. Verify
    verify_res = supabase.table("profiles").select("role").eq("id", user_id).single().execute()
    new_role = verify_res.data['role']
    
    print(f"New Role in DB: {new_role}")
    
    if new_role == 'admin':
        print("✅ SUCCESS: Role is now admin.")
    else:
        print("❌ FAILED: Role did not update.")

if __name__ == "__main__":
    asyncio.run(fix_admin_role())
