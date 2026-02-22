"""
main.py — Serveur FastAPI MatchCV
Routes :
  POST /api/parse-pdf → Extraction texte depuis PDF
  POST /api/score     → Score ATS sémantique (0-100)
  POST /api/adapt     → Adaptation CV par LLM avec fallback
"""

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pdf_parser import extract_text_from_pdf
from ats_score import compute_ats_score
from llm import adapt_cv

app = FastAPI(
    title="MatchCV API",
    description="API d'adaptation de CV par IA — 100% gratuit",
    version="1.0.0",
)

# CORS — autorise le frontend Vite en dev (localhost:5173) et en prod
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Modèles Pydantic ──────────────────────────────────────────────────


class ScoreRequest(BaseModel):
    cv_text: str
    offer_text: str


class AdaptRequest(BaseModel):
    cv_text: str
    offer_text: str


# ── Routes ────────────────────────────────────────────────────────────


@app.get("/")
def root():
    return {"status": "ok", "message": "MatchCV API v1.0 — 100% gratuit 🚀"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/api/parse-pdf")
async def parse_pdf(file: UploadFile = File(...)):
    """
    Reçoit un fichier PDF en multipart/form-data.
    Retourne le texte extrait.
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Le fichier doit être un PDF.")

    pdf_bytes = await file.read()
    if len(pdf_bytes) > 10 * 1024 * 1024:  # 10 MB max
        raise HTTPException(status_code=413, detail="Fichier trop volumineux (max 10 MB).")

    try:
        text = extract_text_from_pdf(pdf_bytes)
        if not text.strip():
            raise HTTPException(
                status_code=422,
                detail="Impossible d'extraire du texte (PDF scanné ou protégé).",
            )
        return {"text": text, "chars": len(text)}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur parsing PDF : {str(e)}")


@app.post("/api/score")
def score(req: ScoreRequest):
    """
    Calcule le score ATS entre un CV et une offre d'emploi.
    Retourne : score (0-100), level, color, advice.
    """
    if not req.cv_text.strip() or not req.offer_text.strip():
        raise HTTPException(status_code=400, detail="CV et offre requis.")
    try:
        result = compute_ats_score(req.cv_text, req.offer_text)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur calcul ATS : {str(e)}")


@app.post("/api/adapt")
def adapt(req: AdaptRequest):
    """
    Adapte le CV à l'offre d'emploi via LLM (Groq → Mistral → Ollama).
    Retourne un JSON structuré avec le CV adapté et une lettre de motivation.
    """
    if not req.cv_text.strip() or not req.offer_text.strip():
        raise HTTPException(status_code=400, detail="CV et offre requis.")
    try:
        adapted = adapt_cv(req.cv_text, req.offer_text)
        return adapted
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"Tous les providers LLM ont échoué : {str(e)}",
        )
