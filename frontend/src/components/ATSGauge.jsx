// ATSGauge.jsx — Jauge SVG circulaire animée + interprétation du score
import { useEffect, useState } from 'react';

const RADIUS = 56;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function ATSGauge({ atsData }) {
    const [animatedScore, setAnimatedScore] = useState(0);

    useEffect(() => {
        if (!atsData) return;
        // Animation du compteur
        let start = 0;
        const target = atsData.score;
        const duration = 1500;
        const startTime = performance.now();
        const animate = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setAnimatedScore(Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }, [atsData]);

    if (!atsData) return null;

    const dashArray = (animatedScore / 100) * CIRCUMFERENCE;
    const color = atsData.color;

    return (
        <div className="card accent-border">
            <div className="card-title">Score ATS</div>
            <div className="card-subtitle">
                Compatibilité sémantique entre votre profil et l'offre — calculé 100% en local
            </div>
            <div className="ats-wrapper">
                {/* Gauge SVG */}
                <div className="ats-gauge-container">
                    <svg width="140" height="140" className="ats-gauge-svg">
                        <circle
                            className="ats-gauge-track"
                            cx="70"
                            cy="70"
                            r={RADIUS}
                        />
                        <circle
                            className="ats-gauge-fill"
                            cx="70"
                            cy="70"
                            r={RADIUS}
                            stroke={color}
                            strokeDasharray={`${dashArray} ${CIRCUMFERENCE}`}
                            strokeDashoffset="0"
                        />
                    </svg>
                    <div className="ats-gauge-center">
                        <div className="ats-score-num" style={{ color }}>{animatedScore}</div>
                        <div className="ats-score-label">/ 100</div>
                    </div>
                </div>

                {/* Info */}
                <div className="ats-info">
                    <div className="ats-level" style={{ color }}>{atsData.level}</div>
                    <div className="ats-advice">{atsData.advice}</div>
                    <div className="ats-tip">
                        💡 L'IA va adapter votre CV pour améliorer ce score et maximiser vos chances.
                    </div>
                </div>
            </div>
        </div>
    );
}
