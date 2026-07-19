export type ReportWindowInput = Readonly<{
  type: 'HPM1' | 'HMM1' | 'HJM1';
  reportYear: number;
  todayBerlin: string;
  periodFromMonth?: number;
  periodToMonth?: number;
}>;

export type ReportWindowResult =
  | { allowed: true }
  | { allowed: false; reason: string; requiredUnsupportedType?: 'HNM1' };

function parseBerlinDate(value: string): Date {
  const iso = value.length === 10 ? `${value}T00:00:00.000Z` : value;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    throw new Error(`invalid Berlin date: ${value}`);
  }
  return d;
}

function compareYmd(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

export function evaluateReportWindow(input: ReportWindowInput): ReportWindowResult {
  const today = parseBerlinDate(input.todayBerlin);
  const y = today.getUTCFullYear();
  const todayStr = input.todayBerlin.slice(0, 10);

  if (input.type === 'HPM1') {
    if (input.reportYear !== y + 1) {
      return { allowed: false, reason: 'HPM1 ne concerne que l’année civile suivante' };
    }
    if (compareYmd(todayStr, `${y}-12-31`) > 0) {
      return { allowed: false, reason: 'HPM1 n’est exportable que jusqu’au 31 décembre' };
    }
    return { allowed: true };
  }

  if (input.type === 'HJM1') {
    if (input.reportYear !== y - 1) {
      return { allowed: false, reason: 'HJM1 ne concerne que l’année civile précédente' };
    }
    if (compareYmd(todayStr, `${y}-05-15`) > 0) {
      return {
        allowed: false,
        reason: 'HJM1 n’est exportable que jusqu’au 15 mai',
        requiredUnsupportedType: 'HNM1'
      };
    }
    return { allowed: true };
  }

  if (input.type === 'HMM1') {
    if (input.reportYear !== y) {
      return { allowed: false, reason: 'HMM1 ne concerne que l’année civile courante' };
    }
    const from = input.periodFromMonth ?? 1;
    const to = input.periodToMonth ?? 12;
    if (from < 1 || to > 12 || from > to) {
      return { allowed: false, reason: 'Période HMM1 invalide' };
    }
    return { allowed: true };
  }

  return { allowed: false, reason: 'Type de déclaration non pris en charge' };
}

export function canonicalizeReportPeriod(input: {
  reportYear: number;
  periodFromMonth: number;
  periodToMonth: number;
}): { periodFrom: string; periodTo: string } {
  const { reportYear, periodFromMonth, periodToMonth } = input;
  if (periodFromMonth < 1 || periodFromMonth > 12 || periodToMonth < 1 || periodToMonth > 12) {
    throw new Error('month out of range');
  }
  if (periodFromMonth > periodToMonth) {
    throw new Error('periodFromMonth must not exceed periodToMonth');
  }
  const periodFrom = `${reportYear}-${pad2(periodFromMonth)}-01`;
  const periodTo = `${reportYear}-${pad2(periodToMonth)}-${lastDayOfMonth(reportYear, periodToMonth)}`;
  return { periodFrom, periodTo };
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function lastDayOfMonth(year: number, month: number): string {
  const next = new Date(Date.UTC(year, month, 1));
  next.setUTCDate(0);
  return pad2(next.getUTCDate());
}
