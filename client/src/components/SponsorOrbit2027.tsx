import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Info, Pause, Play, X } from "lucide-react";
import { SPONSORS_2026, SponsorVisual2026 } from "@/components/SponsorVisual2026";

export function SponsorOrbit2027() {
  const cardsRef = useRef<Array<HTMLSpanElement | null>>([]);
  const dragRef = useRef({ active: false, x: 0, angle: 0 });
  const angleRef = useRef(0);
  const dropRef = useRef(0);
  const velocityRef = useRef(0.018);
  const swapTimerRef = useRef<number | null>(null);
  const finishTimerRef = useRef<number | null>(null);

  const [paused, setPaused] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  // JV Sport ouvre la galerie, comme dans la direction visuelle validée.
  const [focusedIndex, setFocusedIndex] = useState(1);
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    let frame = 0;
    let previous = performance.now();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const animate = (now: number) => {
      const delta = Math.min(now - previous, 50);
      previous = now;

      if (!paused && !dragRef.current.active && !reduceMotion) {
        angleRef.current += velocityRef.current * delta;
        dropRef.current += delta * 0.012;
        velocityRef.current += (0.014 - velocityRef.current) * 0.025;
      }

      const mobile = window.innerWidth <= 760;
      const radius = mobile ? 350 : 530;
      const rowGap = mobile ? 154 : 184;
      const ySpan = rowGap * 4;
      const halfY = ySpan / 2;
      const cameraZ = mobile ? 850 : 1120;
      // On masque davantage de cartes à l'avant pour retrouver une galerie plus
      // aérée, proche de la maquette validée, sans retirer aucun partenaire.
      const frontLimit = mobile ? 60 : 70;
      const fadeStart = frontLimit - 105;

      cardsRef.current.forEach((card, index) => {
        if (!card) return;
        const column = index % 12;
        const row = Math.floor(index / 12);
        const degrees = column * 30 + (row % 2) * 15 + angleRef.current;
        const radians = degrees * Math.PI / 180;
        const x = Math.sin(radians) * radius;
        const z = Math.cos(radians) * radius;
        let y = (row - 1.5) * rowGap - (dropRef.current % ySpan);
        while (y < -halfY) y += ySpan;
        while (y > halfY) y -= ySpan;

        const facing = Math.atan2(-x, cameraZ - z) * 180 / Math.PI;
        const opacity = z >= frontLimit ? 0 : z > fadeStart ? (frontLimit - z) / 105 : 1;
        card.style.transform = `translate3d(${x}px, ${y}px, ${z}px) rotateY(${facing}deg)`;
        card.style.opacity = `${Math.max(0, Math.min(1, opacity))}`;
        card.style.visibility = opacity <= 0 ? "hidden" : "visible";
      });

      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [paused]);

  const requestNextSponsor = useCallback(() => {
    if (isFlipping) return;
    const next = (focusedIndex + 1) % SPONSORS_2026.length;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      setFocusedIndex(next);
      return;
    }

    setIsFlipping(true);
    if (swapTimerRef.current) window.clearTimeout(swapTimerRef.current);
    if (finishTimerRef.current) window.clearTimeout(finishTimerRef.current);

    swapTimerRef.current = window.setTimeout(() => {
      setFocusedIndex(next);
    }, 410);

    finishTimerRef.current = window.setTimeout(() => {
      setIsFlipping(false);
    }, 840);
  }, [focusedIndex, isFlipping]);

  useEffect(() => {
    if (paused || isFlipping) return;
    const timer = window.setInterval(requestNextSponsor, 4200);
    return () => window.clearInterval(timer);
  }, [paused, isFlipping, requestNextSponsor]);

  useEffect(() => () => {
    if (swapTimerRef.current) window.clearTimeout(swapTimerRef.current);
    if (finishTimerRef.current) window.clearTimeout(finishTimerRef.current);
  }, []);

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

  const focusedSponsor = SPONSORS_2026[focusedIndex];

  return (
    <section className="mmd-sponsor-orbit mmd-sponsor-orbit-premium" aria-labelledby="sponsor-orbit-title">
      <div className="mmd-sponsor-orbit-copy">
        <h1 id="sponsor-orbit-title">NOS PARTENAIRES</h1>
        <span>ÉDITIONS 2025–2026 · ENSEMBLE PLUS LOIN</span>
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
                <span className="mmd-sponsor-orbit-card-media">
                  <SponsorVisual2026 index={sponsor.index} label={sponsor.name} />
                </span>
              </span>
            ))}
          </div>
        </div>

        <button
          className={`mmd-sponsor-orbit-hero${isFlipping ? " is-flipping" : ""}`}
          type="button"
          onClick={requestNextSponsor}
          aria-label={`${focusedSponsor.name}. Afficher le partenaire suivant.`}
        >
          <span className="mmd-sponsor-orbit-hero-flipper">
            <span className="mmd-sponsor-orbit-hero-face">
              <span className="mmd-sponsor-orbit-hero-inner">
                <SponsorVisual2026 key={focusedSponsor.index} index={focusedSponsor.index} label={focusedSponsor.name} />
              </span>
              <small>{focusedSponsor.name}</small>
            </span>
          </span>
        </button>
      </div>

      <div className="mmd-sponsor-orbit-hint" aria-hidden="true">
        <i /> GLISSEZ POUR EXPLORER <i />
      </div>

      <ul className="sr-only" aria-label="Partenaires de l'édition 2026">
        {SPONSORS_2026.map((sponsor) => <li key={sponsor.index}>{sponsor.name}</li>)}
      </ul>

      {infoOpen && (
        <div className="mmd-sponsor-orbit-panel" role="dialog" aria-modal="true" aria-labelledby="sponsor-info-title">
          <div>
            <button type="button" onClick={() => setInfoOpen(false)} aria-label="Fermer"><X /></button>
            <span>ÉDITIONS 2025–2026</span>
            <h2 id="sponsor-info-title">Nos partenaires</h2>
            <p>Cette galerie immersive présente les partenaires des éditions 2025–2026 de Miss & Mister Dour. Les visuels sont affichés depuis leurs créations officielles, sans redessin automatique des logos.</p>
            <p>Les partenaires de l’édition 2027 seront dévoilés prochainement.</p>
          </div>
        </div>
      )}
    </section>
  );
}
