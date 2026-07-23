import { useState } from 'react';
import { NIVEAUX_CECRL, cvBrouillonSchema, type CV } from '@cvclair/cv-schema';
import type { ReponsesQuiz } from '@/lib/ia';
import { chargerOuCreerCv, sauvegarderCv } from '@/storage/db';
import { MODELE_PAR_DEFAUT } from '@/templates';

type Phase =
  | { etat: 'saisie' }
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

/**
 * Quiz de génération IA (PLAN §5) : quelques questions factuelles → la
 * fonction serverless rédige le CV. L'IA ne reçoit que ces faits et le
 * garde-fou de véracité retire toute invention avant sauvegarde.
 */
export default function QuizCv() {
  const [quiz, setQuiz] = useState<ReponsesQuiz>(initial);
  const [phase, setPhase] = useState<Phase>({ etat: 'saisie' });

  function maj<K extends keyof ReponsesQuiz>(champ: K, valeur: ReponsesQuiz[K]) {
    setQuiz((q) => ({ ...q, [champ]: valeur }));
  }

  function majRealisation(index: number, valeur: string) {
    setQuiz((q) => ({ ...q, realisations: q.realisations.map((r, i) => (i === index ? valeur : r)) }));
  }

  function majLangue(index: number, champ: 'langue' | 'niveau', valeur: string) {
    setQuiz((q) => ({ ...q, langues: q.langues.map((l, i) => (i === index ? { ...l, [champ]: valeur } : l)) }));
  }

  const requisOk =
    quiz.nomComplet.trim() &&
    quiz.email.trim() &&
    quiz.telephone.trim() &&
    quiz.posteVise.trim() &&
    quiz.diplome.trim() &&
    quiz.etablissement.trim() &&
    quiz.anneeDiplome.trim();

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
      <div className="editeur">
        <p role="status">Génération de votre CV par l'IA… (quelques secondes)</p>
      </div>
    );
  }

  if (phase.etat === 'termine') {
    return (
      <div className="editeur">
        <h1>Votre CV est prêt</h1>
        <p>L'IA a rédigé votre CV à partir de vos réponses — uniquement à partir de vos réponses.</p>
        {phase.retouchees.length > 0 ? (
          <p className="banniere" role="note">
            Garde-fou de véracité : {phase.retouchees.length} formulation{phase.retouchees.length > 1 ? 's' : ''}{' '}
            non fondée(s) sur vos réponses a/ont été retirée(s).
          </p>
        ) : null}
        <p>
          <a className="bouton" href="/app/">
            Vérifier et modifier mon CV
          </a>{' '}
          <a className="bouton secondaire" href="/app/apercu/">
            Voir l'aperçu
          </a>
        </p>
      </div>
    );
  }

  return (
    <div className="editeur">
      <h1>Générez votre CV en 2 minutes</h1>
      <p className="aide">
        Répondez à quelques questions factuelles : l'IA rédige le CV. Elle n'invente rien — tout ce qu'elle écrit
        provient de vos réponses.
      </p>

      {phase.etat === 'erreur' ? (
        <p className="banniere" role="alert">
          {phase.message}
        </p>
      ) : null}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void generer();
        }}
      >
        <section aria-labelledby="quiz-identite">
          <h2 id="quiz-identite">Vous</h2>
          <div className="grille">
            <label htmlFor="q-nom">Nom complet *</label>
            <input id="q-nom" value={quiz.nomComplet} onChange={(e) => maj('nomComplet', e.target.value)} required />
            <label htmlFor="q-email">E-mail *</label>
            <input
              id="q-email"
              type="email"
              value={quiz.email}
              onChange={(e) => maj('email', e.target.value)}
              required
            />
            <label htmlFor="q-tel">Téléphone *</label>
            <input
              id="q-tel"
              type="tel"
              value={quiz.telephone}
              onChange={(e) => maj('telephone', e.target.value)}
              required
            />
            <label htmlFor="q-ville">Ville (optionnel)</label>
            <input id="q-ville" value={quiz.localisation} onChange={(e) => maj('localisation', e.target.value)} />
          </div>
        </section>

        <section aria-labelledby="quiz-poste">
          <h2 id="quiz-poste">Le poste visé</h2>
          <div className="grille">
            <label htmlFor="q-postevise">Intitulé du poste visé *</label>
            <input
              id="q-postevise"
              value={quiz.posteVise}
              onChange={(e) => maj('posteVise', e.target.value)}
              placeholder="Ex. : Comptable clients"
              required
            />
            <label htmlFor="q-secteur">Secteur d'activité</label>
            <input
              id="q-secteur"
              value={quiz.secteur}
              onChange={(e) => maj('secteur', e.target.value)}
              placeholder="Ex. : distribution"
            />
            <label htmlFor="q-annees">Années d'expérience</label>
            <select
              id="q-annees"
              value={quiz.anneesExperience}
              onChange={(e) => maj('anneesExperience', e.target.value)}
            >
              {CHOIX_EXPERIENCE.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
        </section>

        <section aria-labelledby="quiz-experience">
          <h2 id="quiz-experience">Votre expérience la plus récente</h2>
          <div className="grille">
            <label htmlFor="q-posterecent">Intitulé du poste</label>
            <input
              id="q-posterecent"
              value={quiz.posteRecent}
              onChange={(e) => maj('posteRecent', e.target.value)}
            />
            <label htmlFor="q-employeur">Employeur</label>
            <input
              id="q-employeur"
              value={quiz.employeurRecent}
              onChange={(e) => maj('employeurRecent', e.target.value)}
            />
            <label htmlFor="q-periode">Période</label>
            <input
              id="q-periode"
              value={quiz.periodeRecente}
              onChange={(e) => maj('periodeRecente', e.target.value)}
              placeholder="Ex. : 09/2021 – présent"
            />
          </div>
          <p className="aide">Vos 3 réalisations principales, avec des chiffres si possible (l'IA les reformulera sans en ajouter) :</p>
          {[0, 1, 2].map((i) => (
            <div key={i}>
              <label className="sr-only" htmlFor={`q-rea-${i}`}>
                Réalisation {i + 1}
              </label>
              <textarea
                id={`q-rea-${i}`}
                rows={2}
                value={quiz.realisations[i] ?? ''}
                onChange={(e) => majRealisation(i, e.target.value)}
                placeholder={
                  i === 0
                    ? 'Ex. : j’ai réduit le délai de paiement de 48 à 36 jours'
                    : i === 1
                      ? 'Ex. : je gère 1 500 comptes clients'
                      : 'Ex. : j’ai automatisé le lettrage de 80 % des écritures'
                }
              />
            </div>
          ))}
        </section>

        <section aria-labelledby="quiz-formation">
          <h2 id="quiz-formation">Votre diplôme le plus élevé</h2>
          <div className="grille">
            <label htmlFor="q-diplome">Diplôme *</label>
            <input
              id="q-diplome"
              value={quiz.diplome}
              onChange={(e) => maj('diplome', e.target.value)}
              placeholder="Ex. : BTS Comptabilité et gestion"
              required
            />
            <label htmlFor="q-etablissement">Établissement *</label>
            <input
              id="q-etablissement"
              value={quiz.etablissement}
              onChange={(e) => maj('etablissement', e.target.value)}
              required
            />
            <label htmlFor="q-anneediplome">Année d'obtention (MM/AAAA) *</label>
            <input
              id="q-anneediplome"
              value={quiz.anneeDiplome}
              onChange={(e) => maj('anneeDiplome', e.target.value)}
              placeholder="06/2019"
              required
            />
          </div>
        </section>

        <section aria-labelledby="quiz-competences">
          <h2 id="quiz-competences">Vos compétences</h2>
          <label className="sr-only" htmlFor="q-competences">
            Compétences
          </label>
          <textarea
            id="q-competences"
            rows={3}
            value={quiz.competences.join('\n')}
            onChange={(e) => maj('competences', e.target.value.split('\n'))}
            placeholder={'Une par ligne\nEx. : Sage 100\nExcel'}
          />
        </section>

        <section aria-labelledby="quiz-langues">
          <h2 id="quiz-langues">Vos langues</h2>
          {quiz.langues.map((l, i) => (
            <div className="ligne-langue" key={i}>
              <label htmlFor={`q-langue-${i}`}>Langue</label>
              <input
                id={`q-langue-${i}`}
                value={l.langue}
                onChange={(e) => majLangue(i, 'langue', e.target.value)}
              />
              <label htmlFor={`q-niveau-${i}`}>Niveau</label>
              <select
                id={`q-niveau-${i}`}
                value={l.niveau}
                onChange={(e) => majLangue(i, 'niveau', e.target.value)}
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
                onClick={() => setQuiz((q) => ({ ...q, langues: q.langues.filter((_, j) => j !== i) }))}
              >
                Retirer
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setQuiz((q) => ({ ...q, langues: [...q.langues, { langue: '', niveau: 'B1' }] }))}
          >
            + Ajouter une langue
          </button>
        </section>

        <p>
          <button type="submit" className="bouton" disabled={!requisOk}>
            Générer mon CV avec l'IA
          </button>{' '}
          <a href="/app/">Préférer tout saisir à la main</a>
        </p>
        <p className="aide">
          Vos réponses partent uniquement vers le service de génération et ne sont pas conservées. 3 générations
          offertes.
        </p>
      </form>
    </div>
  );
}
