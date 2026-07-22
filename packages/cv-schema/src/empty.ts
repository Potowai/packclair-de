import type { CV } from './schema';

/** CV vide valide, point de départ de l'éditeur. */
export function creerCvVide(): CV {
  return {
    identite: {
      nomComplet: '',
      email: '',
      telephone: ''
    },
    accroche: undefined,
    experiences: [],
    formation: [],
    competences: [],
    langues: [],
    certifications: [],
    centresInteret: []
  };
}
