import { test, expect } from '@playwright/test';
import { resolve } from 'node:path';

const fixture = resolve(import.meta.dirname, 'fixtures', 'orders.csv');

test.describe('assistant local', () => {
  test('parcourt la déclaration sans aucune requête externe', async ({ page, context }) => {
    const external: string[] = [];
    context.on('request', (req) => {
      const url = req.url();
      if (url.startsWith('http://localhost') || url.startsWith('https://localhost')) return;
      if (url.startsWith('data:') || url.startsWith('blob:')) return;
      external.push(url);
    });

    await page.goto('/app/');
    await expect(
      page.getByRole('heading', { name: /préparer ma déclaration/i })
    ).toBeVisible();

    // Étape 1 : contexte
    await page.getByLabel(/type de rapport/i).selectOption('HMM1');
    await page.getByRole('button', { name: 'Continuer' }).click();

    // Étape 2 : import (auto-avance vers profils)
    await page.getByLabel(/fichier csv de commandes/i).setInputFiles(fixture);
    await expect(page.getByRole('button', { name: /profils prêts/i })).toBeVisible();

    // Étape 3 : profils — renseigner une masse produit et une masse colis
    await page.getByLabel('masse 20000 produit MUG').fill('12');
    await page.getByLabel('masse 20000 produit CARD').fill('4');
    await page.getByLabel('masse 20000 colis').fill('10');
    await page.getByRole('button', { name: /profils prêts/i }).click();

    // Étape 4 : colis (attestation mono-parcel)
    await page
      .getByRole('button', { name: /attester un colis par commande/i })
      .click();

    // Étape 5 : calcul (auto-avance vers confirmation opérateur)
    await page.getByRole('button', { name: 'Calculer' }).click();
    const opSection = page.getByRole('region', { name: /confirmation opérateur/i });
    await expect(opSection).toBeVisible();

    // Étape 6 : confirmation opérateur
    const mass = opSection.getByLabel(/masse confirmée/i).first();
    await mass.fill('26,500');
    const reason = opSection.getByLabel(/motif/i).first();
    await reason.fill('saisie opérateur');
    await opSection.getByRole('button', { name: 'Réconcilier' }).click();

    // Étape 7 : export XML
    const exportSection = page.getByRole('region', { name: /export/i });
    await expect(exportSection).toBeVisible();
    const downloadPromise = page.waitForEvent('download');
    await exportSection.getByRole('button', { name: /générer le xml/i }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/^lucid_HMM1_/);

    expect(external, `requêtes externes inattendues: ${external.join(', ')}`).toEqual([]);
  });

  test('reste utilisable hors-ligne après premier chargement', async ({ page, context }) => {
    await page.goto('/app/');
    await expect(
      page.getByRole('heading', { name: /préparer ma déclaration/i })
    ).toBeVisible();

    // Laisse le service worker s’enregistrer, précacher et prendre le contrôle.
    await page.waitForFunction(() => Boolean(navigator.serviceWorker?.controller));

    await context.setOffline(true);
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(
      page.getByRole('heading', { name: /préparer ma déclaration/i })
    ).toBeVisible();
    expect(errors).toEqual([]);
  });
});
