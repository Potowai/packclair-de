import { z } from 'zod';

/**
 * CVSchema — schéma unique de CV CVClair (cf. docs/cv-maker/PLAN.md §5).
 * Inspiré de JSON Resume, avec extensions françaises : accroche, niveaux CECRL,
 * permis, et aucune donnée discriminante obligatoire (photo/âge/adresse optionnels).
 */

/** Format de date canonique ATS : MM/AAAA. */
export const REGEX_MOIS_ANNEE = /^(0[1-9]|1[0-2])\/\d{4}$/;

export const moisAnneeSchema = z
  .string()
  .regex(REGEX_MOIS_ANNEE, 'Format de date attendu : MM/AAAA');

/** Fin de période : MM/AAAA ou « present » (poste en cours). */
export const finPeriodeSchema = z.union([moisAnneeSchema, z.literal('present')]);

export const NIVEAUX_CECRL = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'MATERNELLE'] as const;
export const niveauCecrlSchema = z.enum(NIVEAUX_CECRL);

export const identiteSchema = z.object({
  nomComplet: z.string().trim().min(1).max(100),
  titre: z.string().trim().max(120).optional(),
  email: z.email('Adresse e-mail invalide'),
  telephone: z.string().regex(/^\+?[0-9 .()-]{6,20}$/, 'Numéro de téléphone invalide'),
  localisation: z.string().trim().max(100).optional(),
  lien: z.url('URL invalide').optional()
});

export const experienceSchema = z.object({
  id: z.string().min(1),
  titre: z.string().trim().min(1).max(120),
  employeur: z.string().trim().min(1).max(120),
  debut: moisAnneeSchema,
  fin: finPeriodeSchema,
  puces: z.array(z.string().trim().min(1).max(200)).max(8).default([])
});

export const formationSchema = z.object({
  id: z.string().min(1),
  diplome: z.string().trim().min(1).max(160),
  etablissement: z.string().trim().min(1).max(160),
  debut: moisAnneeSchema.optional(),
  fin: moisAnneeSchema
});

export const langueSchema = z.object({
  langue: z.string().trim().min(1).max(60),
  niveau: niveauCecrlSchema
});

export const cvSchema = z.object({
  identite: identiteSchema,
  accroche: z.string().trim().max(600).optional(),
  experiences: z.array(experienceSchema).max(15).default([]),
  formation: z.array(formationSchema).max(10).default([]),
  competences: z.array(z.string().trim().min(1).max(60)).max(30).default([]),
  langues: z.array(langueSchema).max(10).default([]),
  certifications: z.array(z.string().trim().min(1).max(160)).max(15).default([]),
  centresInteret: z.array(z.string().trim().min(1).max(80)).max(8).default([])
});

export const CVSchema = cvSchema;

/**
 * Schéma « brouillon » : l'éditeur autorise les champs identité vides pendant
 * la saisie. La validation stricte (cvSchema) reste exigée pour l'aperçu
 * final et le téléchargement.
 */
export const identiteBrouillonSchema = z.object({
  nomComplet: z.string().trim().max(100),
  titre: z.string().trim().max(120).optional(),
  email: z.union([z.literal(''), z.email('Adresse e-mail invalide')]),
  telephone: z.union([z.literal(''), z.string().regex(/^\+?[0-9 .()-]{6,20}$/, 'Numéro de téléphone invalide')]),
  localisation: z.string().trim().max(100).optional(),
  lien: z.union([z.literal(''), z.url('URL invalide')]).optional()
});

export const cvBrouillonSchema = cvSchema.extend({ identite: identiteBrouillonSchema });

export type Identite = z.infer<typeof identiteSchema>;
export type Experience = z.infer<typeof experienceSchema>;
export type Formation = z.infer<typeof formationSchema>;
export type Langue = z.infer<typeof langueSchema>;
export type NiveauCecrl = z.infer<typeof niveauCecrlSchema>;
export type CV = z.infer<typeof cvSchema>;
export type CVInput = z.input<typeof cvSchema>;

/** Libellé français de fin de période pour l'affichage. */
export function libelleFin(fin: string): string {
  return fin === 'present' ? 'présent' : fin;
}
