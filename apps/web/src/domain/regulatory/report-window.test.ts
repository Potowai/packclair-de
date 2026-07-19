import { describe, expect, it } from 'vitest';
import {
  evaluateReportWindow,
  canonicalizeReportPeriod
} from './report-window';

describe('fenêtres de déclaration LUCID', () => {
  const fullYear = { periodFromMonth: 1, periodToMonth: 12 };

  it('HPM1 autorisé pour l’année suivante avant le 31 décembre', () => {
    expect(
      evaluateReportWindow({ type: 'HPM1', reportYear: 2027, todayBerlin: '2026-12-31', ...fullYear })
        .allowed
    ).toBe(true);
  });

  it('HPM1 refusé pour une autre année', () => {
    expect(
      evaluateReportWindow({ type: 'HPM1', reportYear: 2026, todayBerlin: '2026-12-31', ...fullYear })
        .allowed
    ).toBe(false);
  });

  it('HJM1 autorisé jusqu’au 15 mai de l’année suivante', () => {
    expect(
      evaluateReportWindow({ type: 'HJM1', reportYear: 2025, todayBerlin: '2026-05-15', ...fullYear })
        .allowed
    ).toBe(true);
  });

  it('HJM1 après le 15 mai signale HNM1 non pris en charge', () => {
    const result = evaluateReportWindow({
      type: 'HJM1',
      reportYear: 2025,
      todayBerlin: '2026-05-16',
      ...fullYear
    });
    expect(result).toMatchObject({ allowed: false, requiredUnsupportedType: 'HNM1' });
  });

  it('HMM1 autorisé dans l’année courante', () => {
    expect(
      evaluateReportWindow({
        type: 'HMM1',
        reportYear: 2026,
        periodFromMonth: 4,
        periodToMonth: 6,
        todayBerlin: '2026-07-12'
      }).allowed
    ).toBe(true);
  });

  it('canonicalise la période au premier et dernier jour', () => {
    expect(canonicalizeReportPeriod({ reportYear: 2028, periodFromMonth: 2, periodToMonth: 2 })).toEqual({
      periodFrom: '2028-02-01',
      periodTo: '2028-02-29'
    });
  });

  it('canonicalise une période plurimensuelle', () => {
    expect(canonicalizeReportPeriod({ reportYear: 2026, periodFromMonth: 4, periodToMonth: 6 })).toEqual({
      periodFrom: '2026-04-01',
      periodTo: '2026-06-30'
    });
  });
});
