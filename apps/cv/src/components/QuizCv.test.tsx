import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import QuizCv from '@/components/QuizCv';
import { db } from '@/storage/db';

const cvGenereValide = {
  identite: {
    nomComplet: 'Nadia Haddad',
    titre: 'Comptable clients',
    email: 'nadia@example.fr',
    telephone: '06 56 78 90 12'
  },
  accroche: 'Comptable clients avec 3 à 5 ans d’expérience.',
  experiences: [
    {
      id: 'gen-exp-0',
      titre: 'Comptable clients',
      employeur: 'DistribNord',
      debut: '09/2021',
      fin: 'present',
      puces: ['Gérer 1500 comptes clients']
    }
  ],
  formation: [{ id: 'gen-for-0', diplome: 'BTS CG', etablissement: 'Lycée Colbert', fin: '06/2019' }],
  competences: ['Sage 100'],
  langues: [{ langue: 'Français', niveau: 'MATERNELLE' }],
  certifications: [],
  centresInteret: []
};

/** Navigue les 3 premières étapes en remplissant les champs obligatoires. */
async function parcourirEtapes(user: ReturnType<typeof userEvent.setup>) {
  // Étape 0 — Identité
  await user.type(screen.getByLabelText(/Nom complet/), 'Nadia Haddad');
  await user.type(screen.getByLabelText(/E-mail/), 'nadia@example.fr');
  await user.type(screen.getByLabelText(/Téléphone/), '06 56 78 90 12');
  await user.click(screen.getByRole('button', { name: /Étape suivante/ }));

  // Étape 1 — Poste
  await user.type(screen.getByLabelText(/Intitulé du poste visé/), 'Comptable clients');
  await user.click(screen.getByRole('button', { name: /Étape suivante/ }));

  // Étape 2 — Expérience (skip, champs optionnels)
  await user.click(screen.getByRole('button', { name: /Étape suivante/ }));

  // Étape 3 — Formation
  await user.type(screen.getByLabelText(/Diplôme/), 'BTS Comptabilité et gestion');
  await user.type(screen.getByLabelText(/Établissement/), 'Lycée Colbert');
  await user.type(screen.getByLabelText(/Année d'obtention/), '06/2019');
  await user.click(screen.getByRole('button', { name: /Étape suivante/ }));
}

describe('QuizCv', () => {
  beforeEach(async () => {
    await db.cvs.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('affiche le stepper avec la première étape active', () => {
    render(<QuizCv />);
    expect(screen.getByRole('heading', { name: /Qui êtes-vous/ })).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument(); // step number
  });

  it('génère, valide et sauvegarde le CV puis affiche le succès', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ cv: cvGenereValide, retouchees: [] }), { status: 200 }))
    );
    const user = userEvent.setup();
    render(<QuizCv />);
    await parcourirEtapes(user);

    // Étape 4 — Finaliser
    await user.click(screen.getByRole('button', { name: /Générer mon CV avec l'IA/ }));

    expect(await screen.findByRole('heading', { name: /Votre CV est prêt/ })).toBeInTheDocument();
    const enregistre = await db.cvs.toArray();
    expect(enregistre).toHaveLength(1);
    expect(enregistre[0]!.donnees.identite.nomComplet).toBe('Nadia Haddad');
  });

  it('affiche l’état « service IA non configuré » sur 503', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ erreur: 'Service IA non configuré.' }), { status: 503 }))
    );
    const user = userEvent.setup();
    render(<QuizCv />);
    await parcourirEtapes(user);
    await user.click(screen.getByRole('button', { name: /Générer mon CV avec l'IA/ }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/n'est pas configuré/);
  });

  it('affiche le signalement du garde-fou quand des formulations ont été retirées', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(JSON.stringify({ cv: cvGenereValide, retouchees: ['puce : nombre non sourcé « 99 »'] }), {
          status: 200
        })
      )
    );
    const user = userEvent.setup();
    render(<QuizCv />);
    await parcourirEtapes(user);
    await user.click(screen.getByRole('button', { name: /Générer mon CV avec l'IA/ }));
    expect(await screen.findByRole('heading', { name: /Votre CV est prêt/ })).toBeInTheDocument();
    expect(screen.getByRole('note')).toHaveTextContent(/véracité/);
  });

  it('rejette un CV invalide renvoyé par la fonction', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ cv: { identite: {} }, retouchees: [] }), { status: 200 }))
    );
    const user = userEvent.setup();
    render(<QuizCv />);
    await parcourirEtapes(user);
    await user.click(screen.getByRole('button', { name: /Générer mon CV avec l'IA/ }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/invalide/);
  });
});
