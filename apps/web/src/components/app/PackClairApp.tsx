import { useEffect, useReducer } from 'react';
import { registerSW } from 'virtual:pwa-register';
import { INITIAL_STATE, appReducer } from './app-reducer';
import { ContextStep } from './steps/ContextStep';
import { ImportStep } from './steps/ImportStep';
import { ProfileStep } from './steps/ProfileStep';
import { ShipmentStep } from './steps/ShipmentStep';
import { CalculationStep } from './steps/CalculationStep';
import { OperatorConfirmationStep } from './steps/OperatorConfirmationStep';
import { ExportStep } from './steps/ExportStep';
import { DataSafetyPanel } from './DataSafetyPanel';
import { FreeCalculator } from '../calculator/FreeCalculator';
import { ReferralPanel } from './ReferralPanel';
import { initReferral } from '@/app/referral';
import { createLocalDomainWorkerApi, type DomainWorkerApi } from '../../app/ports/domain-worker';
import { FreeEntitlementGateway } from '../../app/ports/entitlement-gateway';
import { ReferenceStatusGatewayImpl } from '../../app/ports/reference-status-gateway';
import { BrowserDownloadGateway, type DownloadGateway } from '../../app/ports/download-gateway';

export interface PackClairAppProps {
  domainWorker?: DomainWorkerApi;
  download?: DownloadGateway;
}

const STEP_LABELS: Record<string, string> = {
  context: 'Période',
  import: 'Import',
  profiles: 'Profils',
  shipments: 'Colis',
  calculation: 'Calcul',
  operator: 'Confirmation',
  export: 'Export'
};

export function PackClairApp({ domainWorker, download }: PackClairAppProps) {
  const [state, dispatch] = useReducer(appReducer, INITIAL_STATE);

  const worker = domainWorker ?? createLocalDomainWorkerApi();
  const gateway = download ?? new BrowserDownloadGateway();
  void FreeEntitlementGateway;
  void ReferenceStatusGatewayImpl;

  useEffect(() => {
    const update = registerSW({ immediate: true });
    initReferral();
    return () => {
      void update;
    };
  }, []);

  return (
    <main>
      <h1>Préparer ma déclaration LUCID</h1>
      <p>
        Importez vos commandes, calculez vos emballages et préparez le fichier XML à déposer vous-même
        dans LUCID. Vos données restent sur cet appareil.
      </p>

      <nav aria-label="Étapes">
        <ol>
          {Object.entries(STEP_LABELS).map(([key, label]) => (
            <li key={key} aria-current={state.step === key ? 'step' : undefined}>
              {label}
            </li>
          ))}
        </ol>
      </nav>

      {state.step === 'context' && <ContextStep state={state} dispatch={dispatch} />}
      {state.step === 'import' && (
        <ImportStep state={state} dispatch={dispatch} domainWorker={worker} />
      )}
      {state.step === 'profiles' && <ProfileStep state={state} dispatch={dispatch} />}
      {state.step === 'shipments' && <ShipmentStep state={state} dispatch={dispatch} />}
      {state.step === 'calculation' && (
        <CalculationStep state={state} dispatch={dispatch} domainWorker={worker} />
      )}
      {state.step === 'operator' && (
        <OperatorConfirmationStep state={state} dispatch={dispatch} domainWorker={worker} />
      )}
      {state.step === 'export' && (
        <ExportStep state={state} dispatch={dispatch} domainWorker={worker} download={gateway} />
      )}

      {state.lastMessage && <p role="status">{state.lastMessage}</p>}

      <DataSafetyPanel />
      <ReferralPanel />
      <FreeCalculator />
    </main>
  );
}
