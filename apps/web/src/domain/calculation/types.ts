import type { MaterialCode } from '../regulatory/materials';
import type { ReportType } from '../regulatory/report-types';

export type MaterialMasses = Readonly<Record<MaterialCode, bigint>>;

export type PackagingProfileRevision = Readonly<{
  id: string;
  logicalId: string;
  revision: number;
  kind: 'product' | 'shipment';
  sku: string | null;
  massesMg: MaterialMasses;
}>;

export type OrderLine = Readonly<{
  orderId: string;
  lineId?: string;
  shipmentId: string | null;
  sku: string;
  quantity: bigint;
}>;

export type Shipment = Readonly<{
  shipmentId: string;
  parcelCount: bigint;
  profileRevisionId: string;
}>;

export type MonoParcelAttestation = Readonly<{
  batchId: string;
  acceptedAt: string;
  profileRevisionId: string;
}>;

export type LineContribution = Readonly<{
  lineKey: string;
  profileRevisionId: string;
  quantity: bigint;
  massesMg: MaterialMasses;
}>;

export type ShipmentContribution = Readonly<{
  shipmentKey: string;
  profileRevisionId: string;
  parcelCount: bigint;
  massesMg: MaterialMasses;
}>;

export type CalculationInput = Readonly<{
  id?: string;
  sourceKey: string;
  accountKey: string;
  batchIds: readonly string[];
  createdAt: string;
  trustedDateBerlin: string;
  profileRevisions: readonly PackagingProfileRevision[];
  lines: readonly OrderLine[];
  shipments: readonly Shipment[];
  monoParcelAttestation?: MonoParcelAttestation;
}>;

export type CalculationSnapshot = Readonly<{
  id: string;
  createdAt: string;
  trustedDateBerlin: string;
  engineVersion: '1';
  referenceSetVersion: string;
  sourceKey: string;
  accountKey: string;
  batchIds: readonly string[];
  profileSnapshots: readonly PackagingProfileRevision[];
  profileRevisionIds: readonly string[];
  lineContributions: readonly LineContribution[];
  shipmentContributions: readonly ShipmentContribution[];
  calculatedMg: MaterialMasses;
}>;

export type DeclarationBlocker = Readonly<{
  code:
    | 'MISSING_PROFILE'
    | 'INVALID_QUANTITY'
    | 'SHIPMENT_CONFLICT'
    | 'MISSING_SHIPMENT_ATTESTATION'
    | 'UNMOTIVATED_DIFFERENCE'
    | 'NEGATIVE_MASS'
    | 'INVALID_CONFIRMED_FORMAT'
    | 'NO_OPERATOR'
    | 'NO_NONZERO_MATERIAL';
  detail: string;
  material?: MaterialCode;
}>;

export type MotivatedDifference = Readonly<{
  material: MaterialCode;
  suggestedGrams: bigint;
  confirmedGrams: bigint;
  reason: string;
}>;

export type ReadyDeclaration = Readonly<{
  type: ReportType;
  reportYear: number;
  periodFrom: string;
  periodTo: string;
  operatorId: string;
  operatorConfirmedAt: string;
  confirmedGrams: Readonly<Partial<Record<MaterialCode, bigint>>>;
  referenceSetVersion: string;
  motivatedDifferences: readonly MotivatedDifference[];
}>;

export type Reconciliation =
  | { ok: true; value: ReadyDeclaration }
  | { ok: false; blockers: readonly DeclarationBlocker[] };

export class DomainError extends Error {
  code: string;
  constructor(code: string, message?: string) {
    super(message ?? code);
    this.name = 'DomainError';
    this.code = code;
  }
}
