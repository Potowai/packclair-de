import type { CV } from '@cvclair/cv-schema';
import { normaliser } from './texte';

export interface CouvertureMotsCles {
  correspondants: string[];
  manquants: string[];
  /** 0–1. */
  couverture: number;
}

/** Texte intégral d'un CV structuré, pour la recherche de mots-clés. */
export function texteIntegral(cv: CV): string {
  return [
    cv.identite.nomComplet,
    cv.identite.titre ?? '',
    cv.accroche ?? '',
    ...cv.experiences.flatMap((e) => [e.titre, e.employeur, ...e.puces]),
    ...cv.formation.flatMap((f) => [f.diplome, f.etablissement]),
    ...cv.competences,
    ...cv.langues.map((l) => l.langue),
    ...cv.certifications,
    ...cv.centresInteret
  ].join('\n');
}

/**
 * Couverture des mots-clés exigés par une offre (liste fournie — en M3/M4,
 * l'IA extraira cette liste de l'offre). Recherche insensible aux accents
 * et à la casse, par expression exacte.
 */
export function keywordCoverage(cv: CV, motsClesRequis: string[]): CouvertureMotsCles {
  const texte = normaliser(texteIntegral(cv));
  const requis = [...new Set(motsClesRequis.map((m) => m.trim()).filter(Boolean))];
  const correspondants = requis.filter((m) => texte.includes(normaliser(m)));
  const manquants = requis.filter((m) => !texte.includes(normaliser(m)));
  return {
    correspondants,
    manquants,
    couverture: requis.length === 0 ? 1 : correspondants.length / requis.length
  };
}
