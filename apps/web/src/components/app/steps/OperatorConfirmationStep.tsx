import { useState, type Dispatch } from 'react';
import type { AppAction, AppState } from '../app-reducer';
import type { DomainWorkerApi } from '../../../app/ports/domain-worker';
import { SYSTEM_OPERATORS } from '../../../domain/regulatory/operators';
import { MATERIAL_CODES, type MaterialCode } from '../../../domain/regulatory/materials';

function canonicalPeriod(state: AppState): { from: string; to: string } {
  const ctx = state.reportContext!;
  const from = new Date(ctx.reportYear, ctx.periodFromMonth - 1, 1);
  const to = new Date(ctx.reportYear, ctx.periodToMonth, 0);
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  return { from: iso(from), to: iso(to) };
}

export function OperatorConfirmationStep({
  state,
  dispatch,
  domainWorker
}: {
  state: AppState;
  dispatch: Dispatch<AppAction>;
  domainWorker: DomainWorkerApi;
}) {
  const [operator, setOperator] = useState(state.operatorId ?? SYSTEM_OPERATORS[0]!.id);
  const [errors, setErrors] = useState<string[]>([]);
  const suggested = state.snapshot?.calculatedMg;

  async function reconcile() {
    if (!state.snapshot || !state.reportContext) return;
    const { from, to } = canonicalPeriod(state);
    const result = await domainWorker.reconcileConfirmedTotals({
      snapshot: state.snapshot,
      type: state.reportContext.type,
      reportYear: state.reportContext.reportYear,
      periodFrom: from,
      periodTo: to,
      operatorId: operator,
      operatorConfirmedAt: new Date().toISOString().slice(0, 10),
      confirmedGrams: state.confirmedGrams,
      reasons: state.reasons
    });
    if (result.ok) {
      setErrors([]);
      dispatch({ type: 'SET_OPERATOR', operatorId: operator });
      dispatch({ type: 'RECONCILED', declaration: result.value });
    } else {
      setErrors(result.blockers.map((b) => b.detail));
      dispatch({ type: 'SET_ERRORS', errors: result.blockers.map((b) => b.detail) });
    }
  }

  return (
    <section aria-labelledby="op-heading">
      <h2 id="op-heading">6. Confirmation opérateur</h2>
      <label>
        Opérateur
        <select value={operator} onChange={(e) => setOperator(e.target.value)}>
          {SYSTEM_OPERATORS.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </select>
      </label>
      {suggested && (
        <ul aria-label="masses confirmées">
          {MATERIAL_CODES.filter((c) => (suggested[c] ?? 0n) > 0n).map((c) => (
            <li key={c}>
              <label>
                {c} (g)
                <input
                  aria-label={`masse confirmée ${c}`}
                  value={state.confirmedGrams[c as MaterialCode] ?? ''}
                  onChange={(e) =>
                    dispatch({ type: 'SET_CONFIRMED', code: c as MaterialCode, value: e.target.value })
                  }
                />
              </label>
              <label>
                Motif d’écart
                <input
                  aria-label={`motif ${c}`}
                  value={state.reasons[c as MaterialCode] ?? ''}
                  onChange={(e) =>
                    dispatch({ type: 'SET_REASON', code: c as MaterialCode, reason: e.target.value })
                  }
                />
              </label>
            </li>
          ))}
        </ul>
      )}
      {errors.length > 0 && (
        <ul role="alert">
          {errors.map((e, i) => (
            <li key={i}>{e}</li>
          ))}
        </ul>
      )}
      <button type="button" onClick={() => dispatch({ type: 'BACK' })}>
        Retour
      </button>
      <button type="button" onClick={() => void reconcile()}>
        Réconcilier
      </button>
    </section>
  );
}
