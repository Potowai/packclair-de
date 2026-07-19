import { render, screen } from '@testing-library/react';
import { PackClairApp } from './PackClairApp';

it('annonce la promesse locale', () => {
  render(<PackClairApp />);
  expect(
    screen.getByRole('heading', { name: /préparer ma déclaration/i })
  ).toBeVisible();
  expect(
    screen.getByText(/vos données restent sur cet appareil/i)
  ).toBeVisible();
  expect(
    screen.getByRole('region', { name: /sécurité des données/i })
  ).toBeVisible();
});
