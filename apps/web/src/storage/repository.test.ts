import { beforeEach, describe, expect, it } from 'vitest';
import { LocalRepository } from './repository';
import { DomainError } from '../domain/calculation/types';
import type { PackagingProfileRevision, CalculationSnapshot, ReadyDeclaration } from '../domain/calculation/types';
import type { ImportBatch } from '../domain/import/types';
import { REFERENCE_SET_VERSION } from '../domain/regulatory/reference-set';
import type { MaterialCode } from '../domain/regulatory/materials';

const masses = (mg: bigint) =>
  ({
    '10000': 0n,
    '20000': mg,
    '30000': 0n,
    '40000': 0n,
    '50000': 0n,
    '60000': 0n,
    '70000': 0n,
    '80000': 0n
  }) as Record<MaterialCode, bigint>;

const profile: PackagingProfileRevision = {
  id: 'mug@1',
  logicalId: 'mug',
  revision: 1,
  kind: 'product',
  sku: 'MUG',
  massesMg: masses(10_000n)
};

const snapshot: CalculationSnapshot = {
  id: 'snap1',
  createdAt: '2026-07-12T10:00:00.000Z',
  trustedDateBerlin: '2026-07-12',
  engineVersion: '1',
  referenceSetVersion: REFERENCE_SET_VERSION,
  sourceKey: 'etsy',
  accountKey: 'shop-a',
  batchIds: ['b1'],
  profileSnapshots: [profile],
  profileRevisionIds: ['mug@1'],
  lineContributions: [],
  shipmentContributions: [],
  calculatedMg: masses(10_000n)
};

const batch: ImportBatch = {
  id: 'b1',
  sourceKey: 'etsy',
  accountKey: 'shop-a',
  fileNameHash: 'abc',
  createdAt: '2026-07-12T10:00:00.000Z',
  retainedColumns: ['order_id'],
  periodFrom: null,
  periodTo: null,
  hasStableLineId: true,
  excludedLineCount: 0,
  lines: [
    {
      sourceKey: 'etsy',
      accountKey: 'shop-a',
      orderId: 'A',
      lineId: '1',
      shipmentId: 'S1',
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
};

const declaration: ReadyDeclaration = {
  type: 'HMM1',
  reportYear: 2026,
  periodFrom: '2026-01-01',
  periodTo: '2026-12-31',
  operatorId: 'DE6005779374130',
  operatorConfirmedAt: '2026-07-12',
  confirmedGrams: { '20000': 26_500n },
  referenceSetVersion: REFERENCE_SET_VERSION,
  motivatedDifferences: []
};

describe('LocalRepository', () => {
  let repo: LocalRepository;
  beforeEach(async () => {
    await new LocalRepository().database.delete().catch(() => {});
    repo = new LocalRepository();
  });

  it('crée une révision de profil immuable', async () => {
    await repo.createProfileRevision(profile);
    await expect(repo.createProfileRevision(profile)).rejects.toBeInstanceOf(DomainError);
    const got = await repo.getProfileRevision('mug@1');
    expect(got?.massesMg['20000']).toBe(10_000n);
  });

  it('restaure un snapshot à l’identique (bigint décimal)', async () => {
    await repo.saveSnapshot(snapshot);
    const got = await repo.getSnapshot('snap1');
    expect(got).toEqual(snapshot);
    expect(got?.calculatedMg['20000']).toBe(10_000n);
  });

  it('annule un import invalide de façon atomique', async () => {
    const dupLineBatch: ImportBatch = {
      ...batch,
      id: 'dup',
      lines: [
        { ...batch.lines[0]!, lineId: '1', orderId: 'A' },
        { ...batch.lines[0]!, lineId: '1', orderId: 'A' }
      ]
    };
    await expect(repo.saveImportAtomically(dupLineBatch)).rejects.toBeInstanceOf(DomainError);
    const stored = await repo.database.batches.get('dup');
    expect(stored).toBeUndefined();
    const lines = await repo.database.orderLines.where('batchId').equals('dup').toArray();
    expect(lines.length).toBe(0);
  });

  it('persiste déclaration et snapshot lié', async () => {
    await repo.saveSnapshot(snapshot);
    const id = await repo.saveDeclaration(declaration, 'snap1');
    const got = await repo.getDeclaration(id);
    expect(got?.confirmedGrams['20000']).toBe(26_500n);
  });
});
