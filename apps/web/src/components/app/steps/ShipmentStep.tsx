import type { Dispatch } from 'react';
import type { AppAction, AppState } from '../app-reducer';

export function ShipmentStep({ state, dispatch }: { state: AppState; dispatch: Dispatch<AppAction> }) {
  const hasShipments = state.importBatch?.lines.some((l) => l.shipmentId !== null) ?? false;
  return (
    <section aria-labelledby="ship-heading">
      <h2 id="ship-heading">4. Colis</h2>
      {hasShipments ? (
        <p>Identifiants de colis détectés.</p>
      ) : (
        <p>Aucun identifiant de colis : attestez un colis unique par commande.</p>
      )}
      <button type="button" onClick={() => dispatch({ type: 'BACK' })}>
        Retour
      </button>
      <button type="button" onClick={() => dispatch({ type: 'ATTEST_MONO_PARCEL', profileRevisionId: 'shipment:mono', attestedAt: new Date().toISOString().slice(0, 10) })}>
        {hasShipments ? 'Continuer' : 'Attester un colis par commande'}
      </button>
    </section>
  );
}
