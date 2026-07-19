import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { decodeBytes, hashBytes } from './decode';
import { previewCsv, normalizeBatch, escapeSpreadsheetCell, normalizeDate } from './normalize';
import { detectOverlap, buildCompositeKeys } from './overlap';
import { createSummaryCsv } from '../export/safe-csv';
import type { CsvMapping, ImportBatch } from './types';
import { ImportError } from './decode';

const fx = (name: string) => readFileSync(resolve(import.meta.dirname, '__fixtures__', name));

function mapping(): CsvMapping {
  return {
    sourceKey: 'etsy',
    accountKey: 'shop-a',
    orderId: 'order_id',
    lineId: 'line_id',
    orderDate: 'order_date',
    country: 'country',
    sku: 'sku',
    quantity: 'quantity',
    status: 'status',
    includedStatuses: ['paid'],
    dateFormat: 'YYYY-MM-DD',
    defaultOneParcelPerOrder: true
  };
}

describe('décodage CSV', () => {
  it('décode UTF-8 avec BOM', () => {
    const bytes = new Uint8Array([0xef, 0xbb, 0xbf, ...new TextEncoder().encode('a,b\n1,2')]);
    const r = decodeBytes(bytes);
    expect(r.encoding).toBe('utf-8');
    expect(r.requiresConfirmation).toBe(false);
  });

  it('décode UTF-16LE', () => {
    const r = decodeBytes(new Uint8Array(fx('orders-utf16le.csv')));
    expect(r.encoding).toBe('utf-16le');
    expect(r.text).toContain('order_id');
  });

  it('décode UTF-16BE', () => {
    const r = decodeBytes(new Uint8Array(fx('orders-utf16be.csv')));
    expect(r.encoding).toBe('utf-16be');
    expect(r.text).toContain('order_id');
  });

  it('signale l’encodage Windows-1252 non confirmé', () => {
    const r = decodeBytes(new Uint8Array(fx('orders-win1252.csv')));
    expect(r.requiresConfirmation).toBe(true);
  });

  it('décode Windows-1252 après confirmation', () => {
    const r = decodeBytes(new Uint8Array(fx('orders-win1252.csv')), {
      assumeEncoding: 'windows-1252'
    });
    expect(r.encoding).toBe('windows-1252');
    expect(r.text).toContain('order_id');
  });

  it('rejette les fichiers trop volumineux', () => {
    const big = new Uint8Array(25 * 1024 * 1024 + 1);
    expect(() => decodeBytes(big)).toThrowError(ImportError);
  });
});

describe('normalisation CSV', () => {
  it('détecte le délimiteur point-virgule', () => {
    const text = 'a;b\n1;2';
    const preview = previewCsv(text);
    expect(preview.delimiter).toBe(';');
  });

  it('limite l’aperçu à dix lignes', () => {
    const rows = Array.from({ length: 20 }, (_, i) => `o${i},s${i},1,2026-01-01,DE`).join('\n');
    const text = `order_id,sku,quantity,order_date,country\n${rows}`;
    const preview = previewCsv(text);
    expect(preview.rows.length).toBe(10);
    expect(preview.totalRows).toBe(20);
  });

  it('rejette une date ambiguë sans format', () => {
    expect(() => normalizeDate('01/02/2026', 'YYYY-MM-DD')).toThrowError(ImportError);
  });

  it('normalise DD/MM/YYYY', () => {
    expect(normalizeDate('12/03/2026', 'DD/MM/YYYY')).toBe('2026-03-12');
  });

  it('normalise l’Allemagne et exclut les autres pays', () => {
    const norm = (raw: string) =>
      normalizeBatch(fixtureText(), mapping(), previewCsv(fixtureText())).lines.find(
        (l) => l.orderId === raw
      )?.country;
    // build a fixture with mixed countries
    const text = [
      'order_id,line_id,sku,quantity,order_date,country,status',
      'A,1,MUG,1,2026-01-01,DE,paid',
      'B,2,MUG,1,2026-01-01,Germany,paid',
      'C,3,MUG,1,2026-01-01,France,paid'
    ].join('\n');
    const batch = normalizeBatch(text, mapping(), previewCsv(text));
    expect(batch.lines[0]!.country).toBe('DE');
    expect(batch.lines[1]!.country).toBe('DE');
    expect(batch.lines[2]!.country).toBe('EXCLUDED');
    void norm;
  });

  it('préserve le SKU avec zéros initiaux', () => {
    const text = 'order_id,line_id,sku,quantity,order_date,country,status\nA,1,00042,1,2026-01-01,DE,paid';
    const batch = normalizeBatch(text, mapping(), previewCsv(text));
    expect(batch.lines[0]!.sku).toBe('00042');
  });

  it('calcule un aperçu et une normalisation cohérents', () => {
    const text = fx('orders-utf8.csv').toString('utf-8');
    const preview = previewCsv(text);
    expect(preview.headers).toContain('order_id');
    const batch = normalizeBatch(text, mapping(), preview);
    expect(batch.lines.length).toBe(3);
    expect(batch.excludedLineCount).toBe(0);
  });
});

describe('chevauchement et sécurité', () => {
  it('détecte un fichier dupliqué par empreinte', async () => {
    const text = fx('orders-utf8.csv').toString('utf-8');
    const batch: ImportBatch = normalizeBatch(text, mapping(), previewCsv(text));
    const h = await batchHash(batch);
    const result = detectOverlap(
      [{ id: 'prev', hash: h, hasStableLineId: true, periodFrom: null, periodTo: null }],
      batch,
      h
    );
    expect(result.decision).toBe('DUPLICATE_FILE');
  });

  it('exige un remplacement sans identifiant de ligne stable', () => {
    const text = 'order_id,sku,quantity,order_date,country\nA,MUG,1,2026-01-01,DE';
    const m = mapping();
    const mNoLine = { ...m, lineId: undefined };
    const batch = normalizeBatch(text, mNoLine, previewCsv(text));
    expect(batch.hasStableLineId).toBe(false);
    const result = detectOverlap([], batch, 'x');
    expect(result.decision).toBe('REPLACE_BATCH_REQUIRED');
    if (result.decision === 'REPLACE_BATCH_REQUIRED') {
      expect(result.reason).toBe('NO_STABLE_LINE_ID');
    }
  });
});

describe('sécurité tableur', () => {
  it('neutralise les formules', () => {
    expect(escapeSpreadsheetCell('=1+1')).toBe("'=1+1");
    expect(escapeSpreadsheetCell('+2')).toBe("'+2");
    expect(escapeSpreadsheetCell('@SUM')).toBe("'@SUM");
    expect(escapeSpreadsheetCell('ok')).toBe('ok');
  });

  it('neutrise le CSV de synthèse', () => {
    const batch: ImportBatch = {
      id: 'b1', sourceKey: '=evil', accountKey: 'a', fileNameHash: '',
      createdAt: '', retainedColumns: [], periodFrom: null, periodTo: null,
      lines: [
        { sourceKey: '=evil', accountKey: 'a', orderId: 'A', lineId: '1', shipmentId: null, parcelCount: null, shippingProfile: null, orderDate: '2026-01-01', country: 'DE', sku: 'X', quantity: 1, status: null, included: true }
      ],
      excludedLineCount: 0,
      hasStableLineId: true
    };
    const csv = createSummaryCsv(batch);
    expect(csv).toContain("'=evil");
  });
});

async function batchHash(b: ImportBatch): Promise<string> {
  const keys = buildCompositeKeys(b).sort().join('|') + b.createdAt;
  return hashBytes(new TextEncoder().encode(keys));
}

function fixtureText(): string {
  return fx('orders-utf8.csv').toString('utf-8');
}
