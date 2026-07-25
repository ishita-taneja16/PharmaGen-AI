import os
from typing import List, Dict, Any
# pyrefly: ignore [missing-import]
import pdfplumber
# pyrefly: ignore [missing-import]
import pytesseract
from PIL import Image
from app.utils.logger import logger
from app.core.exceptions import PaperParsingException

def parse_pdf_document(file_path: str) -> List[Dict[str, Any]]:
    """
    Parses a PDF paper into pages, using PDFPlumber for text/tables 
    and PyTesseract as OCR fallback for scanned images.
    """
    if not os.path.exists(file_path):
        raise PaperParsingException(f"PDF file not found at path: {file_path}")

    pages_data = []

    try:
        with pdfplumber.open(file_path) as pdf:
            for page_idx, page in enumerate(pdf.pages, start=1):
                text = page.extract_text() or ""

                # OCR Fallback if text is empty or sparse
                if len(text.strip()) < 50:
                    try:
                        page_image = page.to_image(resolution=300).original
                        ocr_text = pytesseract.image_to_string(page_image)
                        if len(ocr_text.strip()) > len(text.strip()):
                            text = ocr_text
                    except Exception as ocr_err:
                        logger.warning(f"OCR fallback failed on page {page_idx}: {ocr_err}")

                pages_data.append({
                    "page_number": page_idx,
                    "content": text.strip()
                })

    except Exception as e:
        logger.error(f"Error parsing PDF {file_path}: {e}")
        raise PaperParsingException(f"Failed to parse PDF document: {str(e)}")

    return pages_data

def chunk_text_content(pages_data: List[Dict[str, Any]], chunk_size: int = 500, overlap: int = 50) -> List[Dict[str, Any]]:
    """
    Splits page text into overlapping semantic windows.
    """
    chunks = []
    chunk_index = 0

    for page in pages_data:
        text = page["content"]
        page_num = page["page_number"]
        words = text.split()

        if not words:
            continue

        start = 0
        while start < len(words):
            end = min(start + chunk_size, len(words))
            chunk_text = " ".join(words[start:end])

            chunks.append({
                "chunk_index": chunk_index,
                "chunk_content": chunk_text,
                "metadata": {
                    "page_number": page_num,
                    "word_count": len(words[start:end])
                }
            })

            chunk_index += 1
            if end == len(words):
                break
            start += (chunk_size - overlap)

    return chunks
