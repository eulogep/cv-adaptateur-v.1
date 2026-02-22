# MatchCV 🎯

> J'en avais marre de réécrire mon CV à la main pour chaque offre. Alors j'ai codé un truc pour le faire à ma place.

**→ [Voir l'app](https://cv-adaptateur-v-1.vercel.app)** · **[Voir l'API](https://cv-adaptateur-v1-production.up.railway.app/docs)**

---

## C'est quoi ?

Une app web qui prend ton CV + une offre d'emploi, et qui te sort :
- Un CV **réécrit et réorganisé** pour cette offre précise
- Une **lettre de motivation** personnalisée
- Un **score ATS** pour savoir si tu passeras les filtres RH
- Les **mots-clés manquants** que les RH recherchent
- Un **export PDF** propre, prêt à envoyer

Tout ça gratuitement, sans créer de compte, sans payer d'API.

---

## Pourquoi j'ai fait ça

En cherchant mon alternance, j'ai postulé à des dizaines d'offres. À chaque fois, même galère : reformuler les mêmes compétences différemment, mettre certaines choses en avant selon le poste, réécrire la lettre de motivation...

J'ai commencé à utiliser des LLMs pour m'aider, puis j'ai réalisé que je pouvais automatiser tout le process. Donc voilà — j'ai construit MatchCV pendant ma recherche d'alternance, pour ma propre recherche d'alternance. C'est récursif et j'aime ça.

---

## Comment ça marche

```
Ton CV (PDF ou texte)
        +
Texte de l'offre
        ↓
Score ATS calculé localement (0 API = 0 coût)
        ↓
LLM qui réécrit ton CV et génère la lettre
(Groq → Mistral → Ollama selon dispo)
        ↓
Export PDF prêt à envoyer
```

---

## Stack (tout gratuit)

**Frontend** — React + Vite, CSS vanilla, déployé sur Vercel

**Backend** — FastAPI Python, déployé sur Railway (500h gratuites/mois)

**IA** — Groq (Llama 3.3 70B) comme LLM principal, Mistral en backup, Ollama en local pour le dev. Si l'un tombe, le suivant prend le relais automatiquement.

**Score ATS** — 100% local, basé sur les keywords, zéro appel API

---

## Lancer le projet en local

Tu auras besoin de Python 3.10+, Node.js 18+ et une clé API Groq gratuite (→ [console.groq.com](https://console.groq.com))

```bash
# Cloner
git clone https://github.com/eulogep/cv-adaptateur-v.1.git
cd cv-adaptateur-v.1

# Backend
cd backend
cp .env.example .env
# → coller ta GROQ_API_KEY dans le .env
pip install -r requirements.txt
python3 -m uvicorn main:app --reload --port 8000

# Frontend (dans un autre terminal)
cd frontend
npm install
echo "VITE_API_URL=http://localhost:8000" > .env
npm run dev
```

L'app tourne sur `http://localhost:5173` et la doc API sur `http://localhost:8000/docs`.

---

## Variables d'environnement

**Backend (`backend/.env`)**

| Variable | Quoi | Obligatoire |
|---|---|---|
| `GROQ_API_KEY` | Ta clé Groq → [console.groq.com](https://console.groq.com) | ✅ |
| `MISTRAL_API_KEY` | Backup LLM → [console.mistral.ai](https://console.mistral.ai) | ❌ |
| `OLLAMA_BASE_URL` | Si tu veux tourner en local (défaut: `http://localhost:11434`) | ❌ |

**Frontend (`frontend/.env`)**

| Variable | Quoi |
|---|---|
| `VITE_API_URL` | URL du backend (ex: `http://localhost:8000`) |

---

## API — les 3 endpoints

**`POST /api/parse-pdf`** — Extrait le texte d'un PDF
```json
// Body: multipart/form-data, champ "file" (PDF max 10MB)
// Réponse:
{ "text": "...", "chars": 1842 }
```

**`POST /api/score`** — Score ATS CV vs offre
```json
// Body:
{ "cv_text": "...", "offer_text": "..." }
// Réponse:
{ "score": 78, "level": "Bon", "advice": "..." }
```

**`POST /api/adapt`** — Le cœur — adaptation par LLM
```json
// Body:
{ "cv_text": "...", "offer_text": "..." }
// Réponse:
{
  "titre": "Data Scientist IA",
  "resume": "...",
  "competences": { "techniques": [...], "soft_skills": [...] },
  "experiences": [...],
  "lettre_motivation": "...",
  "mots_cles_ajoutes": [...],
  "_provider": "Groq (llama-3.3-70b)"
}
```

---

## Structure du projet

```
cv-adaptateur-v.1/
├── backend/
│   ├── main.py          # Routes FastAPI
│   ├── llm.py           # Fallback chain Groq → Mistral → Ollama
│   ├── ats_score.py     # Score ATS sans API
│   ├── pdf_parser.py    # Extraction texte PDF
│   └── requirements.txt
│
├── frontend/
│   └── src/
│       ├── App.jsx
│       └── components/
│           ├── CVInput.jsx    # Upload PDF / textarea
│           ├── ATSGauge.jsx   # Jauge SVG animée
│           ├── CVResult.jsx   # Résultat avec onglets
│           ├── PDFExport.jsx  # Export @react-pdf
│           └── Loader.jsx
│
└── README.md
```

---

## Ce que j'ai appris en le faisant

- Gérer un fallback entre plusieurs providers LLM proprement
- Déployer une API FastAPI sur Railway avec nixpacks
- Parser des PDFs en Python sans perdre le formatage
- Générer des PDFs côté client avec `@react-pdf/renderer`
- Que le plus dur dans un side project c'est pas le code — c'est de finir

---

## Ce qui viendra après (si j'ai le temps)

- [ ] Upload PDF sans copier-coller
- [ ] Historique des candidatures
- [ ] Scraping URL d'offre directement
- [ ] 2-3 templates de CV différents
- [ ] Mode mobile propre

---

## Providers LLM utilisés

| Provider | Modèle | Limite gratuite |
|---|---|---|
| Groq | llama-3.3-70b-versatile | 14 400 req/jour |
| Mistral AI | mistral-small-latest | 1 milliard tokens/mois |
| Ollama | mistral:7b-instruct | Illimitée (local) |

---

Fait par **Euloge Junior MABIALA** — étudiant en 3ème année à l'ESIEA Paris, en recherche d'alternance Data Science & IA pour septembre 2026.

[GitHub](https://github.com/eulogep) · [Portfolio](https://eulogep.github.io/portefolio_new/)
