import { test, expect } from '@playwright/test';
import { resolve } from 'node:path';

const fixture = resolve(import.meta.dirname, 'fixtures', 'orders.csv');

async function runFullFlow(page: import('@playwright/test').Page) {
  await page.getByLabel(/type de rapport/i).selectOption('HMM1');
  await page.getByRole('button', { name: 'Continuer' }).click();
  await page.getByLabel(/fichier csv de commandes/i).setInputFiles(fixture);
  await expect(page.getByRole('button', { name: /profils prêts/i })).toBeVisible();
  await page.getByLabel('masse 20000 produit MUG').fill('12');
  await page.getByLabel('masse 20000 produit CARD').fill('4');
  await page.getByLabel('masse 20000 colis').fill('10');
  await page.getByRole('button', { name: /profils prêts/i }).click();
  await page.getByRole('button', { name: /attester un colis par commande/i }).click();
  await page.getByRole('button', { name: 'Calculer' }).click();
  const opSection = page.getByRole('region', { name: /confirmation opérateur/i });
  await expect(opSection).toBeVisible();
  await opSection.getByLabel(/masse confirmée/i).first().fill('26,500');
  await opSection.getByLabel(/motif/i).first().fill('saisie opérateur');
  await opSection.getByRole('button', { name: 'Réconcilier' }).click();
  const exportSection = page.getByRole('region', { name: /export/i });
  await expect(exportSection).toBeVisible();
  const downloadPromise = page.waitForEvent('download');
  await exportSection.getByRole('button', { name: /générer le xml/i }).click();
  await downloadPromise;
}

test('acquisition : attribue un parrain depuis ?ref et crédite la conversion', async ({ page }) => {
  await page.goto('/app/?ref=ZZTOP9');

  // Le panneau d’acquisition est présent.
  await expect(page.getByRole('region', { name: /parrainage & acquisition/i })).toBeVisible();

  // Le code parrain du visiteur est attribué via le paramètre d’URL.
  const attributed = await page.evaluate(() => {
    const raw = localStorage.getItem('packclair:referral');
    return raw ? (JSON.parse(raw).attributedReferrer as string | null) : null;
  });
  expect(attributed).toBe('ZZTOP9');

  // Parcours complet -> la conversion est créditée au parrain (automatisation).
  await runFullFlow(page);

  const conversions = await page.evaluate(() => {
    const raw = localStorage.getItem('packclair:referral');
    return raw ? (JSON.parse(raw).conversions as number) : 0;
  });
  expect(conversions).toBeGreaterThanOrEqual(1);
});
