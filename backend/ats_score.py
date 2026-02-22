"""
ats_score.py — Calcul du score ATS par similarité sémantique ou TF-IDF fallback
Tente sentence-transformers, sinon utilise une méthode keyword-based locale.
"""
import re
import math
from collections import Counter

# Tentative de chargement sentence-transformers
_model = None
_st_available = False

try:
    from sentence_transformers import SentenceTransformer, util
    _st_available = True
except ImportError:
    print("[ATS] sentence-transformers non disponible — utilisation du score keyword-based.")


def get_model():
    global _model
    if not _st_available:
        return None
    if _model is None:
        print("[ATS] Chargement du modèle all-MiniLM-L6-v2...")
        _model = SentenceTransformer("all-MiniLM-L6-v2")
        print("[ATS] Modèle chargé.")
    return _model


def _keyword_score(cv_text: str, offer_text: str) -> float:
    """
    Fallback : score basé sur l'overlap TF-IDF simplifié entre CV et offre.
    """
    def tokenize(text):
        words = re.findall(r'\b[a-zA-ZÀ-ÿ][a-zA-ZÀ-ÿ0-9+#]*\b', text.lower())
        stopwords = {'le','la','les','de','du','des','un','une','et','est','en',
                     'pour','avec','dans','sur','par','au','aux','ou','a','à',
                     'que','qui','se','ce','il','elle','son','sa','ses','vous',
                     'nous','je','tu','ils','elles','the','of','for','in','to',
                     'and','is','are','with','on','at','by','an','be','has'}
        return [w for w in words if w not in stopwords and len(w) > 2]

    cv_tokens = tokenize(cv_text)
    offer_tokens = tokenize(offer_text)

    if not offer_tokens:
        return 0.0

    cv_set = set(cv_tokens)
    offer_counter = Counter(offer_tokens)
    matched = sum(min(cv_tokens.count(w), cnt) for w, cnt in offer_counter.items() if w in cv_set)
    total = sum(offer_counter.values())
    return matched / total if total > 0 else 0.0


def compute_ats_score(cv_text: str, offer_text: str) -> dict:
    """
    Calcule la similarité sémantique entre le CV et l'offre d'emploi.
    Retourne un dict avec le score (0-100) et une interprétation.
    """
    model = get_model()

    # Encoder les deux textes
    model = get_model()
    if model is not None:
        # Méthode sémantique (sentence-transformers)
        embeddings = model.encode(
            [cv_text[:2000], offer_text[:2000]],
            convert_to_tensor=True,
            normalize_embeddings=True,
        )
        raw_score = util.cos_sim(embeddings[0], embeddings[1]).item()
    else:
        # Méthode fallback (keyword-based)
        raw_score = _keyword_score(cv_text, offer_text)
        # Normaliser pour un score plus lisible (les mots-clés donnent souvent 0.1-0.5)
        raw_score = min(raw_score * 2.2, 0.98)

    score = round(max(0.0, min(1.0, raw_score)) * 100)

    # Interprétation
    if score >= 75:
        level = "Excellent"
        color = "#6EE7B7"
        advice = "Votre profil correspond très bien à ce poste. Postulez en confiance !"
    elif score >= 55:
        level = "Bon"
        color = "#FBBF24"
        advice = "Bon alignement. L'adaptation IA va maximiser vos chances."
    elif score >= 35:
        level = "Moyen"
        color = "#F97316"
        advice = "Plusieurs écarts détectés. L'adaptation IA est fortement recommandée."
    else:
        level = "Faible"
        color = "#F472B6"
        advice = "Profil peu aligné. L'IA va retravailler en profondeur votre CV."

    return {
        "score": score,
        "level": level,
        "color": color,
        "advice": advice,
    }
