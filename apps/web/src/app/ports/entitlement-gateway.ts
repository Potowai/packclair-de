export type EntitlementClaimsV1 = Readonly<{
  plan: 'pro';
  referenceSetVersion: string;
  xmlExportFreshUntil: string;
  expiresAt: string;
  graceUntil: string;
  entitlementVersion: number;
  signature: string;
}>;

export type EntitlementResolution =
  | { status: 'free' }
  | { status: 'active' | 'grace'; claims: EntitlementClaimsV1 }
  | { status: 'expired' | 'invalid' | 'offline_unavailable'; reason: string };

export interface EntitlementGateway {
  resolve(signal?: AbortSignal): Promise<EntitlementResolution>;
  refresh(signal?: AbortSignal): Promise<EntitlementResolution>;
  clear(): Promise<void>;
}

export class FreeEntitlementGateway implements EntitlementGateway {
  async resolve(): Promise<EntitlementResolution> {
    return { status: 'free' };
  }
  async refresh(): Promise<EntitlementResolution> {
    return { status: 'free' };
  }
  async clear(): Promise<void> {
    // no backend state to clear
  }
}
