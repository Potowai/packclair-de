import { describe, expect, it } from 'vitest';
import { createSummaryCsv } from '../export/safe-csv';
import { createAuditHtml } from '../export/audit-report';
import { createExportFileNames } from '../export/file-names';
import { REFERENCE_SET_VERSION } from '../regulatory/reference-set';
import type { ReadyDeclaration } from '../calculation/types';

const report: ReadyDeclaration = {
  type: 'HMM1',
  reportYear: 2026,
  periodFrom: '2026-01-01',
  periodTo: '2026-12-31',
  operatorId: 'DE6005779374130',
  operatorConfirmedAt: '2026-07-12',
  confirmedGrams: { '20000': 26_500n, '50000': 7_500n },
  referenceSetVersion: REFERENCE_SET_VERSION,
  motivatedDifferences: [
    { material: '20000', suggestedGrams: 24_000n, confirmedGrams: 26_500n, reason: 'manquant' }
  ]
};

describe('fichiers d’export', () => {
  it('produit des noms de fichiers ASCII déterministes', () => {
    const names = createExportFileNames(report);
    expect(names.xml).toBe('lucid_HMM1_2026-01-01_2026-12-31_DE6005779374130.xml');
    expect(names.xml).toMatch(/^[A-Za-z0-9_.-]+$/);
  });

  it('neutralise les caractères hors ASCII dans le nom de fichier', () => {
    const names = createExportFileNames({ ...report, operatorId: '=cmd' });
    expect(names.xml).toMatch(/^[A-Za-z0-9_.-]+$/);
    expect(names.xml).not.toContain('=');
  });

  it('échappe le HTML de l’audit', () => {
    const html = createAuditHtml(report, {
      snapshotId: 's1',
      engineVersion: '1',
      referenceSetVersion: REFERENCE_SET_VERSION,
      sourceKey: 'etsy',
      accountKey: 'shop-a',
      createdAt: '2026-07-12T10:00:00.000Z'
    });
    expect(html).toContain('<html');
    expect(html).toContain('26,500');
    expect(html).toContain('manquant');
    expect(html).toContain('DE6005779374130');
  });

  it('échappe les balises injectées dans l’audit', () => {
    const html = createAuditHtml(
      { ...report, operatorId: '<script>' },
      {
        snapshotId: 's1',
        engineVersion: '1',
        referenceSetVersion: REFERENCE_SET_VERSION,
        sourceKey: 'etsy',
        accountKey: 'shop-a',
        createdAt: '2026-07-12'
      }
    );
    expect(html).toContain('&lt;script&gt;');
    expect(html).not.toContain('<script>');
  });

  it('produit un CSV de synthèse sûr', () => {
    const csv = createSummaryCsv({
      id: 'b1',
      sourceKey: 'etsy',
      accountKey: 'shop-a',
      fileNameHash: '',
      createdAt: '',
      retainedColumns: [],
      periodFrom: null,
      periodTo: null,
      excludedLineCount: 0,
      hasStableLineId: true,
      lines: [
        {
          sourceKey: 'etsy',
          accountKey: 'shop-a',
          orderId: '=A1',
          lineId: '1',
          shipmentId: null,
          parcelCount: null,
          shippingProfile: null,
          orderDate: '2026-01-01',
          country: 'DE',
          sku: 'MUG',
          quantity: 1,
          status: null,
          included: true
        }
      ]
    });
    expect(csv).toContain("'=A1");
  });
});
