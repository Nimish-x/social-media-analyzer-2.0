
import asyncio
import os
import sys

# Add parent directory to path to import app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.supabase import get_supabase_admin

async def check_emails():
    supabase = get_supabase_admin()
    if not supabase:
        print("❌ Error: SUPABASE_SERVICE_ROLE_KEY not found")
        return

    emails = ["admin@sociallife.com", "admin@socialleaf.com"]
    for email in emails:
        res = supabase.table("profiles").select("email, id").eq("email", email).execute()
        if res.data:
            print(f"✅ Found {email} in profiles: {res.data[0]}")
        else:
            print(f"❌ {email} not found in profiles.")

if __name__ == "__main__":
    asyncio.run(check_emails())
