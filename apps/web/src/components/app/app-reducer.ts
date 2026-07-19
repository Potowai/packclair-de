import type { ImportBatch, CsvMapping } from '../../domain/import/types';
import type { CalculationSnapshot, ReadyDeclaration } from '../../domain/calculation/types';
import type { MaterialCode } from '../../domain/regulatory/materials';
import type { SupportedReport } from '../../domain/xml/types';

export type MonoParcelAttestation = Readonly<{
  profileRevisionId: string;
  attestedAt: string;
}>;

export type AppStep =
  | 'context'
  | 'import'
  | 'profiles'
  | 'shipments'
  | 'calculation'
  | 'operator'
  | 'export';

export type ReportContext = Readonly<{
  type: SupportedReport;
  reportYear: number;
  periodFromMonth: number;
  periodToMonth: number;
}>;

export type AppState = Readonly<{
  step: AppStep;
  reportContext?: ReportContext;
  batchId?: string;
  snapshotId?: string;
  operatorId?: string;
  importBatch?: ImportBatch;
  mapping?: CsvMapping;
  snapshot?: CalculationSnapshot;
  confirmedGrams: Partial<Record<MaterialCode, string>>;
  reasons: Partial<Record<MaterialCode, string>>;
  monoParcelAttestation?: MonoParcelAttestation;
  declaration?: ReadyDeclaration;
  xmlBytes?: Uint8Array;
  blockingErrors: readonly string[];
  lastMessage?: string;
}>;

export const INITIAL_STATE: AppState = {
  step: 'context',
  confirmedGrams: {},
  reasons: {},
  blockingErrors: []
};

export type AppAction =
  | { type: 'SET_CONTEXT'; context: ReportContext }
  | { type: 'IMPORT_BATCH'; batch: ImportBatch; mapping: CsvMapping }
  | { type: 'ATTEST_MONO_PARCEL'; profileRevisionId: string; attestedAt: string }
  | { type: 'SET_PROFILES_DONE' }
  | { type: 'SET_SHIPMENTS_DONE' }
  | { type: 'CALCULATED'; snapshot: CalculationSnapshot }
  | { type: 'SET_OPERATOR'; operatorId: string }
  | { type: 'SET_CONFIRMED'; code: MaterialCode; value: string }
  | { type: 'SET_REASON'; code: MaterialCode; reason: string }
  | { type: 'RECONCILED'; declaration: ReadyDeclaration }
  | { type: 'XML_READY'; bytes: Uint8Array }
  | { type: 'SET_ERRORS'; errors: readonly string[] }
  | { type: 'SET_MESSAGE'; message: string }
  | { type: 'GO_TO'; step: AppStep }
  | { type: 'BACK' };

const STEP_ORDER: AppStep[] = [
  'context',
  'import',
  'profiles',
  'shipments',
  'calculation',
  'operator',
  'export'
];

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_CONTEXT':
      return { ...state, reportContext: action.context, step: 'import' };
    case 'IMPORT_BATCH':
      return {
        ...state,
        importBatch: action.batch,
        mapping: action.mapping,
        batchId: action.batch.id,
        step: 'profiles'
      };
    case 'ATTEST_MONO_PARCEL':
      return {
        ...state,
        monoParcelAttestation: {
          profileRevisionId: action.profileRevisionId,
          attestedAt: action.attestedAt
        },
        step: 'calculation'
      };
    case 'SET_PROFILES_DONE':
      return { ...state, step: 'shipments' };
    case 'SET_SHIPMENTS_DONE':
      return { ...state, step: 'calculation' };
    case 'CALCULATED':
      return { ...state, snapshot: action.snapshot, snapshotId: action.snapshot.id, step: 'operator' };
    case 'SET_OPERATOR':
      return { ...state, operatorId: action.operatorId };
    case 'SET_CONFIRMED':
      return {
        ...state,
        confirmedGrams: { ...state.confirmedGrams, [action.code]: action.value }
      };
    case 'SET_REASON':
      return { ...state, reasons: { ...state.reasons, [action.code]: action.reason } };
    case 'RECONCILED':
      return { ...state, declaration: action.declaration, step: 'export' };
    case 'XML_READY':
      return { ...state, xmlBytes: action.bytes, lastMessage: 'XML généré' };
    case 'SET_ERRORS':
      return { ...state, blockingErrors: action.errors };
    case 'SET_MESSAGE':
      return { ...state, lastMessage: action.message };
    case 'GO_TO':
      return { ...state, step: action.step };
    case 'BACK': {
      const idx = STEP_ORDER.indexOf(state.step);
      const prev = STEP_ORDER[Math.max(0, idx - 1)]!;
      return { ...state, step: prev };
    }
    default:
      return state;
  }
}
