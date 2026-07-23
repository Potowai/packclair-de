import { appelerStripe, construireCorpsSession } from '../../src/lib/stripe';

function json(corps: unknown, statut = 200): Response {
  return new Response(JSON.stringify(corps), {
    status: statut,
    headers: { 'content-type': 'application/json; charset=utf-8' }
  });
}

/**
 * POST /.netlify/functions/creer-session-telechargement
 * Crée une session Stripe Checkout à 2,99 € pour le téléchargement du CV.
 * Retourne { url } vers laquelle rediriger le navigateur.
 */
export default async (req: Request): Promise<Response> => {
  if (req.method !== 'POST') return json({ erreur: 'Méthode non autorisée.' }, 405);

  const cle = process.env.STRIPE_SECRET_KEY;
  if (!cle) {
    return json(
      { erreur: 'Paiement non configuré.', details: 'STRIPE_SECRET_KEY manquant.' },
      503
    );
  }

  const origin = new URL(req.url).origin;
  const corps = construireCorpsSession(
    `${origin}/app/telechargement/?session_id={CHECKOUT_SESSION_ID}`,
    `${origin}/app/apercu/`
  );

  try {
    const session = (await appelerStripe('POST', '/checkout/sessions', corps, cle)) as {
      url?: string;
    };
    if (!session.url) {
      return json({ erreur: 'Stripe n’a pas retourné d’URL.', details: JSON.stringify(session) }, 502);
    }
    return json({ url: session.url });
  } catch (e) {
    return json({ erreur: 'Échec de création de la session de paiement.', details: String(e).slice(0, 200) }, 502);
  }
};
