import type { MaterialCode } from '../regulatory/materials';
import { MATERIAL_CODES } from '../regulatory/materials';
import type { ReportType } from '../regulatory/report-types';
import { REFERENCE_SET_VERSION } from '../regulatory/reference-set';
import { isKnownOperator } from '../regulatory/operators';
import { roundSuggestionToGrams } from './mass';
import type {
  CalculationSnapshot,
  DeclarationBlocker,
  MotivatedDifference,
  ReadyDeclaration,
  Reconciliation
} from './types';

const CONFIRMED_PATTERN = /^\d{1,15},\d{3}$/;

export function parseConfirmedGrams(value: string): bigint | null {
  if (!CONFIRMED_PATTERN.test(value)) return null;
  const [intPart, decPart] = value.split(',');
  const grams = BigInt(intPart!) * 1000n + BigInt(decPart!);
  return grams;
}

export function formatGrams(g: bigint): string {
  const neg = g < 0n;
  const abs = neg ? -g : g;
  const intPart = abs / 1000n;
  const decPart = abs % 1000n;
  const str = `${intPart.toString()},${decPart.toString().padStart(3, '0')}`;
  return neg ? `-${str}` : str;
}

export type ReconcileInput = Readonly<{
  snapshot: CalculationSnapshot;
  type: ReportType;
  reportYear: number;
  periodFrom: string;
  periodTo: string;
  operatorId: string;
  operatorConfirmedAt: string;
  confirmedGrams: Readonly<Partial<Record<MaterialCode, string>>>;
  reasons?: Readonly<Partial<Record<MaterialCode, string>>>;
}>;

export function reconcileConfirmedTotals(input: ReconcileInput): Reconciliation {
  const blockers: DeclarationBlocker[] = [];
  const motivatedDifferences: MotivatedDifference[] = [];
  const confirmedOut: Partial<Record<MaterialCode, bigint>> = {};

  const total = roundSuggestionToGrams(collectTotal(input.snapshot.calculatedMg));

  for (const code of MATERIAL_CODES) {
    const raw = input.confirmedGrams[code];
    if (raw === undefined || raw === null || raw === '') continue;
    const parsed = parseConfirmedGrams(raw);
    if (parsed === null) {
      blockers.push({
        code: 'INVALID_CONFIRMED_FORMAT',
        detail: `matériau ${code}: ${raw}`,
        material: code
      });
      continue;
    }
    if (parsed < 0n) {
      blockers.push({ code: 'NEGATIVE_MASS', detail: `matériau ${code}`, material: code });
      continue;
    }
    const suggested = roundSuggestionToGrams(input.snapshot.calculatedMg[code] ?? 0n);
    confirmedOut[code] = parsed;
    if (parsed !== suggested) {
      const reason = input.reasons?.[code];
      if (!reason || reason.trim().length === 0) {
        blockers.push({
          code: 'UNMOTIVATED_DIFFERENCE',
          detail: `matériau ${code}: suggéré ${formatGrams(suggested)} confirmé ${formatGrams(parsed)}`,
          material: code
        });
      } else {
        motivatedDifferences.push({
          material: code,
          suggestedGrams: suggested,
          confirmedGrams: parsed,
          reason
        });
      }
    }
  }

  if (!input.operatorId || !isKnownOperator(input.operatorId)) {
    blockers.push({ code: 'NO_OPERATOR', detail: input.operatorId ?? '' });
  }

  const hasNonZero = Object.values(confirmedOut).some((v) => (v ?? 0n) > 0n);
  if (!hasNonZero) {
    blockers.push({ code: 'NO_NONZERO_MATERIAL', detail: 'all confirmed masses zero' });
  }

  if (blockers.length > 0) {
    return { ok: false, blockers };
  }

  const value: ReadyDeclaration = {
    type: input.type,
    reportYear: input.reportYear,
    periodFrom: input.periodFrom,
    periodTo: input.periodTo,
    operatorId: input.operatorId,
    operatorConfirmedAt: input.operatorConfirmedAt,
    confirmedGrams: confirmedOut,
    referenceSetVersion: REFERENCE_SET_VERSION,
    motivatedDifferences
  };
  return { ok: true, value };
}

function collectTotal(m: CalculationSnapshot['calculatedMg']): bigint {
  let sum = 0n;
  for (const code of MATERIAL_CODES) sum += m[code] ?? 0n;
  return sum;
}
