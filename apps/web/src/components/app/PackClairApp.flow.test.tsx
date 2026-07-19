import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PackClairApp } from './PackClairApp';
import { createLocalDomainWorkerApi, type DomainWorkerApi } from '../../app/ports/domain-worker';
import { calculatePackaging } from '../../domain/calculation/calculate';
import type { DownloadGateway } from '../../app/ports/download-gateway';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { MaterialCode } from '../../domain/regulatory/materials';

function makeDownloadSpy(): DownloadGateway & { received: { name: string; bytes: Uint8Array }[] } {
  const received: { name: string; bytes: Uint8Array }[] = [];
  return {
    received,
    async download(name, bytes) {
      received.push({ name, bytes });
    },
    async downloadText() {
      /* not used */
    }
  };
}

function profileFor(sku: string, mg: bigint) {
  const masses = Object.fromEntries(
    (['10000', '20000', '30000', '40000', '50000', '60000', '70000', '80000'] as MaterialCode[]).map(
      (c) => [c, 0n]
    )
  ) as Record<MaterialCode, bigint>;
  masses['20000'] = mg;
  return {
    id: `${sku}@1`,
    logicalId: sku.toLowerCase(),
    revision: 1,
    kind: 'product' as const,
    sku,
    massesMg: masses
  };
}

function shipmentProfile(id: string) {
  const masses = Object.fromEntries(
    (['10000', '20000', '30000', '40000', '50000', '60000', '70000', '80000'] as MaterialCode[]).map(
      (c) => [c, 0n]
    )
  ) as Record<MaterialCode, bigint>;
  masses['20000'] = 10_000n;
  return {
    id,
    logicalId: id,
    revision: 1,
    kind: 'shipment' as const,
    sku: null,
    massesMg: masses
  };
}

function makeWorkerWithProfiles(): DomainWorkerApi {
  const base = createLocalDomainWorkerApi();
  return {
    ...base,
    async calculatePackaging(input) {
      const skus = new Set(input.lines.map((l) => l.sku));
      const profiles = [
        ...[...skus].map((s, i) => profileFor(s, 10_000n + BigInt(i) * 1000n)),
        shipmentProfile(input.monoParcelAttestation?.profileRevisionId ?? 'shipment:mono')
      ];
      return calculatePackaging({ ...input, profileRevisions: profiles });
    }
  };
}

const fixturePath = resolve(import.meta.dirname, '__fixtures__', 'orders.csv');

describe('parcours de déclaration', () => {
  it('importe, calcule, réconcilie et génère un XML BOM', async () => {
    const user = userEvent.setup();
    const worker: DomainWorkerApi = makeWorkerWithProfiles();
    const download = makeDownloadSpy();

    render(<PackClairApp domainWorker={worker} download={download} />);

    expect(screen.getByRole('heading', { name: /préparer ma déclaration/i })).toBeVisible();
    expect(
      screen.getByRole('heading', { name: /préparer ma déclaration/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/vos données restent sur cet appareil/i)).toBeVisible();

    // Step 1: context
    await user.selectOptions(screen.getByLabelText(/Type de rapport/i), 'HMM1');
    await user.click(screen.getByRole('button', { name: 'Continuer' }));

    // Step 2: import — importing auto-advances to profiles
    const file = new File([readFileSync(fixturePath)], 'orders.csv', { type: 'text/csv' });
    const input = screen.getByLabelText(/Fichier CSV de commandes/i) as HTMLInputElement;
    await user.upload(input, file);
    expect(await screen.findByRole('button', { name: /Profils prêts/i })).toBeVisible();

    // Step 3 & 4: profiles + shipments
    await user.click(await screen.findByRole('button', { name: /Profils prêts/i }));
    await user.click(await screen.findByRole('button', { name: /Colis|Attester/i }));

    // Step 5: calculation — calculating auto-advances to operator
    await user.click(await screen.findByRole('button', { name: 'Calculer' }));
    expect(await screen.findByRole('region', { name: /Confirmation opérateur/i })).toBeVisible();

    // Step 6: operator confirmation — enter confirmed grams + a reason
    const section = await screen.findByRole('region', { name: /Confirmation opérateur/i });
    const massInputs = within(section).getAllByLabelText(/masse confirmée/i) as HTMLInputElement[];
    expect(massInputs.length).toBeGreaterThan(0);
    // confirmed grams must use comma decimal format (g,mmm)
    await user.type(massInputs[0]!, '26,500');
    const reasonInputs = within(section).getAllByLabelText(/motif/i) as HTMLInputElement[];
    await user.type(reasonInputs[0]!, 'saisie opérateur');
    await user.click(within(section).getByRole('button', { name: 'Réconcilier' }));

    // Step 7: export
    const exportSection = await screen.findByRole('region', { name: /Export/i });
    await user.click(within(exportSection).getByRole('button', { name: /Générer le XML/i }));

    expect(await screen.findByText(/Fichier XML téléchargé/i)).toBeVisible();
    expect(download.received.length).toBe(1);
    const bytes = download.received[0]!.bytes;
    expect([...bytes.slice(0, 3)]).toEqual([0xef, 0xbb, 0xbf]);
    expect(download.received[0]!.name).toMatch(/^lucid_HMM1_/);
  });
});
