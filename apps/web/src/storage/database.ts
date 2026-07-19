import Dexie, { type Table } from 'dexie';
import type { PackagingProfileRevision } from '../domain/calculation/types';
import type { CalculationSnapshot, ReadyDeclaration } from '../domain/calculation/types';
import type { ImportBatch, CsvMapping } from '../domain/import/types';

export type ProfileRevisionEntity = Readonly<{
  id: string;
  logicalId: string;
  revision: number;
  kind: 'product' | 'shipment';
  sku: string | null;
  massesMgJson: string;
  _schema: 'profile-revision@1';
}>;

export type BatchEntity = ImportBatch & {
  _schema: 'batch@1';
  mapping?: CsvMapping;
};

export type OrderLineEntity = Readonly<{
  key: string;
  batchId: string;
  orderId: string;
  shipmentId: string | null;
  sku: string;
  _schema: 'order-line@1';
}>;

export type ShipmentEntity = Readonly<{
  key: string;
  batchId: string;
  shipmentId: string;
  _schema: 'shipment@1';
}>;

export type SnapshotEntity = Readonly<{
  id: string;
  createdAt: string;
  referenceSetVersion: string;
  data: string;
  _schema: 'snapshot@1';
}>;

export type DeclarationEntity = Readonly<{
  id: string;
  createdAt: string;
  snapshotId: string;
  reportType: string;
  reportYear: number;
  data: string;
  _schema: 'declaration@1';
}>;

export type MappingPresetEntity = Readonly<{
  id: string;
  sourceKey: string;
  accountKey: string;
  mapping: CsvMapping;
  _schema: 'mapping-preset@1';
}>;

export type SettingEntity = Readonly<{
  key: string;
  value: unknown;
  _schema: 'setting@1';
}>;

export class PackClairDB extends Dexie {
  profileRevisions!: Table<ProfileRevisionEntity, string>;
  batches!: Table<BatchEntity, string>;
  orderLines!: Table<OrderLineEntity, string>;
  shipments!: Table<ShipmentEntity, string>;
  snapshots!: Table<SnapshotEntity, string>;
  declarations!: Table<DeclarationEntity, string>;
  mappingPresets!: Table<MappingPresetEntity, string>;
  settings!: Table<SettingEntity, string>;

  constructor() {
    super('packclair');
    this.version(1).stores({
      profileRevisions: '&id, logicalId, [logicalId+revision]',
      batches: '&id, hash, [sourceKey+accountKey], periodFrom, periodTo',
      orderLines: '&key, batchId, orderId, shipmentId, sku',
      shipments: '&key, batchId, shipmentId',
      snapshots: '&id, createdAt, referenceSetVersion',
      declarations: '&id, createdAt, snapshotId, reportType, reportYear',
      mappingPresets: '&id, [sourceKey+accountKey]',
      settings: '&key'
    });
  }
}

export function createDatabase(): PackClairDB {
  return new PackClairDB();
}
