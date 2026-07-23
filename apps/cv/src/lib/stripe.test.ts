import { afterEach, describe, expect, it, vi } from 'vitest';
import { appelerStripe, construireCorpsSession } from '@/lib/stripe';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('construireCorpsSession', () => {
  it('génère les paramètres pour une session Checkout à 2,99 €', () => {
    const params = construireCorpsSession('https://site.fr/succes', 'https://site.fr/annulation');
    expect(params.get('mode')).toBe('payment');
    expect(params.get('line_items[0][price_data][unit_amount]')).toBe('299');
    expect(params.get('line_items[0][price_data][currency]')).toBe('eur');
    expect(params.get('success_url')).toBe('https://site.fr/succes');
    expect(params.get('cancel_url')).toBe('https://site.fr/annulation');
  });
});

describe('appelerStripe', () => {
  it('envoie la requête avec l’authentification Basic', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string, init: RequestInit) => {
        expect(url).toContain('api.stripe.com/v1/checkout/sessions');
        expect(init.method).toBe('POST');
        expect(init.headers).toHaveProperty('Authorization');
        expect((init.headers as Record<string, string>)['Authorization']).toMatch(/^Basic /);
        return new Response(JSON.stringify({ id: 'cs_test_123', url: 'https://checkout.stripe.com/pay/cs_test_123' }), {
          status: 200
        });
      })
    );
    const corps = new URLSearchParams({ mode: 'payment', 'line_items[0][quantity]': '1' });
    const resultat = await appelerStripe('POST', '/checkout/sessions', corps, 'sk_test_xxx');
    expect((resultat as Record<string, unknown>).id).toBe('cs_test_123');
  });

  it('lève une erreur sur un code HTTP d’échec', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('UNAUTHORIZED', { status: 401 })));
    await expect(appelerStripe('GET', '/anything', null, 'sk_test_bad')).rejects.toThrow('Stripe 401');
  });
});
