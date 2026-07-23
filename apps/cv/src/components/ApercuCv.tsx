import { useCallback, useEffect, useRef, useState } from 'react';
import { cvSchema } from '@cvclair/cv-schema';
import { lintCv, type ResultatLint } from '@cvclair/ats-harness';
import { chargerOuCreerCv, type CvStocke } from '@/storage/db';
import { MODELE_PAR_DEFAUT, composantModele } from '@/templates';

/**
 * Aperçu fidèle du CV (gratuit). Aucune feuille de style print : le
 * téléchargement PDF est un produit payant (2,99 € — PLAN §3). Le bouton
 * ci-dessous lance la session Stripe Checkout.
 */
export default function ApercuCv() {
  const [record, setRecord] = useState<CvStocke | null>(null);
  const [lint, setLint] = useState<ResultatLint | null>(null);
  const conteneur = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void chargerOuCreerCv(MODELE_PAR_DEFAUT).then(setRecord);
  }, []);

  useEffect(() => {
    if (record && conteneur.current) {
      // Le rendu est hydraté au montage ; on lint le HTML réel de l'aperçu.
      const id = setTimeout(() => {
        if (conteneur.current) setLint(lintCv(conteneur.current.innerHTML));
      }, 100);
      return () => clearTimeout(id);
    }
  }, [record]);

  if (!record) {
    return <p role="status">Chargement de l'aperçu…</p>;
  }

  const Modele = composantModele(record.modele);
  const strict = cvSchema.safeParse(record.donnees);
  const [payementEnCours, setPayementEnCours] = useState(false);

  const telecharger = useCallback(async () => {
    setPayementEnCours(true);
    try {
      const reponse = await fetch('/.netlify/functions/creer-session-telechargement', { method: 'POST' });
      const data = (await reponse.json().catch(() => ({}))) as { url?: string; erreur?: string };
      if (reponse.ok && data.url) {
        window.location.href = data.url;
      } else {
        alert(data.erreur === 'Paiement non configuré.' ? 'Le paiement n\'est pas encore configuré.' : data.erreur ?? 'Erreur de paiement.');
      }
    } catch {
      alert('Connexion impossible.');
    } finally {
      setPayementEnCours(false);
    }
  }, []);

  return (
    <div className="apercu">
      <header className="apercu-barre">
        <div>
          <strong>Score ATS : {lint ? `${lint.scoreStructure}/100` : '…'}</strong>
          {lint && lint.erreurs.length > 0 ? (
            <span className="aide">
              {' '}
              — {lint.erreurs.length} point{lint.erreurs.length > 1 ? 's' : ''} à corriger
            </span>
          ) : null}
        </div>
        <button
          type="button"
          className="bouton"
          disabled={!strict.success || payementEnCours}
          onClick={telecharger}
        >
          {payementEnCours ? 'Redirection…' : 'Télécharger le PDF — 2,99 €'}
        </button>
      </header>

      {!strict.success ? (
        <p className="banniere" role="alert">
          CV incomplet : renseignez nom, e-mail, téléphone et dates (MM/AAAA) avant le téléchargement.
        </p>
      ) : null}

      {lint && lint.erreurs.length > 0 ? (
        <details className="rapport-lint">
          <summary>Détail du score ATS</summary>
          <ul>
            {lint.erreurs.map((v, i) => (
              <li key={i}>
                <code>{v.regle}</code> — {v.message}
              </li>
            ))}
          </ul>
        </details>
      ) : null}

      <div className="feuille" ref={conteneur}>
        <Modele cv={record.donnees} />
      </div>

      <p className="aide centrer">
        Le téléchargement du PDF haute qualité (2,99 €, sans abonnement) arrive avec la version M2. Vos données
        restent sur votre appareil.
      </p>
    </div>
  );
}
