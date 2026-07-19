import { useState, type Dispatch } from 'react';
import type { AppAction, AppState } from '../app-reducer';
import type { DomainWorkerApi } from '../../../app/ports/domain-worker';
import { REFERENCE_SET_VERSION } from '../../../domain/regulatory/reference-set';

export function ImportStep({
  state,
  dispatch,
  domainWorker
}: {
  state: AppState;
  dispatch: Dispatch<AppAction>;
  domainWorker: DomainWorkerApi;
}) {
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function onFile(file: File) {
    setError(null);
    setFileName(file.name);
    try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const decoded = await domainWorker.decode(bytes, { assumeEncoding: 'windows-1252' });
    const preview = await domainWorker.previewCsv(decoded.text);
    const mapping = state.mapping ?? {
      sourceKey: 'etsy',
      accountKey: 'shop-a',
      orderId: preview.headers[0] ?? 'order_id',
      lineId: preview.headers.includes('line_id') ? 'line_id' : undefined,
      shipmentId: preview.headers.includes('shipment_id') ? 'shipment_id' : undefined,
      orderDate: preview.headers.find((h: string) => h.toLowerCase().includes('date')) ?? 'order_date',
      country: preview.headers.find((h: string) => h.toLowerCase().includes('country')) ?? 'country',
      sku: preview.headers.find((h: string) => h.toLowerCase().includes('sku')) ?? 'sku',
      quantity: preview.headers.find((h: string) => h.toLowerCase().includes('quantity')) ?? 'quantity',
      status: preview.headers.includes('status') ? 'status' : undefined,
      includedStatuses: undefined,
      dateFormat: 'YYYY-MM-DD' as const,
      defaultOneParcelPerOrder: true
    };
    const batch = await domainWorker.normalizeBatch(decoded.text, mapping, preview);
    dispatch({ type: 'IMPORT_BATCH', batch, mapping });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      throw e;
    }
  }

  return (
    <section aria-labelledby="imp-heading">
      <h2 id="imp-heading">2. Importer vos commandes</h2>
      <p>{state.importBatch ? 'Commandes importées.' : 'Aucune commande importée.'}</p>
      <input
        type="file"
        aria-label="Fichier CSV de commandes"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void onFile(f);
        }}
      />
      {fileName && <p>Fichier : {fileName}</p>}
      {error && (
        <p role="alert" aria-describedby="imp-heading">
          {error}
        </p>
      )}
      <button type="button" onClick={() => dispatch({ type: 'BACK' })}>
        Retour
      </button>
      {state.importBatch && (
        <button type="button" onClick={() => dispatch({ type: 'GO_TO', step: 'profiles' })}>
          Continuer
        </button>
      )}
      <p className="reference-version">Référentiel : {REFERENCE_SET_VERSION}</p>
    </section>
  );
}
