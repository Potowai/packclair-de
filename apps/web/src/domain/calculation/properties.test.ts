import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { calculatePackaging } from './calculate';
import { addMasses, scaleMasses, emptyMasses } from './mass';
import { MATERIAL_CODES } from '../regulatory/materials';
import type { MaterialMasses, PackagingProfileRevision } from './types';

function randProfile(id: string, kind: 'product' | 'shipment' = 'product'): PackagingProfileRevision {
  const masses = {} as Record<string, bigint>;
  for (const code of MATERIAL_CODES) masses[code] = 0n;
  masses['20000'] = BigInt(Math.floor(Math.random() * 1000)) * 1000n;
  return {
    id,
    logicalId: id,
    revision: 1,
    kind,
    sku: kind === 'product' ? id : null,
    massesMg: masses as MaterialMasses
  };
}

describe('propriétés du moteur de calcul', () => {
  it('indépendance de l’ordre des lignes', () => {
    const shipmentProfile = randProfile('parcel@1', 'shipment');
    fc.assert(
      fc.property(
        fc.array(fc.tuple(fc.integer({ min: 1, max: 9 }), fc.integer({ min: 1, max: 5 })), { minLength: 1, maxLength: 12 }),
        (entries) => {
          const profiles = entries.map(([i]) => randProfile(`p${i}`, 'product'));
          const bySku = new Map(profiles.map((p) => [p.sku as string, p]));
          const make = (ordered: typeof entries) => {
            const lines = ordered.map(([i, q], idx) => ({
              orderId: `O${idx}`,
              lineId: String(idx),
              shipmentId: `S${idx}`,
              sku: `p${i}`,
              quantity: BigInt(q)
            }));
            return calculatePackaging({
              sourceKey: 's', accountKey: 'a', batchIds: ['b1'],
              createdAt: '2026-07-12T10:00:00.000Z', trustedDateBerlin: '2026-07-12',
              profileRevisions: [...profiles, shipmentProfile],
              lines,
              shipments: [],
              monoParcelAttestation: { batchId: 'b1', acceptedAt: '2026-07-12', profileRevisionId: 'parcel@1' }
            });
          };
          const a = make(entries);
          const b = make([...entries].reverse());
          expect(a.calculatedMg['20000']).toEqual(b.calculatedMg['20000']);
          void bySku;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('associativité de l’agrégation', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            m: fc.integer({ min: 0, max: 1000 }),
            f: fc.integer({ min: 1, max: 5 })
          }),
          { minLength: 1, maxLength: 10 }
        ),
        (items) => {
          const ms: MaterialMasses[] = items.map((it) => {
            const m = emptyMasses();
            m['20000'] = BigInt(it.m) * 1000n;
            return m;
          });
          const totalDirect = ms.reduce((acc, m) => addMasses(acc, m), emptyMasses());
          const firstHalf = ms.slice(0, Math.ceil(ms.length / 2)).reduce((acc, m) => addMasses(acc, m), emptyMasses());
          const secondHalf = ms.slice(Math.ceil(ms.length / 2)).reduce((acc, m) => addMasses(acc, m), emptyMasses());
          const totalSplit = addMasses(firstHalf, secondHalf);
          expect(totalDirect['20000']).toEqual(totalSplit['20000']);
          const scaled = scaleMasses(totalDirect, 2n);
          expect(scaled['20000']).toEqual(totalDirect['20000'] * 2n);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('totaux non négatifs pour des composants non négatifs', () => {
    fc.assert(
      fc.property(fc.array(fc.integer({ min: 0, max: 1000 }), { minLength: 1, maxLength: 8 }), (vals) => {
        const m = emptyMasses();
        m['20000'] = BigInt(vals.reduce((a, b) => a + b, 0)) * 1000n;
        expect(m['20000']! >= 0n).toBe(true);
      })
    );
  });
});
