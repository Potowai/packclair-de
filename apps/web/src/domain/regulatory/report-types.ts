export type ReportType = 'HPM1' | 'HMM1' | 'HJM1';

export const REPORT_TYPES: readonly ReportType[] = ['HPM1', 'HMM1', 'HJM1'];

export const SUPPORTED_REPORT_SET: ReadonlySet<string> = new Set(REPORT_TYPES);

export const UNSUPPORTED_REPORT_TYPES: readonly string[] = ['HNM1', 'HAM1'];

export function isSupportedReportType(value: string): value is ReportType {
  return SUPPORTED_REPORT_SET.has(value);
}
