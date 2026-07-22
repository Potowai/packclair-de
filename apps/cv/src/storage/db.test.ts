import { beforeEach, describe, expect, it } from 'vitest';
import { creerCvVide } from '@cvclair/cv-schema';
import { chargerOuCreerCv, db, sauvegarderCv } from '@/storage/db';

describe('stockage local (Dexie/IndexedDB)', () => {
  beforeEach(async () => {
    await db.cvs.clear();
  });

  it('crée un CV vide au premier lancement', async () => {
    const cv = await chargerOuCreerCv('classique');
    expect(cv.nom).toBe('Mon CV');
    expect(cv.modele).toBe('classique');
    expect(cv.donnees).toEqual(creerCvVide());
  });

  it('recharge le CV le plus récent sans en recréer un', async () => {
    const premier = await chargerOuCreerCv('classique');
    const deuxieme = await chargerOuCreerCv('moderne');
    expect(deuxieme.id).toBe(premier.id);
    expect(await db.cvs.count()).toBe(1);
  });

  it('sauvegarde les modifications et met à jour le horodatage', async () => {
    const cv = await chargerOuCreerCv('classique');
    const avant = cv.maj;
    await new Promise((r) => setTimeout(r, 5));
    await sauvegarderCv({
      ...cv,
      donnees: { ...cv.donnees, identite: { ...cv.donnees.identite, nomComplet: 'Léa Martin' } }
    });
    const relu = await db.cvs.get(cv.id);
    expect(relu?.donnees.identite.nomComplet).toBe('Léa Martin');
    expect(relu!.maj).toBeGreaterThan(avant);
  });

  it('persiste le choix du gabarit', async () => {
    const cv = await chargerOuCreerCv('classique');
    await sauvegarderCv({ ...cv, modele: 'compact' });
    const relu = await chargerOuCreerCv('classique');
    expect(relu.modele).toBe('compact');
  });
});
