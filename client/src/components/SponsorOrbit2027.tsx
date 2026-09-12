import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { Info, Pause, Play, X } from "lucide-react";
import { BRANDING } from "@/config/branding";
import { SPONSORS_2026, SponsorVisual2026 } from "@/components/SponsorVisual2026";

type OrbitStyle = CSSProperties & {
  "--orbit-angle": string;
  "--orbit-y": string;
};

export function SponsorOrbit2027() {
  const orbitRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ active: false, x: 0, angle: 0 });
  const angleRef = useRef(0);
  const velocityRef = useRef(0.018);
  const [paused, setPaused] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  useEffect(() => {
    let frame = 0;
    let previous = performance.now();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const animate = (now: number) => {
      const delta = Math.min(now - previous, 50);
      previous = now;

      if (!paused && !dragRef.current.active && !reduceMotion) {
        angleRef.current += velocityRef.current * delta;
        velocityRef.current += (0.018 - velocityRef.current) * 0.025;
      }

      if (orbitRef.current) {
        orbitRef.current.style.transform = `rotateY(${angleRef.current}deg)`;
      }
      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [paused]);

  useEffect(() => {
    if (focusedIndex !== null || paused) return;
    const timer = window.setInterval(() => {
      setFocusedIndex((current) => current === null ? 0 : (current + 1) % SPONSORS_2026.length);
    }, 2800);
    return () => window.clearInterval(timer);
  }, [focusedIndex, paused]);

  const startDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    dragRef.current = { active: true, x: event.clientX, angle: angleRef.current };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const moveDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return;
    const delta = event.clientX - dragRef.current.x;
    angleRef.current = dragRef.current.angle + delta * 0.22;
    velocityRef.current = delta * 0.0008;
  };

  const endDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    dragRef.current.active = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const focusedSponsor = focusedIndex === null ? null : SPONSORS_2026[focusedIndex];

  return (
    <section className="mmd-sponsor-orbit" aria-labelledby="sponsor-orbit-title">
      <div className="mmd-sponsor-orbit-copy">
        <span>PARTENAIRES · ÉDITION 2027</span>
        <h1 id="sponsor-orbit-title">Ceux qui font vivre <em>l'aventure.</em></h1>
      </div>

      <div className="mmd-sponsor-orbit-actions">
        <button type="button" onClick={() => setPaused((value) => !value)} aria-label={paused ? "Reprendre la rotation" : "Mettre la rotation en pause"}>
          {paused ? <Play /> : <Pause />}
        </button>
        <button type="button" onClick={() => setInfoOpen(true)} aria-label="Informations sur les partenaires">
          <Info />
        </button>
      </div>

      <div
        className="mmd-sponsor-orbit-viewport"
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <div className="mmd-sponsor-orbit-scene" aria-hidden="true">
          <div className="mmd-sponsor-orbit-ring" ref={orbitRef}>
            {SPONSORS_2026.map((sponsor, index) => {
              const column = index % 12;
              const row = Math.floor(index / 12);
              const style: OrbitStyle = {
                "--orbit-angle": `${column * 30 + row * 7.5}deg`,
                "--orbit-y": `${(row - 1.5) * 178}px`,
              };
              return (
                <span className="mmd-sponsor-orbit-card" style={style} key={sponsor.index}>
                  <SponsorVisual2026 index={sponsor.index} label={sponsor.name} />
                </span>
              );
            })}
          </div>
        </div>

        <button
          className="mmd-sponsor-orbit-hero"
          type="button"
          onClick={() => setFocusedIndex((current) => current === null ? 0 : (current + 1) % SPONSORS_2026.length)}
          aria-label={focusedSponsor ? `${focusedSponsor.name}. Afficher le partenaire suivant.` : "Découvrir les partenaires"}
        >
          <span className="mmd-sponsor-orbit-hero-inner">
            {focusedSponsor ? (
              <SponsorVisual2026 index={focusedSponsor.index} label={focusedSponsor.name} />
            ) : (
              <img src={BRANDING.logoIdentity} alt="" />
            )}
          </span>
          <small>{focusedSponsor?.name ?? "Miss & Mister Dour 2027"}</small>
        </button>
      </div>

      <div className="mmd-sponsor-orbit-hint" aria-hidden="true">
        <i /> Glissez pour explorer <i />
      </div>

      <ul className="sr-only" aria-label="Partenaires de l'édition 2026">
        {SPONSORS_2026.map((sponsor) => <li key={sponsor.index}>{sponsor.name}</li>)}
      </ul>

      {infoOpen && (
        <div className="mmd-sponsor-orbit-panel" role="dialog" aria-modal="true" aria-labelledby="sponsor-info-title">
          <div>
            <button type="button" onClick={() => setInfoOpen(false)} aria-label="Fermer"><X /></button>
            <span>MISS & MISTER DOUR</span>
            <h2 id="sponsor-info-title">Ceux qui font vivre l'aventure</h2>
            <p>Cette galerie immersive rassemble les partenaires de l'édition 2026. Les partenaires officiels 2027 seront identifiés séparément.</p>
          </div>
        </div>
      )}
    </section>
  );
}
