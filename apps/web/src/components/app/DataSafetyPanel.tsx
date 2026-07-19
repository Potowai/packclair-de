import type { PersistenceStatus } from '../../storage/persistence';
import { getPersistenceStatus } from '../../storage/persistence';

export function DataSafetyPanel({
  status = getPersistenceStatus()
}: {
  status?: PersistenceStatus;
}) {
  return (
    <section aria-labelledby="safety-heading">
      <h2 id="safety-heading">Sécurité des données</h2>
      <ul>
        <li>Vos commandes, SKU et calculs restent sur cet appareil.</li>
        <li>Aucune donnée n’est envoyée à un serveur.</li>
        <li>
          Stockage persistant : {status.available ? 'disponible' : 'indisponible'} (permission{' '}
          {status.persistPermission}).
        </li>
        <li>Risque de quota : {status.quotaRisk}.</li>
      </ul>
    </section>
  );
}
