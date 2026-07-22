import type { CV } from '@cvclair/cv-schema';
import { StructureCv } from '../commun';
import './template.css';

/** Gabarit Compact : dense, pensé pour les profils expérimentés en une page. */
export default function Template({ cv }: { cv: CV }) {
  return (
    <main className="cv-compact" style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '13px' }}>
      <StructureCv cv={cv} />
    </main>
  );
}
