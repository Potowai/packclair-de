export type SystemOperator = Readonly<{ id: string; name: string }>;

const OPERATOR_TUPLES = [
  ['DE6005779374130', 'Interzero Circular Solutions Germany GmbH'],
  ['DE6005973594801', 'Reclay Systems GmbH'],
  ['DE6006382012686', 'RKD Recycling Kontor Dual GmbH & Co. KG'],
  ['DE6004919627351', 'Der Grüne Punkt – Duales System Deutschland GmbH'],
  ['DE6005906579671', 'Landbell AG für Rückhol-Systeme'],
  ['DE6005959764031', 'Noventiz Dual GmbH'],
  ['DE6007094250999', 'Zentek GmbH & Co. KG'],
  ['DE6007086225568', 'Veolia Umweltservice Dual GmbH'],
  ['DE6007168805143', 'ELS Europäische LizenzierungsSysteme GmbH'],
  ['DE6004738522858', 'BellandVision GmbH'],
  ['DE6004844021815', 'PreZero Dual GmbH'],
  ['DE6007780383579', 'EKO-PUNKT GmbH & Co. KG'],
  ['DE6257129182400', 'Recycling Dual GmbH'],
  ['DE6161328237553', 'Interzero Recycling Alliance GmbH // Lizenzero'],
  ['DE6229413357273', 'Altera System GmbH']
] as const;

export const SYSTEM_OPERATORS: readonly SystemOperator[] = OPERATOR_TUPLES.map(
  ([id, name]) => ({ id, name })
);

const OPERATOR_IDS: ReadonlySet<string> = new Set(SYSTEM_OPERATORS.map((o) => o.id));

export const OPERATOR_NAMES: ReadonlyMap<string, string> = new Map(
  SYSTEM_OPERATORS.map((o) => [o.id, o.name])
);

export function isKnownOperator(id: string): boolean {
  return OPERATOR_IDS.has(id);
}

export function operatorName(id: string): string | undefined {
  return OPERATOR_NAMES.get(id);
}
