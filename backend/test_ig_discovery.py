import asyncio
import os
import sys
from dotenv import load_dotenv

# Ensure we can import app modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

load_dotenv()

from app.services.instagram_service import get_competitor_stats, get_tokens

async def main():
    print("🔍 Testing Instagram Business Discovery...")
    
    # 1. Check Token
    tokens = get_tokens("instagram")
    if not tokens:
        print("❌ No Instagram token found in environment/storage.")
        return

    print(f"✅ Token found: {tokens.get('access_token')[:15]}...")

    # 2. Test with a known Business Account (e.g. 'instagram' or 'nasa')
    target = "instagram"
    print(f"🚀 Attempting to fetch stats for @{target}...")
    
    try:
        data = await get_competitor_stats(target)
        if data:
            print("\n✅ SUCCESS! Data fetched:")
            print(f"Username: {data['account']['username']}")
            print(f"Followers: {data['metrics']['followers']}")
            print(f"Posts: {data['metrics']['posts']}")
            print(f"Bio: {data['account']['bio'][:50]}...")
        else:
            print("\n❌ FAILED: get_competitor_stats returned None.")
            print("(Check the server logs if you added print statements there, or I will add more here)")
            
    except Exception as e:
        print(f"\n❌ EXCEPTION: {e}")

if __name__ == "__main__":
    asyncio.run(main())
