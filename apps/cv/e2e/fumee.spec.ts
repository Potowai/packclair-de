import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.describe('parcours de fumée (M1)', () => {
  test('accueil : promesse, prix affichés, CTA', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /passe les ATS/i })).toBeVisible();
    await expect(page.getByText('2,99 €').first()).toBeVisible();
    await expect(page.getByText(/sans abonnement/i).first()).toBeVisible();

    const axe = await new AxeBuilder({ page }).analyze();
    expect(axe.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious')).toEqual([]);
  });

  test('créer → remplir → aperçu en moins de 10 minutes, données conservées', async ({ page }) => {
    await page.goto('/app/');
    const champNom = page.getByLabel(/Nom complet/);
    await champNom.waitFor();

    await champNom.fill('Léa Martin');
    await page.getByLabel(/E-mail/).fill('lea.martin@example.fr');
    await page.getByLabel(/Téléphone/).fill('06 12 34 56 78');
    await expect(page.getByRole('status')).toHaveText('Enregistré');

    // L'aperçu affiche le CV saisi (persistance IndexedDB entre pages).
    await page.goto('/app/apercu/');
    await expect(page.getByRole('heading', { level: 1, name: 'Léa Martin' })).toBeVisible();
    await expect(page.getByText('lea.martin@example.fr')).toBeVisible();
    await expect(page.getByText(/Score ATS/)).toBeVisible();
    // Le téléchargement est annoncé à 2,99 € et indisponible avant M2.
    await expect(page.getByRole('button', { name: /2,99 €/ })).toBeDisabled();

    const axe = await new AxeBuilder({ page }).analyze();
    expect(axe.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious')).toEqual([]);
  });

  test('le score ATS est de 100/100 pour un CV complet conforme', async ({ page }) => {
    await page.goto('/app/');
    await page.getByLabel(/Nom complet/).waitFor();

    await page.getByLabel(/Nom complet/).fill('Léa Martin');
    await page.getByLabel(/E-mail/).fill('lea.martin@example.fr');
    await page.getByLabel(/Téléphone/).fill('06 12 34 56 78');
    await page.getByRole('button', { name: /Ajouter un poste/ }).click();
    await page.getByLabel(/Intitulé du poste/).fill('Développeuse front-end');
    await page.getByLabel(/Employeur/).fill('WebFactory');
    await page.getByLabel(/Début \(MM\/AAAA\)/).fill('09/2023');
    await page.getByLabel(/Fin \(MM\/AAAA ou présent\)/).fill('présent');
    await page.getByRole('button', { name: /Ajouter un diplôme/ }).click();
    await page.getByLabel(/Diplôme/).fill('Master Informatique');
    await page.getByLabel(/Établissement/).fill('Université de Lyon');
    await page.getByLabel(/Fin \(MM\/AAAA\)/).fill('06/2023');
    await page.getByRole('textbox', { name: 'Compétences' }).fill('React\nTypeScript');
    await expect(page.getByRole('status')).toHaveText('Enregistré');

    await page.goto('/app/apercu/');
    await expect(page.getByText('Score ATS : 100/100')).toBeVisible({ timeout: 15_000 });
  });
});
