import { REFERENCE_SET_VERSION } from '../regulatory/reference-set';
import type { ExportDecision, ExportPolicyInput } from './types';

function daysBetween(from: string, to: string): number {
  const a = Date.parse(`${from}T00:00:00Z`);
  const b = Date.parse(`${to}T00:00:00Z`);
  if (Number.isNaN(a) || Number.isNaN(b)) {
    throw new DomainError('INVALID_DATE', `${from} / ${to}`);
  }
  return Math.round((b - a) / 86_400_000);
}

export function evaluateExportPolicy(input: ExportPolicyInput): ExportDecision {
  if (!['HPM1', 'HMM1', 'HJM1'].includes(input.reportType)) {
    return { status: 'blocked', reason: 'UNSUPPORTED_REPORT' };
  }
  if (input.referenceSetVersion !== REFERENCE_SET_VERSION) {
    return { status: 'blocked', reason: 'REVIEW_REQUIRED' };
  }
  const age = daysBetween(input.referenceRetrievedAt, input.trustedTodayBerlin);
  if (age > input.maxAgeDays || age < 0) {
    return { status: 'blocked', reason: 'STALE_REFERENCE' };
  }
  return { status: 'allowed', fresh: age <= input.maxAgeDays };
}

export class DomainError extends Error {
  code: string;
  constructor(code: string, message?: string) {
    super(message ?? code);
    this.name = 'DomainError';
    this.code = code;
  }
}
