import { ReferralStore } from '@/app/referral-store';
import { attributeFromSearch } from '@/domain/referral/referral';

function getStorage(): Storage | null {
  try {
    return typeof localStorage !== 'undefined' ? localStorage : null;
  } catch {
    return null;
  }
}

export const referralStore = new ReferralStore(
  (getStorage() as unknown as ConstructorParameters<typeof ReferralStore>[0]) ?? memoryFallback()
);

function memoryFallback() {
  const map = new Map<string, string>();
  return {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v)
  };
}

/** Call once on app start: assign an own code and attribute any ?ref= link. */
export function initReferral(): void {
  const owned = referralStore.ensureOwnCode();
  if (typeof location !== 'undefined') {
    const attributed = attributeFromSearch(owned, location.search);
    referralStore.save(attributed);
  }
}
