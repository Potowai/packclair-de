import type { ImportBatch, OverlapResult } from './types';
import { hashBytes } from './decode';

export function buildCompositeKeys(batch: ImportBatch): string[] {
  return batch.lines.map((l) =>
    [l.sourceKey, l.accountKey, l.orderId, l.lineId].join('/')
  );
}

export function batchHash(batch: ImportBatch): Promise<string> {
  const payload = buildCompositeKeys(batch).sort().join('|') + batch.createdAt;
  return hashBytes(new TextEncoder().encode(payload));
}

export function detectOverlap(
  existing: readonly { id: string; hash: string; hasStableLineId: boolean; periodFrom: string | null; periodTo: string | null }[],
  candidate: ImportBatch,
  candidateHash: string
): OverlapResult {
  for (const e of existing) {
    if (e.hash === candidateHash) {
      return { decision: 'DUPLICATE_FILE', existingBatchId: e.id };
    }
  }

  const candidateKeys = new Set(buildCompositeKeys(candidate));
  void candidateKeys;

  if (!candidateHasStableLineId(candidate)) {
    return { decision: 'REPLACE_BATCH_REQUIRED', reason: 'NO_STABLE_LINE_ID' };
  }

  const overlapping = existing.some(
    (e) =>
      e.periodFrom !== null &&
      e.periodTo !== null &&
      periodsOverlap(e.periodFrom, e.periodTo, candidate.periodFrom, candidate.periodTo)
  );
  if (overlapping) {
    return { decision: 'REPLACE_BATCH_REQUIRED', reason: 'OVERLAPPING_PERIOD' };
  }

  return { decision: 'APPEND_ALLOWED' };
}

function candidateHasStableLineId(batch: ImportBatch): boolean {
  return batch.hasStableLineId;
}

function periodsOverlap(
  aFrom: string,
  aTo: string,
  bFrom: string | null,
  bTo: string | null
): boolean {
  if (bFrom === null || bTo === null) return false;
  return aFrom <= bTo && bFrom <= aTo;
}
