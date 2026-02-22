"""
llm.py — Appel LLM avec fallback automatique Groq → Mistral → Ollama
"""
import os
import json
import re
import httpx
from groq import Groq
from mistralai import Mistral
from dotenv import load_dotenv

load_dotenv()

SYSTEM_PROMPT = """Tu es un expert en recrutement et en rédaction de CV.
Tu reçois un CV brut et une offre d'emploi.
Tu dois adapter le CV pour maximiser les chances de passer les filtres ATS et d'obtenir un entretien.

Réponds UNIQUEMENT avec un JSON valide, sans balises markdown, au format suivant :
{
  "nom": "Prénom Nom extrait du CV",
  "titre": "Titre professionnel adapté à l'offre",
  "resume": "Résumé professionnel de 3-4 phrases adapté au poste",
  "experiences": [
    {
      "poste": "Titre du poste",
      "entreprise": "Nom de l'entreprise",
      "periode": "2022 - 2024",
      "description": "Description adaptée aux compétences demandées dans l'offre"
    }
  ],
  "competences": {
    "techniques": ["compétence1", "compétence2"],
    "soft_skills": ["qualité1", "qualité2"]
  },
  "formation": [
    {
      "diplome": "Nom du diplôme",
      "etablissement": "Établissement",
      "annee": "2020"
    }
  ],
  "lettre_motivation": "Lettre de motivation complète et personnalisée de 3 paragraphes pour ce poste spécifique",
  "mots_cles_ajoutes": ["mot clé 1", "mot clé 2"],
  "score_amelioration": 15
}"""


def _extract_json(text: str) -> dict:
    """Extrait le JSON d'une réponse LLM même si elle contient du texte alentour."""
    # Chercher un bloc JSON
    match = re.search(r"\{[\s\S]*\}", text)
    if match:
        return json.loads(match.group())
    raise ValueError("Aucun JSON valide trouvé dans la réponse")


def _call_groq(cv_text: str, offer_text: str) -> dict:
    api_key = os.getenv("GROQ_API_KEY", "")
    if not api_key or api_key.startswith("gsk_xxx"):
        raise ValueError("GROQ_API_KEY non configurée")

    client = Groq(api_key=api_key)
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": f"[OFFRE D'EMPLOI]\n{offer_text[:3000]}\n\n[CV ACTUEL]\n{cv_text[:3000]}",
            },
        ],
        temperature=0.3,
        max_tokens=4000,
    )
    return _extract_json(response.choices[0].message.content)


def _call_mistral(cv_text: str, offer_text: str) -> dict:
    api_key = os.getenv("MISTRAL_API_KEY", "")
    if not api_key or len(api_key) < 10:
        raise ValueError("MISTRAL_API_KEY non configurée")

    client = Mistral(api_key=api_key)
    response = client.chat.complete(
        model="mistral-small-latest",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": f"[OFFRE D'EMPLOI]\n{offer_text[:3000]}\n\n[CV ACTUEL]\n{cv_text[:3000]}",
            },
        ],
        temperature=0.3,
        max_tokens=4000,
    )
    return _extract_json(response.choices[0].message.content)


def _call_ollama(cv_text: str, offer_text: str) -> dict:
    base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    payload = {
        "model": "mistral:7b-instruct",
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": f"[OFFRE D'EMPLOI]\n{offer_text[:2000]}\n\n[CV ACTUEL]\n{cv_text[:2000]}",
            },
        ],
        "stream": False,
        "options": {"temperature": 0.3, "num_predict": 3000},
    }
    resp = httpx.post(f"{base_url}/api/chat", json=payload, timeout=120.0)
    resp.raise_for_status()
    content = resp.json()["message"]["content"]
    return _extract_json(content)


def adapt_cv(cv_text: str, offer_text: str) -> dict:
    """
    Tente d'adapter le CV via les providers dans l'ordre :
    Groq → Mistral → Ollama
    Retourne le JSON adapté ou lève une exception si tous échouent.
    """
    providers = [
        ("Groq (llama-3.3-70b)", _call_groq),
        ("Mistral (mistral-small)", _call_mistral),
        ("Ollama (mistral:7b)", _call_ollama),
    ]

    last_error = None
    for name, fn in providers:
        try:
            print(f"[LLM] Tentative avec {name}...")
            result = fn(cv_text, offer_text)
            print(f"[LLM] ✅ Succès avec {name}")
            result["_provider"] = name
            return result
        except Exception as e:
            print(f"[LLM] ❌ {name} a échoué : {e}")
            last_error = e
            continue

    raise Exception(
        f"Tous les providers LLM ont échoué. Dernier message : {last_error}\n"
        "Vérifiez vos clés API dans le fichier .env"
    )
