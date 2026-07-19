export type CsvEncoding = 'utf-8' | 'utf-16le' | 'utf-16be' | 'windows-1252';

export type CsvDelimiter = ',' | ';' | '\t';

export type CsvDateFormat = 'YYYY-MM-DD' | 'DD/MM/YYYY' | 'MM/DD/YYYY';

export type CountryNormalization = 'DE' | 'UNKNOWN' | 'EXCLUDED';

export type NormalizedOrderLine = Readonly<{
  sourceKey: string;
  accountKey: string;
  orderId: string;
  lineId: string;
  shipmentId: string | null;
  parcelCount: number | null;
  shippingProfile: string | null;
  orderDate: string;
  country: CountryNormalization;
  sku: string;
  quantity: number;
  status: string | null;
  included: boolean;
  excludedReason?: string;
}>;

export type ImportBatch = Readonly<{
  id: string;
  sourceKey: string;
  accountKey: string;
  fileNameHash: string;
  createdAt: string;
  retainedColumns: readonly string[];
  periodFrom: string | null;
  periodTo: string | null;
  lines: readonly NormalizedOrderLine[];
  excludedLineCount: number;
  hasStableLineId: boolean;
}>;

export type OverlapResult =
  | { decision: 'DUPLICATE_FILE'; existingBatchId: string }
  | { decision: 'PARTIAL_OVERLAP'; keys: readonly string[] }
  | { decision: 'APPEND_ALLOWED' }
  | { decision: 'REPLACE_BATCH_REQUIRED'; reason: 'NO_STABLE_LINE_ID' | 'OVERLAPPING_PERIOD' };

export type CsvMapping = Readonly<{
  sourceKey: string;
  accountKey: string;
  orderId: string;
  lineId?: string;
  shipmentId?: string;
  parcelCount?: string;
  shippingProfile?: string;
  orderDate: string;
  country: string;
  sku: string;
  quantity: string;
  status?: string;
  includedStatuses?: readonly string[];
  dateFormat: CsvDateFormat;
  defaultOneParcelPerOrder: boolean;
}>;

export type CsvPreview = Readonly<{
  encoding: CsvEncoding;
  requiresEncodingConfirmation: boolean;
  delimiter: CsvDelimiter;
  headers: readonly string[];
  rows: readonly Readonly<Record<string, string>>[];
  totalRows: number;
  retainedColumns: readonly string[];
}>;
