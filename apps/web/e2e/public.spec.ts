import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('page publique', () => {
  test('affiche la promesse locale et le lien vers l’assistant', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'PackClair DE', level: 1 })).toBeVisible();
    await expect(page.getByText(/vos données restent chez vous/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /ouvrir l’assistant/i })).toBeVisible();
  });

  test('accessibilité de base (axe) sans violation critique', async ({ page }) => {
    await page.goto('/');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    const serious = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );
    expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
  });
});
