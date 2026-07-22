import type { ComponentType } from 'react';
import type { CV } from '@cvclair/cv-schema';
import Classique from './classique/Template';
import Moderne from './moderne/Template';
import Compact from './compact/Template';

export interface ModeleCv {
  id: string;
  nom: string;
  description: string;
  tier: 'free' | 'pro';
}

/** Registre des gabarits (skill cv-template) : 3 gratuits au lancement. */
export const MODELES: ModeleCv[] = [
  { id: 'classique', nom: 'Classique', description: 'Serif traditionnel, rassurant pour les recruteurs.', tier: 'free' },
  { id: 'moderne', nom: 'Moderne', description: 'Sans-serif avec accent bleu, sobre et actuel.', tier: 'free' },
  { id: 'compact', nom: 'Compact', description: 'Dense, pour les profils expérimentés en une page.', tier: 'free' }
];

export const MODELE_PAR_DEFAUT = 'classique';

export const COMPOSANTS_MODELES: Record<string, ComponentType<{ cv: CV }>> = {
  classique: Classique,
  moderne: Moderne,
  compact: Compact
};

export function composantModele(id: string): ComponentType<{ cv: CV }> {
  return COMPOSANTS_MODELES[id] ?? Classique;
}
