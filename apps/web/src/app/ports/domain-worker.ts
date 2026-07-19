import { decodeBytes } from '../../domain/import/decode';
import { normalizeBatch, previewCsv } from '../../domain/import/normalize';
import { calculatePackaging } from '../../domain/calculation/calculate';
import { reconcileConfirmedTotals, type ReconcileInput } from '../../domain/calculation/reconcile';
import { serializeLucidXml } from '../../domain/xml/serialize';
import type { ImportBatch, CsvMapping, CsvPreview } from '../../domain/import/types';
import type { CalculationSnapshot } from '../../domain/calculation/types';
import type { ReadyDeclaration } from '../../domain/calculation/types';

export type DecodeOptions = { assumeEncoding?: 'windows-1252' };

export interface DomainWorkerApi {
  decode(bytes: Uint8Array, options?: DecodeOptions): Promise<{
    text: string;
    encoding: string;
    requiresConfirmation: boolean;
  }>;
  previewCsv(text: string): Promise<CsvPreview>;
  normalizeBatch(text: string, mapping: CsvMapping, preview: CsvPreview): Promise<ImportBatch>;
  calculatePackaging(input: Parameters<typeof calculatePackaging>[0]): Promise<CalculationSnapshot>;
  reconcileConfirmedTotals(input: ReconcileInput): Promise<
    | { ok: true; value: ReadyDeclaration }
    | { ok: false; blockers: readonly { code: string; detail: string; material?: string }[] }
  >;
  serializeLucidXml(report: ReadyDeclaration): Promise<Uint8Array>;
}

export function createLocalDomainWorkerApi(): DomainWorkerApi {
  return {
    async decode(bytes, options) {
      const r = decodeBytes(bytes, options);
      return { text: r.text, encoding: r.encoding, requiresConfirmation: r.requiresConfirmation };
    },
    async previewCsv(text) {
      return previewCsv(text);
    },
    async normalizeBatch(text, mapping, preview) {
      return normalizeBatch(text, mapping, preview);
    },
    async calculatePackaging(input) {
      return calculatePackaging(input);
    },
    async reconcileConfirmedTotals(input) {
      return reconcileConfirmedTotals(input);
    },
    async serializeLucidXml(report) {
      return serializeLucidXml(report);
    }
  };
}
