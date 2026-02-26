
import asyncio
import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.supabase import get_supabase_admin

async def verify_admin():
    email = "admin@socialleaf.com"
    supabase = get_supabase_admin()
    
    print(f"Checking role for {email}...")
    
    res = supabase.table("profiles").select("*").eq("email", email).execute()
    
    if res.data:
        user = res.data[0]
        print(f"User Found:")
        print(f"ID: {user.get('id')}")
        print(f"Role: {user.get('role')}")
        print(f"Plan: {user.get('plan')}")
        
        if user.get('role') == 'admin':
            print("✅ Database is CORRECT. Role is 'admin'.")
        else:
            print(f"❌ Database is INCORRECT. Role is '{user.get('role')}'.")
    else:
        print("❌ User not found in profiles table.")

if __name__ == "__main__":
    asyncio.run(verify_admin())
