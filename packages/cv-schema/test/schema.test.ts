import { describe, expect, it } from 'vitest';
import { creerCvVide } from '../src/empty';
import { CVSchema, cvBrouillonSchema, cvSchema, experienceSchema, moisAnneeSchema } from '../src/schema';

const cvValide = {
  identite: {
    nomComplet: 'Léa Martin',
    titre: 'Développeuse front-end',
    email: 'lea.martin@example.fr',
    telephone: '06 12 34 56 78',
    localisation: 'Lyon',
    lien: 'https://linkedin.com/in/leamartin'
  },
  accroche: 'Développeuse front-end avec 3 ans d’expérience, spécialisée React.',
  experiences: [
    {
      id: 'exp-1',
      titre: 'Développeuse front-end',
      employeur: 'Acme',
      debut: '03/2023',
      fin: 'present',
      puces: ['Développer 12 composants React réutilisés par 3 équipes']
    }
  ],
  formation: [
    { id: 'for-1', diplome: 'Master informatique', etablissement: 'Université de Lyon', fin: '06/2022' }
  ],
  competences: ['React', 'TypeScript'],
  langues: [
    { langue: 'Français', niveau: 'MATERNELLE' },
    { langue: 'Anglais', niveau: 'C1' }
  ],
  certifications: [],
  centresInteret: []
};

function clone<T>(valeur: T): T {
  return JSON.parse(JSON.stringify(valeur)) as T;
}

describe('CVSchema', () => {
  it('accepte un CV complet valide', () => {
    const resultat = cvSchema.safeParse(cvValide);
    expect(resultat.success).toBe(true);
  });

  it('accepte le CV vide de l’éditeur comme brouillon', () => {
    expect(cvBrouillonSchema.safeParse(creerCvVide()).success).toBe(true);
  });

  it('mais le CV vide ne passe pas la validation stricte (aperçu/téléchargement)', () => {
    expect(cvSchema.safeParse(creerCvVide()).success).toBe(false);
  });

  it('le brouillon refuse quand même un e-mail malformé', () => {
    const cv = clone(cvValide);
    cv.identite.email = 'pas-un-email';
    expect(cvBrouillonSchema.safeParse(cv).success).toBe(false);
  });

  it('remplit les tableaux par défaut', () => {
    const cv = cvSchema.parse({ identite: cvValide.identite });
    expect(cv.experiences).toEqual([]);
    expect(cv.competences).toEqual([]);
  });

  it('rejette un e-mail invalide', () => {
    const cv = clone(cvValide);
    cv.identite.email = 'pas-un-email';
    expect(cvSchema.safeParse(cv).success).toBe(false);
  });

  it('rejette une date au mauvais format', () => {
    expect(moisAnneeSchema.safeParse('3/2023').success).toBe(false);
    expect(moisAnneeSchema.safeParse('2023-03').success).toBe(false);
    expect(moisAnneeSchema.safeParse('03/2023').success).toBe(true);
  });

  it('rejette une année sur deux chiffres', () => {
    expect(moisAnneeSchema.safeParse('03/23').success).toBe(false);
  });

  it('accepte « present » comme fin de période', () => {
    const exp = { ...cvValide.experiences[0], fin: 'present' };
    expect(experienceSchema.safeParse(exp).success).toBe(true);
  });

  it('rejette une puce vide ou trop longue', () => {
    const exp = { ...cvValide.experiences[0], puces: [''] };
    expect(experienceSchema.safeParse(exp).success).toBe(false);
    const longue = { ...cvValide.experiences[0], puces: ['x'.repeat(201)] };
    expect(experienceSchema.safeParse(longue).success).toBe(false);
  });

  it('rejette plus de 8 puces par poste', () => {
    const exp = { ...cvValide.experiences[0], puces: Array(9).fill('Réaliser un projet') };
    expect(experienceSchema.safeParse(exp).success).toBe(false);
  });

  it('n’exige ni photo, ni âge, ni adresse', () => {
    const cv = CVSchema.parse(cvValide);
    expect('photo' in cv.identite).toBe(false);
    expect('age' in cv.identite).toBe(false);
    expect('adresse' in cv.identite).toBe(false);
  });
});
