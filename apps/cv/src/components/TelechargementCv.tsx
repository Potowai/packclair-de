import { useEffect, useRef, useState } from 'react';
import { cvSchema } from '@cvclair/cv-schema';
import { chargerOuCreerCv, type CvStocke } from '@/storage/db';
import { MODELE_PAR_DEFAUT, composantModele } from '@/templates';

type EtatPaiement =
  | { etat: 'verification' }
  | { etat: 'debloque'; jeton: string }
  | { etat: 'expire' }
  | { etat: 'erreur'; message: string };

const STOCKAGE_CLE = 'cvclair:telechargement';

/**
 * Page de téléchargement débloquée après paiement Stripe (2,99 €).
 * Vérifie le jeton côté serveur, puis autorise l'impression PDF du CV
 * via une feuille de style print (texte réel et sélectionnable — ATS-safe).
 */
export default function TelechargementCv() {
  const [record, setRecord] = useState<CvStocke | null>(null);
  const [paiement, setPaiement] = useState<EtatPaiement>({ etat: 'verification' });
  const feuilleRef = useRef<HTMLDivElement>(null);

  // 1. Charger le CV
  useEffect(() => {
    void chargerOuCreerCv(MODELE_PAR_DEFAUT).then(setRecord);
  }, []);

  // 2. Vérifier le paiement
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');

    if (sessionId) {
      // Vérifier la session côté serveur
      void fetch(`/.netlify/functions/verifier-paiement?session_id=${encodeURIComponent(sessionId)}`)
        .then(async (rep) => {
          if (!rep.ok) {
            const data = (await rep.json().catch(() => ({}))) as { erreur?: string };
            setPaiement({ etat: 'erreur', message: data.erreur ?? 'Erreur de vérification.' });
            return;
          }
          const data = (await rep.json()) as { paye: boolean; jeton?: string; message?: string };
          if (data.paye && data.jeton) {
            localStorage.setItem(STOCKAGE_CLE, JSON.stringify({ jeton: data.jeton, date: Date.now() }));
            setPaiement({ etat: 'debloque', jeton: data.jeton });
          } else if (data.message?.includes('expirée')) {
            setPaiement({ etat: 'expire' });
          } else {
            setPaiement({ etat: 'erreur', message: data.message ?? 'Paiement non confirmé.' });
          }
        })
        .catch(() => setPaiement({ etat: 'erreur', message: 'Connexion impossible.' }));
    } else {
      // Vérifier un jeton stocké (re-téléchargement)
      const stocke = localStorage.getItem(STOCKAGE_CLE);
      if (stocke) {
        try {
          const parsed = JSON.parse(stocke) as { jeton: string; date: number };
          if (Date.now() - parsed.date < 7 * 24 * 3600 * 1000) {
            setPaiement({ etat: 'debloque', jeton: parsed.jeton });
          } else {
            localStorage.removeItem(STOCKAGE_CLE);
            setPaiement({ etat: 'expire' });
          }
        } catch {
          localStorage.removeItem(STOCKAGE_CLE);
          setPaiement({ etat: 'expire' });
        }
      } else {
        setPaiement({ etat: 'erreur', message: 'Aucun paiement trouvé. Commencez par créer un CV.' });
      }
    }
  }, []);

  if (!record) return <p role="status">Chargement…</p>;

  const Modele = composantModele(record.modele);
  const strict = cvSchema.safeParse(record.donnees);
  const ok = strict.success && (paiement.etat === 'debloque' || paiement.etat === 'verification');

  // L'impression est autorisée quand le paiement est débloqué
  const impressionAutorisee = paiement.etat === 'debloque';

  return (
    <div className="apercu">
      <header className="apercu-barre">
        <div>
          {paiement.etat === 'verification' ? <span>Vérification du paiement…</span> : null}
          {paiement.etat === 'debloque' ? (
            <span className="etat-vert">Paiement confirmé — vous pouvez télécharger</span>
          ) : null}
          {paiement.etat === 'expire' ? <span>Lien expiré (7 jours)</span> : null}
          {paiement.etat === 'erreur' ? <span className="etat-rouge">{paiement.message}</span> : null}
        </div>
        <button
          type="button"
          className="bouton"
          disabled={!impressionAutorisee || !ok}
          onClick={() => window.print()}
        >
          {impressionAutorisee ? 'Imprimer / Enregistrer en PDF' : 'Paiement requis'}
        </button>
      </header>

      {!strict.success ? (
        <p className="banniere" role="alert">
          CV incomplet : renseignez tous les champs obligatoires avant de télécharger.
        </p>
      ) : null}

      {/* Le rendu du CV — la feuille de style print n'est activée que sur cette page. */}
      <div className="feuille impression-pdf" ref={feuilleRef}>
        <Modele cv={record.donnees} />
      </div>

      {import.meta.env.DEV ? (
        <p className="aide centrer">
          Mode développement : l'impression PDF est active sans vérification serveur.
        </p>
      ) : null}
    </div>
  );
}
