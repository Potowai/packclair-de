import { useState } from 'react';
import { MATERIAL_CODES, type MaterialCode } from '../../domain/regulatory/materials';
import { formatGrams } from '../../domain/calculation/reconcile';

const EMPTY = Object.fromEntries(MATERIAL_CODES.map((c) => [c, '0'])) as Record<MaterialCode, string>;

export function FreeCalculator() {
  const [masses, setMasses] = useState<Record<MaterialCode, string>>({ ...EMPTY });
  const totalMg = MATERIAL_CODES.reduce((sum, c) => sum + (BigInt(masses[c] || '0') * 1000n), 0n);
  return (
    <section aria-labelledby="calc-heading">
      <h2 id="calc-heading">Calculateur gratuit (sans XML)</h2>
      <p>Saisissez vos masses en grammes pour obtenir une suggestion par matériau.</p>
      <ul>
        {MATERIAL_CODES.map((c) => (
          <li key={c}>
            <label>
              {c} (g)
              <input
                aria-label={`masse ${c}`}
                inputMode="numeric"
                value={masses[c]}
                onChange={(e) => setMasses({ ...masses, [c]: e.target.value })}
              />
            </label>
          </li>
        ))}
      </ul>
      <p>Total : {formatGrams(totalMg)} kg-equivalents (suggestion, pas un dépôt LUCID).</p>
    </section>
  );
}
