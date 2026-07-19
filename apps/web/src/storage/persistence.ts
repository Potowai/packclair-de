export type PersistenceStatus = Readonly<{
  available: boolean;
  persistPermission: 'granted' | 'denied' | 'prompt' | 'unsupported';
  quotaRisk: 'unknown' | 'low' | 'high';
  durableHistoryAllowed: boolean;
}>;

const BIGINT_TAG = '$bigint';

function replacer(_key: string, value: unknown): unknown {
  if (typeof value === 'bigint') {
    return { [BIGINT_TAG]: value.toString() };
  }
  return value;
}

function reviver(_key: string, value: unknown): unknown {
  if (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    BIGINT_TAG in (value as Record<string, unknown>)
  ) {
    const raw = (value as Record<string, unknown>)[BIGINT_TAG];
    if (typeof raw === 'string') return BigInt(raw);
  }
  return value;
}

export function jsonEncode(value: unknown): string {
  return JSON.stringify(value, replacer);
}

export function jsonDecode<T>(text: string): T {
  return JSON.parse(text, reviver) as T;
}

export function serializeBigint(value: bigint): string {
  return value.toString();
}

export function deserializeBigint(value: string): bigint {
  return BigInt(value);
}

export function getPersistenceStatus(): PersistenceStatus {
  const nav = globalThis.navigator as
    | (Navigator & { storage?: { persist?: () => Promise<PermissionState> } })
    | undefined;
  const hasStorage = typeof nav !== 'undefined' && !!nav.storage;
  return {
    available: hasStorage,
    persistPermission: 'unsupported',
    quotaRisk: 'unknown',
    durableHistoryAllowed: false
  };
}

export async function requestPersistentStorage(): Promise<boolean> {
  const nav = globalThis.navigator as
    | (Navigator & { storage?: { persist?: () => Promise<PermissionState> } })
    | undefined;
  if (!nav?.storage?.persist) return false;
  try {
    const result = await nav.storage.persist();
    return result === 'granted';
  } catch {
    return false;
  }
}
