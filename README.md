<div align="center">

# MatchCV

**Plateforme d'adaptation IA de CV — 100% gratuite, open source**

[![Live Demo](https://img.shields.io/badge/Demo-Vercel-black?logo=vercel)](https://cv-adaptateur-v-1.vercel.app)
[![Backend](https://img.shields.io/badge/API-Railway-purple?logo=railway)](https://cv-adaptateur-v1-production.up.railway.app)
[![License](https://img.shields.io/badge/licence-MIT-green)](LICENSE)
[![Made by](https://img.shields.io/badge/par-Euloge%20Junior%20MABIALA-blue)](https://github.com/eulogep)

Upload ton CV · Colle une offre · L'IA adapte tout automatiquement · Export PDF

</div>

---

## Démonstration

🔗 **App live** → [cv-adaptateur-v-1.vercel.app](https://cv-adaptateur-v-1.vercel.app)  
🔗 **API live** → [cv-adaptateur-v1-production.up.railway.app](https://cv-adaptateur-v1-production.up.railway.app/docs)

---

## Fonctionnalités

| Fonctionnalité | Description |
|---|---|
| 📄 **Upload CV** | Drag-and-drop PDF ou coller le texte brut |
| 💼 **Coller l'offre** | Texte complet de l'offre d'emploi |
| 📊 **Score ATS** | Similarité sémantique CV ↔ offre (0–100) |
| 🤖 **Adaptation IA** | CV réécrit par LLM (Groq / Mistral / Ollama) |
| ✉️ **Lettre de motivation** | Générée automatiquement et personnalisée |
| 🔑 **Mots-clés ATS** | Liste des termes ajoutés pour les filtres RH |
| ⬇️ **Export PDF** | CV + Lettre de motivation en 2 pages |
| 🔄 **Fallback LLM** | Groq → Mistral → Ollama automatique |

---

## Stack technique

```
Frontend          Backend              IA & ML
──────────        ──────────           ──────────────
React + Vite      FastAPI              Groq (llama-3.3-70b) — principal
Vanilla CSS       Uvicorn              Mistral AI (mistral-small) — backup
@react-pdf        PyMuPDF              Ollama (mistral:7b) — local/dev
lucide-react      python-dotenv        Score ATS keyword-based — 0 coût

Hébergement
──────────────────
Frontend → Vercel (gratuit)
Backend  → Railway.app (gratuit 500h/mois)
```

---

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    Utilisateur                           │
│         Upload PDF / Texte CV + Offre d'emploi          │
└──────────────────┬───────────────────────────────────────┘
                   │
         ┌─────────▼────────┐
         │  React Frontend   │  Vercel
         │   (Vite + CSS)    │
         └─────────┬─────────┘
                   │ fetch
         ┌─────────▼────────┐
         │  FastAPI Backend  │  Railway
         │                  │
         │  /api/parse-pdf  │ ← PyMuPDF
         │  /api/score      │ ← Keyword ATS
         │  /api/adapt      │ ← LLM fallback
         └──┬─────────────┬─┘
            │             │
     ┌──────▼──┐     ┌───▼───────┐
     │  Groq   │     │  Mistral  │ → Ollama (local)
     │ LLaMA3  │     │  Small    │
     └─────────┘     └───────────┘
```

---

## Installation locale

### Prérequis

- Python 3.10+
- Node.js 18+
- Clé API Groq gratuite → [console.groq.com](https://console.groq.com)

### 1. Cloner le repo

```bash
git clone https://github.com/eulogep/cv-adaptateur-v.1.git
cd cv-adaptateur-v.1
```

### 2. Backend

```bash
cd backend

# Créer le fichier .env
cp .env.example .env
# Éditer .env et ajouter : GROQ_API_KEY=gsk_...

# Installer les dépendances
pip install -r requirements.txt

# Lancer le serveur
python3 -m uvicorn main:app --reload --port 8000
```

→ API disponible sur `http://localhost:8000`  
→ Documentation Swagger : `http://localhost:8000/docs`

### 3. Frontend

```bash
cd frontend

# Installer les dépendances
npm install

# Configurer l'URL de l'API
echo "VITE_API_URL=http://localhost:8000" > .env

# Lancer l'app
npm run dev
```

→ App disponible sur `http://localhost:5173`

---

## Variables d'environnement

### Backend (`backend/.env`)

| Variable | Description | Requis |
|---|---|---|
| `GROQ_API_KEY` | Clé API Groq — [console.groq.com](https://console.groq.com) | ✅ |
| `MISTRAL_API_KEY` | Clé API Mistral (backup LLM) — [console.mistral.ai](https://console.mistral.ai) | ❌ |
| `OLLAMA_BASE_URL` | URL Ollama local (défaut: `http://localhost:11434`) | ❌ |

### Frontend (`frontend/.env`)

| Variable | Description |
|---|---|
| `VITE_API_URL` | URL du backend (ex: `http://localhost:8000`) |

---

## API Reference

### `GET /`
Health check.
```json
{"status": "ok", "message": "MatchCV API v1.0 — 100% gratuit 🚀"}
```

### `POST /api/parse-pdf`
Extrait le texte d'un PDF uploadé.
```
Content-Type: multipart/form-data
Body: file (PDF, max 10MB)
```
```json
{"text": "...", "chars": 1842}
```

### `POST /api/score`
Calcule le score ATS entre le CV et l'offre.
```json
{"cv_text": "...", "offer_text": "..."}
```
```json
{"score": 78, "level": "Bon", "color": "#FBBF24", "advice": "..."}
```

### `POST /api/adapt`
Adapte le CV par LLM avec fallback automatique.
```json
{"cv_text": "...", "offer_text": "..."}
```
```json
{
  "nom": "Euloge Junior MABIALA",
  "titre": "Développeur Python IA",
  "resume": "...",
  "experiences": [...],
  "competences": {"techniques": [...], "soft_skills": [...]},
  "formation": [...],
  "lettre_motivation": "...",
  "mots_cles_ajoutes": [...],
  "score_amelioration": 15,
  "_provider": "Groq (llama-3.3-70b)"
}
```

---

## Déploiement

### Backend → Railway

1. Connecter le repo GitHub à [railway.app](https://railway.app)
2. **Root Directory** → `backend`
3. **Public Networking** → port `8000`
4. **Variables** → ajouter `GROQ_API_KEY`

### Frontend → Vercel

1. Importer le repo sur [vercel.com](https://vercel.com)
2. **Root Directory** → `frontend` | **Framework** → `Vite`
3. **Environment Variables** → `VITE_API_URL=https://[ton-app].railway.app`

---

## Structure du projet

```
cv-adaptateur-v.1/
├── backend/
│   ├── main.py           # Routes FastAPI
│   ├── llm.py            # LLM fallback chain
│   ├── ats_score.py      # Score ATS keyword-based
│   ├── pdf_parser.py     # Extraction texte PDF
│   ├── requirements.txt
│   ├── Procfile          # Railway
│   ├── railway.json      # Railway config
│   ├── nixpacks.toml     # Railway build config
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── App.jsx           # Orchestrateur principal
│   │   ├── index.css         # Design system dark
│   │   └── components/
│   │       ├── CVInput.jsx   # Upload PDF / textarea
│   │       ├── ATSGauge.jsx  # Jauge SVG animée
│   │       ├── CVResult.jsx  # Résultat avec onglets
│   │       ├── PDFExport.jsx # Export @react-pdf
│   │       └── Loader.jsx    # Animation de chargement
│   ├── vercel.json
│   └── package.json
├── index.html            # Documentation architecture
├── .gitignore
└── README.md
```

---

## Providers LLM gratuits

| Provider | Modèle | Limite gratuite | Usage |
|---|---|---|---|
| **Groq** | llama-3.3-70b-versatile | 14 400 req/jour | Principal |
| **Mistral AI** | mistral-small-latest | 1B tokens/mois | Backup |
| **Ollama** | mistral:7b-instruct | Illimitée (local) | Dev/tests |

---

## Auteur

**Euloge Junior MABIALA** · 2026  
[GitHub](https://github.com/eulogep) · [LinkedIn](https://linkedin.com/in/eulogemabiala)

---

<div align="center">
  <sub>Built with ❤️ · 100% open source · Zéro coût infrastructure</sub>
</div>
