import type { CV } from '@cvclair/cv-schema';
import { StructureCv } from '../commun';
import './template.css';

/** Gabarit Moderne : sans-serif, accent bleu foncé sur les rubriques. */
export default function Template({ cv }: { cv: CV }) {
  return (
    <main className="cv-moderne" style={{ fontFamily: 'Inter, system-ui, Arial, sans-serif', fontSize: '13px' }}>
      <StructureCv cv={cv} />
    </main>
  );
}
