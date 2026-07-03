import os
import pytesseract
from PIL import Image
import io
import json

from langchain_google_genai import ChatGoogleGenerativeAI

from langchain_core.output_parsers import JsonOutputParser
from pydantic import BaseModel, Field

from config import GEMINI_API_KEY
from prompts.aadhar_prompts import get_aadhaar_prompt

pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'


# ─────────────────────────────────────────
# PYDANTIC SCHEMA — the structure we want back
# Gemini will be forced to return data in this shape
# ─────────────────────────────────────────
class AadhaarData(BaseModel):
    name: str = Field(description="Full name of the person", default="")
    dob: str = Field(description="Date of birth in DD/MM/YYYY format", default="")
    gender: str = Field(description="Gender - Male, Female, or Other", default="")
    aadhaar_number: str = Field(description="12 digit Aadhaar number, formatted as XXXX XXXX XXXX", default="")
    address: str = Field(description="Address if visible", default="")


def extract_text_from_image(image_bytes: bytes) -> str:
    """
    Step 1: Use Tesseract to read raw text from image bytes
    """
    image = Image.open(io.BytesIO(image_bytes))

    # Convert to grayscale — improves OCR accuracy
    image = image.convert('L')

    # Run Tesseract OCR
    raw_text = pytesseract.image_to_string(image)

    return raw_text


def structure_with_gemini(raw_text: str) -> dict:
    """
    Step 2: Use Gemini + Pydantic to convert messy OCR text
    into clean structured JSON
    """
    parser = JsonOutputParser(pydantic_object=AadhaarData)

    prompt = get_aadhaar_prompt(parser)

    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        google_api_key=GEMINI_API_KEY,
        temperature=0
    )

    chain = prompt | llm | parser

    result = chain.invoke({"raw_text": raw_text})

    return result


def process_aadhaar_image(image_bytes: bytes) -> dict:
    """
    Main function — combines OCR + structuring
    """
    raw_text = extract_text_from_image(image_bytes)

    if not raw_text or len(raw_text.strip()) < 10:
        raise Exception("Could not read text from image. Please upload a clearer photo.")

    structured_data = structure_with_gemini(raw_text)

    return {
        "raw_text": raw_text.strip(),
        "extracted": structured_data
    }