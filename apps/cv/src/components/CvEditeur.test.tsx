import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import CvEditeur from '@/components/CvEditeur';
import { db } from '@/storage/db';

describe('CvEditeur', () => {
  beforeEach(async () => {
    await db.cvs.clear();
  });

  it('affiche le formulaire et crée le CV au chargement', async () => {
    render(<CvEditeur delaiSauvegarde={10} />);
    expect(await screen.findByLabelText(/Nom complet/)).toBeInTheDocument();
    expect(screen.getByLabelText(/E-mail/)).toBeInTheDocument();
    expect(screen.getByText(/Score ATS/)).toBeInTheDocument();
    expect(await screen.findByRole('radio', { name: /Classique/ })).toBeChecked();
    expect(await db.cvs.count()).toBe(1);
  });

  it('sauvegarde automatiquement la saisie en local', async () => {
    const user = userEvent.setup();
    render(<CvEditeur delaiSauvegarde={10} />);
    const champNom = await screen.findByLabelText(/Nom complet/);
    await user.type(champNom, 'Léa Martin');
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Enregistré'));
    const enregistre = await db.cvs.toArray();
    expect(enregistre[0]?.donnees.identite.nomComplet).toBe('Léa Martin');
  });

  it('ajoute un poste et une langue', async () => {
    const user = userEvent.setup();
    render(<CvEditeur delaiSauvegarde={10} />);
    await screen.findByLabelText(/Nom complet/);
    await user.click(screen.getByRole('button', { name: /Ajouter un poste/ }));
    expect(screen.getByLabelText(/Intitulé du poste/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Ajouter une langue/ }));
    expect(screen.getByLabelText('Langue')).toBeInTheDocument();
    await waitFor(async () => {
      const enregistre = await db.cvs.toArray();
      expect(enregistre[0]?.donnees.experiences).toHaveLength(1);
      expect(enregistre[0]?.donnees.langues).toHaveLength(1);
    });
  });

  it('normalise « présent » en valeur canonique', async () => {
    const user = userEvent.setup();
    render(<CvEditeur delaiSauvegarde={10} />);
    await screen.findByLabelText(/Nom complet/);
    await user.click(screen.getByRole('button', { name: /Ajouter un poste/ }));
    await user.type(screen.getByLabelText(/Fin \(MM\/AAAA ou présent\)/), 'Présent');
    await waitFor(async () => {
      const enregistre = await db.cvs.toArray();
      expect(enregistre[0]?.donnees.experiences[0]?.fin).toBe('present');
    });
  });

  it('change de gabarit et le persiste', async () => {
    const user = userEvent.setup();
    render(<CvEditeur delaiSauvegarde={10} />);
    await screen.findByLabelText(/Nom complet/);
    await user.click(screen.getByRole('radio', { name: /Compact/ }));
    await waitFor(async () => {
      const enregistre = await db.cvs.toArray();
      expect(enregistre[0]?.modele).toBe('compact');
    });
  });
});
