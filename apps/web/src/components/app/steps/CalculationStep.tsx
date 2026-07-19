import { useState, type Dispatch } from 'react';
import type { AppAction, AppState } from '../app-reducer';
import type { DomainWorkerApi } from '../../../app/ports/domain-worker';
import { REFERENCE_SET_VERSION } from '../../../domain/regulatory/reference-set';
import { MATERIAL_CODES, type MaterialCode } from '../../../domain/regulatory/materials';
import type { PackagingProfileRevision, MaterialMasses } from '../../../domain/calculation/types';

function gramsToMg(value: string | undefined): bigint {
  if (!value) return 0n;
  const normalized = value.trim().replace(',', '.');
  const num = Number(normalized);
  if (!Number.isFinite(num) || num < 0) return 0n;
  return BigInt(Math.round(num * 1000));
}

function profileToRevision(p: AppState['profiles'][number]): PackagingProfileRevision {
  const massesMg = Object.fromEntries(MATERIAL_CODES.map((c) => [c, 0n])) as Record<MaterialCode, bigint>;
  for (const code of MATERIAL_CODES) {
    massesMg[code] = gramsToMg(p.masses[code]);
  }
  return {
    id: p.id,
    logicalId: p.kind === 'product' ? (p.sku ?? p.id) : p.id,
    revision: 1,
    kind: p.kind,
    sku: p.kind === 'product' ? (p.sku ?? null) : null,
    massesMg: massesMg as MaterialMasses
  };
}

export function CalculationStep({
  state,
  dispatch,
  domainWorker
}: {
  state: AppState;
  dispatch: Dispatch<AppAction>;
  domainWorker: DomainWorkerApi;
}) {
  const [busy, setBusy] = useState(false);

  async function calculate() {
    if (!state.importBatch || !state.reportContext) return;
    setBusy(true);
    try {
      const snapshot = await domainWorker.calculatePackaging({
        sourceKey: state.importBatch.sourceKey,
        accountKey: state.importBatch.accountKey,
        batchIds: [state.importBatch.id],
        createdAt: new Date().toISOString(),
        trustedDateBerlin: new Date().toISOString().slice(0, 10),
        profileRevisions: state.profiles.map(profileToRevision),
        monoParcelAttestation: state.monoParcelAttestation
          ? {
              batchId: state.importBatch.id,
              acceptedAt: state.monoParcelAttestation.attestedAt,
              profileRevisionId: state.monoParcelAttestation.profileRevisionId
            }
          : undefined,
        lines: state.importBatch.lines.map((l) => ({
          orderId: l.orderId,
          lineId: l.lineId || undefined,
          shipmentId: l.shipmentId,
          sku: l.sku,
          quantity: BigInt(l.quantity)
        })),
        shipments: []
      });
      dispatch({ type: 'CALCULATED', snapshot });
    } finally {
      setBusy(false);
    }
  }

  const suggested = state.snapshot?.calculatedMg;
  return (
    <section aria-labelledby="calc-heading">
      <h2 id="calc-heading">5. Calcul</h2>
      <p>Référentiel : {REFERENCE_SET_VERSION}</p>
      {suggested ? (
        <ul aria-label="masses suggérées">
          {MATERIAL_CODES.filter((c) => (suggested[c] ?? 0n) > 0n).map((c) => (
            <li key={c}>
              {c} : {(Number(suggested[c]) / 1000).toLocaleString('fr-FR')} g
            </li>
          ))}
        </ul>
      ) : (
        <p>Aucun calcul encore effectué.</p>
      )}
      <button type="button" onClick={() => dispatch({ type: 'BACK' })}>
        Retour
      </button>
      <button type="button" onClick={() => void calculate()} disabled={busy}>
        Calculer
      </button>
      {state.snapshot && (
        <button type="button" onClick={() => dispatch({ type: 'GO_TO', step: 'operator' })}>
          Continuer
        </button>
      )}
    </section>
  );
}
