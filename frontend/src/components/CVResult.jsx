// CVResult.jsx — Affichage du CV adapté par l'IA avec onglets CV / Lettre de motivation
import { useState } from 'react';
import PDFExport from './PDFExport';

export default function CVResult({ data, atsData }) {
    const [activeTab, setActiveTab] = useState('cv');

    if (!data) return null;

    return (
        <div className="card accent-border">
            {/* Header */}
            <div className="result-header">
                <div>
                    <div className="card-title">CV Adapté par l'IA ✨</div>
                    {data._provider && (
                        <div className="result-provider">via {data._provider}</div>
                    )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    {data.score_amelioration > 0 && (
                        <div className="improvement-badge">
                            📈 +{data.score_amelioration}% estimé
                        </div>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs">
                <button
                    className={`tab ${activeTab === 'cv' ? 'active' : ''}`}
                    onClick={() => setActiveTab('cv')}
                >
                    📄 CV Adapté
                </button>
                <button
                    className={`tab ${activeTab === 'lm' ? 'active' : ''}`}
                    onClick={() => setActiveTab('lm')}
                >
                    ✉️ Lettre de motivation
                </button>
                {data.mots_cles_ajoutes?.length > 0 && (
                    <button
                        className={`tab ${activeTab === 'keywords' ? 'active' : ''}`}
                        onClick={() => setActiveTab('keywords')}
                    >
                        🔑 Mots-clés ajoutés
                    </button>
                )}
            </div>

            {/* Tab: CV */}
            {activeTab === 'cv' && (
                <div>
                    <div className="cv-name">{data.nom || 'Candidat'}</div>
                    <div className="cv-title">{data.titre || ''}</div>

                    {data.resume && (
                        <div className="cv-section">
                            <div className="cv-section-label">Résumé professionnel</div>
                            <div className="cv-text">{data.resume}</div>
                        </div>
                    )}

                    {data.experiences?.length > 0 && (
                        <div className="cv-section">
                            <div className="cv-section-label">Expériences professionnelles</div>
                            {data.experiences.map((exp, i) => (
                                <div key={i} className="experience-item">
                                    <div className="exp-header">
                                        <div>
                                            <div className="exp-poste">{exp.poste}</div>
                                            <div className="exp-entreprise">{exp.entreprise}</div>
                                        </div>
                                        <div className="exp-periode">{exp.periode}</div>
                                    </div>
                                    <div className="exp-desc">{exp.description}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {(data.competences?.techniques?.length > 0 ||
                        data.competences?.soft_skills?.length > 0) && (
                            <div className="cv-section">
                                <div className="cv-section-label">Compétences</div>
                                {data.competences?.techniques?.length > 0 && (
                                    <>
                                        <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '8px' }}>
                                            Compétences techniques
                                        </p>
                                        <div className="skills-grid" style={{ marginBottom: '12px' }}>
                                            {data.competences.techniques.map((s, i) => (
                                                <span key={i} className="skill-tag">{s}</span>
                                            ))}
                                        </div>
                                    </>
                                )}
                                {data.competences?.soft_skills?.length > 0 && (
                                    <>
                                        <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '8px' }}>
                                            Soft skills
                                        </p>
                                        <div className="skills-grid">
                                            {data.competences.soft_skills.map((s, i) => (
                                                <span key={i} className="skill-tag soft">{s}</span>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                    {data.formation?.length > 0 && (
                        <div className="cv-section">
                            <div className="cv-section-label">Formation</div>
                            {data.formation.map((f, i) => (
                                <div key={i} style={{ marginBottom: '10px' }}>
                                    <div className="exp-poste">{f.diplome}</div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <div className="exp-entreprise">{f.etablissement}</div>
                                        <div className="exp-periode">{f.annee}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Tab: Lettre de motivation */}
            {activeTab === 'lm' && (
                <div>
                    <div className="cv-section-label" style={{ marginBottom: '16px' }}>
                        Lettre de motivation personnalisée
                    </div>
                    <div className="lm-text">{data.lettre_motivation || 'Non disponible.'}</div>
                </div>
            )}

            {/* Tab: Mots-clés */}
            {activeTab === 'keywords' && (
                <div>
                    <div className="cv-section-label" style={{ marginBottom: '16px' }}>
                        Mots-clés ATS ajoutés par l'IA
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '16px' }}>
                        Ces termes ont été intégrés dans votre CV pour améliorer la détection ATS.
                    </p>
                    <div className="keywords-added">
                        {data.mots_cles_ajoutes?.map((kw, i) => (
                            <span key={i} className="keyword-chip">🔑 {kw}</span>
                        ))}
                    </div>
                </div>
            )}

            {/* Action bar */}
            <div className="action-bar">
                <PDFExport data={data} atsData={atsData} />
                <button
                    className="btn btn-secondary"
                    onClick={() => {
                        const text = `${data.nom}\n${data.titre}\n\n${data.resume}\n\n${data.lettre_motivation || ''
                            }`;
                        navigator.clipboard.writeText(text);
                    }}
                >
                    📋 Copier le texte
                </button>
            </div>
        </div>
    );
}
