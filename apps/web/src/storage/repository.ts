import type { PackClairDB } from './database';
import { createDatabase } from './database';
import { jsonEncode, jsonDecode } from './persistence';
import type { PackagingProfileRevision } from '../domain/calculation/types';
import type { CalculationSnapshot, ReadyDeclaration } from '../domain/calculation/types';
import type { ImportBatch, CsvMapping, NormalizedOrderLine } from '../domain/import/types';
import { DomainError } from '../domain/calculation/types';

function lineKey(line: NormalizedOrderLine): string {
  return `${line.sourceKey}/${line.accountKey}/${line.orderId}/${line.lineId}`;
}

function shipmentKey(line: NormalizedOrderLine): string {
  return `${line.sourceKey}/${line.accountKey}/${line.shipmentId ?? 'none'}`;
}

export class LocalRepository {
  constructor(private readonly db: PackClairDB = createDatabase()) {}

  get database(): PackClairDB {
    return this.db;
  }

  async createProfileRevision(profile: PackagingProfileRevision): Promise<void> {
    const existing = await this.db.profileRevisions.get(profile.id);
    if (existing) {
      throw new DomainError('PROFILE_REVISION_IMMUTABLE', profile.id);
    }
    await this.db.profileRevisions.add({
      id: profile.id,
      logicalId: profile.logicalId,
      revision: profile.revision,
      kind: profile.kind,
      sku: profile.sku,
      massesMgJson: jsonEncode(profile.massesMg),
      _schema: 'profile-revision@1'
    });
  }

  async getProfileRevision(id: string): Promise<PackagingProfileRevision | undefined> {
    const row = await this.db.profileRevisions.get(id);
    if (!row) return undefined;
    return {
      id: row.id,
      logicalId: row.logicalId,
      revision: row.revision,
      kind: row.kind,
      sku: row.sku,
      massesMg: jsonDecode(row.massesMgJson)
    };
  }

  async saveImportAtomically(batch: ImportBatch, mapping?: CsvMapping): Promise<void> {
    try {
      await this.db.transaction(
        'rw',
        this.db.batches,
        this.db.orderLines,
        this.db.shipments,
        async () => {
          await this.db.batches.add({ ...batch, mapping, _schema: 'batch@1' });
          const lineRows = batch.lines.map((line) => ({
            key: lineKey(line),
            batchId: batch.id,
            orderId: line.orderId,
            shipmentId: line.shipmentId,
            sku: line.sku,
            _schema: 'order-line@1' as const
          }));
          await this.db.orderLines.bulkAdd(lineRows);
          const seen = new Set<string>();
          const shipRows: { key: string; batchId: string; shipmentId: string }[] = [];
          for (const line of batch.lines) {
            const key = shipmentKey(line);
            if (seen.has(key)) continue;
            seen.add(key);
            shipRows.push({ key, batchId: batch.id, shipmentId: line.shipmentId ?? 'none' });
          }
          await this.db.shipments.bulkAdd(shipRows);
        }
      );
    } catch (err) {
      if (err instanceof DomainError) throw err;
      throw new DomainError('IMPORT_ROLLBACK', String(err));
    }
  }

  async saveSnapshot(snapshot: CalculationSnapshot): Promise<void> {
    await this.db.snapshots.put({
      id: snapshot.id,
      createdAt: snapshot.createdAt,
      referenceSetVersion: snapshot.referenceSetVersion,
      data: jsonEncode(snapshot),
      _schema: 'snapshot@1'
    });
  }

  async getSnapshot(id: string): Promise<CalculationSnapshot | undefined> {
    const row = await this.db.snapshots.get(id);
    if (!row) return undefined;
    return jsonDecode<CalculationSnapshot>(row.data);
  }

  async saveDeclaration(declaration: ReadyDeclaration, snapshotId: string): Promise<string> {
    const id = `decl_${declaration.referenceSetVersion}_${declaration.operatorId}_${declaration.periodFrom}_${declaration.periodTo}`;
    await this.db.declarations.put({
      id,
      createdAt: declaration.operatorConfirmedAt,
      snapshotId,
      reportType: declaration.type,
      reportYear: declaration.reportYear,
      data: jsonEncode(declaration),
      _schema: 'declaration@1'
    });
    return id;
  }

  async getDeclaration(id: string): Promise<ReadyDeclaration | undefined> {
    const row = await this.db.declarations.get(id);
    if (!row) return undefined;
    return jsonDecode<ReadyDeclaration>(row.data);
  }
}

export { DomainError };
