import type { Dispatch } from 'react';
import type { AppAction, AppState } from '../app-reducer';

export function ProfileStep({ state, dispatch }: { state: AppState; dispatch: Dispatch<AppAction> }) {
  const skus = new Set(state.importBatch?.lines.map((l) => l.sku) ?? []);
  return (
    <section aria-labelledby="prof-heading">
      <h2 id="prof-heading">3. Profils d’emballage</h2>
      <p>SKU détectés : {[...skus].join(', ') || 'aucun'}</p>
      <p>Créez ou attachez un profil de masse par SKU et par colis.</p>
      <button type="button" onClick={() => dispatch({ type: 'BACK' })}>
        Retour
      </button>
      <button type="button" onClick={() => dispatch({ type: 'SET_PROFILES_DONE' })}>
        Profils prêts
      </button>
    </section>
  );
}
