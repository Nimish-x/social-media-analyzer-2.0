
import asyncio
import os
import sys

# Add backend to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.voice_service import voice_service

async def test_audio():
    print("Testing Local Audio Generation...")
    try:
        text = "This is a test of the local voice coach system. Great job!"
        audio_data = await voice_service.generate_audio(text)
        
        filename = "test_output.mp3"
        with open(filename, "wb") as f:
            f.write(audio_data)
            
        print(f"✅ Success! Audio saved to {filename} ({len(audio_data)} bytes)")
        
        # Check if file size is reasonable
        if len(audio_data) > 1000:
            print("✅ File size looks correct.")
        else:
            print("⚠️ File size seems too small!")
            
    except Exception as e:
        print(f"❌ Failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_audio())
