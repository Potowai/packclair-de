import type { MaterialCode } from '../regulatory/materials';
import { MATERIAL_CODES } from '../regulatory/materials';
import type { ReportType } from '../regulatory/report-types';
import { REFERENCE_SET_VERSION } from '../regulatory/reference-set';
import { formatGrams } from '../calculation/reconcile';
import { MODERN_MATERIALS, SUPPORTED_REPORTS } from './types';
import type { ReadyDeclaration } from '../calculation/types';

const UTF8_BOM = [0xef, 0xbb, 0xbf];

const MODERN_SET = new Set<string>(MODERN_MATERIALS);
const SUPPORTED_SET = new Set<string>(SUPPORTED_REPORTS);

function escapeText(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function serializeLucidXml(report: ReadyDeclaration): Uint8Array {
  if (!SUPPORTED_SET.has(report.type)) {
    throw new DomainError('UNSUPPORTED_REPORT', `rapport non pris en charge: ${report.type}`);
  }
  if (report.referenceSetVersion !== REFERENCE_SET_VERSION) {
    throw new DomainError(
      'REFERENCE_VERSION_MISMATCH',
      `référentiel ${report.referenceSetVersion} != ${REFERENCE_SET_VERSION}`
    );
  }

  const materials: { code: MaterialCode; grams: bigint }[] = [];
  for (const [rawCode, grams] of Object.entries(report.confirmedGrams)) {
    if (grams === undefined || grams === null) continue;
    if (MODERN_SET.has(rawCode)) {
      throw new DomainError('MODERN_MATERIAL', `matériau moderne non pris en charge: ${rawCode}`);
    }
    if (!MATERIAL_CODES.includes(rawCode as MaterialCode)) {
      throw new DomainError('UNKNOWN_MATERIAL', `matériau inconnu: ${rawCode}`);
    }
    const code = rawCode as MaterialCode;
    if (grams < 0n) {
      throw new DomainError('NEGATIVE_MASS', `matériau ${code}`);
    }
    if (grams === 0n) continue;
    materials.push({ code, grams });
  }

  if (materials.length === 0) {
    throw new DomainError('NO_NONZERO_MATERIAL', 'aucune masse non nulle à déclarer');
  }

  materials.sort((a, b) => a.code.localeCompare(b.code));

  const escapedOperator = escapeText(report.operatorId);
  const materialXml = materials
    .map(
      (m) =>
        `      <Material>\n        <MaterialCode>${escapeText(m.code)}</MaterialCode>\n        <Mass>${escapeText(
          formatGrams(m.grams)
        )}</Mass>\n      </Material>`
    )
    .join('\n');

  const xml =
    `<?xml version="1.0"?>\n` +
    `<Root>\n` +
    `  <VersionNoInterface>1.0</VersionNoInterface>\n` +
    `  <PackagingTypeCode>V</PackagingTypeCode>\n` +
    `  <TypeOfReportCode>${escapeText(report.type)}</TypeOfReportCode>\n` +
    `  <ReportingPeriodFrom>${escapeText(report.periodFrom)}</ReportingPeriodFrom>\n` +
    `  <ReportingPeriodTo>${escapeText(report.periodTo)}</ReportingPeriodTo>\n` +
    `  <ListOfSystemOperators>\n` +
    `    <SystemOperator>\n` +
    `      <SystemOperatorID>${escapedOperator}</SystemOperatorID>\n` +
    `      <ListOfMaterials>\n${materialXml}\n      </ListOfMaterials>\n` +
    `    </SystemOperator>\n` +
    `  </ListOfSystemOperators>\n` +
    `</Root>\n`;

  const body = new TextEncoder().encode(xml);
  const out = new Uint8Array(UTF8_BOM.length + body.length);
  out.set(UTF8_BOM, 0);
  out.set(body, UTF8_BOM.length);
  return out;
}

export class DomainError extends Error {
  code: string;
  constructor(code: string, message?: string) {
    super(message ?? code);
    this.name = 'DomainError';
    this.code = code;
  }
}
