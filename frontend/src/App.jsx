// App.jsx — Orchestrateur principal MatchCV
import { useState } from 'react';
import './index.css';
import CVInput from './components/CVInput';
import ATSGauge from './components/ATSGauge';
import CVResult from './components/CVResult';
import Loader from './components/Loader';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// ── Stepper ──────────────────────────────────────────────────────────
function Stepper({ currentStep }) {
  const steps = ['Saisie', 'Analyse ATS', 'CV Adapté'];
  return (
    <div className="stepper">
      {steps.map((label, i) => {
        const num = i + 1;
        const status =
          num < currentStep ? 'done' : num === currentStep ? 'active' : 'inactive';
        return (
          <div key={num} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <div className="step">
              <div className={`step-num ${status}`}>
                {status === 'done' ? '✓' : num}
              </div>
              <div className={`step-label ${status === 'inactive' ? 'inactive' : 'active'}`}>
                {label}
              </div>
            </div>
            {i < steps.length - 1 && <div className="step-connector" />}
          </div>
        );
      })}
    </div>
  );
}

// ── Main App ─────────────────────────────────────────────────────────
export default function App() {
  const [step, setStep] = useState(1);
  const [cvText, setCvText] = useState('');
  const [offerText, setOfferText] = useState('');
  const [atsData, setAtsData] = useState(null);
  const [adaptedCV, setAdaptedCV] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!cvText.trim() || !offerText.trim()) {
      setError('Veuillez remplir le CV et l\'offre d\'emploi.');
      return;
    }
    setError('');
    setLoading(true);
    setLoadingMsg('Analyse ATS en cours...');
    setStep(2);

    try {
      // 1. Score ATS
      const scoreRes = await fetch(`${API}/api/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cv_text: cvText, offer_text: offerText }),
      });
      if (!scoreRes.ok) {
        const err = await scoreRes.json();
        throw new Error(err.detail || 'Erreur calcul ATS');
      }
      const scoreData = await scoreRes.json();
      setAtsData(scoreData);

      // 2. Adaptation LLM
      setLoadingMsg('Adaptation par IA en cours...');
      const adaptRes = await fetch(`${API}/api/adapt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cv_text: cvText, offer_text: offerText }),
      });
      if (!adaptRes.ok) {
        const err = await adaptRes.json();
        throw new Error(err.detail || 'Erreur adaptation LLM');
      }
      const adaptData = await adaptRes.json();
      setAdaptedCV(adaptData);
      setStep(3);
    } catch (e) {
      setError(e.message);
      setStep(1);
    } finally {
      setLoading(false);
      setLoadingMsg('');
    }
  };

  const handleReset = () => {
    setStep(1);
    setCvText('');
    setOfferText('');
    setAtsData(null);
    setAdaptedCV(null);
    setError('');
  };

  return (
    <>
      <div className="glow-1" />
      <div className="glow-2" />

      <div className="app-wrapper">
        {/* Header */}
        <header className="header">
          <div className="logo">Match<span>CV</span></div>
          <div className="header-badge">100% Gratuit · Zéro API payante</div>
        </header>

        {/* Stepper */}
        <Stepper currentStep={step} />

        {/* Error */}
        {error && (
          <div className="error-box">
            <strong>⚠️ Erreur</strong>
            {error}
            <div style={{ marginTop: '8px', fontSize: '12px' }}>
              Vérifiez que le backend est démarré : <code>cd backend && uvicorn main:app --reload</code>
              <br />Et que le fichier <code>.env</code> contient vos clés API.
            </div>
          </div>
        )}

        {/* ── STEP 1 : Saisie ── */}
        {step === 1 && (
          <>
            <div className="two-col">
              {/* CV */}
              <div className="card">
                <div className="card-title">📄 Votre CV</div>
                <div className="card-subtitle">
                  Uploadez un PDF ou collez votre CV en texte
                </div>
                <CVInput cvText={cvText} setCvText={setCvText} />
              </div>

              {/* Offre */}
              <div className="card">
                <div className="card-title">💼 Offre d'emploi</div>
                <div className="card-subtitle">
                  Collez le texte complet de l'offre (titre, missions, compétences requises...)
                </div>
                <label className="input-label">Offre d'emploi</label>
                <textarea
                  rows={16}
                  placeholder="Ex : Nous recherchons un développeur Python avec 3 ans d'expérience en FastAPI, Docker et SQL. Vous serez en charge de..."
                  value={offerText}
                  onChange={(e) => setOfferText(e.target.value)}
                />
                {offerText && (
                  <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '8px' }}>
                    {offerText.length} caractères
                  </div>
                )}
              </div>
            </div>

            <button
              className="btn btn-primary btn-full btn-lg"
              onClick={handleAnalyze}
              disabled={!cvText.trim() || !offerText.trim()}
            >
              🚀 Analyser & Adapter mon CV
            </button>

            {(!cvText.trim() || !offerText.trim()) && (
              <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--muted)', marginTop: '12px' }}>
                Remplissez les deux champs pour continuer
              </p>
            )}
          </>
        )}

        {/* ── STEP 2 : Chargement ── */}
        {loading && (
          <div className="card">
            <Loader message={loadingMsg} />
          </div>
        )}

        {/* ── STEP 2 : Score ATS (pendant chargement de l'adaptation) ── */}
        {step >= 2 && atsData && <ATSGauge atsData={atsData} />}

        {/* ── STEP 3 : Résultat ── */}
        {step === 3 && adaptedCV && (
          <>
            <CVResult data={adaptedCV} atsData={atsData} />
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <button className="btn btn-secondary" onClick={handleReset}>
                🔄 Recommencer avec un autre CV
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
