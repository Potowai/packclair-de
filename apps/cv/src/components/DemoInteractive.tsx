import { useState } from 'react';

const VIDE = {
  nom: '', titre: '', employeur: '', debut: '', fin: '',
  realisations: ['', '', ''], diplome: '', etablissement: '', competences: ''
};

export default function DemoInteractive() {
  const [d, setD] = useState(VIDE);
  const aUnContenu = d.nom || d.titre || d.employeur || d.diplome || d.competences;

  return (
    <section className="demo-section">
      <div className="demo-grid">
        {/* Formulaire */}
        <div className="demo-form">
          <div className="demo-champ">
            <input placeholder="Votre nom" value={d.nom} onChange={(e) => setD({ ...d, nom: e.target.value })} />
          </div>
          <div className="demo-champ">
            <input placeholder="Poste visé (ex. Comptable clients)" value={d.titre} onChange={(e) => setD({ ...d, titre: e.target.value })} />
          </div>
          <div className="demo-champ-row">
            <input placeholder="Employeur" value={d.employeur} onChange={(e) => setD({ ...d, employeur: e.target.value })} />
            <input placeholder="09/2021 – présent" value={`${d.debut}${d.fin ? ' – ' + d.fin : ''}`} onChange={(e) => {
              const val = e.target.value;
              const sep = val.indexOf(' – ');
              if (sep >= 0) { setD({ ...d, debut: val.slice(0, sep), fin: val.slice(sep + 3) }); }
              else { setD({ ...d, debut: val, fin: '' }); }
            }} className="demo-dates" />
          </div>
          {[0, 1, 2].map((i) => (
            <div className="demo-champ" key={i}>
              <input
                placeholder={`Réalisation ${i + 1} (ex. j'ai réduit les délais de 30 %)`}
                value={d.realisations[i] ?? ''}
                onChange={(e) => {
                  const r = [...d.realisations]; r[i] = e.target.value; setD({ ...d, realisations: r });
                }}
              />
            </div>
          ))}
          <div className="demo-champ-row">
            <input placeholder="Diplôme" value={d.diplome} onChange={(e) => setD({ ...d, diplome: e.target.value })} />
            <input placeholder="Établissement" value={d.etablissement} onChange={(e) => setD({ ...d, etablissement: e.target.value })} />
          </div>
          <div className="demo-champ">
            <input placeholder="Compétences (ex. React, Excel, Sage 100)" value={d.competences} onChange={(e) => setD({ ...d, competences: e.target.value })} />
          </div>
        </div>

        {/* Aperçu CV live */}
        <div className="demo-preview">
          <div className="demo-preview-badge">Aperçu en direct</div>
          <div className={`demo-cv ${aUnContenu ? 'rempli' : ''}`}>
            <div className="demo-cv-nom">{d.nom || 'Votre Nom'}</div>
            {d.titre && <div className="demo-cv-titre">{d.titre}</div>}
            {(d.employeur || d.debut) && (
              <div className="demo-cv-rubrique">
                <div className="demo-cv-rubrique-titre">Expérience professionnelle</div>
                {(d.employeur || d.debut) && (
                  <div className="demo-cv-poste">
                    <div className="demo-cv-poste-ligne">
                      {d.titre && <span className="demo-cv-poste-titre">{d.titre}</span>}
                      {d.employeur && <span className="demo-cv-poste-employeur">{d.employeur}</span>}
                    </div>
                    {d.debut && <div className="demo-cv-poste-dates">{d.debut}{d.fin ? ` – ${d.fin}` : ''}</div>}
                  </div>
                )}
                {d.realisations.filter(Boolean).length > 0 && (
                  <ul className="demo-cv-puces">
                    {d.realisations.filter(Boolean).map((p, i) => <li key={i}>{p}</li>)}
                  </ul>
                )}
              </div>
            )}
            {d.diplome && (
              <div className="demo-cv-rubrique">
                <div className="demo-cv-rubrique-titre">Formation</div>
                <div className="demo-cv-poste">
                  <span className="demo-cv-poste-titre">{d.diplome}</span>
                  {d.etablissement && <span className="demo-cv-poste-employeur">{d.etablissement}</span>}
                </div>
              </div>
            )}
            {d.competences && (
              <div className="demo-cv-rubrique">
                <div className="demo-cv-rubrique-titre">Compétences</div>
                <div className="demo-cv-competences">{d.competences}</div>
              </div>
            )}
            {!aUnContenu && (
              <div className="demo-cv-placeholder">
                <p>Commencez à remplir le formulaire<br/>et voyez votre CV se construire ici.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
