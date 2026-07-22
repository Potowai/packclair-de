import type { CV } from '@cvclair/cv-schema';
import { parse } from 'node-html-parser';
import { normaliser } from './texte';

/** Champs extraits du HTML rendu — simule ce qu'un parseur ATS doit retrouver. */
export interface ChampsExtraits {
  nomComplet: string;
  email: string;
  telephone: string;
  rubriques: string[];
  postes: { titre: string; employeur: string; dates: string }[];
  competences: string[];
  langues: string[];
  texteComplet: string;
}

export function extractFields(html: string): ChampsExtraits {
  const r = parse(html);
  const champ = (nom: string) => r.querySelector(`[data-field="${nom}"]`)?.text.trim() ?? '';
  const postes = r.querySelectorAll('[data-section="experience"] [data-poste]').map((p) => ({
    titre: p.querySelector('[data-field="poste-titre"]')?.text.trim() ?? '',
    employeur: p.querySelector('[data-field="poste-employeur"]')?.text.trim() ?? '',
    dates: p.querySelector('[data-field="poste-dates"]')?.text.trim() ?? ''
  }));
  const liste = (section: string) =>
    r.querySelectorAll(`[data-section="${section}"] li`).map((li) => li.text.trim());
  return {
    nomComplet: champ('nom'),
    email: champ('email'),
    telephone: champ('telephone'),
    rubriques: r.querySelectorAll('h2').map((h) => h.text.trim()),
    postes,
    competences: liste('competences'),
    langues: liste('langues'),
    texteComplet: r.text
  };
}

export interface PrecisionExtraction {
  attendu: number;
  trouve: number;
  /** 0–1 ; le gate CI exige ≥ 0,98. */
  precision: number;
  manquants: string[];
}

function contient(texteNormalise: string, valeur: string): boolean {
  return texteNormalise.includes(normaliser(valeur));
}

function chiffres(s: string): string {
  return s.replace(/\D/g, '');
}

/**
 * Vérifie que chaque donnée du CV source est retrouvée dans le texte rendu.
 * C'est le substitut déterministe de la « précision de champ » multi-parseurs
 * (Tika/pdfminer arrivent avec le PDF serveur — PLAN §4.2, M2).
 */
export function precisionExtraction(cv: CV, extraits: ChampsExtraits): PrecisionExtraction {
  const texte = normaliser(extraits.texteComplet).replace(/\s+/g, ' ');
  const attendus: string[] = [
    cv.identite.nomComplet,
    cv.identite.email,
    ...cv.experiences.flatMap((e) => [e.titre, e.employeur, ...e.puces]),
    ...cv.formation.flatMap((f) => [f.diplome, f.etablissement]),
    ...cv.competences,
    ...cv.langues.map((l) => l.langue),
    ...cv.certifications,
    ...cv.centresInteret
  ].filter((v) => v.trim().length > 0);

  const manquants = attendus.filter((v) => !contient(texte, v));
  const telephoneOk =
    chiffres(cv.identite.telephone).length === 0 ||
    chiffres(extraits.texteComplet).includes(chiffres(cv.identite.telephone));
  const total = attendus.length + 1; // + téléphone
  const trouve = total - manquants.length - (telephoneOk ? 0 : 1);
  return {
    attendu: total,
    trouve,
    precision: total === 0 ? 1 : trouve / total,
    manquants: telephoneOk ? manquants : [...manquants, `téléphone:${cv.identite.telephone}`]
  };
}
