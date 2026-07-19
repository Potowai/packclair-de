import { describe, expect, it } from 'vitest';
import { createSummaryCsv } from './safe-csv';
import type { ImportBatch } from '../import/types';

function makeBatch(lineValues: string[][]): ImportBatch {
  return {
    id: 'b1',
    sourceKey: 'etsy',
    accountKey: 'shop-a',
    fileNameHash: '',
    createdAt: '2026-07-12T00:00:00.000Z',
    retainedColumns: ['order_id', 'sku'],
    periodFrom: null,
    periodTo: null,
    excludedLineCount: 0,
    hasStableLineId: true,
    lines: lineValues.map(([orderId, lineId, sku, qty, included], idx) => ({
      sourceKey: 'etsy',
      accountKey: 'shop-a',
      orderId: orderId as string,
      lineId: lineId as string,
      shipmentId: null,
      parcelCount: null,
      shippingProfile: null,
      orderDate: '2026-01-01',
      country: 'DE',
      sku: sku as string,
      quantity: Number(qty),
      status: null,
      included: included === 'true'
    }))
  };
}

describe('CSV de synthèse sûr', () => {
  it('neutralise les formules dans les cellules', () => {
    const batch = makeBatch([['=A1', '1', '=cmd', '1', 'true']]);
    const csv = createSummaryCsv(batch);
    expect(csv).toContain("'=A1");
    expect(csv).toContain("'=cmd");
  });

  it('écrit un en-tête et des lignes', () => {
    const batch = makeBatch([['A', '1', 'MUG', '2', 'true']]);
    const csv = createSummaryCsv(batch);
    const rows = csv.split('\n');
    expect(rows[0]).toBe('sourceKey,accountKey,orderId,lineId,sku,quantity,included');
    expect(rows[1]).toBe('etsy,shop-a,A,1,MUG,2,true');
  });
});
