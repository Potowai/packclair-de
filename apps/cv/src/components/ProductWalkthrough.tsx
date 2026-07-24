const STEPS = [
  {
    num: '01',
    title: 'Répondez au quiz',
    desc: '5 questions sur votre expérience. 2 minutes chrono. Pas de formulaire de 47 champs.',
    color: '#059669',
    screenshot: (
      <div className="pw-screenshot pw-quiz">
        <div className="pw-ss-header">
          <div className="pw-ss-dots"><span /><span /><span /></div>
          <div className="pw-ss-url">cvclair.fr/app/quiz</div>
        </div>
        <div className="pw-ss-body">
          <div className="pw-ss-stepper">
            {[1,2,3,4,5].map(i => <div key={i} className={`pw-ss-step ${i<=2?'done':''} ${i===2?'active':''}`}>{i<2?'✓':i}</div>)}
          </div>
          <div className="pw-ss-content">
            <div className="pw-ss-title">Quel poste visez-vous ?</div>
            <div className="pw-ss-field"><span>Intitulé</span><div>Comptable clients</div></div>
            <div className="pw-ss-field"><span>Secteur</span><div>Distribution</div></div>
            <div className="pw-ss-field"><span>Expérience</span><div>3 à 5 ans</div></div>
          </div>
        </div>
      </div>
    )
  },
  {
    num: '02',
    title: "L'IA rédige, le garde-fou vérifie",
    desc: "Elle reformule vos réponses — sans inventer. Tout chiffre non sourcé est supprimé.",
    color: '#6366f1',
    screenshot: (
      <div className="pw-screenshot pw-gen">
        <div className="pw-ss-header">
          <div className="pw-ss-dots"><span /><span /><span /></div>
          <div className="pw-ss-url">cvclair.fr/app</div>
        </div>
        <div className="pw-ss-body">
          <div className="pw-ss-gen-spinner" />
          <div className="pw-ss-gen-text">Génération de votre CV…</div>
          <div className="pw-ss-gen-sub">L'IA reformule uniquement vos réponses.</div>
        </div>
      </div>
    )
  },
  {
    num: '03',
    title: 'Score ATS 98/100',
    desc: 'PDF texte sélectionnable. Gabarits prouvés par notre harnais de test automatisé.',
    color: '#059669',
    screenshot: (
      <div className="pw-screenshot pw-cv">
        <div className="pw-ss-header">
          <div className="pw-ss-dots"><span /><span /><span /></div>
          <div className="pw-ss-url">cvclair.fr/app/apercu</div>
        </div>
        <div className="pw-ss-body pw-cv-body">
          <div className="pw-cv-name">Nadia Haddad</div>
          <div className="pw-cv-role">Comptable clients</div>
          <div className="pw-cv-section-title">Expérience</div>
          <div className="pw-cv-item"><span>Comptable clients</span><span className="pw-cv-date">09/2021 – présent</span></div>
          <div className="pw-cv-company">DistribNord</div>
          <ul className="pw-cv-list"><li>Gérer 1 500 comptes clients</li><li>Réduire le délai de paiement de 30 %</li></ul>
          <div className="pw-cv-score">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
            Score ATS : 98/100
          </div>
        </div>
      </div>
    )
  }
];

export default function ProductWalkthrough() {
  return (
    <div className="pw-grid">
      {STEPS.map((step, i) => (
        <div key={i} className={`pw-row ${i % 2 === 1 ? 'reversed' : ''}`}>
          <div className="pw-text">
            <div className="pw-num" style={{ color: step.color }}>{step.num}</div>
            <h3>{step.title}</h3>
            <p>{step.desc}</p>
          </div>
          <div className="pw-visual">
            {step.screenshot}
          </div>
        </div>
      ))}
    </div>
  );
}
