import { cvBrouillonSchema } from '@cvclair/cv-schema';
import {
  appelerIa,
  extraireJson,
  retirerIntrus,
  verifierVeracite,
  type AppelIaConfig,
  type ApiFormat,
  type CvGenere,
  type ReponsesQuiz
} from '../../src/lib/ia';

function json(corps: unknown, statut = 200): Response {
  return new Response(JSON.stringify(corps), {
    status: statut,
    headers: { 'content-type': 'application/json; charset=utf-8' }
  });
}

function modeleDefaut(format: ApiFormat): string {
  return format === 'anthropic' ? 'claude-sonnet-4-5' : 'gpt-4o-mini';
}

function lireConfig(): AppelIaConfig {
  const format = (process.env.AI_PROVIDER ?? 'anthropic') as ApiFormat;
  const apiKey = process.env.AI_API_KEY ?? process.env.ANTHROPIC_API_KEY ?? '';
  return {
    apiKey,
    format,
    model: process.env.AI_MODEL || process.env.ANTHROPIC_MODEL || modeleDefaut(format),
    baseUrl: process.env.AI_BASE_URL
  };
}

/**
 * POST /.netlify/functions/generer-cv
 * Corps : ReponsesQuiz → { cv, retouchees }.
 * Lit AI_PROVIDER, AI_API_KEY, AI_MODEL, AI_BASE_URL pour s'adapter à
 * n'importe quel fournisseur (Anthropic, OpenRouter, Nvidia, etc.).
 */
export default async (req: Request): Promise<Response> => {
  if (req.method !== 'POST') return json({ erreur: 'Méthode non autorisée.' }, 405);

  const config = lireConfig();
  if (!config.apiKey) {
    return json(
      {
        erreur: 'Service IA non configuré.',
        details: 'Définissez AI_API_KEY (ou ANTHROPIC_API_KEY) dans les variables d\'environnement Netlify.'
      },
      503
    );
  }

  let quiz: ReponsesQuiz;
  try {
    quiz = (await req.json()) as ReponsesQuiz;
  } catch {
    return json({ erreur: 'Corps JSON invalide.' }, 400);
  }

  if (!quiz || typeof quiz !== 'object') return json({ erreur: 'Corps invalide.' }, 400);
  const requis: (keyof ReponsesQuiz)[] = ['nomComplet', 'email', 'telephone', 'posteVise', 'diplome', 'etablissement', 'anneeDiplome'];
  const manquants = requis.filter((k) => !String(quiz[k] ?? '').trim());
  if (manquants.length > 0) {
    return json({ erreur: `Champs requis manquants : ${manquants.join(', ')}.` }, 400);
  }

  try {
    const texte = await appelerIa(quiz, config);
    const brut = extraireJson(texte) as CvGenere;
    const verdict = verifierVeracite(brut, quiz);
    const nettoye = retirerIntrus(brut, quiz);

    const cvComplet = {
      identite: {
        nomComplet: quiz.nomComplet.trim(),
        titre: quiz.posteVise.trim(),
        email: quiz.email.trim(),
        telephone: quiz.telephone.trim(),
        ...(quiz.localisation?.trim() ? { localisation: quiz.localisation.trim() } : {})
      },
      accroche: nettoye.accroche,
      experiences: (nettoye.experiences ?? []).map((e, i) => ({
        id: `gen-exp-${i}`,
        titre: String(e.titre ?? '').trim(),
        employeur: String(e.employeur ?? '').trim(),
        debut: String(e.debut ?? '').trim(),
        fin: String(e.fin ?? '').trim() === 'présent' ? 'present' : String(e.fin ?? '').trim(),
        puces: (e.puces ?? []).map((p) => String(p).trim()).filter(Boolean).slice(0, 8)
      })),
      formation: (nettoye.formation ?? []).map((f, i) => ({
        id: `gen-for-${i}`,
        diplome: String(f.diplome ?? '').trim(),
        etablissement: String(f.etablissement ?? '').trim(),
        ...(f.debut ? { debut: String(f.debut).trim() } : {}),
        fin: String(f.fin ?? '').trim()
      })),
      competences: (nettoye.competences ?? []).map((c) => String(c).trim()).filter(Boolean).slice(0, 30),
      langues: (nettoye.langues ?? [])
        .map((l) => ({ langue: String(l.langue ?? '').trim(), niveau: String(l.niveau ?? '').trim() }))
        .filter((l) => l.langue),
      certifications: [],
      centresInteret: []
    };

    const valide = cvBrouillonSchema.safeParse(cvComplet);
    if (!valide.success) {
      return json(
        {
          erreur: 'Le CV généré ne respecte pas le schéma.',
          details: valide.error.issues.slice(0, 5).map((i) => `${i.path.join('.')}: ${i.message}`)
        },
        502
      );
    }

    return json({ cv: valide.data, retouchees: verdict.intrus });
  } catch (e) {
    return json({ erreur: 'Échec de la génération IA.', details: String(e).slice(0, 300) }, 502);
  }
};
