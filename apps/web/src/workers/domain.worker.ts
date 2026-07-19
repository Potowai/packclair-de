import * as Comlink from 'comlink';
import { decodeBytes } from '../domain/import/decode';
import { normalizeBatch, previewCsv } from '../domain/import/normalize';
import { calculatePackaging } from '../domain/calculation/calculate';
import { reconcileConfirmedTotals } from '../domain/calculation/reconcile';
import { serializeLucidXml } from '../domain/xml/serialize';

const api = {
  decode: (bytes: Uint8Array, options?: { assumeEncoding?: 'windows-1252' }) =>
    decodeBytes(bytes, options),
  previewCsv: (text: string) => previewCsv(text),
  normalizeBatch: (text: string, mapping: never, preview: never) =>
    normalizeBatch(text, mapping, preview),
  calculatePackaging: (input: Parameters<typeof calculatePackaging>[0]) =>
    calculatePackaging(input),
  reconcileConfirmedTotals,
  serializeLucidXml
};

export type WorkerApi = typeof api;

Comlink.expose(api);

export {};
