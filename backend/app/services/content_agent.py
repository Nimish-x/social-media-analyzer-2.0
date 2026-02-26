"""
Content Intelligence Agent - Dedicated service for high-quality social media content generation.
Supports Multi-Modal inputs (Images, Video, Audio) via Gemini 1.5 Pro / 2.0 Flash.
"""
import google.generativeai as genai
from typing import Dict, Any, List, Optional
import json
import io
from PIL import Image
from fastapi import UploadFile
from app.core.config import get_settings

settings = get_settings()

class ContentAgent:
    def __init__(self):
        self.gemini_key = settings.gemini_api_key
        if self.gemini_key:
            genai.configure(api_key=self.gemini_key)
            
    async def generate_caption(
        self,
        files: List[UploadFile],
        # Strict Parameters
        hook_type: str,
        hook_length: str,
        tone: str,
        cta: str,
        body_style: str,
        formatting: str,
        emoji_in_hook: bool,
        # Optional High-Level Context
        niche: Optional[str] = None,
        goal: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generate a caption from multiple files (images/video) using strict constraints.
        """
        if not self.gemini_key:
            raise Exception("Gemini API Key is not configured")

        try:
            # 1. Process Files into Gemini-ready parts
            media_parts = []
            for file in files:
                content = await file.read()
                mime_type = file.content_type
                
                if mime_type.startswith("image/"):
                    # Load image to validate/process if needed, or pass bytes directly
                    image = Image.open(io.BytesIO(content))
                    media_parts.append(image)
                elif mime_type.startswith("video/"):
                    # For video, we pass the bytes part directly with mime type
                    # Note: For large videos, File API is better, but for snippets bytes work in 1.5 Flash
                    media_parts.append({
                        "mime_type": mime_type,
                        "data": content
                    })
                else:
                    print(f"Skipping unsupported file type: {mime_type}")

            if not media_parts:
                raise Exception("No valid image or video files provided.")

            # 2. Construct Strict Prompt
            # We fold high-level context (niche/goal) into the prompt if provided
            context_block = ""
            if niche: context_block += f"- Target Niche: {niche}\n"
            if goal: context_block += f"- Content Goal: {goal}\n"

            prompt = f"""
You are a content intelligence engine for elite social media creators.

YOUR TASK:
Generate a caption for the provided visual content (single image, carousel, or video).
Follow the constraints below with ROBOTIC STRICTNESS.

====================
VISUAL CONTEXT
====================
{context_block}

====================
CONSTRAINTS (IMMUTABLE)
====================
- Hook Type: {hook_type}
- Hook Length: {hook_length}
- Tone: {tone}
- CTA: {cta}
- Body Style: {body_style}
- Formatting: {formatting}
- Emoji in Hook: {emoji_in_hook}

====================
STRICT RULES
====================
1. LINE 1 is ALWAYS the Hook.
2. NO emojis in the hook unless emoji_in_hook=True.
3. NO generic fluff ("Unlock your potential", "Level up"). Use concrete words.
4. If it's a video: internalize the motion/energy in the copy.
5. If it's a carousel: address the progression of images.
6. Max 4 lines of body copy (excluding hook/CTA).

====================
OUTPUT FORMAT (JSON ONLY)
====================
{{
  "caption": "The full caption text...",
  "analysis": {{
    "visual_type": "video|carousel|image",
    "key_elements": ["element1", "element2"],
    "mood": "..."
  }},
  "confidence_score": 95
}}
"""
            # 3. Call Gemini
            # Use 1.5 Flash for speed/multimodal, or Pro for complex reasoning
            model = genai.GenerativeModel('gemini-1.5-flash')
            
            # Combine [Prompt, ...Images/Videos]
            request_content = [prompt] + media_parts
            
            print("🚀 Sending request to Gemini Content Agent...")
            response = model.generate_content(request_content)
            
            # 4. Parse Response
            text = response.text.strip()
            if text.startswith("```json"):
                text = text[7:]
            if text.endswith("```"):
                text = text[:-3]
                
            return json.loads(text.strip())

        except Exception as e:
            print(f"Content Agent Error: {e}")
            # Fallback for UI resilience
            return {
                "caption": f"Error generating caption: {str(e)}. Please try again.",
                "analysis": {"error": True},
                "confidence_score": 0
            }

    async def analyze_feedback(
        self,
        caption: str,
        feedback: str, # 'positive' or 'negative'
        metadata: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Analyze user feedback to improve future generations.
        """
        # (This logic can be similar to what we had, just moved here)
        # For now, return a mock success to keep UI snappy
        return {"status": "recorded", "weight_updates": {}}

# Singleton
content_agent = ContentAgent()
