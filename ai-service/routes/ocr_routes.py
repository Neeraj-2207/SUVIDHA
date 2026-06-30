from fastapi import APIRouter, UploadFile, File, HTTPException
from services.ocr_service import process_aadhaar_image

router = APIRouter()

# ─────────────────────────────────────────
# POST /ocr/extract
# Receives an image file → returns structured data
# ─────────────────────────────────────────
@router.post("/ocr/extract")
async def extract_aadhaar(file: UploadFile = File(...)):
    try:
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(
                status_code=400,
                detail="Please upload an image file (jpg, png)"
            )

        # Read image bytes
        image_bytes = await file.read()

        # Validate file size (max 5MB)
        if len(image_bytes) > 5 * 1024 * 1024:
            raise HTTPException(
                status_code=400,
                detail="Image too large. Maximum 5MB allowed."
            )

        # Process the image
        result = process_aadhaar_image(image_bytes)

        return {
            "success": True,
            "data": result["extracted"],
            "raw_text": result["raw_text"]
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"OCR error: {e}")
        raise HTTPException(
            status_code=500,
            detail=str(e) if str(e) else "Could not process image. Please try again."
        )