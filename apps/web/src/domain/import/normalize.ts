import Papa from 'papaparse';
import type {
  CsvDateFormat,
  CsvDelimiter,
  CsvMapping,
  CsvPreview,
  ImportBatch,
  NormalizedOrderLine
} from './types';
import { ImportError } from './decode';

const MAX_ROWS = 100_000;
const MAX_QUANTITY = 1_000_000;

const COUNTRY_ALIASES: Record<string, string> = {
  de: 'DE',
  germany: 'DE',
  deutschland: 'DE',
  allemagne: 'DE'
};

const FORMULA_PREFIXES = ['=', '+', '-', '@'];

export function detectDelimiter(text: string): CsvDelimiter {
  const sample = text.slice(0, 4096);
  const counts = { ',': 0, ';': 0, '\t': 0 };
  let inQuotes = false;
  for (const ch of sample) {
    if (ch === '"') inQuotes = !inQuotes;
    if (inQuotes) continue;
    if (ch === ',') counts[',']++;
    else if (ch === ';') counts[';']++;
    else if (ch === '\t') counts['\t']++;
  }
  let best: CsvDelimiter = ',';
  let bestCount = -1;
  for (const d of [',', ';', '\t'] as CsvDelimiter[]) {
    if (counts[d] > bestCount) {
      bestCount = counts[d];
      best = d;
    }
  }
  return best;
}

export function previewCsv(
  text: string,
  options: { delimiter?: CsvDelimiter; encoding?: 'windows-1252' } = {}
): CsvPreview {
  const delimiter = options.delimiter ?? detectDelimiter(text);
  const parsed = Papa.parse<Record<string, string>>(text, {
    delimiter,
    skipEmptyLines: true,
    header: true
  });
  const headers = (parsed.meta.fields ?? []) as string[];
  const allRows = parsed.data;
  const totalRows = allRows.length;
  const rows = allRows.slice(0, 10);
  return {
    encoding: (options.encoding ?? 'utf-8') as CsvPreview['encoding'],
    requiresEncodingConfirmation: false,
    delimiter,
    headers,
    rows,
    totalRows,
    retainedColumns: headers
  };
}

function normalizeCountry(raw: string): NormalizedOrderLine['country'] {
  const key = raw.trim().toLowerCase();
  if (COUNTRY_ALIASES[key]) return 'DE';
  if (key === '' || key === 'unknown' || key === 'inconnu') return 'UNKNOWN';
  if (key === 'fr' || key === 'France') return 'EXCLUDED';
  return 'EXCLUDED';
}

export function normalizeDate(raw: string, format: CsvDateFormat): string {
  const cleaned = raw.trim();
  const parts = cleaned.split(/[-/]/);
  if (parts.length !== 3) throw new ImportError('AMBIGUOUS_DATE', cleaned);
  let y: string, m: string, d: string;
  if (format === 'YYYY-MM-DD') {
    [y, m, d] = parts as [string, string, string];
  } else if (format === 'DD/MM/YYYY') {
    [d, m, y] = parts as [string, string, string];
  } else {
    [m, d, y] = parts as [string, string, string];
  }
  const yi = Number(y);
  const mi = Number(m);
  const di = Number(d);
  if (!Number.isInteger(yi) || !Number.isInteger(mi) || !Number.isInteger(di)) {
    throw new ImportError('INVALID_DATE', cleaned);
  }
  if (mi < 1 || mi > 12 || di < 1 || di > 31 || yi < 1900 || yi > 2999) {
    throw new ImportError('INVALID_DATE', cleaned);
  }
  return `${yi}-${String(mi).padStart(2, '0')}-${String(di).padStart(2, '0')}`;
}

function parseQuantity(raw: string): number {
  const cleaned = raw.trim().replace(/\s/g, '').replace(/,/g, '.');
  const n = Number(cleaned);
  if (!Number.isInteger(n) || n < 1 || n > MAX_QUANTITY) {
    throw new ImportError('INVALID_QUANTITY', raw);
  }
  return n;
}

export function normalizeBatch(
  text: string,
  mapping: CsvMapping,
  preview: CsvPreview
): ImportBatch {
  if (preview.totalRows > MAX_ROWS) {
    throw new ImportError('TOO_MANY_ROWS', `${preview.totalRows}`);
  }
  const parsed = Papa.parse<Record<string, string>>(text, {
    delimiter: preview.delimiter,
    skipEmptyLines: true,
    header: true
  });
  const headers = parsed.meta.fields ?? [];
  const retained = pickRetained(headers, mapping);
  const lines: NormalizedOrderLine[] = [];
  let excluded = 0;

  parsed.data.forEach((row, idx) => {
    const get = (col: string | undefined): string => {
      if (col === undefined) return '';
      return row[col] ?? '';
    };
    let orderDate: string;
    try {
      orderDate = normalizeDate(get(mapping.orderDate), mapping.dateFormat);
    } catch (e) {
      if (e instanceof ImportError) {
        excluded++;
        return;
      }
      throw e;
    }
    let quantity: number;
    try {
      quantity = parseQuantity(get(mapping.quantity));
    } catch (e) {
      if (e instanceof ImportError) {
        excluded++;
        return;
      }
      throw e;
    }
    const status = mapping.status ? get(mapping.status) : null;
    const included =
      status === null ? true : (mapping.includedStatuses ?? []).includes(status);

    const country = normalizeCountry(get(mapping.country));
    const lineId = mapping.lineId ? get(mapping.lineId) : String(idx + 1);
    const shipmentId = mapping.shipmentId ? get(mapping.shipmentId) : null;
    const parcelCountRaw = mapping.parcelCount ? get(mapping.parcelCount) : '';
    const parcelCount = parcelCountRaw.trim() === '' ? null : parseQuantity(parcelCountRaw);
    const shippingProfile = mapping.shippingProfile ? get(mapping.shippingProfile) : null;

    if (!included) excluded++;

    lines.push({
      sourceKey: mapping.sourceKey,
      accountKey: mapping.accountKey,
      orderId: get(mapping.orderId).trim(),
      lineId: lineId.trim(),
      shipmentId: shipmentId === null ? null : shipmentId.trim(),
      parcelCount,
      shippingProfile: shippingProfile === null ? null : shippingProfile.trim(),
      orderDate,
      country,
      sku: get(mapping.sku).trim(),
      quantity,
      status,
      included,
      excludedReason: included ? undefined : 'status excluded'
    });
  });

  return {
    id: `batch_${mapping.sourceKey}_${mapping.accountKey}_${Date.now()}`,
    sourceKey: mapping.sourceKey,
    accountKey: mapping.accountKey,
    fileNameHash: '',
    createdAt: new Date().toISOString(),
    retainedColumns: retained,
    periodFrom: null,
    periodTo: null,
    lines,
    excludedLineCount: excluded,
    hasStableLineId: mapping.lineId !== undefined
  };
}

function pickRetained(headers: string[], mapping: CsvMapping): string[] {
  const used = [
    mapping.orderId,
    mapping.sku,
    mapping.quantity,
    mapping.orderDate,
    mapping.country,
    mapping.lineId,
    mapping.shipmentId,
    mapping.parcelCount,
    mapping.shippingProfile,
    mapping.status
  ].filter((c): c is string => typeof c === 'string' && c.length > 0);
  const unique = Array.from(new Set(used));
  return headers.filter((h) => unique.includes(h));
}

export function escapeSpreadsheetCell(value: string): string {
  const first = value[0];
  if (first === undefined) return value;
  if (FORMULA_PREFIXES.includes(first)) return `'${value}`;
  return value;
}
