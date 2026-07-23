/**
 * Pipeline IA du quiz (PLAN §5) : prompt → appel Anthropic → extraction JSON
 * → garde-fou de véracité → nettoyage. Framework-free pour être testé en
 * Vitest et embarqué dans la fonction Netlify.
 */

export interface LangueQuiz {
  langue: string;
  niveau: string;
}

export interface ReponsesQuiz {
  nomComplet: string;
  email: string;
  telephone: string;
  localisation?: string;
  posteVise: string;
  anneesExperience: string;
  secteur: string;
  posteRecent?: string;
  employeurRecent?: string;
  /** Ex. « 09/2023 – présent ». */
  periodeRecente?: string;
  realisations: string[];
  competences: string[];
  diplome: string;
  etablissement: string;
  /** Ex. « 06/2023 ». */
  anneeDiplome: string;
  langues: LangueQuiz[];
}

export const MODELE_PAR_DEFAUT_IA = 'claude-sonnet-4-5';

/** CV généré par l'IA (l'identité est reconstruite depuis le quiz, jamais par l'IA). */
export interface CvGenere {
  accroche?: string;
  experiences: {
    titre: string;
    employeur: string;
    debut: string;
    fin: string;
    puces: string[];
  }[];
  formation: { diplome: string; etablissement: string; debut?: string; fin: string }[];
  competences: string[];
  langues: LangueQuiz[];
}

const SYSTEM_PROMPT = `Tu es un rédacteur de CV français senior. Tu rédiges des CV qui passent les ATS et plaisent aux recruteurs français.

Règles impératives :
1. VÉRACITÉ ABSOLUE : utilise UNIQUEMENT les faits fournis par le candidat. N'invente JAMAIS d'employeur, de chiffre, de pourcentage, de diplôme, de technologie ou de date. Toute réalisation chiffrée doit reprendre les chiffres fournis, sans en ajouter.
2. Style : puces commençant par un verbe d'action, moins de 25 mots par puce, résultats quantifiés UNIQUEMENT avec les chiffres fournis.
3. Accroche : 2–4 lignes, orientée vers le poste visé, sans clichés (« dynamique et motivé » interdit).
4. Rubriques et dates : dates au format MM/AAAA, « présent » pour un poste en cours.
5. Niveaux de langue CECRL : A1, A2, B1, B2, C1, C2 ou MATERNELLE.
6. Réponds UNIQUEMENT avec un objet JSON valide, sans markdown, sans commentaire.`;

function exempleStructure(): string {
  return `{
  "accroche": "string (2-4 lignes)",
  "experiences": [
    { "titre": "string", "employeur": "string", "debut": "MM/AAAA", "fin": "MM/AAAA ou présent", "puces": ["string"] }
  ],
  "formation": [
    { "diplome": "string", "etablissement": "string", "debut": "MM/AAAA ou absent", "fin": "MM/AAAA" }
  ],
  "competences": ["string"],
  "langues": [{ "langue": "string", "niveau": "A1|A2|B1|B2|C1|C2|MATERNELLE" }]
}`;
}

/** Construit les messages de la requête : faits du quiz + structure attendue. */
export function construireMessagesQuiz(q: ReponsesQuiz): { system: string; user: string } {
  const faits = [
    `Poste visé : ${q.posteVise}`,
    `Secteur : ${q.secteur || 'non précisé'}`,
    `Expérience : ${q.anneesExperience}`,
    q.posteRecent ? `Poste récent : ${q.posteRecent}` : null,
    q.employeurRecent ? `Employeur récent : ${q.employeurRecent}` : null,
    q.periodeRecente ? `Période : ${q.periodeRecente}` : null,
    `Réalisations fournies par le candidat :\n${q.realisations.filter(Boolean).map((r) => `- ${r}`).join('\n') || '- (aucune)'}`,
    `Compétences déclarées : ${q.competences.filter(Boolean).join(', ') || '(aucune)'}`,
    `Diplôme : ${q.diplome} — ${q.etablissement}, ${q.anneeDiplome}`,
    `Langues : ${q.langues.map((l) => `${l.langue} (${l.niveau})`).join(', ') || 'non précisées'}`
  ]
    .filter(Boolean)
    .join('\n');

  const user = `Rédige un CV en français pour ce candidat, à partir UNIQUEMENT des faits ci-dessous.

FAITS FOURNIS PAR LE CANDIDAT :
${faits}

Consignes :
- 1 expérience à partir du poste récent (si fourni) avec 2 à 5 puces reformulant les réalisations fournies ; n'ajoute aucune autre expérience.
- Si aucun poste récent n'est fourni, "experiences" est un tableau vide.
- 1 formation à partir du diplôme fourni ; "debut" seulement si une année de début est fournie.
- "competences" reprend les compétences déclarées, sans en ajouter.
- "langues" reprend les langues fournies.
- Respecte EXACTEMENT cette structure JSON :
${exempleStructure()}

Rappel : aucun chiffre, employeur, diplôme ou technologie qui ne figure pas dans les faits.`;

  return { system: SYSTEM_PROMPT, user };
}

/** Extrait l'objet JSON d'une réponse de modèle (tolère les fences markdown). */
export function extraireJson(texte: string): unknown {
  const sansFence = texte.replace(/```(?:json)?/gi, '');
  const debut = sansFence.indexOf('{');
  const fin = sansFence.lastIndexOf('}');
  if (debut < 0 || fin <= debut) {
    throw new Error('Aucun JSON trouvé dans la réponse du modèle.');
  }
  return JSON.parse(sansFence.slice(debut, fin + 1));
}

/** Tous les nombres (suites de chiffres) présents dans un texte. */
export function nombresDe(texte: string): Set<string> {
  const trouves = texte.match(/\d+(?:[.,]\d+)?/g) ?? [];
  return new Set(trouves.map((n) => n.replace(',', '.')));
}

function nombresDuQuiz(q: ReponsesQuiz): Set<string> {
  const sources = [
    q.anneesExperience,
    q.periodeRecente ?? '',
    q.anneeDiplome,
    ...q.realisations,
    q.posteRecent ?? '',
    q.employeurRecent ?? ''
  ].join('\n');
  return nombresDe(sources);
}

export interface VerdictVeracite {
  ok: boolean;
  /** Éléments contenant des faits non sourcés (chiffres ou employeurs inventés). */
  intrus: string[];
}

export function normaliserTexte(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

/**
 * Garde-fou de véracité (PLAN §5.4) : tout nombre dans le CV généré doit
 * provenir des réponses du quiz ; l'employeur/titre d'expérience doit venir
 * des faits fournis. Ce qui n'est pas sourcé est signalé comme intrus.
 */
export function verifierVeracite(cv: CvGenere, q: ReponsesQuiz): VerdictVeracite {
  const nombresAutorises = nombresDuQuiz(q);
  const intrus: string[] = [];

  const controlerNombres = (texte: string, contexte: string) => {
    for (const n of nombresDe(texte)) {
      if (!nombresAutorises.has(n)) {
        intrus.push(`${contexte} : nombre non sourcé « ${n} » dans « ${texte.slice(0, 60)} »`);
      }
    }
  };

  if (cv.accroche) controlerNombres(cv.accroche, 'accroche');

  const employeurAttendu = normaliserTexte(q.employeurRecent ?? '');
  const posteAttendu = normaliserTexte(q.posteRecent ?? '');
  for (const exp of cv.experiences ?? []) {
    controlerNombres(exp.debut ?? '', 'dates');
    controlerNombres(exp.fin === 'present' ? '' : (exp.fin ?? ''), 'dates');
    if (employeurAttendu && !normaliserTexte(exp.employeur ?? '').includes(employeurAttendu)) {
      intrus.push(`expérience : employeur non fourni « ${exp.employeur} »`);
    }
    if (posteAttendu && !normaliserTexte(exp.titre ?? '').includes(posteAttendu)) {
      intrus.push(`expérience : intitulé éloigné du fait fourni « ${exp.titre} »`);
    }
    for (const puce of exp.puces ?? []) controlerNombres(puce, 'puce');
  }
  for (const f of cv.formation ?? []) {
    controlerNombres(f.fin ?? '', 'formation');
    if (f.debut) controlerNombres(f.debut, 'formation');
  }

  return { ok: intrus.length === 0, intrus };
}

/**
 * Retire du CV généré tout contenu non sourcé : puces avec nombres inventés,
 * expériences à l'employeur non fourni, accroche douteuse (supprimée).
 */
export function retirerIntrus(cv: CvGenere, q: ReponsesQuiz): CvGenere {
  const nombresAutorises = nombresDuQuiz(q);
  const employeurAttendu = normaliserTexte(q.employeurRecent ?? '');
  const posteAttendu = normaliserTexte(q.posteRecent ?? '');

  const contientNombreIntrus = (texte: string) =>
    [...nombresDe(texte)].some((n) => !nombresAutorises.has(n));

  const experiences = (cv.experiences ?? [])
    .filter((e) => {
      const employeurOk = !employeurAttendu || normaliserTexte(e.employeur ?? '').includes(employeurAttendu);
      const titreOk = !posteAttendu || normaliserTexte(e.titre ?? '').includes(posteAttendu);
      return employeurOk && titreOk;
    })
    .map((e) => ({
      ...e,
      puces: (e.puces ?? []).filter((p) => !contientNombreIntrus(p))
    }))
    .filter((e) => !contientNombreIntrus(e.debut ?? '') && !contientNombreIntrus(e.fin === 'present' ? '' : (e.fin ?? '')));

  const accroche = cv.accroche && !contientNombreIntrus(cv.accroche) ? cv.accroche : undefined;

  return { ...cv, accroche, experiences };
}

// ----------------------------------------------------------------
// Appel API multi-fournisseur (Anthropic, OpenRouter, Nvidia…)
// ----------------------------------------------------------------

export type ApiFormat = 'anthropic' | 'openai';

export interface AppelIaConfig {
  /** Clé API du fournisseur. */
  apiKey: string;
  /** Format de l'API : 'anthropic' (Messages) ou 'openai' (Chat Completions). */
  format: ApiFormat;
  /** Identifiant du modèle (ex: claude-sonnet-4-5, gpt-4o-mini…). */
  model: string;
  /** URL de base de l'API. Défaut selon le format. */
  baseUrl?: string;
}

const URLS_PAR_DEFAUT: Record<ApiFormat, string> = {
  anthropic: 'https://api.anthropic.com',
  openai: 'https://openrouter.ai/api'
};

/**
 * Appelle l'API d'IA (Anthropic Messages, OpenAI Chat Completions sous
 * OpenRouter/Nvidia, etc.) avec les messages du quiz. Lève une erreur
 * descriptive en cas d'échec.
 */
export async function appelerIa(
  q: ReponsesQuiz,
  config: AppelIaConfig
): Promise<string> {
  const { system, user } = construireMessagesQuiz(q);
  const baseUrl = config.baseUrl ?? URLS_PAR_DEFAUT[config.format];
  const delai = AbortSignal.timeout(45_000);

  if (config.format === 'anthropic') {
    const reponse = await fetch(`${baseUrl}/v1/messages`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: config.model,
        max_tokens: 2000,
        temperature: 0.3,
        system,
        messages: [{ role: 'user', content: user }]
      }),
      signal: delai
    });
    if (!reponse.ok) {
      const detail = await reponse.text().catch(() => '');
      throw new Error(`API IA (anthropic) ${reponse.status}: ${detail.slice(0, 200)}`);
    }
    const data = (await reponse.json()) as { content?: { type: string; text?: string }[] };
    const texte = data.content?.find((c) => c.type === 'text')?.text;
    if (!texte) throw new Error('Réponse IA (anthropic) sans contenu texte.');
    return texte;
  }

  // Format OpenAI (OpenRouter, Nvidia, OpenAI, Groq, Together, etc.)
  const reponse = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: 2000,
      temperature: 0.3,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user }
      ]
    }),
    signal: delai
  });
  if (!reponse.ok) {
    const detail = await reponse.text().catch(() => '');
    throw new Error(`API IA (openai) ${reponse.status}: ${detail.slice(0, 200)}`);
  }
  const data = (await reponse.json()) as { choices?: { message?: { content?: string } }[] };
  const texte = data.choices?.[0]?.message?.content;
  if (!texte) throw new Error('Réponse IA (openai) sans contenu texte.');
  return texte;
}

/**
 * Appel Anthropic (ancien nom — conservé pour compatibilité). Délègue à
 * `appelerIa` avec le format 'anthropic'.
 */
export async function appelerAnthropic(
  q: ReponsesQuiz,
  cleApi: string,
  modele: string = MODELE_PAR_DEFAUT_IA
): Promise<string> {
  return appelerIa(q, { apiKey: cleApi, format: 'anthropic', model: modele });
}
