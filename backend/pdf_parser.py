"""
pdf_parser.py — Extraction de texte depuis un PDF avec PyMuPDF
"""
import fitz  # PyMuPDF


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """
    Extrait le texte brut d'un PDF donné en bytes.
    Retourne une chaîne de texte avec le contenu de toutes les pages.
    """
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    text_parts = []
    for page in doc:
        text_parts.append(page.get_text("text"))
    doc.close()
    return "\n".join(text_parts).strip()
