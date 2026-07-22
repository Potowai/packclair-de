import { describe, expect, it } from 'vitest';
import { cvSchema } from '@cvclair/cv-schema';
import { FIXTURES_OR } from '../src/fixtures';

describe('fixtures en or', () => {
  it('contient exactement 10 CV représentatifs', () => {
    expect(FIXTURES_OR).toHaveLength(10);
    expect(new Set(FIXTURES_OR.map((f) => f.id)).size).toBe(10);
  });

  it.each(FIXTURES_OR.map((f) => [f.id, f.cv] as const))('%s est un CVSchema valide', (_id, cv) => {
    const resultat = cvSchema.safeParse(cv);
    expect(resultat.success).toBe(true);
  });

  it('couvre les profils clés : junior, cadre, reconversion', () => {
    const ids = FIXTURES_OR.map((f) => f.id);
    expect(ids).toContain('junior-dev');
    expect(ids).toContain('cadre-commercial');
    expect(ids).toContain('reconversion-infirmiere');
  });
});
