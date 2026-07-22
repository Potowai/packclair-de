import { describe, expect, it } from 'vitest';
import { extractFields, precisionExtraction } from '../src/extract';
import { FIXTURES_OR } from '../src/fixtures';

const HTML = `
<main>
  <h1 data-field="nom">Léa Martin</h1>
  <p><span data-field="email">lea.martin@example.fr</span> — <span data-field="telephone">06 12 34 56 78</span></p>
  <h2>Expérience professionnelle</h2>
  <section data-section="experience">
    <article data-poste>
      <h3 data-field="poste-titre">Développeuse front-end</h3>
      <p data-field="poste-employeur">WebFactory</p>
      <p data-field="poste-dates">09/2023 – présent</p>
      <ul><li>Développer 15 fonctionnalités React en production</li></ul>
    </article>
  </section>
  <h2>Formation</h2>
  <section data-section="formation">
    <p data-field="formation-diplome">Master Informatique</p>
    <p data-field="formation-etablissement">Université Claude Bernard Lyon 1</p>
  </section>
  <h2>Compétences</h2>
  <section data-section="competences"><ul><li>React</li><li>TypeScript</li></ul></section>
  <h2>Langues</h2>
  <section data-section="langues"><ul><li>Français — langue maternelle</li></ul></section>
</main>`;

describe('extractFields', () => {
  it('retrouve les champs structurés du HTML rendu', () => {
    const e = extractFields(HTML);
    expect(e.nomComplet).toBe('Léa Martin');
    expect(e.email).toBe('lea.martin@example.fr');
    expect(e.telephone).toBe('06 12 34 56 78');
    expect(e.rubriques).toContain('Expérience professionnelle');
    expect(e.postes).toHaveLength(1);
    expect(e.postes[0]).toEqual({
      titre: 'Développeuse front-end',
      employeur: 'WebFactory',
      dates: '09/2023 – présent'
    });
    expect(e.competences).toEqual(['React', 'TypeScript']);
    expect(e.langues).toEqual(['Français — langue maternelle']);
  });
});

describe('precisionExtraction', () => {
  it('mesure 100 % quand tout le CV source est présent dans le rendu', () => {
    const cv = {
      ...FIXTURES_OR[0]!.cv,
      experiences: [
        {
          id: 'exp-1',
          titre: 'Développeuse front-end',
          employeur: 'WebFactory',
          debut: '09/2023',
          fin: 'present' as const,
          puces: ['Développer 15 fonctionnalités React en production']
        }
      ],
      formation: [
        {
          id: 'for-1',
          diplome: 'Master Informatique',
          etablissement: 'Université Claude Bernard Lyon 1',
          fin: '06/2023'
        }
      ],
      competences: ['React', 'TypeScript'],
      langues: [{ langue: 'Français', niveau: 'MATERNELLE' as const }]
    };
    const r = precisionExtraction(cv, extractFields(HTML));
    expect(r.precision).toBe(1);
    expect(r.manquants).toEqual([]);
  });

  it('signale les données absentes du rendu', () => {
    const cv = { ...FIXTURES_OR[0]!.cv, competences: ['React', 'Kubernetes'] };
    const r = precisionExtraction(cv, extractFields(HTML));
    expect(r.precision).toBeLessThan(1);
    expect(r.manquants).toContain('Kubernetes');
  });

  it('vérifie le téléphone par ses chiffres', () => {
    const cv = { ...FIXTURES_OR[0]!.cv, identite: { ...FIXTURES_OR[0]!.cv.identite, telephone: '07 00 00 00 00' } };
    const r = precisionExtraction(cv, extractFields(HTML));
    expect(r.manquants.some((m) => m.startsWith('téléphone:'))).toBe(true);
  });
});
