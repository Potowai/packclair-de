import Dexie, { type Table } from 'dexie';
import { creerCvVide, type CV } from '@cvclair/cv-schema';

/** Enregistrement stocké en local (IndexedDB) — local-first, PLAN §7. */
export interface CvStocke {
  id: string;
  /** Nom d'affichage dans la liste des CV (« Mon CV »). */
  nom: string;
  /** Identifiant du gabarit (registre src/templates). */
  modele: string;
  donnees: CV;
  /** Date de dernière modification (epoch ms). */
  maj: number;
}

export class CvClairDB extends Dexie {
  cvs!: Table<CvStocke, string>;

  constructor(nom = 'cvclair') {
    super(nom);
    this.version(1).stores({ cvs: 'id, maj' });
  }
}

export const db = new CvClairDB();

/** Charge le CV le plus récent, ou en crée un vide au premier lancement. */
export async function chargerOuCreerCv(modeleParDefaut: string): Promise<CvStocke> {
  const recents = await db.cvs.orderBy('maj').reverse().limit(1).toArray();
  const existant = recents[0];
  if (existant) return existant;
  const nouveau: CvStocke = {
    id: crypto.randomUUID(),
    nom: 'Mon CV',
    modele: modeleParDefaut,
    donnees: creerCvVide(),
    maj: Date.now()
  };
  await db.cvs.add(nouveau);
  return nouveau;
}

export async function sauvegarderCv(cv: CvStocke): Promise<void> {
  await db.cvs.put({ ...cv, maj: Date.now() });
}
