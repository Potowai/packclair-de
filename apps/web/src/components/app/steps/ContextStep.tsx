import type { Dispatch } from 'react';
import type { AppAction, AppState, ReportContext } from '../app-reducer';
import { SUPPORTED_REPORTS } from '../../../domain/xml/types';

export function ContextStep({ state, dispatch }: { state: AppState; dispatch: Dispatch<AppAction> }) {
  return (
    <section aria-labelledby="ctx-heading">
      <h2 id="ctx-heading">1. Période de déclaration</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const form = new FormData(e.currentTarget);
          const context: ReportContext = {
            type: (form.get('type') as ReportContext['type']) ?? 'HMM1',
            reportYear: Number(form.get('year')),
            periodFromMonth: Number(form.get('from')),
            periodToMonth: Number(form.get('to'))
          };
          dispatch({ type: 'SET_CONTEXT', context });
        }}
      >
        <label>
          Type de rapport
          <select name="type" defaultValue={state.reportContext?.type ?? 'HMM1'}>
            {SUPPORTED_REPORTS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
        <label>
          Année
          <input name="year" type="number" defaultValue={state.reportContext?.reportYear ?? 2026} />
        </label>
        <label>
          Mois début
          <input name="from" type="number" min={1} max={12} defaultValue={state.reportContext?.periodFromMonth ?? 4} />
        </label>
        <label>
          Mois fin
          <input name="to" type="number" min={1} max={12} defaultValue={state.reportContext?.periodToMonth ?? 6} />
        </label>
        <button type="submit">Continuer</button>
      </form>
    </section>
  );
}
