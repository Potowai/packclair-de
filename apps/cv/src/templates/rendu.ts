import type { Langue, NiveauCecrl } from '@cvclair/cv-schema';

const LIBELLES_NIVEAU: Record<NiveauCecrl, string> = {
  A1: 'débutant (A1)',
  A2: 'élémentaire (A2)',
  B1: 'intermédiaire (B1)',
  B2: 'avancé (B2)',
  C1: 'courant (C1)',
  C2: 'bilingue (C2)',
  MATERNELLE: 'langue maternelle'
};

/** « Français — langue maternelle », « Anglais — courant (C1) » (skill french-cv-style). */
export function libelleLangue(langue: Langue): string {
  return `${langue.langue} — ${LIBELLES_NIVEAU[langue.niveau]}`;
}
