from langchain_core.prompts import PromptTemplate


def get_aadhaar_prompt(parser):
    """
    Returns the PromptTemplate used for Aadhaar OCR extraction.
    """
    return PromptTemplate(
        template="""
You are an expert at extracting information from Indian Aadhaar card OCR text.

The following text was extracted from an Aadhaar card using OCR and may contain
errors, extra spaces, spelling mistakes, or garbled characters.

Your task is to extract the relevant fields accurately.

Rules:
- If a field is missing, return an empty string.
- Aadhaar number must be formatted as: XXXX XXXX XXXX
- Date of birth must be formatted as: DD/MM/YYYY
- Do not invent or guess values.
- Correct obvious OCR mistakes where possible.

{format_instructions}

OCR Text:
{raw_text}
""",
        input_variables=["raw_text"],
        partial_variables={
            "format_instructions": parser.get_format_instructions()
        },
    )