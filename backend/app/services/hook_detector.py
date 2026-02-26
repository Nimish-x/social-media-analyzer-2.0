"""
Hook Detector Service - STABLE VERSION
Analyzes video frames using OpenRouter (Qwen-VL) to find the most engaging "hook" moment.
Falls back to Gemini 1.5 Flash, then text-only generation.
"""

import os
import json
import re
import httpx
from typing import List, Tuple, Optional
from dotenv import load_dotenv

load_dotenv()

# Get API keys
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY_SECONDARY") or os.getenv("GEMINI_API_KEY")  # Use secondary key, fallback to primary

# CONFIRMED WORKING free VLM models on OpenRouter (NO :free suffix!)
OPENROUTER_VLM_MODELS = [
    "qwen/qwen-2-vl-7b-instruct",
    "llava/llava-1.5-7b-hf"
]

# Optimal frame extraction for hackathon (3 frames only!)
MAX_FRAMES = 3

HOOK_ANALYSIS_PROMPT = """You are an expert social media content analyst.

I'm showing you 3 frames from a short video:
- Frame 0 (0s): Opening shot
- Frame 1 (1s): Early hook moment
- Frame 2 (2s): Attention window

Which frame stops scrolling MOST and why?

Respond ONLY with JSON:
{
    "frame_index": <0, 1, or 2>,
    "timestamp_sec": <0, 1, or 2>,
    "hook_score": <1-100>,
    "reason": "<why this frame hooks viewers>",
    "visual_elements": ["<element1>", "<element2>"],
    "improvement_tip": "<how to make hook stronger>"
}
"""


async def analyze_hook_with_openrouter(frames: List[Tuple[float, str]]) -> Optional[dict]:
    """Analyze frames using OpenRouter API with confirmed working models."""
    if not OPENROUTER_API_KEY:
        print("DEBUG: OPENROUTER_API_KEY not configured")
        return None
    
    print(f"DEBUG: Analyzing {len(frames)} frames with OpenRouter...")
    
    api_url = "https://openrouter.ai/api/v1/chat/completions"
    
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:8080",
        "X-Title": "Social Leaf"
    }
    
    # Build SINGLE content with ALL frames (single-pass VLM call)
    content = [{"type": "text", "text": HOOK_ANALYSIS_PROMPT}]
    
    for i, (timestamp, b64_image) in enumerate(frames):
        content.append({
            "type": "image_url",
            "image_url": {"url": f"data:image/jpeg;base64,{b64_image}"}
        })
    
    # Try confirmed working models only
    for model in OPENROUTER_VLM_MODELS:
        print(f"DEBUG: Trying OpenRouter model: {model}")
        
        payload = {
            "model": model,
            "messages": [{"role": "user", "content": content}],
            "max_tokens": 400,
            "temperature": 0.2
        }
        
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(api_url, headers=headers, json=payload)
                
                print(f"DEBUG: OpenRouter {model} status: {response.status_code}")
                
                if response.status_code == 200:
                    data = response.json()
                    result_text = data.get("choices", [{}])[0].get("message", {}).get("content", "")
                    
                    print(f"DEBUG: OpenRouter response: {result_text[:100]}...")
                    
                    json_match = re.search(r'\{[\s\S]*\}', result_text)
                    if json_match:
                        result = json.loads(json_match.group())
                        result.setdefault("frame_index", 0)
                        result.setdefault("timestamp_sec", 0)
                        result.setdefault("hook_score", 50)
                        result.setdefault("reason", "Analysis completed")
                        result.setdefault("visual_elements", [])
                        
                        frame_idx = min(result.get("frame_index", 0) or 0, len(frames) - 1)
                        result["frame_image"] = frames[frame_idx][1]
                        return result
                else:
                    print(f"DEBUG: OpenRouter error: {response.text[:150]}")
                    continue
                    
        except Exception as e:
            print(f"DEBUG: OpenRouter exception: {str(e)[:100]}")
            continue
    
    return None


async def analyze_hook_with_gemini(frames: List[Tuple[float, str]]) -> Optional[dict]:
    """Fallback to Gemini 1.5 Flash (stable, not 2.0)."""
    if not GEMINI_API_KEY:
        print("DEBUG: GEMINI_API_KEY not configured")
        return None
        
    print("DEBUG: Falling back to Gemini 1.5 Flash...")
    
    try:
        import google.generativeai as genai
        genai.configure(api_key=GEMINI_API_KEY)
        
        # Use only 2 frames max for Gemini fallback (quota sensitive)
        limited_frames = frames[:2]
        
        # Build single-pass content
        content_parts = [HOOK_ANALYSIS_PROMPT]
        for i, (timestamp, b64_image) in enumerate(limited_frames):
            content_parts.append({"mime_type": "image/jpeg", "data": b64_image})
        
        # Use models/gemini-flash-latest (confirmed working)
        print("DEBUG: Calling models/gemini-flash-latest...")
        model = genai.GenerativeModel("models/gemini-flash-latest")
        
        response = await model.generate_content_async(
            content_parts,
            generation_config=genai.types.GenerationConfig(
                temperature=0.2,
                max_output_tokens=400
            )
        )
        
        response_text = response.text.strip()
        print(f"DEBUG: Gemini response: {response_text[:100]}...")
        
        json_match = re.search(r'\{[\s\S]*\}', response_text)
        if json_match:
            result = json.loads(json_match.group())
            result.setdefault("frame_index", 0)
            result.setdefault("timestamp_sec", 0)
            result.setdefault("hook_score", 50)
            result.setdefault("reason", "Analysis completed")
            result.setdefault("visual_elements", [])
            
            frame_idx = min(result.get("frame_index", 0) or 0, len(frames) - 1)
            result["frame_image"] = frames[frame_idx][1]
            return result
            
    except Exception as e:
        error_str = str(e)
        print(f"DEBUG: Gemini failed: {error_str[:100]}")
    
    return None


def generate_text_only_fallback(frames: List[Tuple[float, str]]) -> dict:
    """Last resort: Return a sensible default without vision analysis."""
    print("DEBUG: Using text-only fallback (no vision API available)")
    
    return {
        "frame_index": 0,
        "timestamp_sec": 0,
        "hook_score": 65,
        "reason": "Opening frame selected as default hook. For accurate analysis, please ensure GEMINI_API_KEY is configured.",
        "visual_elements": ["opening shot"],
        "improvement_tip": "Add text overlay or strong emotion in first 2 seconds",
        "frame_image": frames[0][1] if frames else ""
    }


async def analyze_hook(
    frames: List[Tuple[float, str]],
    model_name: str = "qwen/qwen-2-vl-7b-instruct"
) -> Optional[dict]:
    """
    Analyze frames to find the best hook moment.
    Priority: Gemini Flash -> OpenRouter (Qwen-VL) -> Text-only fallback
    """
    if not frames:
        raise ValueError("No frames provided for analysis")
    
    # Limit to MAX_FRAMES (3) for optimal performance
    limited_frames = frames[:MAX_FRAMES]
    
    # Try Gemini first (you have a working API key)
    if GEMINI_API_KEY:
        result = await analyze_hook_with_gemini(limited_frames)
        if result:
            return result
    
    # Fallback to OpenRouter if available
    if OPENROUTER_API_KEY:
        result = await analyze_hook_with_openrouter(limited_frames)
        if result:
            return result
    
    # Last resort: text-only fallback
    return generate_text_only_fallback(limited_frames)


def get_hook_summary(analysis: dict) -> str:
    """Generate a human-readable summary of the hook analysis."""
    if "error" in analysis:
        return f"Analysis failed: {analysis['error']}"
    
    timestamp = analysis.get("timestamp_sec", 0)
    reason = analysis.get("reason", "Unknown")
    score = analysis.get("hook_score", "N/A")
    elements = analysis.get("visual_elements", [])
    
    summary = f"🎯 Best Hook at {timestamp:.1f}s (Score: {score}/100)\n"
    summary += f"📝 {reason}\n"
    if elements:
        summary += f"👀 Key Elements: {', '.join(elements)}"
    
    return summary
