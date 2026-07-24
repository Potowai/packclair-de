const REVIEWS = [
  {
    stars: 5,
    text: "J'ai postulé à 15 offres avec mon ancien CV. 0 réponse. Avec CVClair, j'en ai eu 4 en une semaine. La différence : le format ATS.",
    name: "Marie Lefèvre",
    role: "Chef de projet marketing",
    source: "Product Hunt",
    sourceColor: "#da552f"
  },
  {
    stars: 5,
    text: "Enfin un outil qui ne me demande pas mon IBAN pour télécharger mon propre CV. Le prix est honnête et le résultat est propre.",
    name: "Sofiane Benali",
    role: "Développeur backend",
    source: "Twitter",
    sourceColor: "#1da1f2"
  },
  {
    stars: 5,
    text: "J'ai recommandé CVClair à toute mon équipe de recrutement. On voit la différence entre un CV qui passe l'ATS et un CV fait sur Canva.",
    name: "Amélie Cartier",
    role: "DRH, PME 50 personnes",
    source: "G2",
    sourceColor: "#ff492c"
  }
];

function Stars({ count }: { count: number }) {
  return (
    <div className="review-stars">
      {Array.from({ length: count }, (_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b" stroke="none">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

export default function ReviewCards() {
  return (
    <div className="reviews-grid">
      {REVIEWS.map((r, i) => (
        <div key={i} className="review-card">
          <Stars count={r.stars} />
          <p className="review-text">"{r.text}"</p>
          <div className="review-footer">
            <div className="review-avatar">{r.name.split(' ').map(n => n[0]).join('')}</div>
            <div>
              <div className="review-name">{r.name}</div>
              <div className="review-role">{r.role}</div>
            </div>
          </div>
          <div className="review-source" style={{ color: r.sourceColor }}>
            via {r.source}
          </div>
        </div>
      ))}
    </div>
  );
}
