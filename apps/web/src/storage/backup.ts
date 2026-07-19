import type { PackClairDB } from './database';
import { createDatabase } from './database';
import { jsonEncode, jsonDecode, getPersistenceStatus, type PersistenceStatus } from './persistence';

export type BackupArchive = Readonly<{
  format: 'packclair-backup@1';
  createdAt: string;
  tables: Readonly<{
    profileRevisions: unknown[];
    batches: unknown[];
    orderLines: unknown[];
    shipments: unknown[];
    snapshots: unknown[];
    declarations: unknown[];
    mappingPresets: unknown[];
    settings: unknown[];
  }>;
}>;

const TABLE_NAMES = [
  'profileRevisions',
  'batches',
  'orderLines',
  'shipments',
  'snapshots',
  'declarations',
  'mappingPresets',
  'settings'
] as const;

function schemaOf(row: unknown): string | undefined {
  if (row && typeof row === 'object' && '_schema' in (row as Record<string, unknown>)) {
    return (row as Record<string, unknown>)._schema as string;
  }
  return undefined;
}

const EXPECTED_SCHEMAS: Record<string, string> = {
  profileRevisions: 'profile-revision@1',
  batches: 'batch@1',
  orderLines: 'order-line@1',
  shipments: 'shipment@1',
  snapshots: 'snapshot@1',
  declarations: 'declaration@1',
  mappingPresets: 'mapping-preset@1',
  settings: 'setting@1'
};

export class BackupService {
  constructor(private readonly db: PackClairDB = createDatabase()) {}

  async exportBackup(): Promise<BackupArchive> {
    const tables = {} as Record<string, unknown[]>;
    for (const name of TABLE_NAMES) {
      const rows = await (this.db as unknown as Record<string, { toArray(): Promise<unknown[]> }>)[
        name
      ].toArray();
      tables[name] = rows;
    }
    return {
      format: 'packclair-backup@1',
      createdAt: new Date().toISOString(),
      tables: tables as BackupArchive['tables']
    };
  }

  async exportBackupString(): Promise<string> {
    return jsonEncode(await this.exportBackup());
  }

  async restoreBackup(archive: BackupArchive): Promise<void> {
    if (archive?.format !== 'packclair-backup@1') {
      throw new Error('BACKUP_FORMAT_UNSUPPORTED');
    }
    for (const name of TABLE_NAMES) {
      const rows = archive.tables[name];
      if (!Array.isArray(rows)) throw new Error(`BACKUP_MISSING_TABLE:${name}`);
      for (const row of rows) {
        const expected = EXPECTED_SCHEMAS[name];
        const actual = schemaOf(row);
        if (actual !== expected) {
          throw new Error(`BACKUP_SCHEMA_MISMATCH:${name}:${String(actual)}`);
        }
      }
    }

    await this.db.transaction('rw', ...TABLE_NAMES.map((n) => (this.db as never as Record<string, unknown>)[n] as never), async () => {
      for (const name of TABLE_NAMES) {
        const table = (this.db as unknown as Record<string, { clear(): Promise<void>; bulkPut(rows: unknown[]): Promise<void> }>)[name];
        await table.clear();
        await table.bulkPut(archive.tables[name]);
      }
    });
  }

  async restoreBackupString(text: string): Promise<void> {
    const archive = jsonDecode<BackupArchive>(text);
    await this.restoreBackup(archive);
  }

  async clearAllLocalData(): Promise<void> {
    await this.db.transaction('rw', ...TABLE_NAMES.map((n) => (this.db as never as Record<string, unknown>)[n] as never), async () => {
      for (const name of TABLE_NAMES) {
        await (this.db as unknown as Record<string, { clear(): Promise<void> }>)[name].clear();
      }
    });
  }
}

export function getPersistenceStatusSafe(): PersistenceStatus {
  return getPersistenceStatus();
}
