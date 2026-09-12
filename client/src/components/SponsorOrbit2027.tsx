import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Info, Pause, Play, X } from "lucide-react";
import { BRANDING } from "@/config/branding";
import { SPONSORS_2026, SponsorVisual2026 } from "@/components/SponsorVisual2026";

export function SponsorOrbit2027() {
  const cardsRef = useRef<Array<HTMLSpanElement | null>>([]);
  const dragRef = useRef({ active: false, x: 0, angle: 0 });
  const angleRef = useRef(0);
  const dropRef = useRef(0);
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
        dropRef.current += delta * 0.018;
        velocityRef.current += (0.018 - velocityRef.current) * 0.025;
      }

      const mobile = window.innerWidth <= 760;
      const radius = mobile ? 350 : 470;
      const rowGap = mobile ? 146 : 178;
      const ySpan = rowGap * 4;
      const halfY = ySpan / 2;
      const cameraZ = mobile ? 850 : 1100;
      const frontLimit = mobile ? 115 : 170;
      const fadeStart = frontLimit - 95;

      cardsRef.current.forEach((card, index) => {
        if (!card) return;
        const column = index % 12;
        const row = Math.floor(index / 12);
        const degrees = column * 30 + row * 7.5 + angleRef.current;
        const radians = degrees * Math.PI / 180;
        const x = Math.sin(radians) * radius;
        const z = Math.cos(radians) * radius;
        let y = (row - 1.5) * rowGap - (dropRef.current % ySpan);
        while (y < -halfY) y += ySpan;
        while (y > halfY) y -= ySpan;

        const facing = Math.atan2(-x, cameraZ - z) * 180 / Math.PI;
        const opacity = z >= frontLimit ? 0 : z > fadeStart ? (frontLimit - z) / 95 : 1;
        card.style.transform = `translate3d(${x}px, ${y}px, ${z}px) rotateY(${facing}deg)`;
        card.style.opacity = `${Math.max(0, Math.min(1, opacity))}`;
        card.style.visibility = opacity <= 0 ? "hidden" : "visible";
      });
      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [paused]);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => {
      setFocusedIndex((current) => current === null ? 0 : (current + 1) % SPONSORS_2026.length);
    }, 2800);
    return () => window.clearInterval(timer);
  }, [paused]);

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
          <div className="mmd-sponsor-orbit-ring">
            {SPONSORS_2026.map((sponsor, index) => (
              <span
                className="mmd-sponsor-orbit-card"
                ref={(element) => { cardsRef.current[index] = element; }}
                key={sponsor.index}
              >
                <SponsorVisual2026 index={sponsor.index} label={sponsor.name} />
              </span>
            ))}
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
              <SponsorVisual2026 key={focusedSponsor.index} index={focusedSponsor.index} label={focusedSponsor.name} />
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
