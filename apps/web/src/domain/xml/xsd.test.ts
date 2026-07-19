import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { validateXML } from 'xmllint-wasm';
import { serializeLucidXml } from './serialize';
import { REFERENCE_SET_VERSION } from '../regulatory/reference-set';
import type { ReadyDeclaration } from '../calculation/types';

const xsdPath = resolve(
  import.meta.dirname,
  '..',
  '..',
  '..',
  'regulatory',
  'lucid',
  '1.0',
  'Hersteller_Datenmeldung_Schema.xsd'
);
const xsd = readFileSync(xsdPath, 'utf-8');

function report(type: ReadyDeclaration['type'], grams: ReadyDeclaration['confirmedGrams']): ReadyDeclaration {
  return {
    type,
    reportYear: 2026,
    periodFrom: '2026-01-01',
    periodTo: '2026-12-31',
    operatorId: 'DE6005779374130',
    operatorConfirmedAt: '2026-07-12',
    confirmedGrams: grams,
    referenceSetVersion: REFERENCE_SET_VERSION,
    motivatedDifferences: []
  };
}

describe('validation XSD indépendante', () => {
  for (const type of ['HPM1', 'HMM1', 'HJM1'] as const) {
    it(`valide un rapport ${type} conforme`, async () => {
      const bytes = serializeLucidXml(report(type, { '20000': 26_500n, '50000': 7_500n }));
      const text = new TextDecoder().decode(bytes).replace(/^﻿/, '');
      const result = await validateXML({ xml: text, schema: xsd });
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });
  }

  it('rejette un XML tronqué', async () => {
    const result = await validateXML({ xml: '<Root><VersionNoInterface>1.0', schema: xsd });
    expect(result.valid).toBe(false);
  });
});
