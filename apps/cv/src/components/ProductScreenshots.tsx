import { useEffect, useState } from 'react';

const SCREENSHOTS = [
  {
    label: 'Quiz',
    color: '#059669',
    content: (
      <div className="ss-quiz">
        <div className="ss-stepper">
          {[1,2,3,4,5].map(i => (
            <div key={i} className={`ss-step ${i <= 2 ? 'done' : ''} ${i === 2 ? 'active' : ''}`}>
              {i < 2 ? '✓' : i}
            </div>
          ))}
        </div>
        <div className="ss-form">
          <div className="ss-field"><div className="ss-label">Poste visé</div><div className="ss-input filled">Comptable clients</div></div>
          <div className="ss-field"><div className="ss-label">Secteur</div><div className="ss-input filled">Distribution</div></div>
          <div className="ss-field"><div className="ss-label">Expérience</div><div className="ss-input filled">3 à 5 ans</div></div>
        </div>
      </div>
    )
  },
  {
    label: 'Éditeur',
    color: '#6366f1',
    content: (
      <div className="ss-editor">
        <div className="ss-editor-header">
          <div className="ss-score-pill">Score ATS: 92/100</div>
          <div className="ss-btn-sm">Voir l'aperçu</div>
        </div>
        <div className="ss-section">
          <div className="ss-section-title">Identité</div>
          <div className="ss-field"><div className="ss-label">Nom</div><div className="ss-input filled">Nadia Haddad</div></div>
          <div className="ss-field"><div className="ss-label">E-mail</div><div className="ss-input filled">nadia@example.fr</div></div>
        </div>
        <div className="ss-section">
          <div className="ss-section-title">Expérience</div>
          <div className="ss-field"><div className="ss-label">Poste</div><div className="ss-input filled">Comptable clients</div></div>
          <div className="ss-puces">
            <div className="ss-puce">Gérer 1500 comptes clients</div>
            <div className="ss-puce">Réduire le délai de 30 %</div>
          </div>
        </div>
      </div>
    )
  },
  {
    label: 'CV final',
    color: '#059669',
    content: (
      <div className="ss-cv">
        <div className="ss-cv-name">Nadia Haddad</div>
        <div className="ss-cv-role">Comptable clients</div>
        <div className="ss-cv-section">
          <div className="ss-cv-section-title">Expérience</div>
          <div className="ss-cv-item">
            <div className="ss-cv-item-head"><span>Comptable clients</span><span className="ss-cv-date">09/2021 – présent</span></div>
            <div className="ss-cv-company">DistribNord</div>
            <ul className="ss-cv-list">
              <li>Gérer 1 500 comptes clients</li>
              <li>Réduire le délai de paiement de 30 %</li>
              <li>Automatiser le lettrage de 80 %</li>
            </ul>
          </div>
        </div>
        <div className="ss-cv-section">
          <div className="ss-cv-section-title">Compétences</div>
          <div className="ss-cv-tags"><span>Sage 100</span><span>Excel</span><span>Recouvrement</span></div>
        </div>
        <div className="ss-cv-score">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
          Score ATS : 98/100
        </div>
      </div>
    )
  }
];

export default function ProductScreenshots() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setActive((a) => (a + 1) % 3), 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="ss-carousel">
      <div className="ss-tabs">
        {SCREENSHOTS.map((s, i) => (
          <button
            key={i}
            className={`ss-tab ${i === active ? 'active' : ''}`}
            onClick={() => setActive(i)}
            style={i === active ? { borderColor: s.color, color: s.color } : undefined}
          >
            {s.label}
          </button>
        ))}
      </div>
      <div className="ss-viewport">
        {SCREENSHOTS.map((s, i) => (
          <div
            key={i}
            className={`ss-slide ${i === active ? 'visible' : ''}`}
            style={i === active ? { opacity: 1, transform: 'translateX(0) scale(1)' } : { opacity: 0, transform: i < active ? 'translateX(-30px) scale(0.97)' : 'translateX(30px) scale(0.97)' }}
          >
            {s.content}
          </div>
        ))}
      </div>
    </div>
  );
}
