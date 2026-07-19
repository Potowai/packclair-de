export type MaterialCode =
  | '10000'
  | '20000'
  | '30000'
  | '40000'
  | '50000'
  | '60000'
  | '70000'
  | '80000';

export const MATERIAL_CODES: readonly MaterialCode[] = [
  '10000',
  '20000',
  '30000',
  '40000',
  '50000',
  '60000',
  '70000',
  '80000'
];

export const MATERIAL_LABELS: Readonly<Record<MaterialCode, string>> = {
  '10000': 'Verre',
  '20000': 'Papier, carton plat, carton (PPC)',
  '30000': 'Métaux ferreux',
  '40000': 'Aluminium',
  '50000': 'Plastiques',
  '60000': 'Emballages en carton pour boissons',
  '70000': 'Autres emballages composites',
  '80000': 'Autres matériaux'
};

export const MODERN_MATERIAL_SET: ReadonlySet<string> = new Set(MATERIAL_CODES);

export function isModernMaterialCode(value: string): value is MaterialCode {
  return MODERN_MATERIAL_SET.has(value);
}
