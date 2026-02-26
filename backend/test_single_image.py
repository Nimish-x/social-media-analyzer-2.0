#!/usr/bin/env python3
"""Test single image vision analysis to debug the issue."""
import os
import google.generativeai as genai
from PIL import Image
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("❌ GEMINI_API_KEY not found")
    exit(1)

genai.configure(api_key=api_key)

# Create a simple test image
img = Image.new('RGB', (100, 100), color='red')

# Test with the exact model names we're using
models_to_test = [
    'models/gemini-2.0-flash',
    'models/gemini-flash-latest',
    'models/gemini-2.5-flash-lite',
]

prompt = """
Describe this image in detail. Return ONLY valid JSON:
{
  "caption": "description here",
  "hashtags": ["#tag1", "#tag2"],
  "cta": "call to action",
  "style": "descriptive"
}
"""

print("Testing Vision Models with Image Input...")
for model_name in models_to_test:
    print(f"\n{'='*60}")
    print(f"Testing: {model_name}")
    print('='*60)
    try:
        generation_config = {
            "temperature": 0.9,
            "top_p": 0.95,
            "top_k": 40,
            "max_output_tokens": 1024,
        }
        model = genai.GenerativeModel(model_name, generation_config=generation_config)
        response = model.generate_content([prompt, img])
        
        if response and response.text:
            print(f"✅ SUCCESS!")
            print(f"Response: {response.text[:300]}")
        else:
            print(f"❌ No response text")
    except Exception as e:
        print(f"❌ FAILED: {e}")
