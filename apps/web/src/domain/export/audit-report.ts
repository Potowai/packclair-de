import { escapeSpreadsheetCell } from './safe-csv';
import type { ReadyDeclaration } from '../calculation/types';
import type { MaterialCode } from '../regulatory/materials';
import { formatGrams } from '../calculation/reconcile';

export type AuditMeta = Readonly<{
  snapshotId: string;
  engineVersion: string;
  referenceSetVersion: string;
  sourceKey: string;
  accountKey: string;
  createdAt: string;
}>;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function createAuditHtml(report: ReadyDeclaration, meta: AuditMeta): string {
  const rows = (Object.keys(report.confirmedGrams) as MaterialCode[])
    .map((code) => {
      const grams = report.confirmedGrams[code];
      if (grams === undefined) return '';
      const motivated = report.motivatedDifferences.find((d) => d.material === code);
      const reason = motivated ? escapeHtml(motivated.reason) : '';
      return (
        `      <tr><td>${escapeHtml(code)}</td>` +
        `<td>${escapeHtml(formatGrams(grams))}</td>` +
        `<td>${reason}</td></tr>`
      );
    })
    .filter((r) => r.length > 0)
    .join('\n');

  return (
    `<!doctype html>\n<html lang="fr"><head><meta charset="utf-8">` +
    `<title>Audit PackClair ${escapeHtml(report.type)}</title></head>\n<body>\n` +
    `<h1>Audit de déclaration</h1>\n` +
    `<dl>` +
    `<dt>Rapport</dt><dd>${escapeHtml(report.type)}</dd>` +
    `<dt>Période</dt><dd>${escapeHtml(report.periodFrom)} → ${escapeHtml(report.periodTo)}</dd>` +
    `<dt>Opérateur</dt><dd>${escapeHtml(report.operatorId)}</dd>` +
    `<dt>Confirmé le</dt><dd>${escapeHtml(report.operatorConfirmedAt)}</dd>` +
    `<dt>Snapshot</dt><dd>${escapeHtml(meta.snapshotId)}</dd>` +
    `<dt>Moteur</dt><dd>${escapeHtml(meta.engineVersion)}</dd>` +
    `<dt>Référentiel</dt><dd>${escapeHtml(meta.referenceSetVersion)}</dd>` +
    `<dt>Source</dt><dd>${escapeHtml(meta.sourceKey)} / ${escapeHtml(meta.accountKey)}</dd>` +
    `<dt>Créé le</dt><dd>${escapeHtml(meta.createdAt)}</dd>` +
    `</dl>\n` +
    `<table><thead><tr><th>Matériau</th><th>Masse (g)</th><th>Motif d'écart</th></tr></thead>\n<tbody>\n${rows}\n</tbody></table>\n` +
    `</body></html>\n`
  );
}
