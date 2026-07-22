import { parse, type HTMLElement } from 'node-html-parser';

/**
 * Lint ATS — les 20 règles du contrat gabarit (cf. .opencode/skills/ats-audit
 * et docs/cv-maker/PLAN.md §4.1). Opère sur le HTML rendu d'un gabarit.
 *
 * Limite assumée : les feuilles CSS externes ne sont pas analysées ; le
 * contrat « une seule colonne » pour les CSS des gabarits est garanti par la
 * skill cv-template, et ici par l'interdiction des styles en ligne piégeux.
 * L'extraction multi-parseurs (Tika, pdfminer) arrive avec le PDF serveur (M2).
 */

export type NiveauViolation = 'erreur' | 'avertissement';

export interface Violation {
  regle: string;
  message: string;
}

export interface ResultatLint {
  erreurs: Violation[];
  avertissements: Violation[];
  /** 0–100 : 100 - 8/erreur - 2/avertissement, plancher 0. */
  scoreStructure: number;
}

interface Regle {
  id: string;
  niveau: NiveauViolation;
  verifier(racine: HTMLElement): string[];
}

const RUBRIQUES_CANONIQUES = [
  'Profil',
  'Expérience professionnelle',
  'Formation',
  'Compétences',
  'Langues',
  'Certifications',
  'Projets',
  "Centres d'intérêt"
] as const;

const RUBRIQUES_REQUISES = ['Expérience professionnelle', 'Formation', 'Compétences'] as const;

const POLICES_AUTORISEES = [
  'inter',
  'roboto',
  'source serif',
  'source-serif',
  'system-ui',
  'arial',
  'helvetica',
  'georgia',
  'times new roman',
  'segoe ui',
  'liberation sans',
  'liberation serif',
  'noto sans',
  'noto serif',
  'open sans',
  'lato'
];

const GLYPHES_PUCES = /^[•▪◦●◆‣–—]\s/;

function stylesEnLigne(racine: HTMLElement): { el: HTMLElement; style: string }[] {
  return racine
    .querySelectorAll('[style]')
    .map((el) => ({ el, style: (el.getAttribute('style') ?? '').toLowerCase() }));
}

function texteDebutElement(el: HTMLElement): string {
  const premier = el.childNodes[0];
  if (premier && premier.nodeType === 3) return premier.rawText.trimStart();
  return '';
}

export const REGLES: Regle[] = [
  {
    id: 'R01-pas-de-tableau',
    niveau: 'erreur',
    verifier: (r) =>
      r.querySelectorAll('table').map(() => 'Élément <table> interdit : les parseurs ATS lisent mal les tableaux.')
  },
  {
    id: 'R02-pas-de-position-absolue',
    niveau: 'erreur',
    verifier: (r) =>
      stylesEnLigne(r)
        .filter(({ style }) => /position\s*:\s*(absolute|fixed)/.test(style))
        .map(() => 'position:absolute/fixed interdit : casse l’ordre de lecture ATS.')
  },
  {
    id: 'R03-une-seule-colonne',
    niveau: 'erreur',
    verifier: (r) =>
      stylesEnLigne(r)
        .filter(
          ({ style }) =>
            /column-count|columns\s*:|float\s*:|display\s*:\s*(grid|flex)/.test(style)
        )
        .map(() => 'Mise en page multi-colonnes/flex/grid détectée en style en ligne : une seule colonne exigée.')
  },
  {
    id: 'R04-pas-de-header-footer',
    niveau: 'erreur',
    verifier: (r) =>
      r
        .querySelectorAll('header, footer')
        .map(() => 'Élément <header>/<footer> interdit : les ATS ignorent souvent ces zones.')
  },
  {
    id: 'R05-coordonnees-dans-le-corps',
    niveau: 'erreur',
    verifier: (r) => {
      const messages: string[] = [];
      for (const champ of ['email', 'telephone'] as const) {
        const el = r.querySelector(`[data-field="${champ}"]`);
        if (!el || el.text.trim().length === 0) {
          messages.push(`Coordonnée « ${champ} » absente du corps du document.`);
        }
      }
      return messages;
    }
  },
  {
    id: 'R06-rubriques-canoniques',
    niveau: 'erreur',
    verifier: (r) => {
      const titres = r.querySelectorAll('h2').map((h) => h.text.trim());
      const messages: string[] = [];
      for (const titre of titres) {
        if (!(RUBRIQUES_CANONIQUES as readonly string[]).includes(titre)) {
          messages.push(`Rubrique non canonique : « ${titre} » (attendu : ${RUBRIQUES_CANONIQUES.join(', ')}).`);
        }
      }
      for (const requise of RUBRIQUES_REQUISES) {
        if (!titres.includes(requise)) messages.push(`Rubrique requise absente : « ${requise} ».`);
      }
      return messages;
    }
  },
  {
    id: 'R07-ordre-des-rubriques',
    niveau: 'avertissement',
    verifier: (r) => {
      const indices = r
        .querySelectorAll('h2')
        .map((h) => (RUBRIQUES_CANONIQUES as readonly string[]).indexOf(h.text.trim()))
        .filter((i) => i >= 0);
      const desordre = indices.some((v, i) => i > 0 && v < (indices[i - 1] ?? 0));
      return desordre ? ['Ordre des rubriques inhabituel pour un ATS (ordre canonique attendu).'] : [];
    }
  },
  {
    id: 'R08-structure-des-postes',
    niveau: 'erreur',
    verifier: (r) => {
      const messages: string[] = [];
      const section = r.querySelector('[data-section="experience"]');
      if (!section) return ['Section [data-section="experience"] absente.'];
      const postes = section.querySelectorAll('[data-poste]');
      for (const [i, poste] of postes.entries()) {
        for (const champ of ['poste-titre', 'poste-employeur', 'poste-dates'] as const) {
          const el = poste.querySelector(`[data-field="${champ}"]`);
          if (!el || el.text.trim().length === 0) {
            messages.push(`Poste n°${i + 1} : champ « ${champ} » manquant ou vide.`);
          }
        }
      }
      return messages;
    }
  },
  {
    id: 'R09-format-des-dates',
    niveau: 'erreur',
    verifier: (r) =>
      r
        .querySelectorAll('[data-field="poste-dates"], [data-field="formation-dates"]')
        .filter((el) => {
          const t = el.text.trim();
          return !/^(0[1-9]|1[0-2])\/\d{4}\s*[-–]\s*((0[1-9]|1[0-2])\/\d{4}|présent)$/.test(t);
        })
        .map((el) => `Dates au mauvais format : « ${el.text.trim()} » (attendu : MM/AAAA – MM/AAAA ou présent).`)
  },
  {
    id: 'R10-pas-d-annee-deux-chiffres',
    niveau: 'erreur',
    verifier: (r) => (/\b\d{1,2}\/\d{2}\b/.test(r.text) ? ['Année sur deux chiffres détectée (format MM/AA illisible ATS).'] : [])
  },
  {
    id: 'R11-pas-d-icone-porteuse-de-donnee',
    niveau: 'erreur',
    verifier: (r) => {
      const messages: string[] = [];
      for (const el of r.querySelectorAll('[data-field]')) {
        if (el.text.trim().length === 0 && el.tagName !== 'A') {
          messages.push(`Champ ${el.getAttribute('data-field') ?? ''} rendu sans texte (icône seule illisible ATS).`);
        }
      }
      for (const img of r.querySelectorAll('img')) {
        if (img.getAttribute('data-field') !== 'photo') {
          messages.push('<img> non photo détectée : aucune image ne doit porter de contenu.');
        }
      }
      return messages;
    }
  },
  {
    id: 'R12-pas-de-barres-de-competences',
    niveau: 'erreur',
    verifier: (r) => {
      const messages: string[] = [];
      for (const el of r.querySelectorAll('[role="progressbar"], [aria-valuenow]')) {
        void el;
        messages.push('Barre de progression de compétence détectée : illisible par les ATS, utiliser une liste textuelle.');
      }
      for (const el of r.querySelectorAll('[class]')) {
        const classe = el.getAttribute('class') ?? '';
        if (/progress|skill-bar|jauge/.test(classe)) {
          messages.push(`Classe suspecte « ${classe} » : pas de jauges de compétences.`);
        }
      }
      return messages;
    }
  },
  {
    id: 'R13-sections-en-vraies-listes',
    niveau: 'erreur',
    verifier: (r) => {
      const messages: string[] = [];
      for (const nom of ['competences', 'langues'] as const) {
        const section = r.querySelector(`[data-section="${nom}"]`);
        if (!section) continue;
        const aDuContenu = section.text.trim().length > 0;
        if (aDuContenu && section.querySelectorAll('li').length === 0) {
          messages.push(`Section « ${nom} » sans <li> : les ATS attendent de vraies listes.`);
        }
      }
      return messages;
    }
  },
  {
    id: 'R14-vrais-liens',
    niveau: 'erreur',
    verifier: (r) => {
      const messages: string[] = [];
      for (const a of r.querySelectorAll('a')) {
        if (!a.getAttribute('href')) messages.push('Lien <a> sans href.');
      }
      for (const el of r.querySelectorAll('p, li, span, div')) {
        if (/https?:\/\/\S+/.test(el.text) && !el.querySelector('a') && el.tagName !== 'A') {
          messages.push(`URL en texte brut hors lien : « ${el.text.trim().slice(0, 60)}… ».`);
        }
      }
      return messages;
    }
  },
  {
    id: 'R15-police-standard',
    niveau: 'erreur',
    verifier: (r) =>
      stylesEnLigne(r)
        .filter(({ style }) => {
          const m = /font-family\s*:\s*([^;]+)/.exec(style);
          if (!m) return false;
          const familles = (m[1] ?? '').split(',').map((f) => f.trim().replace(/["']/g, ''));
          return !familles.some((f) => POLICES_AUTORISEES.some((ok) => f.includes(ok)));
        })
        .map(() => 'Police non standard en style en ligne (polices autorisées : inter, roboto, arial…).')
  },
  {
    id: 'R16-taille-de-police-minimale',
    niveau: 'erreur',
    verifier: (r) =>
      stylesEnLigne(r)
        .filter(({ style }) => {
          const m = /font-size\s*:\s*([\d.]+)\s*(px|pt)/.exec(style);
          if (!m) return false;
          const valeur = Number(m[1]);
          return (m[2] === 'px' && valeur < 13) || (m[2] === 'pt' && valeur < 10);
        })
        .map(() => 'Taille de police < 10 pt : illisible pour certains parseurs.')
  },
  {
    id: 'R17-contraste-suffisant',
    niveau: 'avertissement',
    verifier: (r) =>
      stylesEnLigne(r)
        .filter(({ style }) => /color\s*:\s*(#f{3,6}\b|#e[a-f0-9]{5}\b|white\b)/.test(style))
        .map(() => 'Texte potentiellement trop clair (contraste insuffisant).')
  },
  {
    id: 'R18-texte-reel-uniquement',
    niveau: 'erreur',
    verifier: (r) =>
      r
        .querySelectorAll('canvas, svg')
        .map(() => 'Élément <canvas>/<svg> interdit : le contenu doit être du texte réel.')
  },
  {
    id: 'R19-ordre-du-dom',
    niveau: 'erreur',
    verifier: (r) =>
      stylesEnLigne(r)
        .filter(({ style }) => /(^|;)\s*order\s*:/.test(style))
        .map(() => 'Propriété CSS order détectée : l’ordre visuel doit suivre l’ordre du DOM.')
  },
  {
    id: 'R20-pas-de-fausses-puces',
    niveau: 'erreur',
    verifier: (r) => {
      const messages: string[] = [];
      for (const el of r.querySelectorAll('p, div, span')) {
        const debut = texteDebutElement(el);
        if (GLYPHES_PUCES.test(debut)) {
          messages.push(`Fausse puce en texte brut : « ${debut.slice(0, 40)}… » (utiliser <ul>/<li>).`);
        }
      }
      return messages;
    }
  }
];

/** Applique les 20 règles au HTML rendu d'un CV. */
export function lintCv(html: string): ResultatLint {
  const racine = parse(html);
  const erreurs: Violation[] = [];
  const avertissements: Violation[] = [];
  for (const regle of REGLES) {
    for (const message of regle.verifier(racine)) {
      const violation = { regle: regle.id, message };
      if (regle.niveau === 'erreur') erreurs.push(violation);
      else avertissements.push(violation);
    }
  }
  const scoreStructure = Math.max(0, 100 - 8 * erreurs.length - 2 * avertissements.length);
  return { erreurs, avertissements, scoreStructure };
}
