import { beforeEach, describe, expect, it } from 'vitest';
import { BackupService } from './backup';
import { LocalRepository } from './repository';
import type { PackagingProfileRevision, CalculationSnapshot } from '../domain/calculation/types';
import { REFERENCE_SET_VERSION } from '../domain/regulatory/reference-set';
import type { MaterialCode } from '../domain/regulatory/materials';
import { jsonEncode, jsonDecode } from './persistence';

const masses = (mg: bigint) =>
  ({ '10000': 0n, '20000': mg, '30000': 0n, '40000': 0n, '50000': 0n, '60000': 0n, '70000': 0n, '80000': 0n } as Record<MaterialCode, bigint>);

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

describe('BackupService', () => {
  let repo: LocalRepository;
  let backup: BackupService;

  beforeEach(async () => {
    await new LocalRepository().database.delete().catch(() => {});
    repo = new LocalRepository();
    backup = new BackupService(repo.database);
    await repo.createProfileRevision(profile);
    await repo.saveSnapshot(snapshot);
  });

  it('encode les bigints en chaînes décimales', () => {
    const text = jsonEncode({ v: 10_000n });
    expect(text).not.toContain('10e3');
    expect(text).toContain('"10000"');
    expect(jsonDecode<{ v: bigint }>(text).v).toBe(10_000n);
  });

  it('effectue un aller-retour de sauvegarde', async () => {
    const archive = await backup.exportBackup();
    const text = jsonEncode(archive);
    const restore = new BackupService(repo.database);
    await restore.restoreBackupString(text);
    const got = await repo.getProfileRevision('mug@1');
    expect(got?.massesMg['20000']).toBe(10_000n);
    const gotSnap = await repo.getSnapshot('snap1');
    expect(gotSnap).toEqual(snapshot);
  });

  it('rejette un schéma de table future sans toucher aux données vivantes', async () => {
    const live = await repo.getProfileRevision('mug@1');
    expect(live).toBeDefined();
    const archive = await backup.exportBackup();
    const broken = jsonDecode<{ tables: Record<string, unknown[]> }>(jsonEncode(archive));
    broken.tables.profileRevisions = [{ id: 'x', _schema: 'profile-revision@2' }];
    await expect(backup.restoreBackupString(jsonEncode(broken))).rejects.toThrow(/BACKUP_SCHEMA_MISMATCH/);
    const stillThere = await repo.getProfileRevision('mug@1');
    expect(stillThere?.id).toBe('mug@1');
  });

  it('efface toutes les données locales', async () => {
    await backup.clearAllLocalData();
    expect(await repo.getProfileRevision('mug@1')).toBeUndefined();
    expect(await repo.getSnapshot('snap1')).toBeUndefined();
  });
});
