// Loader.jsx — Animation de chargement pendant l'appel LLM
import { useEffect, useState } from 'react';

const STEPS = [
    { id: 1, label: 'Lecture du CV...' },
    { id: 2, label: 'Calcul du score ATS...' },
    { id: 3, label: 'Adaptation par IA (Groq LLaMA 3.3 70B)...' },
    { id: 4, label: 'Génération de la lettre de motivation...' },
    { id: 5, label: 'Finalisation du CV adapté...' },
];

export default function Loader({ message = 'Adaptation en cours' }) {
    const [currentStep, setCurrentStep] = useState(1);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentStep((s) => Math.min(s + 1, STEPS.length));
        }, 2200);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="loader-wrapper">
            <div className="loader-spinner" />
            <div className="loader-text">{message}</div>
            <div className="loader-sub">Cela peut prendre 10 à 30 secondes...</div>
            <div className="loader-steps">
                {STEPS.map((step) => (
                    <div
                        key={step.id}
                        className={`loader-step-item ${step.id === currentStep
                                ? 'active'
                                : step.id < currentStep
                                    ? 'done'
                                    : ''
                            }`}
                    >
                        <div className="loader-step-dot" />
                        {step.label}
                    </div>
                ))}
            </div>
        </div>
    );
}
