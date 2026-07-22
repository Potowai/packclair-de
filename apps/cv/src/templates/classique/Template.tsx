import type { CV } from '@cvclair/cv-schema';
import { StructureCv } from '../commun';
import './template.css';

/** Gabarit Classique : serif traditionnel, nom centré, filets sous les rubriques. */
export default function Template({ cv }: { cv: CV }) {
  return (
    <main className="cv-classique" style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: '13px' }}>
      <StructureCv cv={cv} />
    </main>
  );
}
