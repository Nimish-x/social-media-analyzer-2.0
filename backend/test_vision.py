
import os
import google.generativeai as genai
from PIL import Image
import io
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("❌ GEMINI_API_KEY not found in .env")
    exit(1)

genai.configure(api_key=api_key)

print(f"✅ Found API Key: {api_key[:5]}...{api_key[-5:]}")

# Create a dummy image
img = Image.new('RGB', (100, 100), color = 'red')

models_to_test = [
    'gemini-2.0-flash-exp', 
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-pro-vision'
]

print("\n--- Testing Models ---")
for model_name in models_to_test:
    print(f"\nTesting {model_name}...")
    try:
        model = genai.GenerativeModel(model_name)
        response = model.generate_content(["Describe this image", img])
        print(f"✅ Success! Response: {response.text[:50]}...")
    except Exception as e:
        print(f"❌ Failed: {e}")

print("\n--- Listing Available Models ---")
try:
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(f"- {m.name}")
except Exception as e:
    print(f"Could not list models: {e}")
