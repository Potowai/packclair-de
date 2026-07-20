import { useMemo, useState } from 'react';
import { referralStore } from '@/app/referral';
import { exportLeadsCsv } from '@/domain/referral/referral';
import { BrowserDownloadGateway } from '@/app/ports/download-gateway';

function shareUrl(code: string): string {
  if (typeof location === 'undefined') return `?ref=${code}`;
  const base = (import.meta.env.BASE_URL as string) || '/';
  const path = base.replace(/\/$/, '') + '/app/';
  return `${location.origin}${path}?ref=${code}`;
}

export function ReferralPanel() {
  const [state, setState] = useState(() => referralStore.load());
  const gateway = useMemo(() => new BrowserDownloadGateway(), []);

  const code = state.ownCode ?? '—';
  const url = shareUrl(code);
  const conversions = state.conversions;
  const referrer = state.attributedReferrer;

  function refresh() {
    setState(referralStore.load());
  }

  function copyLink() {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      void navigator.clipboard.writeText(url);
    }
  }

  function downloadLeads() {
    const csv = exportLeadsCsv(referralStore.load());
    void gateway.downloadText('packclair-leads.csv', csv, 'text/csv');
    refresh();
  }

  function requestQuote() {
    const body =
      `Bonjour PackClair,%0D%0A%0D%0A` +
      `Je utilise PackClair DE pour mes déclarations LUCID.%0D%0A` +
      `Mon code parrain : ${code}%0D%0A` +
      `Déclarations réalisées : ${conversions}%0D%0A` +
      (referrer ? `Parrainé par : ${referrer}%0D%0A` : '');
    const href = `mailto:contact@packclair.example?subject=Demande%20devis%20PackClair&body=${body}`;
    if (typeof location !== 'undefined') location.href = href;
  }

  return (
    <section aria-labelledby="ref-heading" className="referral-panel">
      <h2 id="ref-heading">Parrainage & acquisition</h2>
      <p>Votre outil fonctionne en local. Partagez-le pour développer votre réseau LUCID.</p>

      <dl>
        <dt>Votre code parrain</dt>
        <dd>{code}</dd>
        <dt>Lien de parrainage</dt>
        <dd>
          <code>{url}</code>{' '}
          <button type="button" onClick={copyLink}>
            Copier
          </button>
        </dd>
        <dt>Déclarations créditées à votre parrain</dt>
        <dd>{conversions}</dd>
        {referrer && (
          <>
            <dt>Parrainé par</dt>
            <dd>{referrer}</dd>
          </>
        )}
      </dl>

      <button type="button" onClick={downloadLeads}>
        Exporter le rapport de leads (CSV)
      </button>{' '}
      <button type="button" onClick={requestQuote}>
        Demander un devis / accompagnement
      </button>
    </section>
  );
}
