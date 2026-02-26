
import json
import sys
import logging
import asyncio
import pyttsx3
import base64
import tempfile
import os
from typing import Dict, Any, List, Optional
from concurrent.futures import ThreadPoolExecutor

# Reuse the singleton AI service for Ollama
from app.services.ai_service import ai_service

class VoiceService:
    """Service for Voice Coach features using Local AI (Ollama + Pyttsx3)."""
    
    def __init__(self):
        # Initialize thread executor for blocking pyttsx3 calls
        self.executor = ThreadPoolExecutor(max_workers=1)
        self.logger = logging.getLogger(__name__)
        
    async def analyze_script(self, script: str) -> Dict[str, Any]:
        """
        Analyze a script using Gemini to generate hooks.
        Returns original hook, improved hooks, and coaching explanation.
        """
        print(f"DEBUG: Analyzing script with Gemini...")
        
        # Access keys from ai_service to ensure we have the latest config
        from app.services.ai_service import ai_service
        primary_key = ai_service.gemini_key
        secondary_key = ai_service.gemini_key_secondary
        
        keys_to_try = []
        if primary_key: keys_to_try.append(primary_key)
        if secondary_key: keys_to_try.append(secondary_key)
        
        prompt = f"""
        You are a world-class Viral Video Coach.
        
        TASK:
        Analyze this script and help the user start stronger.
        
        1. Identify the 'Original Hook' (first sentence).
        2. Write an 'Average Hook' (boring, standard).
        3. Write a 'High-Retention Hook' (curiosity-inducing, short, punchy).
        4. Write a 'Coaching Explanation':
           - Speak directly to the user (e.g., "Hey! So the issue here is...")
           - Explain WHY the high-retention hook works.
           - Be encouraging but specific.
           - Keep it under 50 words.
        
        SCRIPT:
        "{script}"
        
        OUTPUT FORMAT (JSON ONLY, NO MARKDOWN):
        {{
          "original": "...",
          "average_hook": "...",
          "high_retention_hook": "...",
          "why_high_retention_works": "...",
          "retention_score": 8.5,
          "retention_score_reason": "...",
          "coaching_explanation": "..."
        }}
        """
        
        import google.generativeai as genai
        
        last_error = None
        
        for key_idx, api_key in enumerate(keys_to_try):
            try:
                print(f"DEBUG: Using Gemini Key #{key_idx + 1}")
                genai.configure(api_key=api_key)
                
                # Try preferred models
                models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro']
                
                for model_name in models:
                    try:
                        print(f"DEBUG: Attempting {model_name}...")
                        model = genai.GenerativeModel(model_name)
                        response = await model.generate_content_async(prompt)
                        
                        text = response.text.strip()
                        # Clean markdown if present
                        if text.startswith("```json"):
                            text = text.replace("```json", "").replace("```", "")
                        elif text.startswith("```"):
                            text = text.replace("```", "")
                            
                        result = json.loads(text)
                        
                        # Ensure proper types
                        result["retention_score"] = float(result.get("retention_score", 0.0))
                         # Fallback if specific fields missing
                        if "coaching_explanation" not in result:
                            result["coaching_explanation"] = result.get("why_high_retention_works", "This hook creates better curiosity.")
                            
                        return result
                        
                    except Exception as model_err:
                        print(f"DEBUG: Model {model_name} failed: {model_err}")
                        last_error = model_err
                        continue
                
            except Exception as e:
                 print(f"DEBUG: Key #{key_idx + 1} failed: {e}")
                 last_error = e
                 continue

        print(f"ERROR: Voice Coach Analysis Failed. Last error: {last_error}")
        # Robust Fallback
        return {
            "original": script[:50] + "...",
            "average_hook": "Here is a video about this topic.",
            "high_retention_hook": "Stop making this common mistake!",
            "why_high_retention_works": "Creates immediate intrigue.",
            "retention_score": 5.0,
            "retention_score_reason": "AI Service Unavailable - using fallback.",
            "coaching_explanation": "I'm having trouble analyzing right now, but generally, try to start with a surprising statement!"
        }

    async def generate_audio(self, text: str, voice_id: str = "default") -> bytes:
        """
        Generate audio from text using local pyttsx3 via subprocess.
        """
        print(f"DEBUG: Generating local audio via subprocess for: {text[:50]}...")
        
        import subprocess
        import uuid
        
        # Unique temp file
        temp_filename = f"temp_voice_{uuid.uuid4()}.mp3"
        script_path = os.path.join(os.path.dirname(__file__), "generate_audio_file.py")
        
        try:
            # Run the generation script
            # We use python executable from the current environment
            python_exe = sys.executable
            
            # Map voice_id to style
            style = "neutral"
            if voice_id == "pNInz6obpgDQGcFmaJgB": 
                style = "energetic"
                
            cmd = [python_exe, script_path, "--text", text, "--output", temp_filename, "--voice", style]
            
            proc = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            stdout, stderr = await proc.communicate()
            
            if proc.returncode != 0:
                print(f"ERROR: Subprocess failed. Stderr: {stderr.decode()}")
                raise Exception(f"Audio Generation Script Failed: {stderr.decode()}")
            
            print(f"DEBUG: Subprocess success. Output: {stdout.decode()}")
            
            # Read the file
            if os.path.exists(temp_filename):
                with open(temp_filename, "rb") as f:
                    audio_bytes = f.read()
                os.remove(temp_filename)
                return audio_bytes
            else:
                raise Exception("Audio file was not created by subprocess")
                
        except Exception as e:
            print(f"ERROR: Audio generation process failed: {e}")
            if os.path.exists(temp_filename):
                os.remove(temp_filename)
            raise e

# Singleton instance
voice_service = VoiceService()
