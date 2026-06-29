import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

print("=== EMBEDDING MODELS ===")
for model in genai.list_models():
    if 'embed' in model.name.lower():
        print(model.name)

print("\n=== CHAT MODELS ===")
for model in genai.list_models():
    if 'generateContent' in [m for m in model.supported_generation_methods]:
        print(model.name)