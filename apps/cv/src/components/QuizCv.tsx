import { useState } from 'react';
import { NIVEAUX_CECRL, cvBrouillonSchema, type CV } from '@cvclair/cv-schema';
import type { ReponsesQuiz } from '@/lib/ia';
import { chargerOuCreerCv, sauvegarderCv } from '@/storage/db';
import { MODELE_PAR_DEFAUT } from '@/templates';

type Phase =
  | { etat: 'saisie'; etape: number }
  | { etat: 'generation' }
  | { etat: 'erreur'; message: string }
  | { etat: 'termine'; retouchees: string[] };

const CHOIX_EXPERIENCE = ['Moins de 2 ans', '3 à 5 ans', '6 à 10 ans', 'Plus de 10 ans'];

const LIBELLES_NIVEAU: Record<string, string> = {
  A1: 'A1 — débutant',
  A2: 'A2 — élémentaire',
  B1: 'B1 — intermédiaire',
  B2: 'B2 — avancé',
  C1: 'C1 — courant',
  C2: 'C2 — bilingue',
  MATERNELLE: 'Langue maternelle'
};

const ETAPES = ['Identité', 'Poste visé', 'Expérience', 'Formation', 'Finaliser'] as const;
const TOTAL_ETAPES = ETAPES.length;

const initial: ReponsesQuiz = {
  nomComplet: '',
  email: '',
  telephone: '',
  localisation: '',
  posteVise: '',
  anneesExperience: CHOIX_EXPERIENCE[0]!,
  secteur: '',
  posteRecent: '',
  employeurRecent: '',
  periodeRecente: '',
  realisations: ['', '', ''],
  competences: [],
  diplome: '',
  etablissement: '',
  anneeDiplome: '',
  langues: [{ langue: 'Français', niveau: 'MATERNELLE' }]
};

function StepIndicateur({ etape, total }: { etape: number; total: number }) {
  return (
    <div className="stepper">
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className="stepper-wrapper">
          <div className={`stepper-cercle ${i < etape ? 'termine' : ''} ${i === etape ? 'actif' : ''}`}>
            {i < etape ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <span>{i + 1}</span>
            )}
          </div>
          <span className={`stepper-label ${i === etape ? 'actif' : ''}`}>{ETAPES[i]}</span>
          {i < total - 1 && <div className={`stepper-ligne ${i < etape ? 'termine' : ''}`} />}
        </div>
      ))}
    </div>
  );
}

function BarreProgression({ etape, total }: { etape: number; total: number }) {
  const pct = Math.round((etape / total) * 100);
  return (
    <div className="progress-bar">
      <div className="progress-remplissage" style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function QuizCv() {
  const [quiz, setQuiz] = useState<ReponsesQuiz>(initial);
  const [phase, setPhase] = useState<Phase>({ etat: 'saisie', etape: 0 });

  const etape = phase.etat === 'saisie' ? phase.etape : 0;

  function maj<K extends keyof ReponsesQuiz>(champ: K, valeur: ReponsesQuiz[K]) {
    setQuiz((q) => ({ ...q, [champ]: valeur }));
  }

  function majRealisation(index: number, valeur: string) {
    setQuiz((q) => ({ ...q, realisations: q.realisations.map((r, i) => (i === index ? valeur : r)) }));
  }

  function majLangue(index: number, champ: 'langue' | 'niveau', valeur: string) {
    setQuiz((q) => ({ ...q, langues: q.langues.map((l, i) => (i === index ? { ...l, [champ]: valeur } : l)) }));
  }

  function etapeSuivante() {
    setPhase((p) => (p.etat === 'saisie' && p.etape < TOTAL_ETAPES - 1 ? { ...p, etape: p.etape + 1 } : p));
  }

  function etapePrecedente() {
    setPhase((p) => (p.etat === 'saisie' && p.etape > 0 ? { ...p, etape: p.etape - 1 } : p));
  }

  const requisOk =
    etape > 0 ||
    (quiz.nomComplet.trim() &&
      quiz.email.trim() &&
      quiz.telephone.trim() &&
      quiz.posteVise.trim() &&
      quiz.diplome.trim() &&
      quiz.etablissement.trim() &&
      quiz.anneeDiplome.trim());

  async function generer() {
    setPhase({ etat: 'generation' });
    try {
      const reponse = await fetch('/.netlify/functions/generer-cv', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...quiz, competences: quiz.competences.filter(Boolean) })
      });
      const data = (await reponse.json().catch(() => ({}))) as {
        cv?: unknown;
        retouchees?: string[];
        erreur?: string;
      };
      if (!reponse.ok) {
        const message =
          reponse.status === 503
            ? "Le service d'IA n'est pas configuré sur ce déploiement (clé manquante). Réessayez plus tard."
            : (data.erreur ?? 'La génération a échoué. Réessayez.');
        setPhase({ etat: 'erreur', message });
        return;
      }
      const valide = cvBrouillonSchema.safeParse(data.cv);
      if (!valide.success) {
        setPhase({ etat: 'erreur', message: 'Le CV généré est invalide. Réessayez en précisant vos réponses.' });
        return;
      }
      const record = await chargerOuCreerCv(MODELE_PAR_DEFAUT);
      await sauvegarderCv({ ...record, donnees: valide.data as CV });
      setPhase({ etat: 'termine', retouchees: data.retouchees ?? [] });
    } catch {
      setPhase({ etat: 'erreur', message: 'Connexion impossible. Vérifiez votre réseau et réessayez.' });
    }
  }

  if (phase.etat === 'generation') {
    return (
      <div className="stepper-page">
        <div className="stepper-card generant">
          <div className="spinner" />
          <p className="generant-texte">Génération de votre CV par l'IA…</p>
          <p className="aide">Cela prend quelques secondes. L'IA reformule uniquement vos réponses, rien d'autre.</p>
        </div>
      </div>
    );
  }

  if (phase.etat === 'termine') {
    return (
      <div className="stepper-page">
        <div className="stepper-card termine">
          <div className="termine-check">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#1a7f3d" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1>Votre CV est prêt</h1>
          <p>L'IA a rédigé votre CV à partir de vos réponses — uniquement de vos réponses.</p>
          {phase.retouchees.length > 0 ? (
            <p className="banniere" role="note">
              Garde-fou de véracité : {phase.retouchees.length > 1 ? 'certaines formulations non fondées sur vos réponses ont été retirées.' : '1 formulation non fondée sur vos réponses a été retirée.'}
            </p>
          ) : null}
          <div className="termine-actions">
            <a className="bouton" href="/app/">
              Vérifier et modifier mon CV
            </a>
            <a className="bouton secondaire" href="/app/apercu/">
              Voir l'aperçu
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="stepper-page">
      <div className="stepper-card">
        <StepIndicateur etape={etape} total={TOTAL_ETAPES} />
        <BarreProgression etape={etape} total={TOTAL_ETAPES} />

        <div className="stepper-conteneur">
          {phase.etat === 'erreur' ? (
            <p className="banniere" role="alert">
              {phase.message}
            </p>
          ) : null}

          {/* Étape 1 : Identité */}
          {etape === 0 && (
            <div key="etape-0" className="etape-contenu">
              <h2 className="etape-titre">Qui êtes-vous ?</h2>
              <p className="etape-soustitre">Ces informations resteront sur votre appareil.</p>
              <div className="champs">
                <div className="champ">
                  <label htmlFor="q-nom">Nom complet *</label>
                  <input id="q-nom" value={quiz.nomComplet} onChange={(e) => maj('nomComplet', e.target.value)} required />
                </div>
                <div className="champ">
                  <label htmlFor="q-email">E-mail *</label>
                  <input id="q-email" type="email" value={quiz.email} onChange={(e) => maj('email', e.target.value)} required />
                </div>
                <div className="champ">
                  <label htmlFor="q-tel">Téléphone *</label>
                  <input id="q-tel" type="tel" value={quiz.telephone} onChange={(e) => maj('telephone', e.target.value)} required />
                </div>
                <div className="champ">
                  <label htmlFor="q-ville">Ville (optionnel)</label>
                  <input id="q-ville" value={quiz.localisation} onChange={(e) => maj('localisation', e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {/* Étape 2 : Poste visé */}
          {etape === 1 && (
            <div key="etape-1" className="etape-contenu">
              <h2 className="etape-titre">Quel poste visez-vous ?</h2>
              <p className="etape-soustitre">L'IA adaptera le ton et les mots-clés à votre secteur.</p>
              <div className="champs">
                <div className="champ">
                  <label htmlFor="q-postevise">Intitulé du poste visé *</label>
                  <input
                    id="q-postevise"
                    value={quiz.posteVise}
                    onChange={(e) => maj('posteVise', e.target.value)}
                    placeholder="Ex. : Comptable clients"
                    required
                  />
                </div>
                <div className="champ">
                  <label htmlFor="q-secteur">Secteur d'activité</label>
                  <input
                    id="q-secteur"
                    value={quiz.secteur}
                    onChange={(e) => maj('secteur', e.target.value)}
                    placeholder="Ex. : distribution, santé, tech"
                  />
                </div>
                <div className="champ">
                  <label htmlFor="q-annees">Années d'expérience</label>
                  <select id="q-annees" value={quiz.anneesExperience} onChange={(e) => maj('anneesExperience', e.target.value)}>
                    {CHOIX_EXPERIENCE.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Étape 3 : Expérience */}
          {etape === 2 && (
            <div key="etape-2" className="etape-contenu">
              <h2 className="etape-titre">Votre expérience la plus récente</h2>
              <p className="etape-soustitre">Remplissez au moins l'intitulé du poste ou l'employeur.</p>
              <div className="champs">
                <div className="champ">
                  <label htmlFor="q-posterecent">Intitulé du poste</label>
                  <input id="q-posterecent" value={quiz.posteRecent} onChange={(e) => maj('posteRecent', e.target.value)} placeholder="Ex. : Comptable clients" />
                </div>
                <div className="champ">
                  <label htmlFor="q-employeur">Employeur</label>
                  <input id="q-employeur" value={quiz.employeurRecent} onChange={(e) => maj('employeurRecent', e.target.value)} placeholder="Ex. : DistribNord" />
                </div>
                <div className="champ">
                  <label htmlFor="q-periode">Période</label>
                  <input id="q-periode" value={quiz.periodeRecente} onChange={(e) => maj('periodeRecente', e.target.value)} placeholder="Ex. : 09/2021 – présent" />
                </div>
              </div>
              <p className="aide">Vos 3 réalisations principales (des chiffres aident, l'IA ne les invente pas) :</p>
              {[0, 1, 2].map((i) => (
                <div className="champ" key={i}>
                  <textarea
                    id={`q-rea-${i}`}
                    rows={2}
                    value={quiz.realisations[i] ?? ''}
                    onChange={(e) => majRealisation(i, e.target.value)}
                    placeholder={
                      i === 0
                        ? 'Ex. : j\'ai réduit le délai de paiement de 48 à 36 jours'
                        : i === 1
                          ? 'Ex. : je gérais 1 500 comptes clients'
                          : 'Ex. : j\'ai automatisé le lettrage de 80 % des écritures'
                    }
                    className="rea-input"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Étape 4 : Formation */}
          {etape === 3 && (
            <div key="etape-3" className="etape-contenu">
              <h2 className="etape-titre">Votre diplôme le plus élevé</h2>
              <p className="etape-soustitre">Un seul diplôme suffit — l'IA n'ajoute rien.</p>
              <div className="champs">
                <div className="champ">
                  <label htmlFor="q-diplome">Diplôme *</label>
                  <input id="q-diplome" value={quiz.diplome} onChange={(e) => maj('diplome', e.target.value)} placeholder="Ex. : BTS Comptabilité et gestion" required />
                </div>
                <div className="champ">
                  <label htmlFor="q-etablissement">Établissement *</label>
                  <input id="q-etablissement" value={quiz.etablissement} onChange={(e) => maj('etablissement', e.target.value)} required />
                </div>
                <div className="champ">
                  <label htmlFor="q-anneediplome">Année d'obtention (MM/AAAA) *</label>
                  <input id="q-anneediplome" value={quiz.anneeDiplome} onChange={(e) => maj('anneeDiplome', e.target.value)} placeholder="06/2019" required />
                </div>
              </div>
              <div className="champ">
                <label htmlFor="q-competences">Compétences (une par ligne)</label>
                <textarea
                  id="q-competences"
                  rows={3}
                  value={quiz.competences.join('\n')}
                  onChange={(e) => maj('competences', e.target.value.split('\n'))}
                  placeholder={'Ex. : Sage 100\nExcel\nRecouvrement'}
                />
              </div>
            </div>
          )}

          {/* Étape 5 : Finaliser */}
          {etape === 4 && (
            <div key="etape-4" className="etape-contenu">
              <h2 className="etape-titre">Presque fini</h2>
              <p className="etape-soustitre">Ajoutez vos langues puis lancez la génération.</p>
              <div className="champs">
                <div className="groupe-langues">
                  {quiz.langues.map((l, i) => (
                    <div className="ligne-langue-stepper" key={i}>
                      <input
                        value={l.langue}
                        onChange={(e) => majLangue(i, 'langue', e.target.value)}
                        placeholder="Français"
                      />
                      <select value={l.niveau} onChange={(e) => majLangue(i, 'niveau', e.target.value)}>
                        {NIVEAUX_CECRL.map((n) => (
                          <option key={n} value={n}>{LIBELLES_NIVEAU[n] ?? n}</option>
                        ))}
                      </select>
                      {quiz.langues.length > 1 && (
                        <button type="button" className="lien-danger" onClick={() => setQuiz((q) => ({ ...q, langues: q.langues.filter((_, j) => j !== i) }))}>
                          Retirer
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" className="ajouter" onClick={() => setQuiz((q) => ({ ...q, langues: [...q.langues, { langue: '', niveau: 'B1' }] }))}>
                    + Ajouter une langue
                  </button>
                </div>
              </div>
              <div className="recap">
                <p><strong>Récapitulatif :</strong></p>
                <ul>
                  <li>Poste visé : <strong>{quiz.posteVise || '—'}</strong></li>
                  <li>Années d'expérience : <strong>{quiz.anneesExperience}</strong></li>
                  <li>Diplôme : <strong>{quiz.diplome || '—'}</strong></li>
                  <li>Réalisations fournies : <strong>{quiz.realisations.filter(Boolean).length}</strong></li>
                </ul>
              </div>
              <p className="confiance">
                🔒 Vos réponses partent uniquement vers le service de génération et ne sont pas conservées.
               L'IA <strong>n'invente rien</strong> — tout ce qu'elle écrit provient de vos réponses.
              </p>
              <div className="generer-zone">
                <button type="button" className="bouton generer-btn" onClick={generer} disabled={!requisOk}>
                  Générer mon CV avec l'IA
                </button>
                <p className="aide">3 générations offertes</p>
              </div>
            </div>
          )}
        </div>

        {phase.etat === 'saisie' && (
          <div className="stepper-nav">
            {etape > 0 ? (
              <button type="button" className="bouton secondaire" onClick={etapePrecedente}>
                ← Étape précédente
              </button>
            ) : (
              <div />
            )}
            {etape < TOTAL_ETAPES - 1 ? (
              <button type="button" className="bouton" onClick={etapeSuivante}>
                Étape suivante →
              </button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
