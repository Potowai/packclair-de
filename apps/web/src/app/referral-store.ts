import {
  EMPTY_LEDGER,
  ensureOwnCode,
  type ReferralLedger
} from '@/domain/referral/referral';

export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

const STORAGE_KEY = 'packclair:referral';

export class ReferralStore {
  private storage: KeyValueStore;

  constructor(storage: KeyValueStore) {
    this.storage = storage;
  }

  load(): ReferralLedger {
    const raw = this.storage.getItem(STORAGE_KEY);
    if (!raw) return { ...EMPTY_LEDGER };
    try {
      const parsed = JSON.parse(raw) as Partial<ReferralLedger>;
      return {
        ownCode: parsed.ownCode ?? null,
        attributedReferrer: parsed.attributedReferrer ?? null,
        conversions: parsed.conversions ?? 0
      };
    } catch {
      return { ...EMPTY_LEDGER };
    }
  }

  save(state: ReferralLedger): void {
    this.storage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  ensureOwnCode(rng?: () => number): ReferralLedger {
    const next = ensureOwnCode(this.load(), rng);
    this.save(next);
    return next;
  }
}
