import { describe, expect, it } from 'vitest';
import { calculatePackaging } from './calculate';
import { reconcileConfirmedTotals, formatGrams, parseConfirmedGrams } from './reconcile';
import { roundSuggestionToGrams } from './mass';
import { DomainError } from './types';
import type {
  CalculationSnapshot,
  MaterialMasses,
  OrderLine,
  PackagingProfileRevision,
  Shipment
} from './types';
import { MATERIAL_CODES } from '../regulatory/materials';

function cardboard(mg: bigint): MaterialMasses {
  const m: Record<string, bigint> = {};
  for (const code of MATERIAL_CODES) m[code] = 0n;
  m['20000'] = mg;
  return m as MaterialMasses;
}

function makeProfile(
  id: string,
  kind: 'product' | 'shipment',
  sku: string | null,
  mg: bigint
): PackagingProfileRevision {
  return { id, logicalId: id, revision: 1, kind, sku, massesMg: cardboard(mg) };
}

describe('moteur de calcul par expédition', () => {
  it('calcule emballage produit + expédition multi-colis', () => {
    const mugProfile = makeProfile('mug@1', 'product', 'MUG', 10_000n);
    const cardProfile = makeProfile('card@1', 'product', 'CARD', 4_000n);
    const parcelProfile = makeProfile('parcel@1', 'shipment', null, 10_000n);
    const snapshot = calculatePackaging({
      sourceKey: 'etsy',
      accountKey: 'shop-a',
      batchIds: ['b1'],
      createdAt: '2026-07-12T10:00:00.000Z',
      trustedDateBerlin: '2026-07-12',
      profileRevisions: [mugProfile, cardProfile, parcelProfile],
      lines: [
        { orderId: 'A', lineId: '1', shipmentId: 'S1', sku: 'MUG', quantity: 2n },
        { orderId: 'A', lineId: '2', shipmentId: 'S1', sku: 'CARD', quantity: 1n }
      ],
      shipments: [{ shipmentId: 'S1', parcelCount: 2n, profileRevisionId: 'parcel@1' }]
    });
    expect(snapshot.calculatedMg['20000']).toBe(44_000n);
    expect(snapshot.profileRevisionIds).toEqual(['mug@1', 'card@1', 'parcel@1']);
  });

  it('compte une expédition partagée par deux commandes une seule fois', () => {
    const product = makeProfile('prod@1', 'product', 'X', 5_000n);
    const parcel = makeProfile('parcel@1', 'shipment', null, 10_000n);
    const snap = calculatePackaging({
      sourceKey: 's', accountKey: 'a', batchIds: ['b1'],
      createdAt: '2026-07-12T10:00:00.000Z', trustedDateBerlin: '2026-07-12',
      profileRevisions: [product, parcel],
      lines: [
        { orderId: 'A', shipmentId: 'S1', sku: 'X', quantity: 1n },
        { orderId: 'B', shipmentId: 'S1', sku: 'X', quantity: 1n }
      ],
      shipments: [{ shipmentId: 'S1', parcelCount: 1n, profileRevisionId: 'parcel@1' }]
    });
    expect(snap.calculatedMg['20000']).toBe(20_000n);
    expect(snap.shipmentContributions.length).toBe(1);
  });

  it('lance SHIPMENT_CONFLICT pour des définitions contradictoires', () => {
    const product = makeProfile('prod@1', 'product', 'X', 5_000n);
    const parcel = makeProfile('parcel@1', 'shipment', null, 10_000n);
    expect(() =>
      calculatePackaging({
        sourceKey: 's', accountKey: 'a', batchIds: ['b1'],
        createdAt: '2026-07-12T10:00:00.000Z', trustedDateBerlin: '2026-07-12',
        profileRevisions: [product, parcel],
        lines: [
          { orderId: 'A', shipmentId: 'S1', sku: 'X', quantity: 1n },
          { orderId: 'B', shipmentId: 'S1', sku: 'X', quantity: 1n }
        ],
        shipments: [
          { shipmentId: 'S1', parcelCount: 2n, profileRevisionId: 'parcel@1' },
          { shipmentId: 'S1', parcelCount: 3n, profileRevisionId: 'parcel@1' }
        ]
      })
    ).toThrowError(expect.objectContaining({ code: 'SHIPMENT_CONFLICT' }));
  });

  it('exige une attestation mono-colis sans identifiant d’expédition', () => {
    const product = makeProfile('prod@1', 'product', 'X', 5_000n);
    const parcel = makeProfile('parcel@1', 'shipment', null, 10_000n);
    expect(() =>
      calculatePackaging({
        sourceKey: 's', accountKey: 'a', batchIds: ['b1'],
        createdAt: '2026-07-12T10:00:00.000Z', trustedDateBerlin: '2026-07-12',
        profileRevisions: [product, parcel],
        lines: [{ orderId: 'A', sku: 'X', quantity: 1n, shipmentId: null }],
        shipments: []
      })
    ).toThrowError(expect.objectContaining({ code: 'MISSING_SHIPMENT_ATTESTATION' }));
  });

  it('utilise l’attestation mono-colis quand shipmentId est absent', () => {
    const product = makeProfile('prod@1', 'product', 'X', 5_000n);
    const parcel = makeProfile('parcel@1', 'shipment', null, 10_000n);
    const snap = calculatePackaging({
      sourceKey: 's', accountKey: 'a', batchIds: ['b1'],
      createdAt: '2026-07-12T10:00:00.000Z', trustedDateBerlin: '2026-07-12',
      profileRevisions: [product, parcel],
      lines: [{ orderId: 'A', sku: 'X', quantity: 1n, shipmentId: null }],
      shipments: [],
      monoParcelAttestation: { batchId: 'b1', acceptedAt: '2026-07-12', profileRevisionId: 'parcel@1' }
    });
    expect(snap.calculatedMg['20000']).toBe(15_000n);
  });

  it('recalcule bit à bit un instantané figé après modification des profils courants', () => {
    const mug = makeProfile('mug@1', 'product', 'MUG', 10_000n);
    const parcel = makeProfile('parcel@1', 'shipment', null, 0n);
    const snapshot = calculatePackaging({
      sourceKey: 's', accountKey: 'a', batchIds: ['b1'],
      createdAt: '2026-07-12T10:00:00.000Z', trustedDateBerlin: '2026-07-12',
      profileRevisions: [mug, parcel],
      lines: [{ orderId: 'A', lineId: '1', shipmentId: null, sku: 'MUG', quantity: 2n }],
      shipments: [],
      monoParcelAttestation: { batchId: 'b1', acceptedAt: '2026-07-12', profileRevisionId: 'parcel@1' }
    });
    const frozen = structuredClone(snapshot);
    const reMug = makeProfile('mug@1', 'product', 'MUG', 99_999n);
    const reComputed = calculatePackaging({
      sourceKey: 's', accountKey: 'a', batchIds: ['b1'],
      createdAt: '2026-07-12T10:00:00.000Z', trustedDateBerlin: '2026-07-12',
      profileRevisions: [reMug, parcel],
      lines: [{ orderId: 'A', lineId: '1', shipmentId: null, sku: 'MUG', quantity: 2n }],
      shipments: [],
      monoParcelAttestation: { batchId: 'b1', acceptedAt: '2026-07-12', profileRevisionId: 'parcel@1' }
    });
    expect(reComputed.calculatedMg['20000']).toBe(199_998n);
    expect(frozen.calculatedMg['20000']).toBe(20_000n);
  });
});

describe('arrondi PackClair', () => {
  it('arrondit au gramme le plus proche, demi au-dessus', () => {
    expect(roundSuggestionToGrams(999n)).toBe(1n);
    expect(roundSuggestionToGrams(1000n)).toBe(1n);
    expect(roundSuggestionToGrams(1499n)).toBe(1n);
    expect(roundSuggestionToGrams(1500n)).toBe(2n);
  });
});

describe('rapprochement des masses confirmées', () => {
  it('blocage si différence non motivée', () => {
    const mug = makeProfile('mug@1', 'product', 'MUG', 26_500_000n);
    const parcel = makeProfile('parcel@1', 'shipment', null, 0n);
    const snapshot = calculatePackaging({
      sourceKey: 's', accountKey: 'a', batchIds: ['b1'],
      createdAt: '2026-07-12T10:00:00.000Z', trustedDateBerlin: '2026-07-12',
      profileRevisions: [mug, parcel],
      lines: [{ orderId: 'A', lineId: '1', shipmentId: null, sku: 'MUG', quantity: 1n }],
      shipments: [],
      monoParcelAttestation: { batchId: 'b1', acceptedAt: '2026-07-12', profileRevisionId: 'parcel@1' }
    });
    const result = reconcileConfirmedTotals({
      snapshot,
      type: 'HMM1',
      reportYear: 2026,
      periodFrom: '2026-04-01',
      periodTo: '2026-06-30',
      operatorId: 'DE6005779374130',
      operatorConfirmedAt: '2026-07-12',
      confirmedGrams: { '20000': '27,000' }
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.blockers.some((b) => b.code === 'UNMOTIVATED_DIFFERENCE')).toBe(true);
    }
  });

  it('accepte une différence motivée', () => {
    const mug = makeProfile('mug@1', 'product', 'MUG', 26_500_000n);
    const parcel = makeProfile('parcel@1', 'shipment', null, 0n);
    const snapshot = calculatePackaging({
      sourceKey: 's', accountKey: 'a', batchIds: ['b1'],
      createdAt: '2026-07-12T10:00:00.000Z', trustedDateBerlin: '2026-07-12',
      profileRevisions: [mug, parcel],
      lines: [{ orderId: 'A', lineId: '1', shipmentId: null, sku: 'MUG', quantity: 1n }],
      shipments: [],
      monoParcelAttestation: { batchId: 'b1', acceptedAt: '2026-07-12', profileRevisionId: 'parcel@1' }
    });
    const result = reconcileConfirmedTotals({
      snapshot,
      type: 'HMM1',
      reportYear: 2026,
      periodFrom: '2026-04-01',
      periodTo: '2026-06-30',
      operatorId: 'DE6005779374130',
      operatorConfirmedAt: '2026-07-12',
      confirmedGrams: { '20000': '27,000' },
      reasons: { '20000': 'Retours déduits selon opérateur' }
    });
    expect(result.ok).toBe(true);
  });

  it('parse et formate les grammes', () => {
    expect(parseConfirmedGrams('26,500')).toBe(26_500n);
    expect(parseConfirmedGrams('abc')).toBeNull();
    expect(formatGrams(26_500n)).toBe('26,500');
  });
});
