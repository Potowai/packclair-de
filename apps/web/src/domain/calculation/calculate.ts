import { REFERENCE_SET_VERSION } from '../regulatory/reference-set';
import type {
  CalculationInput,
  CalculationSnapshot,
  LineContribution,
  MaterialMasses,
  OrderLine,
  PackagingProfileRevision,
  Shipment,
  ShipmentContribution
} from './types';
import { DomainError } from './types';
import {
  addMasses,
  emptyMasses,
  scaleMasses,
  ZERO_MASSES
} from './mass';

const COMPONENT_MAX_MG = 100_000_000_000n; // 100 kg
const QUANTITY_MAX = 1_000_000n;
const PRODUCT_PREFIX = 'product:';
const SHIPMENT_PREFIX = 'shipment:';

function lineKeyOf(
  sourceKey: string,
  accountKey: string,
  line: OrderLine
): string {
  return `${sourceKey}/${accountKey}/${line.orderId}/${line.lineId ?? ''}`;
}

function shipmentKeyOf(
  sourceKey: string,
  accountKey: string,
  shipmentId: string
): string {
  return `${sourceKey}/${accountKey}/${shipmentId}`;
}

export function calculatePackaging(input: CalculationInput): CalculationSnapshot {
  const productProfiles = new Map<string, PackagingProfileRevision>();
  const shipmentProfiles = new Map<string, PackagingProfileRevision>();
  for (const p of input.profileRevisions) {
    if (p.kind === 'product' && p.sku !== null) productProfiles.set(p.sku, p);
    else shipmentProfiles.set(p.id, p);
  }

  const lineContributions: LineContribution[] = [];
  const seenLineKeys = new Set<string>();
  const calculated = emptyMasses();

  for (const line of input.lines) {
    if (line.quantity < 1n || line.quantity > QUANTITY_MAX) {
      throw new DomainError('INVALID_QUANTITY', `qty ${line.quantity}`);
    }
    const profile = productProfiles.get(line.sku);
    if (!profile) {
      throw new DomainError('MISSING_PROFILE', `sku ${line.sku}`);
    }
    for (const code of Object.keys(profile.massesMg) as (keyof MaterialMasses)[]) {
      const v = profile.massesMg[code];
      if (v < 0n || v > COMPONENT_MAX_MG) {
        throw new DomainError('COMPONENT_LIMIT', `component ${code}`);
      }
    }
    const key = lineKeyOf(input.sourceKey, input.accountKey, line);
    if (seenLineKeys.has(key)) {
      throw new DomainError('DUPLICATE_LINE', key);
    }
    seenLineKeys.add(key);
    const contribution = scaleMasses(profile.massesMg, line.quantity);
    lineContributions.push({
      lineKey: key,
      profileRevisionId: profile.id,
      quantity: line.quantity,
      massesMg: contribution
    });
    for (const code of Object.keys(calculated) as (keyof MaterialMasses)[]) {
      calculated[code] = (calculated[code] ?? 0n) + (contribution[code] ?? 0n);
    }
  }

  const shipmentContributions: ShipmentContribution[] = [];
  const shipmentDefs = new Map<
    string,
    { parcelCount: bigint; profileRevisionId: string }
  >();

  for (const def of input.shipments) {
    const key = shipmentKeyOf(input.sourceKey, input.accountKey, def.shipmentId);
    const prior = shipmentDefs.get(key);
    if (prior && prior.parcelCount !== def.parcelCount) {
      throw new DomainError('SHIPMENT_CONFLICT', def.shipmentId);
    }
    shipmentDefs.set(key, {
      parcelCount: def.parcelCount,
      profileRevisionId: def.profileRevisionId
    });
  }

  for (const line of input.lines) {
    if (line.shipmentId === null) {
      if (!input.monoParcelAttestation) {
        throw new DomainError(
          'MISSING_SHIPMENT_ATTESTATION',
          `order ${line.orderId} without shipment id`
        );
      }
      const key = shipmentKeyOf(input.sourceKey, input.accountKey, line.orderId);
      if (!shipmentDefs.has(key)) {
        shipmentDefs.set(key, {
          parcelCount: 1n,
          profileRevisionId: input.monoParcelAttestation.profileRevisionId
        });
      }
      continue;
    }
    const key = shipmentKeyOf(input.sourceKey, input.accountKey, line.shipmentId);
    if (shipmentDefs.has(key)) continue;
    if (input.monoParcelAttestation) {
      shipmentDefs.set(key, {
        parcelCount: 1n,
        profileRevisionId: input.monoParcelAttestation.profileRevisionId
      });
    } else {
      throw new DomainError('MISSING_PROFILE', `shipment ${key}`);
    }
  }

  for (const [key, info] of shipmentDefs) {
    const profile = shipmentProfiles.get(info.profileRevisionId);
    if (!profile) {
      throw new DomainError('MISSING_PROFILE', `shipment profile ${info.profileRevisionId}`);
    }
    for (const code of Object.keys(profile.massesMg) as (keyof MaterialMasses)[]) {
      const v = profile.massesMg[code];
      if (v < 0n || v > COMPONENT_MAX_MG) {
        throw new DomainError('COMPONENT_LIMIT', `component ${code}`);
      }
    }
    const contribution = scaleMasses(profile.massesMg, info.parcelCount);
    shipmentContributions.push({
      shipmentKey: key,
      profileRevisionId: profile.id,
      parcelCount: info.parcelCount,
      massesMg: contribution
    });
    for (const code of Object.keys(calculated) as (keyof MaterialMasses)[]) {
      calculated[code] = (calculated[code] ?? 0n) + (contribution[code] ?? 0n);
    }
  }

  const profileRevisionIds = input.profileRevisions.map((p) => p.id);

  return {
    id: input.id ?? createSnapshotId(input),
    createdAt: input.createdAt,
    trustedDateBerlin: input.trustedDateBerlin,
    engineVersion: '1',
    referenceSetVersion: REFERENCE_SET_VERSION,
    sourceKey: input.sourceKey,
    accountKey: input.accountKey,
    batchIds: input.batchIds,
    profileSnapshots: input.profileRevisions,
    profileRevisionIds,
    lineContributions,
    shipmentContributions,
    calculatedMg: calculated
  };
}

function createSnapshotId(input: CalculationInput): string {
  const parts = [
    input.sourceKey,
    input.accountKey,
    input.batchIds.join(','),
    input.createdAt,
    String(input.lines.length),
    String(input.shipments.length)
  ];
  return `snap_${parts.join('_')}`;
}

export function snapshotFingerprint(snapshot: CalculationSnapshot): string {
  return JSON.stringify({
    engineVersion: snapshot.engineVersion,
    referenceSetVersion: snapshot.referenceSetVersion,
    sourceKey: snapshot.sourceKey,
    accountKey: snapshot.accountKey,
    batchIds: snapshot.batchIds,
    profiles: snapshot.profileSnapshots.map((p) => ({
      id: p.id,
      revision: p.revision,
      massesMg: p.massesMg
    })),
    lines: snapshot.lineContributions.map((l) => ({
      key: l.lineKey,
      qty: l.quantity.toString()
    })),
    shipments: snapshot.shipmentContributions.map((s) => ({
      key: s.shipmentKey,
      parcels: s.parcelCount.toString()
    }))
  });
}

export const PROFILE_PREFIXES = { PRODUCT_PREFIX, SHIPMENT_PREFIX };
export { ZERO_MASSES };
