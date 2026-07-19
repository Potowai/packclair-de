import type { MaterialCode } from '../regulatory/materials';
import type { ReportType } from '../regulatory/report-types';
import type { ReadyDeclaration } from '../calculation/types';

export type { ReadyDeclaration };

export type SupportedReport = Extract<ReportType, 'HPM1' | 'HMM1' | 'HJM1'>;

export const SUPPORTED_REPORTS: readonly SupportedReport[] = ['HPM1', 'HMM1', 'HJM1'];

export const BLOCKED_REPORTS: readonly ReportType[] = ['HNM1', 'HAM1'];

export const MODERN_MATERIALS: readonly MaterialCode[] = ['39000', '49000', '79000'];

export type ExportDecision =
  | { status: 'allowed'; fresh: boolean }
  | { status: 'blocked'; reason: 'STALE_REFERENCE' | 'REVIEW_REQUIRED' | 'UNSUPPORTED_REPORT' };

export type ExportPolicyInput = Readonly<{
  reportType: ReportType;
  referenceSetVersion: string;
  referenceRetrievedAt: string;
  trustedTodayBerlin: string;
  maxAgeDays: number;
}>;
