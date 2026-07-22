import { useEffect, useRef, useState } from 'react';
import {
  NIVEAUX_CECRL,
  cvBrouillonSchema,
  cvSchema,
  type CV,
  type Experience,
  type Formation,
  type Langue
} from '@cvclair/cv-schema';
import { lintCv } from '@cvclair/ats-harness';
import { chargerOuCreerCv, sauvegarderCv, type CvStocke } from '@/storage/db';
import { MODELES, MODELE_PAR_DEFAUT, composantModele } from '@/templates';

type Statut = 'chargement' | 'pret' | 'enregistre';

const LIBELLES_NIVEAU: Record<string, string> = {
  A1: 'A1 — débutant',
  A2: 'A2 — élémentaire',
  B1: 'B1 — intermédiaire',
  B2: 'B2 — avancé',
  C1: 'C1 — courant',
  C2: 'C2 — bilingue',
  MATERNELLE: 'Langue maternelle'
};

function nouvelId(): string {
  return crypto.randomUUID();
}

/** Normalise la saisie « présent » vers la valeur canonique du schéma. */
function normaliserFin(saisie: string): string {
  const v = saisie.trim().toLowerCase();
  return v === 'présent' || v === 'present' ? 'present' : saisie.trim();
}

export default function CvEditeur({ delaiSauvegarde = 400 }: { delaiSauvegarde?: number }) {
  const [record, setRecord] = useState<CvStocke | null>(null);
  const [statut, setStatut] = useState<Statut>('chargement');
  const [score, setScore] = useState<number | null>(null);
  const minuteur = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cacheRendu = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let actif = true;
    void chargerOuCreerCv(MODELE_PAR_DEFAUT).then((cv) => {
      if (actif) {
        setRecord(cv);
        setStatut('pret');
      }
    });
    return () => {
      actif = false;
    };
  }, []);

  function planifierSauvegarde(suivant: CvStocke) {
    if (minuteur.current) clearTimeout(minuteur.current);
    minuteur.current = setTimeout(() => {
      void sauvegarderCv(suivant).then(() => setStatut('enregistre'));
    }, delaiSauvegarde);
  }

  function modifier(fn: (cv: CV) => CV) {
    setRecord((r) => {
      if (!r) return r;
      const suivant = { ...r, donnees: fn(r.donnees) };
      planifierSauvegarde(suivant);
      return suivant;
    });
  }

  function changerModele(modele: string) {
    setRecord((r) => {
      if (!r) return r;
      const suivant = { ...r, modele };
      planifierSauvegarde(suivant);
      return suivant;
    });
  }

  // Score ATS basique (gratuit) : lint local sur le rendu réel du gabarit.
  const cv = record?.donnees ?? null;
  const Modele = composantModele(record?.modele ?? MODELE_PAR_DEFAUT);
  useEffect(() => {
    if (!cv) return;
    const id = setTimeout(() => {
      if (cacheRendu.current) setScore(lintCv(cacheRendu.current.innerHTML).scoreStructure);
    }, 250);
    return () => clearTimeout(id);
  }, [cv, record?.modele]);

  if (!record || !cv) {
    return <p role="status">Chargement de votre CV…</p>;
  }

  const brouillon = cvBrouillonSchema.safeParse(cv);
  const strict = cvSchema.safeParse(cv);

  function majIdentite(champ: string, valeur: string) {
    modifier((c) => ({ ...c, identite: { ...c.identite, [champ]: valeur } }));
  }

  function majExperience(id: string, fn: (e: Experience) => Experience) {
    modifier((c) => ({ ...c, experiences: c.experiences.map((e) => (e.id === id ? fn(e) : e)) }));
  }

  function majFormation(id: string, fn: (f: Formation) => Formation) {
    modifier((c) => ({ ...c, formation: c.formation.map((f) => (f.id === id ? fn(f) : f)) }));
  }

  function majLangue(index: number, fn: (l: Langue) => Langue) {
    modifier((c) => ({ ...c, langues: c.langues.map((l, i) => (i === index ? fn(l) : l)) }));
  }

  return (
    <div className="editeur">
      <header className="editeur-entete">
        <div>
          <strong>Score ATS : {score === null ? '…' : `${score}/100`}</strong>
          <span className="aide"> (structure du CV, calculée localement)</span>
        </div>
        <div>
          <span role="status">{statut === 'enregistre' ? 'Enregistré' : statut === 'pret' ? 'Modification…' : ''}</span>{' '}
          <a className="bouton" href="/app/apercu/">
            Voir l'aperçu
          </a>
        </div>
      </header>

      {!strict.success ? (
        <p className="banniere" role="alert">
          Pour un CV complet, renseignez au minimum : nom, e-mail, téléphone et des dates au format MM/AAAA.
        </p>
      ) : null}
      {!brouillon.success ? (
        <p className="banniere" role="alert">Certains champs sont mal formés (e-mail, téléphone ou dates).</p>
      ) : null}

      <section aria-labelledby="titre-identite">
        <h2 id="titre-identite">Identité</h2>
        <div className="grille">
          <label htmlFor="nomComplet">Nom complet *</label>
          <input
            id="nomComplet"
            value={cv.identite.nomComplet}
            onChange={(e) => majIdentite('nomComplet', e.target.value)}
            autoComplete="name"
          />
          <label htmlFor="titrePoste">Titre du CV</label>
          <input
            id="titrePoste"
            value={cv.identite.titre ?? ''}
            onChange={(e) => majIdentite('titre', e.target.value)}
            placeholder="Ex. : Développeuse front-end"
          />
          <label htmlFor="email">E-mail *</label>
          <input
            id="email"
            type="email"
            value={cv.identite.email}
            onChange={(e) => majIdentite('email', e.target.value)}
            autoComplete="email"
          />
          <label htmlFor="telephone">Téléphone *</label>
          <input
            id="telephone"
            type="tel"
            value={cv.identite.telephone}
            onChange={(e) => majIdentite('telephone', e.target.value)}
            autoComplete="tel"
          />
          <label htmlFor="localisation">Ville (optionnel)</label>
          <input
            id="localisation"
            value={cv.identite.localisation ?? ''}
            onChange={(e) => majIdentite('localisation', e.target.value)}
          />
          <label htmlFor="lien">Lien (LinkedIn, portfolio — optionnel)</label>
          <input
            id="lien"
            type="url"
            value={cv.identite.lien ?? ''}
            onChange={(e) => majIdentite('lien', e.target.value)}
            placeholder="https://…"
          />
        </div>
      </section>

      <section aria-labelledby="titre-profil">
        <h2 id="titre-profil">Profil (accroche)</h2>
        <label className="sr-only" htmlFor="accroche">
          Accroche
        </label>
        <textarea
          id="accroche"
          rows={3}
          maxLength={600}
          value={cv.accroche ?? ''}
          onChange={(e) => modifier((c) => ({ ...c, accroche: e.target.value }))}
          placeholder="2–4 lignes : qui vous êtes, vos années d'expérience, 1–2 réussites chiffrées."
        />
      </section>

      <section aria-labelledby="titre-experience">
        <h2 id="titre-experience">Expérience professionnelle</h2>
        {cv.experiences.map((exp) => (
          <fieldset key={exp.id} className="carte">
            <legend>{exp.titre || 'Nouveau poste'}</legend>
            <div className="grille">
              <label htmlFor={`exp-titre-${exp.id}`}>Intitulé du poste *</label>
              <input
                id={`exp-titre-${exp.id}`}
                value={exp.titre}
                onChange={(e) => majExperience(exp.id, (x) => ({ ...x, titre: e.target.value }))}
              />
              <label htmlFor={`exp-employeur-${exp.id}`}>Employeur *</label>
              <input
                id={`exp-employeur-${exp.id}`}
                value={exp.employeur}
                onChange={(e) => majExperience(exp.id, (x) => ({ ...x, employeur: e.target.value }))}
              />
              <label htmlFor={`exp-debut-${exp.id}`}>Début (MM/AAAA) *</label>
              <input
                id={`exp-debut-${exp.id}`}
                value={exp.debut}
                onChange={(e) => majExperience(exp.id, (x) => ({ ...x, debut: e.target.value.trim() }))}
                placeholder="09/2023"
              />
              <label htmlFor={`exp-fin-${exp.id}`}>Fin (MM/AAAA ou présent) *</label>
              <input
                id={`exp-fin-${exp.id}`}
                value={exp.fin === 'present' ? 'présent' : exp.fin}
                onChange={(e) => majExperience(exp.id, (x) => ({ ...x, fin: normaliserFin(e.target.value) }))}
                placeholder="présent"
              />
            </div>
            <label htmlFor={`exp-puces-${exp.id}`}>Réalisations (une par ligne, verbe d'action + chiffre)</label>
            <textarea
              id={`exp-puces-${exp.id}`}
              rows={4}
              value={exp.puces.join('\n')}
              onChange={(e) => majExperience(exp.id, (x) => ({ ...x, puces: e.target.value.split('\n') }))}
              onBlur={(e) =>
                majExperience(exp.id, (x) => ({
                  ...x,
                  puces: e.target.value
                    .split('\n')
                    .map((p) => p.trim())
                    .filter(Boolean)
                }))
              }
            />
            <button
              type="button"
              className="lien-danger"
              onClick={() => modifier((c) => ({ ...c, experiences: c.experiences.filter((x) => x.id !== exp.id) }))}
            >
              Supprimer ce poste
            </button>
          </fieldset>
        ))}
        <button
          type="button"
          onClick={() =>
            modifier((c) => ({
              ...c,
              experiences: [...c.experiences, { id: nouvelId(), titre: '', employeur: '', debut: '', fin: '', puces: [] }]
            }))
          }
        >
          + Ajouter un poste
        </button>
      </section>

      <section aria-labelledby="titre-formation">
        <h2 id="titre-formation">Formation</h2>
        {cv.formation.map((f) => (
          <fieldset key={f.id} className="carte">
            <legend>{f.diplome || 'Nouveau diplôme'}</legend>
            <div className="grille">
              <label htmlFor={`for-diplome-${f.id}`}>Diplôme *</label>
              <input
                id={`for-diplome-${f.id}`}
                value={f.diplome}
                onChange={(e) => majFormation(f.id, (x) => ({ ...x, diplome: e.target.value }))}
              />
              <label htmlFor={`for-etablissement-${f.id}`}>Établissement *</label>
              <input
                id={`for-etablissement-${f.id}`}
                value={f.etablissement}
                onChange={(e) => majFormation(f.id, (x) => ({ ...x, etablissement: e.target.value }))}
              />
              <label htmlFor={`for-debut-${f.id}`}>Début (MM/AAAA, optionnel)</label>
              <input
                id={`for-debut-${f.id}`}
                value={f.debut ?? ''}
                onChange={(e) =>
                  majFormation(f.id, (x) => ({ ...x, debut: e.target.value.trim() || undefined }))
                }
                placeholder="09/2021"
              />
              <label htmlFor={`for-fin-${f.id}`}>Fin (MM/AAAA) *</label>
              <input
                id={`for-fin-${f.id}`}
                value={f.fin}
                onChange={(e) => majFormation(f.id, (x) => ({ ...x, fin: e.target.value.trim() }))}
                placeholder="06/2023"
              />
            </div>
            <button
              type="button"
              className="lien-danger"
              onClick={() => modifier((c) => ({ ...c, formation: c.formation.filter((x) => x.id !== f.id) }))}
            >
              Supprimer ce diplôme
            </button>
          </fieldset>
        ))}
        <button
          type="button"
          onClick={() =>
            modifier((c) => ({
              ...c,
              formation: [...c.formation, { id: nouvelId(), diplome: '', etablissement: '', fin: '' }]
            }))
          }
        >
          + Ajouter un diplôme
        </button>
      </section>

      <section aria-labelledby="titre-competences">
        <h2 id="titre-competences">Compétences</h2>
        <label className="sr-only" htmlFor="competences">
          Compétences
        </label>
        <textarea
          id="competences"
          rows={4}
          value={cv.competences.join('\n')}
          onChange={(e) => modifier((c) => ({ ...c, competences: e.target.value.split('\n') }))}
          onBlur={(e) =>
            modifier((c) => ({
              ...c,
              competences: e.target.value
                .split('\n')
                .map((s) => s.trim())
                .filter(Boolean)
            }))
          }
          placeholder={'Une compétence par ligne\nEx. : React\nGestion de projet'}
        />
      </section>

      <section aria-labelledby="titre-langues">
        <h2 id="titre-langues">Langues</h2>
        {cv.langues.map((l, i) => (
          <div className="ligne-langue" key={i}>
            <label htmlFor={`langue-nom-${i}`}>Langue</label>
            <input
              id={`langue-nom-${i}`}
              value={l.langue}
              onChange={(e) => majLangue(i, (x) => ({ ...x, langue: e.target.value }))}
              placeholder="Anglais"
            />
            <label htmlFor={`langue-niveau-${i}`}>Niveau</label>
            <select
              id={`langue-niveau-${i}`}
              value={l.niveau}
              onChange={(e) => majLangue(i, (x) => ({ ...x, niveau: e.target.value as Langue['niveau'] }))}
            >
              {NIVEAUX_CECRL.map((n) => (
                <option key={n} value={n}>
                  {LIBELLES_NIVEAU[n] ?? n}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="lien-danger"
              onClick={() => modifier((c) => ({ ...c, langues: c.langues.filter((_, j) => j !== i) }))}
            >
              Retirer
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => modifier((c) => ({ ...c, langues: [...c.langues, { langue: '', niveau: 'B1' }] }))}
        >
          + Ajouter une langue
        </button>
      </section>

      <section aria-labelledby="titre-modele">
        <h2 id="titre-modele">Gabarit</h2>
        <div role="radiogroup" aria-label="Choix du gabarit" className="modeles">
          {MODELES.map((m) => (
            <label key={m.id} className={record.modele === m.id ? 'modele actif' : 'modele'}>
              <input
                type="radio"
                name="modele"
                value={m.id}
                checked={record.modele === m.id}
                onChange={() => changerModele(m.id)}
              />
              <strong>{m.nom}</strong>
              <span>{m.description}</span>
            </label>
          ))}
        </div>
      </section>

      {/* Rendu caché : sert uniquement au calcul local du score ATS. */}
      <div aria-hidden="true" className="rendu-cache" ref={cacheRendu}>
        <Modele cv={cv} />
      </div>
    </div>
  );
}
