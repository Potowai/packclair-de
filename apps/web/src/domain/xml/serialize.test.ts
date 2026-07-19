import { describe, expect, it } from 'vitest';
import { serializeLucidXml, DomainError } from './serialize';
import { REFERENCE_SET_VERSION } from '../regulatory/reference-set';
import type { ReadyDeclaration } from '../calculation/types';

function report(over: Partial<ReadyDeclaration> = {}): ReadyDeclaration {
  return {
    type: 'HMM1',
    reportYear: 2026,
    periodFrom: '2026-01-01',
    periodTo: '2026-12-31',
    operatorId: 'DE6005779374130',
    operatorConfirmedAt: '2026-07-12',
    confirmedGrams: { '20000': 26_500n, '50000': 7_500n },
    referenceSetVersion: REFERENCE_SET_VERSION,
    motivatedDifferences: [],
    ...over
  };
}

describe('sérialiseur XML LUCID', () => {
  it('préfixe un BOM UTF-8', () => {
    const bytes = serializeLucidXml(report());
    expect([...bytes.slice(0, 3)]).toEqual([0xef, 0xbb, 0xbf]);
  });

  it('émet les masses au format comma', () => {
    const text = new TextDecoder().decode(serializeLucidXml(report()));
    expect(text).toContain('<Mass>26,500</Mass>');
    expect(text).toContain('<MaterialCode>20000</MaterialCode>');
  });

  it('respecte l’ordre des éléments', () => {
    const text = new TextDecoder().decode(serializeLucidXml(report()));
    const idx = (s: string) => text.indexOf(s);
    expect(idx('<VersionNoInterface>')).toBeLessThan(idx('<PackagingTypeCode>'));
    expect(idx('<PackagingTypeCode>')).toBeLessThan(idx('<TypeOfReportCode>'));
    expect(idx('<TypeOfReportCode>')).toBeLessThan(idx('<ReportingPeriodFrom>'));
    expect(idx('<ReportingPeriodFrom>')).toBeLessThan(idx('<ReportingPeriodTo>'));
    expect(idx('<ReportingPeriodTo>')).toBeLessThan(idx('<ListOfSystemOperators>'));
  });

  it('trie les matériaux et omet les zéros', () => {
    const text = new TextDecoder().decode(
      serializeLucidXml(report({ confirmedGrams: { '20000': 0n, '50000': 7_500n, '80000': 1_000n } }))
    );
    expect(text).not.toContain('20000');
    expect(text.indexOf('50000')).toBeLessThan(text.indexOf('80000'));
  });

  it('rejette un rapport sans masse non nulle', () => {
    expect(() => serializeLucidXml(report({ confirmedGrams: { '20000': 0n } }))).toThrowError(DomainError);
  });

  it('rejette un matériau moderne', () => {
    expect(() => serializeLucidXml(report({ confirmedGrams: { '39000': 5_000n } }))).toThrowError(
      DomainError
    );
  });

  it('rejette une masse négative', () => {
    expect(() => serializeLucidXml(report({ confirmedGrams: { '20000': -1n } }))).toThrowError(DomainError);
  });

  it('rejette un rapport non pris en charge', () => {
    expect(() => serializeLucidXml(report({ type: 'HNM1' as ReadyDeclaration['type'] }))).toThrowError(
      DomainError
    );
  });

  it('rejette un décalage de référentiel', () => {
    expect(() =>
      serializeLucidXml(report({ referenceSetVersion: 'autre-version' }))
    ).toThrowError(DomainError);
  });

  it('échappe le XML par construction', () => {
    const text = new TextDecoder().decode(
      serializeLucidXml(report({ operatorId: 'DE6005779374130&<>"' }))
    );
    expect(text).toContain('&amp;');
    expect(text).not.toContain('<SystemOperatorID>DE6005779374130&<>"');
  });
});
