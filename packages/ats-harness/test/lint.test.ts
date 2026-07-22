import { describe, expect, it } from 'vitest';
import { lintCv, REGLES } from '../src/lint';

/** HTML minimal conforme au contrat gabarit ATS-safe. */
const HTML_CONFORME = `
<main style="font-family: Inter, system-ui; font-size: 13px">
  <h1 data-field="nom">Léa Martin</h1>
  <p><span data-field="email">lea.martin@example.fr</span> — <span data-field="telephone">06 12 34 56 78</span></p>
  <h2>Profil</h2>
  <p>Développeuse front-end avec 2 ans d’expérience.</p>
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
    <article data-formation>
      <h3 data-field="formation-diplome">Master Informatique</h3>
      <p data-field="formation-etablissement">Université de Lyon</p>
      <p data-field="formation-dates">09/2021 – 06/2023</p>
    </article>
  </section>
  <h2>Compétences</h2>
  <section data-section="competences"><ul><li>React</li><li>TypeScript</li></ul></section>
  <h2>Langues</h2>
  <section data-section="langues"><ul><li>Français — langue maternelle</li></ul></section>
</main>`;

describe('lintCv', () => {
  it('expose exactement 20 règles', () => {
    expect(REGLES).toHaveLength(20);
    expect(new Set(REGLES.map((r) => r.id)).size).toBe(20);
  });

  it('donne 100/100 à un HTML conforme', () => {
    const r = lintCv(HTML_CONFORME);
    expect(r.erreurs).toEqual([]);
    expect(r.scoreStructure).toBe(100);
  });

  const cas: [string, string, string][] = [
    ['R01-pas-de-tableau', '<table><tr><td>Compétences</td></tr></table>', 'tableau'],
    ['R02-pas-de-position-absolue', '<div style="position:absolute">Texte</div>', 'position absolue'],
    ['R03-une-seule-colonne', '<div style="display:grid;grid-template-columns:1fr 1fr">x</div>', 'deux colonnes'],
    ['R04-pas-de-header-footer', '<header><p>Léa Martin</p></header>', 'header'],
    ['R05-coordonnees-dans-le-corps', '', 'email manquant'],
    ['R06-rubriques-canoniques', '<h2>Mes expériences</h2>', 'rubrique non canonique'],
    ['R08-structure-des-postes', '<article data-poste><h3 data-field="poste-titre">Dev</h3></article>', 'poste incomplet'],
    ['R09-format-des-dates', '<p data-field="poste-dates">2023 – 2024</p>', 'dates non MM/AAAA'],
    ['R10-pas-d-annee-deux-chiffres', '<p>Période 03/23 à 06/24</p>', 'année deux chiffres'],
    ['R12-pas-de-barres-de-competences', '<div role="progressbar" aria-valuenow="80"></div>', 'jauge'],
    ['R13-sections-en-vraies-listes', '<section data-section="competences"><p>React</p></section>', 'compétences sans li'],
    ['R14-vrais-liens', '<a>linkedin</a>', 'lien sans href'],
    ['R15-police-standard', '<p style="font-family: Comic Sans MS">texte</p>', 'police fantaisiste'],
    ['R16-taille-de-police-minimale', '<p style="font-size: 9px">texte</p>', 'police trop petite'],
    ['R18-texte-reel-uniquement', '<svg><text>Compétences</text></svg>', 'svg'],
    ['R19-ordre-du-dom', '<p style="order: 2">texte</p>', 'order css'],
    ['R20-pas-de-fausses-puces', '<p>• React et TypeScript</p>', 'fausse puce']
  ];

  it.each(cas)('%s détecte : %s', (regle, html) => {
    const r = lintCv(`<main>${html}</main>`);
    expect(r.erreurs.some((v) => v.regle === regle)).toBe(true);
    expect(r.scoreStructure).toBeLessThan(100);
  });

  it('R07 avertit sur un ordre de rubriques inhabituel sans bloquer', () => {
    const html = HTML_CONFORME.replace(
      '<h2>Profil</h2>',
      '<h2>Formation</h2><section data-section="formation"></section><h2>Profil</h2>'
    );
    const r = lintCv(html);
    expect(r.avertissements.some((v) => v.regle === 'R07-ordre-des-rubriques')).toBe(true);
  });

  it('R11 détecte un champ rendu sans texte et une image de contenu', () => {
    const r = lintCv('<main><span data-field="email"></span><img src="skill.png" /></main>');
    expect(r.erreurs.filter((v) => v.regle === 'R11-pas-d-icone-porteuse-de-donnee').length).toBeGreaterThanOrEqual(2);
  });

  it('le score descend de 8 points par erreur', () => {
    const r = lintCv('<main><table></table><svg></svg></main>');
    expect(r.scoreStructure).toBe(100 - 8 * r.erreurs.length - 2 * r.avertissements.length);
  });
});
