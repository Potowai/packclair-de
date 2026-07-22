import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { FIXTURES_OR, extractFields, lintCv, precisionExtraction } from '@cvclair/ats-harness';
import { COMPOSANTS_MODELES, MODELES } from '@/templates';
import { libelleLangue } from '@/templates/rendu';

/**
 * GATE CI (PLAN §4.2, skill cv-template) : chaque gabarit × chaque fixture
 * en or doit passer le lint sans erreur et extraire ≥ 98 % des champs.
 */
describe('gabarits ATS — gate de publication', () => {
  it('le registre expose les 3 gabarits gratuits', () => {
    expect(MODELES.map((m) => m.id).sort()).toEqual(['classique', 'compact', 'moderne']);
    expect(MODELES.every((m) => m.tier === 'free')).toBe(true);
  });

  for (const modele of MODELES) {
    describe(`gabarit « ${modele.nom} »`, () => {
      for (const fixture of FIXTURES_OR) {
        it(`${fixture.id} : lint 0 erreur, extraction ≥ 98 %`, () => {
          const Composant = COMPOSANTS_MODELES[modele.id]!;
          const html = renderToStaticMarkup(<Composant cv={fixture.cv} />);

          const lint = lintCv(html);
          expect(lint.erreurs, lint.erreurs.map((e) => `${e.regle}: ${e.message}`).join('\n')).toEqual([]);
          expect(lint.scoreStructure).toBe(100);

          const precision = precisionExtraction(fixture.cv, extractFields(html));
          expect(precision.precision, `manquants: ${precision.manquants.join(', ')}`).toBeGreaterThanOrEqual(0.98);
        });
      }
    });
  }
});

describe('libelleLangue', () => {
  it('formate les niveaux CECRL en français', () => {
    expect(libelleLangue({ langue: 'Anglais', niveau: 'C1' })).toBe('Anglais — courant (C1)');
    expect(libelleLangue({ langue: 'Français', niveau: 'MATERNELLE' })).toBe('Français — langue maternelle');
  });
});
