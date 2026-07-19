import { REFERENCE_SET_VERSION } from '../../domain/regulatory/reference-set';

export type ReferenceStatus = Readonly<{
  status: 'fresh' | 'stale' | 'review_required' | 'offline_unavailable';
  trustedTodayBerlin?: string;
  referenceSetVersion?: string;
  checkedAt?: string;
}>;

export interface ReferenceStatusGateway {
  resolve(signal?: AbortSignal): Promise<ReferenceStatus>;
  refresh(signal?: AbortSignal): Promise<ReferenceStatus>;
}

export interface TrustedClock {
  todayBerlin(): string;
  nowIso(): string;
}

export class SystemClock implements TrustedClock {
  todayBerlin(): string {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  nowIso(): string {
    return new Date().toISOString();
  }
}

export class ReferenceStatusGatewayImpl implements ReferenceStatusGateway {
  constructor(private readonly clock: TrustedClock = new SystemClock()) {}
  async resolve(): Promise<ReferenceStatus> {
    const today = this.clock.todayBerlin();
    return {
      status: 'fresh',
      trustedTodayBerlin: today,
      referenceSetVersion: REFERENCE_SET_VERSION,
      checkedAt: this.clock.nowIso()
    };
  }
  async refresh(): Promise<ReferenceStatus> {
    return this.resolve();
  }
}
