import { useState, type Dispatch } from 'react';
import type { AppAction, AppState } from '../app-reducer';
import type { DomainWorkerApi } from '../../../app/ports/domain-worker';
import type { DownloadGateway } from '../../../app/ports/download-gateway';
import { referralStore } from '@/app/referral';
import { recordConversion } from '@/domain/referral/referral';

export function ExportStep({
  state,
  dispatch,
  domainWorker,
  download
}: {
  state: AppState;
  dispatch: Dispatch<AppAction>;
  domainWorker: DomainWorkerApi;
  download: DownloadGateway;
}) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function generate() {
    if (!state.declaration) return;
    setBusy(true);
    try {
      const bytes = await domainWorker.serializeLucidXml(state.declaration);
      dispatch({ type: 'XML_READY', bytes });
      const name = `lucid_${state.declaration.type}_${state.declaration.periodFrom}_${state.declaration.periodTo}_${state.declaration.operatorId}.xml`;
      await download.download(name, bytes, 'application/xml');
      referralStore.save(recordConversion(referralStore.load()));
      setDone(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section aria-labelledby="exp-heading">
      <h2 id="exp-heading">7. Export</h2>
      {!state.declaration && <p>Aucune déclaration prête.</p>}
      {state.declaration && (
        <p>
          Déclaration {state.declaration.type} prête pour {state.declaration.operatorId}.
        </p>
      )}
      {done && <p role="status">Fichier XML téléchargé.</p>}
      <button type="button" onClick={() => dispatch({ type: 'BACK' })}>
        Retour
      </button>
      <button type="button" onClick={() => void generate()} disabled={busy || !state.declaration}>
        Générer le XML
      </button>
    </section>
  );
}
