import type { MaterialCode } from '../regulatory/materials';
import { MATERIAL_CODES } from '../regulatory/materials';
import type { MaterialMasses } from './types';

type MutableMasses = Record<MaterialCode, bigint>;

export const ZERO_MASSES: MaterialMasses = Object.freeze(
  MATERIAL_CODES.reduce((acc, code) => {
    acc[code] = 0n;
    return acc;
  }, {} as MutableMasses) as MutableMasses
);

export function emptyMasses(): MutableMasses {
  return { ...ZERO_MASSES };
}

export function addMasses(a: MaterialMasses, b: MaterialMasses): MaterialMasses {
  const out = emptyMasses();
  for (const code of MATERIAL_CODES) {
    out[code] = (a[code] ?? 0n) + (b[code] ?? 0n);
  }
  return out;
}

export function scaleMasses(m: MaterialMasses, factor: bigint): MaterialMasses {
  const out = emptyMasses();
  for (const code of MATERIAL_CODES) {
    out[code] = (m[code] ?? 0n) * factor;
  }
  return out;
}

export function roundSuggestionToGrams(mg: bigint): bigint {
  const halfGram = 500n;
  const rounded = (mg + halfGram) / 1000n;
  return rounded;
}

export function massesToGrams(mg: MaterialMasses): Record<MaterialCode, bigint> {
  const out = {} as Record<MaterialCode, bigint>;
  for (const code of MATERIAL_CODES) {
    out[code] = roundSuggestionToGrams(mg[code] ?? 0n);
  }
  return out;
}
