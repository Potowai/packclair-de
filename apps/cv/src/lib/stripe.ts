/**
 * Utilitaires Stripe — appels REST sans dépendance npm.
 * PLAN §3 : paiement unique 2,99 €, sans abonnement.
 */

const STRIPE_API = 'https://api.stripe.com/v1';

export function construireCorpsSession(
  urlSucces: string,
  urlAnnulation: string
): URLSearchParams {
  return new URLSearchParams({
    mode: 'payment',
    success_url: urlSucces,
    cancel_url: urlAnnulation,
    'line_items[0][price_data][currency]': 'eur',
    'line_items[0][price_data][unit_amount]': '299',
    'line_items[0][price_data][product_data][name]': 'Téléchargement PDF CVClair',
    'line_items[0][price_data][product_data][description]':
      'CV français ATS, PDF haute qualité, re-téléchargements 7 jours.',
    'line_items[0][quantity]': '1'
  });
}

export async function appelerStripe(
  methode: 'GET' | 'POST',
  chemin: string,
  corps: URLSearchParams | null,
  cle: string
): Promise<unknown> {
  const reponse = await fetch(`${STRIPE_API}${chemin}`, {
    method: methode,
    headers: {
      Authorization: `Basic ${btoa(`${cle}:`)}`,
      ...(corps ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {})
    },
    body: corps?.toString() ?? null,
    signal: AbortSignal.timeout(15_000)
  });
  if (!reponse.ok) {
    const detail = await reponse.text().catch(() => '');
    throw new Error(`Stripe ${reponse.status}: ${detail.slice(0, 200)}`);
  }
  return reponse.json();
}
