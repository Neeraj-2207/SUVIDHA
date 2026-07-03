import os
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DATA_PATH = os.path.join(BASE_DIR, "data", "civic_faq.txt")
VECTORSTORE_PATH = os.path.join(BASE_DIR, "vectorstore")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
