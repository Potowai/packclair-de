import type { CV } from '@cvclair/cv-schema';
import { libelleFin } from '@cvclair/cv-schema';
import { libelleLangue } from './rendu';

/**
 * Structure ATS-safe partagée par tous les gabarits (skill cv-template) :
 * une colonne, rubriques canoniques, champs data-field pour le harnais,
 * aucune donnée vide rendue (R11), aucune balise piège pour les parseurs.
 * Seuls les styles (classe racine + police en ligne) diffèrent par gabarit.
 */
export function StructureCv({ cv }: { cv: CV }) {
  const { identite } = cv;
  return (
    <>
      <h1 data-field="nom">{identite.nomComplet || 'Votre nom'}</h1>
      {identite.titre ? (
        <p className="cv-titre" data-field="titre">
          {identite.titre}
        </p>
      ) : null}
      <p className="cv-contact">
        {identite.email ? <span data-field="email">{identite.email}</span> : null}
        {identite.email && identite.telephone ? ' — ' : null}
        {identite.telephone ? <span data-field="telephone">{identite.telephone}</span> : null}
        {identite.localisation ? (
          <>
            {' — '}
            <span data-field="localisation">{identite.localisation}</span>
          </>
        ) : null}
        {identite.lien ? (
          <>
            {' — '}
            <a data-field="lien" href={identite.lien}>
              {identite.lien}
            </a>
          </>
        ) : null}
      </p>

      <h2>Profil</h2>
      <section data-section="profil">{cv.accroche ? <p>{cv.accroche}</p> : null}</section>

      <h2>Expérience professionnelle</h2>
      <section data-section="experience">
        {cv.experiences.map((e) => (
          <article data-poste key={e.id}>
            <h3 data-field="poste-titre">{e.titre}</h3>
            <p data-field="poste-employeur">{e.employeur}</p>
            <p data-field="poste-dates">
              {e.debut}
              {' – '}
              {libelleFin(e.fin)}
            </p>
            {e.puces.length > 0 ? (
              <ul>
                {e.puces.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            ) : null}
          </article>
        ))}
      </section>

      <h2>Formation</h2>
      <section data-section="formation">
        {cv.formation.map((f) => (
          <article data-formation key={f.id}>
            <h3 data-field="formation-diplome">{f.diplome}</h3>
            <p data-field="formation-etablissement">{f.etablissement}</p>
            {f.debut ? (
              <p data-field="formation-dates">
                {f.debut}
                {' – '}
                {f.fin}
              </p>
            ) : (
              <p data-field="formation-annee">{f.fin}</p>
            )}
          </article>
        ))}
      </section>

      <h2>Compétences</h2>
      <section data-section="competences">
        {cv.competences.length > 0 ? (
          <ul>
            {cv.competences.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        ) : null}
      </section>

      <h2>Langues</h2>
      <section data-section="langues">
        {cv.langues.length > 0 ? (
          <ul>
            {cv.langues.map((l, i) => (
              <li key={i}>{libelleLangue(l)}</li>
            ))}
          </ul>
        ) : null}
      </section>

      {cv.certifications.length > 0 ? (
        <>
          <h2>Certifications</h2>
          <section data-section="certifications">
            <ul>
              {cv.certifications.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </section>
        </>
      ) : null}

      {cv.centresInteret.length > 0 ? (
        <>
          <h2>Centres d'intérêt</h2>
          <section data-section="interets">
            <ul>
              {cv.centresInteret.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </section>
        </>
      ) : null}
    </>
  );
}
