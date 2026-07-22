import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { keywordCoverage, texteIntegral } from '../src/keywords';
import { scoreAts, SEUIL_SCORE } from '../src/score';
import { normaliser } from '../src/texte';
import { FIXTURES_OR } from '../src/fixtures';

const cv = FIXTURES_OR[0]!.cv; // junior-dev : React, TypeScript, Vitest…

describe('keywordCoverage', () => {
  it('trouve les compétences présentes, insensible aux accents et à la casse', () => {
    const r = keywordCoverage(cv, ['react', 'TYPESCRIPT', 'vitest']);
    expect(r.couverture).toBe(1);
    expect(r.manquants).toEqual([]);
  });

  it('signale les mots-clés manquants', () => {
    const r = keywordCoverage(cv, ['React', 'Kubernetes']);
    expect(r.correspondants).toEqual(['React']);
    expect(r.manquants).toEqual(['Kubernetes']);
    expect(r.couverture).toBe(0.5);
  });

  it('renvoie 1 quand aucun mot-clé n’est requis', () => {
    expect(keywordCoverage(cv, []).couverture).toBe(1);
  });

  it('propriété : un CV couvre toujours ses propres compétences', () => {
    fc.assert(
      fc.property(fc.constantFrom(...FIXTURES_OR.map((f) => f.cv)), (cv) => {
        const r = keywordCoverage(cv, cv.competences);
        return r.couverture === 1;
      })
    );
  });

  it('propriété : la couverture reste entre 0 et 1 pour toute entrée', () => {
    fc.assert(
      fc.property(fc.array(fc.string(), { maxLength: 20 }), (mots) => {
        const r = keywordCoverage(cv, mots);
        return r.couverture >= 0 && r.couverture <= 1;
      })
    );
  });
});

describe('scoreAts', () => {
  it('combine 50/50 structure et mots-clés', () => {
    expect(scoreAts(100, 0.9)).toBe(95);
    expect(scoreAts(80, 1)).toBe(90);
  });

  it('sans offre, le score est la structure seule', () => {
    expect(scoreAts(92)).toBe(92);
  });

  it('borne le score entre 0 et 100', () => {
    expect(scoreAts(150, 2)).toBe(100);
    expect(scoreAts(-10, -1)).toBe(0);
  });

  it('le seuil de réussite est 95', () => {
    expect(SEUIL_SCORE).toBe(95);
    expect(scoreAts(100, 0.9)).toBeGreaterThanOrEqual(SEUIL_SCORE);
  });
});

describe('normaliser', () => {
  it('supprime les accents et met en minuscules', () => {
    expect(normaliser('Expérience Équipe À')).toBe('experience equipe a');
  });

  it('texteIntegral contient les rubriques clés', () => {
    const t = texteIntegral(cv);
    expect(t).toContain('Léa Martin');
    expect(t).toContain('WebFactory');
    expect(t).toContain('React');
  });
});
