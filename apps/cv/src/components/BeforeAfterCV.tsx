import { useRef, useState, useCallback } from 'react';

export default function BeforeAfterCV() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(50);
  const dragging = useRef(false);

  const update = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setPos((x / rect.width) * 100);
  }, []);

  function onDown(e: React.PointerEvent) {
    dragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    update(e.clientX);
  }
  function onMove(e: React.PointerEvent) {
    if (dragging.current) update(e.clientX);
  }
  function onUp() { dragging.current = false; }

  return (
    <div
      ref={containerRef}
      className="ba-container"
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      role="slider"
      aria-label="Comparaison avant / après"
      aria-valuenow={Math.round(pos)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      {/* Bad CV (left — behind) */}
      <div className="ba-side ba-bad">
        <div className="ba-cv ba-cv-bad">
          <div className="ba-cv-header-bad">
            <div style={{textAlign:'center'}}>
              <div style={{width:60,height:60,borderRadius:'50%',background:'#e5e7eb',margin:'0 auto 8px'}} />
              <div style={{fontSize:18,fontWeight:800}}>Marie Curie</div>
              <div style={{fontSize:12,color:'#6b7280'}}>Physicienne • Chimiste</div>
              <div style={{fontSize:11,color:'#9ca3af',marginTop:4}}>marie@labo.fr • 06 12 34 56 78</div>
            </div>
          </div>
          <div style={{padding:'12px 16px'}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              <div>
                <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',color:'#6366f1',marginBottom:4}}>Expérience</div>
                <div style={{fontSize:12,fontWeight:600}}>Chercheuse</div>
                <div style={{fontSize:11,color:'#6b7280'}}>Labo Paris • 2020–présent</div>
                <div style={{fontSize:11,color:'#374151',marginTop:4}}>- Recherche avancée<br/>- Publication d'articles<br/>- Encadrement étudiants</div>
              </div>
              <div>
                <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',color:'#6366f1',marginBottom:4}}>Formation</div>
                <div style={{fontSize:12,fontWeight:600}}>PhD Physique</div>
                <div style={{fontSize:11,color:'#6b7280'}}>Sorbonne • 2018</div>
                <div style={{marginTop:8}}>
                  <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',color:'#6366f1',marginBottom:4}}>Compétences</div>
                  <div style={{display:'flex',flexWrap:'wrap',gap:4}}>
                    {['Python','MATLAB','Physique','Chimie','Labo','Recherche'].map(s=>(
                      <span key={s} style={{fontSize:10,padding:'2px 6px',background:'#e0e7ff',color:'#4338ca',borderRadius:4}}>{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div style={{marginTop:12,paddingTop:8,borderTop:'1px solid #e5e7eb',fontSize:11,color:'#6b7280',textAlign:'center'}}>
              ★★★★★ 10 ans d'expérience
            </div>
          </div>
        </div>
        <div className="ba-label ba-label-bad">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          CV classique (Canva)
        </div>
      </div>

      {/* Good CV (right — on top, clipped) */}
      <div className="ba-side ba-good" style={{clipPath: `inset(0 ${100 - pos}% 0 0)`}}>
        <div className="ba-cv ba-cv-good">
          <div style={{padding:'16px 20px'}}>
            <div style={{fontSize:20,fontWeight:700,letterSpacing:'-0.01em'}}>Marie Curie</div>
            <div style={{fontSize:13,color:'#52525b',marginBottom:12}}>Physicienne • Chercheuse spécialisée en radioactivité</div>
            <div style={{fontSize:11,color:'#71717a',marginBottom:16}}>marie@labo.fr • 06 12 34 56 78 • Paris</div>

            <div style={{marginBottom:14}}>
              <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.04em',color:'#059669',borderBottom:'1.5px solid #e4e4e7',paddingBottom:3,marginBottom:6}}>Expérience professionnelle</div>
              <div style={{fontSize:13,fontWeight:600}}>Chercheuse en physique</div>
              <div style={{fontSize:12,color:'#52525b'}}>Laboratoire national • Paris</div>
              <div style={{fontSize:11,color:'#71717a',marginBottom:4}}>2020 – présent</div>
              <ul style={{margin:0,paddingLeft:16,fontSize:12,color:'#3f3f46'}}>
                <li style={{marginBottom:2}}>Dirigé 3 projets de recherche financés à hauteur de 2,4 M€</li>
                <li style={{marginBottom:2}}>Publié 12 articles dans des revues à comité de lecture (Impact factor moyen : 8,2)</li>
                <li style={{marginBottom:2}}>Encadré 8 doctorants, dont 5 en cours de thèse</li>
              </ul>
            </div>

            <div>
              <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.04em',color:'#059669',borderBottom:'1.5px solid #e4e4e7',paddingBottom:3,marginBottom:6}}>Formation</div>
              <div style={{fontSize:13,fontWeight:600}}>Doctorat en physique nucléaire</div>
              <div style={{fontSize:12,color:'#52525b'}}>Université Pierre-et-Marie Curie (Sorbonne)</div>
              <div style={{fontSize:11,color:'#71717a'}}>2015 – 2020</div>
            </div>

            <div style={{marginTop:12}}>
              <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.04em',color:'#059669',borderBottom:'1.5px solid #e4e4e7',paddingBottom:3,marginBottom:6}}>Compétences</div>
              <div style={{display:'flex',flexWrap:'wrap',gap:4}}>
                {['Physique nucléaire','Python','Analyse de données','Gestion de projet','Rédaction scientifique','Encadrement'].map(s=>(
                  <span key={s} style={{fontSize:11,padding:'2px 8px',background:'#ecfdf5',color:'#059669',borderRadius:9999}}>{s}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="ba-label ba-label-good">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
          CVClair (ATS-safe)
        </div>
      </div>

      {/* Handle */}
      <div className="ba-handle" style={{left: `${pos}%`}}>
        <div className="ba-handle-line" />
        <div className="ba-handle-grip">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
      </div>
    </div>
  );
}
