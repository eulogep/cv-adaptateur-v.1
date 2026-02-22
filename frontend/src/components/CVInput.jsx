// CVInput.jsx — Upload PDF drag-and-drop ou coller texte CV
import { useState, useRef } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function CVInput({ cvText, setCvText }) {
    const [dragOver, setDragOver] = useState(false);
    const [fileName, setFileName] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const fileRef = useRef(null);

    const handleFile = async (file) => {
        if (!file || !file.name.toLowerCase().endsWith('.pdf')) {
            setUploadError('Veuillez sélectionner un fichier PDF.');
            return;
        }
        setUploading(true);
        setUploadError('');
        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await fetch(`${API}/api/parse-pdf`, { method: 'POST', body: formData });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail || 'Erreur lors du parsing PDF');
            }
            const data = await res.json();
            setCvText(data.text);
            setFileName(file.name);
        } catch (e) {
            setUploadError(e.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div>
            {/* Drop zone */}
            <div
                className={`drop-zone ${dragOver ? 'drag-over' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    handleFile(e.dataTransfer.files[0]);
                }}
                onClick={() => fileRef.current.click()}
            >
                {uploading ? (
                    <>
                        <div className="drop-zone-icon">⏳</div>
                        <div className="drop-zone-text">Extraction du texte PDF...</div>
                    </>
                ) : (
                    <>
                        <div className="drop-zone-icon">📄</div>
                        <div className="drop-zone-text">
                            <strong>Glisser-déposer</strong> votre CV PDF ici
                        </div>
                        <div className="drop-zone-sub">ou cliquer pour sélectionner un fichier</div>
                    </>
                )}
            </div>

            <input
                ref={fileRef}
                type="file"
                accept=".pdf"
                style={{ display: 'none' }}
                onChange={(e) => handleFile(e.target.files[0])}
            />

            {fileName && !uploadError && (
                <div className="file-success">
                    ✅ <span><strong>{fileName}</strong> — texte extrait ({cvText.length} caractères)</span>
                </div>
            )}

            {uploadError && (
                <div className="error-box">
                    <strong>Erreur PDF</strong>{uploadError}
                </div>
            )}

            <div className="or-divider">ou coller le CV en texte</div>

            <label className="input-label">Contenu du CV</label>
            <textarea
                rows={10}
                placeholder="Collez ici votre CV en texte brut : expériences, compétences, formation, coordonnées..."
                value={cvText}
                onChange={(e) => setCvText(e.target.value)}
            />
        </div>
    );
}
