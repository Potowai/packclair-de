import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  appelerAnthropic,
  construireMessagesQuiz,
  extraireJson,
  nombresDe,
  normaliserTexte,
  retirerIntrus,
  verifierVeracite,
  type CvGenere,
  type ReponsesQuiz
} from '@/lib/ia';

const quiz: ReponsesQuiz = {
  nomComplet: 'Nadia Haddad',
  email: 'nadia@example.fr',
  telephone: '06 56 78 90 12',
  posteVise: 'Comptable clients',
  anneesExperience: '3 à 5 ans',
  secteur: 'distribution',
  posteRecent: 'Comptable clients',
  employeurRecent: 'DistribNord',
  periodeRecente: '09/2021 – présent',
  realisations: [
    'je gère 1500 comptes clients',
    'j’ai réduit le délai de paiement de 48 à 36 jours',
    'j’ai automatisé le lettrage de 80 % des écritures'
  ],
  competences: ['Sage 100', 'Excel'],
  diplome: 'BTS Comptabilité et gestion',
  etablissement: 'Lycée Colbert',
  anneeDiplome: '06/2019',
  langues: [{ langue: 'Français', niveau: 'MATERNELLE' }]
};

const cvFidele: CvGenere = {
  accroche: 'Comptable clients avec 3 à 5 ans d’expérience en distribution.',
  experiences: [
    {
      titre: 'Comptable clients',
      employeur: 'DistribNord',
      debut: '09/2021',
      fin: 'present',
      puces: [
        'Gérer 1500 comptes clients au quotidien',
        'Réduire le délai de paiement de 48 à 36 jours',
        'Automatiser le lettrage de 80 % des écritures sous Sage'
      ]
    }
  ],
  formation: [{ diplome: 'BTS Comptabilité et gestion', etablissement: 'Lycée Colbert', fin: '06/2019' }],
  competences: ['Sage 100', 'Excel'],
  langues: [{ langue: 'Français', niveau: 'MATERNELLE' }]
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('construireMessagesQuiz', () => {
  it('inclut tous les faits du quiz et les interdictions d’invention', () => {
    const { system, user } = construireMessagesQuiz(quiz);
    expect(user).toContain('Comptable clients');
    expect(user).toContain('DistribNord');
    expect(user).toContain('1500 comptes');
    expect(user).toContain('BTS Comptabilité et gestion');
    expect(system).toContain('N\'invente JAMAIS');
    expect(user).toContain('"accroche"');
  });
});

describe('extraireJson', () => {
  it('parse un JSON brut', () => {
    expect(extraireJson('{"a":1}')).toEqual({ a: 1 });
  });

  it('tolère les fences markdown et le texte autour', () => {
    expect(extraireJson('Voici :\n```json\n{"a":2}\n```\nFin.')).toEqual({ a: 2 });
  });

  it('rejette une réponse sans JSON', () => {
    expect(() => extraireJson('aucun objet')).toThrow();
  });
});

describe('nombresDe', () => {
  it('extrait les nombres et normalise les décimales à virgule', () => {
    expect([...nombresDe('48 à 36 jours, 1,2 M€')]).toEqual(['48', '36', '1.2']);
    expect(nombresDe('aucun').size).toBe(0);
  });
});

describe('normaliserTexte', () => {
  it('supprime les accents et met en minuscules', () => {
    expect(normaliserTexte('DistribNord')).toBe('distribnord');
    expect(normaliserTexte('DISTRIBNORD')).toBe('distribnord');
    expect(normaliserTexte('Élève Ingénieur')).toBe('eleve ingenieur');
    expect(normaliserTexte('DISTRIBNORD').includes(normaliserTexte('DistribNord'))).toBe(true);
  });
});

describe('verifierVeracite (garde-fou)', () => {
  it('accepte un CV fidèle aux faits', () => {
    const v = verifierVeracite(cvFidele, quiz);
    expect(v.intrus).toEqual([]);
    expect(v.ok).toBe(true);
  });

  it('signale un chiffre inventé dans une puce', () => {
    const cv: CvGenere = {
      ...cvFidele,
      experiences: [
        { ...cvFidele.experiences[0]!, puces: ['Gérer 2200 comptes clients'] }
      ]
    };
    const v = verifierVeracite(cv, quiz);
    expect(v.ok).toBe(false);
    expect(v.intrus.some((i) => i.includes('2200'))).toBe(true);
  });

  it('signale un employeur inventé', () => {
    const cv: CvGenere = {
      ...cvFidele,
      experiences: [{ ...cvFidele.experiences[0]!, employeur: 'Carrefour' }]
    };
    expect(verifierVeracite(cv, quiz).intrus.some((i) => i.includes('Carrefour'))).toBe(true);
  });

  it('signale un chiffre inventé dans l’accroche', () => {
    const cv: CvGenere = { ...cvFidele, accroche: 'Comptable avec 12 ans d’expérience.' };
    expect(verifierVeracite(cv, quiz).intrus.some((i) => i.includes('accroche'))).toBe(true);
  });

  it('ignore les accents et la casse pour l’employeur', () => {
    const cv: CvGenere = {
      ...cvFidele,
      experiences: [{ ...cvFidele.experiences[0]!, employeur: 'DISTRIBNORD' }]
    };
    expect(verifierVeracite(cv, quiz).ok).toBe(true);
  });
});

describe('retirerIntrus', () => {
  it('retire la puce inventée et garde les fidèles', () => {
    const cv: CvGenere = {
      ...cvFidele,
      experiences: [
        {
          ...cvFidele.experiences[0]!,
          puces: ['Gérer 1500 comptes clients', 'Réduire les impayés de 99 %']
        }
      ]
    };
    const nettoye = retirerIntrus(cv, quiz);
    expect(nettoye.experiences[0]!.puces).toEqual(['Gérer 1500 comptes clients']);
  });

  it('supprime l’accroche si elle contient un nombre non sourcé', () => {
    const cv: CvGenere = { ...cvFidele, accroche: 'Experte avec 27 ans de métier.' };
    expect(retirerIntrus(cv, quiz).accroche).toBeUndefined();
  });

  it('retire une expérience à l’employeur non fourni', () => {
    const cv: CvGenere = {
      ...cvFidele,
      experiences: [cvFidele.experiences[0]!, { ...cvFidele.experiences[0]!, employeur: 'Inventée SA' }]
    };
    expect(retirerIntrus(cv, quiz).experiences).toHaveLength(1);
  });
});

describe('appelerAnthropic', () => {
  it('renvoie le texte de la réponse', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ content: [{ type: 'text', text: '{"a":1}' }] }), { status: 200 }))
    );
    await expect(appelerAnthropic(quiz, 'cle-test', 'modele-test')).resolves.toBe('{"a":1}');
    const appel = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0]!;
    expect(String(appel[0])).toBe('https://api.anthropic.com/v1/messages');
    const corps = JSON.parse(String(appel[1]!.body));
    expect(corps.model).toBe('modele-test');
    expect(corps.system).toContain('VÉRACITÉ');
  });

  it('lève une erreur explicite en cas d’échec API', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('rate limited', { status: 429 })));
    await expect(appelerAnthropic(quiz, 'cle')).rejects.toThrow('Anthropic 429');
  });
});
