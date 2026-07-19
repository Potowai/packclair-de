import { escapeSpreadsheetCell } from '../import/normalize';
import type { ImportBatch, NormalizedOrderLine } from '../import/types';

export type SummaryCsvRow = Readonly<{
  sourceKey: string;
  accountKey: string;
  orderId: string;
  lineId: string;
  sku: string;
  quantity: number;
  included: boolean;
}>;

export function createSummaryCsv(batch: ImportBatch): string {
  const header = ['sourceKey', 'accountKey', 'orderId', 'lineId', 'sku', 'quantity', 'included'];
  const lines = batch.lines.map((l) =>
    [
      escapeSpreadsheetCell(l.sourceKey),
      escapeSpreadsheetCell(l.accountKey),
      escapeSpreadsheetCell(l.orderId),
      escapeSpreadsheetCell(l.lineId),
      escapeSpreadsheetCell(l.sku),
      String(l.quantity),
      l.included ? 'true' : 'false'
    ].join(',')
  );
  return [header.join(','), ...lines].join('\n');
}
