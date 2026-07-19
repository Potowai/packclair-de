import type { ReadyDeclaration } from '../calculation/types';
import { escapeSpreadsheetCell } from './safe-csv';

export type ExportFileNames = Readonly<{
  xml: string;
  summaryCsv: string;
  auditHtml: string;
}>;

export function createExportFileNames(report: ReadyDeclaration): ExportFileNames {
  const period = `${report.periodFrom}_${report.periodTo}`;
  const safe = (s: string) => escapeSpreadsheetCell(s).replace(/[^A-Za-z0-9_.-]/g, '_');
  const operator = safe(report.operatorId);
  const base = `lucid_${report.type}_${period}_${operator}`;
  return {
    xml: `${base}.xml`,
    summaryCsv: `${base}_resume.csv`,
    auditHtml: `${base}_audit.html`
  };
}
