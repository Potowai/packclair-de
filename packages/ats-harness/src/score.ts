/**
 * Score ATS utilisateur (PLAN §4.2) : 50 % parseabilité structurelle,
 * 50 % couverture des mots-clés de l'offre. Sans offre : structure seule.
 * Seuil de réussite : 95/100.
 */
export const SEUIL_SCORE = 95;

export function scoreAts(scoreStructure: number, couvertureMotsCles?: number): number {
  const structure = Math.max(0, Math.min(100, scoreStructure));
  if (couvertureMotsCles === undefined) return Math.round(structure);
  const couverture = Math.max(0, Math.min(1, couvertureMotsCles)) * 100;
  return Math.round(structure * 0.5 + couverture * 0.5);
}
