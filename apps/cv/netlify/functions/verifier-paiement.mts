import { createHmac } from 'node:crypto';
import { appelerStripe } from '../../src/lib/stripe';

function json(corps: unknown, statut = 200): Response {
  return new Response(JSON.stringify(corps), {
    status: statut,
    headers: { 'content-type': 'application/json; charset=utf-8' }
  });
}

function creerJeton(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('hex');
}

/**
 * GET /.netlify/functions/verifier-paiement?session_id=cs_xxx
 * Vérifie la session Stripe. Si payée et dans les 7 jours, retourne
 * un jeton HMAC pour autoriser le téléchargement.
 */
export default async (req: Request): Promise<Response> => {
  if (req.method !== 'GET') return json({ erreur: 'Méthode non autorisée.' }, 405);

  const cle = process.env.STRIPE_SECRET_KEY;
  if (!cle) {
    return json({ erreur: 'Paiement non configuré.' }, 503);
  }
  const secretJeton = process.env.JETON_SECRET_KEY;
  if (!secretJeton) {
    return json({ erreur: 'Jeton non configuré.' }, 503);
  }

  const url = new URL(req.url);
  const sessionId = url.searchParams.get('session_id');
  if (!sessionId) {
    return json({ erreur: 'Paramètre session_id requis.' }, 400);
  }

  try {
    const session = (await appelerStripe(
      'GET',
      `/checkout/sessions/${sessionId}`,
      null,
      cle
    )) as {
      payment_status?: string;
      status?: string;
      created?: number;
      metadata?: Record<string, string>;
    };

    if (session.payment_status !== 'paid') {
      return json({ paye: false, message: 'Le paiement n\'a pas été complété.' });
    }

    // Fenêtre de re-téléchargement : 7 jours
    const maintnant = Math.floor(Date.now() / 1000);
    const creation = session.created ?? 0;
    if (maintnant - creation > 7 * 24 * 3600) {
      return json({ paye: false, message: 'La fenêtre de téléchargement de 7 jours est expirée.' });
    }

    const jeton = creerJeton(`${sessionId}:telechargement`, secretJeton);
    return json({ paye: true, jeton });
  } catch (e) {
    return json({ erreur: 'Échec de vérification du paiement.', details: String(e).slice(0, 200) }, 502);
  }
};
