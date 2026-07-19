import { useState, type Dispatch } from 'react';
import type { AppAction, AppState, PackagingProfileDef } from '../app-reducer';
import { MATERIAL_CODES } from '../../../domain/regulatory/materials';

const SHIPMENT_PROFILE_ID = 'shipment:mono';

function emptyMasses(): Partial<Record<string, string>> {
  return Object.fromEntries(MATERIAL_CODES.map((c) => [c, '0']));
}

export function ProfileStep({ state, dispatch }: { state: AppState; dispatch: Dispatch<AppAction> }) {
  const skus = [...new Set(state.importBatch?.lines.map((l) => l.sku) ?? [])];
  const [productMasses, setProductMasses] = useState<Record<string, Partial<Record<string, string>>>>(
    () =>
      Object.fromEntries(
        skus.map((s) => [s, state.profiles.find((p) => p.kind === 'product' && p.sku === s)?.masses ?? emptyMasses()])
      )
  );
  const [shipmentMasses, setShipmentMasses] = useState<Partial<Record<string, string>>>(
    () => state.profiles.find((p) => p.id === SHIPMENT_PROFILE_ID)?.masses ?? emptyMasses()
  );

  function setMass(
    target: Record<string, string> | Partial<Record<string, string>>,
    set: (v: typeof target) => void,
    code: string,
    value: string
  ) {
    set({ ...target, [code]: value });
  }

  function save() {
    const profiles: PackagingProfileDef[] = [
      ...skus.map((sku) => ({
        id: `product:${sku}@1`,
        kind: 'product' as const,
        sku,
        masses: productMasses[sku] ?? emptyMasses()
      })),
      { id: SHIPMENT_PROFILE_ID, kind: 'shipment' as const, masses: shipmentMasses }
    ];
    dispatch({ type: 'SET_PROFILES_DONE', profiles });
  }

  return (
    <section aria-labelledby="prof-heading">
      <h2 id="prof-heading">3. Profils d’emballage</h2>
      <p>Renseignez la masse (en grammes) de chaque matériau par produit et par colis.</p>

      {skus.length === 0 && <p>Aucun SKU détecté dans l’import.</p>}

      {skus.map((sku) => (
        <fieldset key={sku}>
          <legend>Produit {sku}</legend>
          {MATERIAL_CODES.map((c) => (
            <label key={c}>
              {c} (g)
              <input
                inputMode="decimal"
                aria-label={`masse ${c} produit ${sku}`}
                value={productMasses[sku]?.[c] ?? '0'}
                onChange={(e) => setMass(productMasses[sku] ?? emptyMasses(), (v) => setProductMasses({ ...productMasses, [sku]: v }), c, e.target.value)}
              />
            </label>
          ))}
        </fieldset>
      ))}

      <fieldset>
        <legend>Colis (profil par défaut)</legend>
        {MATERIAL_CODES.map((c) => (
          <label key={c}>
            {c} (g)
            <input
              inputMode="decimal"
              aria-label={`masse ${c} colis`}
              value={shipmentMasses[c] ?? '0'}
              onChange={(e) => setShipmentMasses({ ...shipmentMasses, [c]: e.target.value })}
            />
          </label>
        ))}
      </fieldset>

      <button type="button" onClick={() => dispatch({ type: 'BACK' })}>
        Retour
      </button>
      <button type="button" onClick={() => save()}>
        Profils prêts
      </button>
    </section>
  );
}
