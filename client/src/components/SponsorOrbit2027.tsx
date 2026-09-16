import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { Info, Pause, Play, X } from "lucide-react";
import { SPONSORS_2026, SponsorVisual2026 } from "@/components/SponsorVisual2026";

type HeroPhase = "idle" | "preparing" | "flipping";
type HeroMetrics = { width: number; mediaHeight: number };

type HeroStyle = CSSProperties & {
  "--mmd-hero-width": string;
  "--mmd-hero-media-height": string;
};

const DEFAULT_HERO_METRICS: HeroMetrics = { width: 224, mediaHeight: 190 };

function measureSponsorCanvas(container: HTMLSpanElement | null): HeroMetrics {
  const canvas = container?.querySelector("canvas");
  if (!canvas || !canvas.width || !canvas.height) return DEFAULT_HERO_METRICS;

  try {
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) return DEFAULT_HERO_METRICS;
    const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
    let left = canvas.width;
    let right = -1;
    let top = canvas.height;
    let bottom = -1;

    for (let y = 0; y < canvas.height; y += 2) {
      for (let x = 0; x < canvas.width; x += 2) {
        const alpha = data[(y * canvas.width + x) * 4 + 3];
        if (alpha < 18) continue;
        left = Math.min(left, x);
        right = Math.max(right, x);
        top = Math.min(top, y);
        bottom = Math.max(bottom, y);
      }
    }

    if (right <= left || bottom <= top) return DEFAULT_HERO_METRICS;

    const contentWidth = right - left + 1;
    const contentHeight = bottom - top + 1;
    const aspect = contentWidth / contentHeight;

    if (aspect >= 1.75) return { width: 286, mediaHeight: 174 };
    if (aspect >= 1.25) return { width: 258, mediaHeight: 188 };
    if (aspect <= 0.72) return { width: 190, mediaHeight: 268 };
    if (aspect <= 0.95) return { width: 208, mediaHeight: 244 };
    return { width: 228, mediaHeight: 216 };
  } catch {
    return DEFAULT_HERO_METRICS;
  }
}

export function SponsorOrbit2027() {
  const cardsRef = useRef<Array<HTMLSpanElement | null>>([]);
  const dragRef = useRef({ active: false, x: 0, angle: 0 });
  const angleRef = useRef(0);
  const dropRef = useRef(0);
  const velocityRef = useRef(0.018);
  const backMediaRef = useRef<HTMLSpanElement | null>(null);
  const frontMediaRef = useRef<HTMLSpanElement | null>(null);
  const flipTimerRef = useRef<number | null>(null);
  const prepareRafRef = useRef<number | null>(null);
  const [paused, setPaused] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [incomingIndex, setIncomingIndex] = useState(1);
  const [heroPhase, setHeroPhase] = useState<HeroPhase>("idle");
  const [heroMetrics, setHeroMetrics] = useState<HeroMetrics>(DEFAULT_HERO_METRICS);

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
      const radius = mobile ? 360 : 500;
      const rowGap = mobile ? 164 : 198;
      const ySpan = rowGap * 4;
      const halfY = ySpan / 2;
      const cameraZ = mobile ? 850 : 1100;
      const frontLimit = mobile ? 115 : 170;
      const fadeStart = frontLimit - 95;

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
    const first = window.requestAnimationFrame(() => {
      const second = window.requestAnimationFrame(() => {
        setHeroMetrics(measureSponsorCanvas(frontMediaRef.current));
      });
      prepareRafRef.current = second;
    });
    prepareRafRef.current = first;
    return () => {
      if (prepareRafRef.current) window.cancelAnimationFrame(prepareRafRef.current);
    };
  }, []);

  const requestNextSponsor = useCallback(() => {
    if (heroPhase !== "idle") return;
    const next = (focusedIndex + 1) % SPONSORS_2026.length;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      setFocusedIndex(next);
      setIncomingIndex((next + 1) % SPONSORS_2026.length);
      window.requestAnimationFrame(() => {
        setHeroMetrics(measureSponsorCanvas(frontMediaRef.current));
      });
      return;
    }

    setIncomingIndex(next);
    setHeroPhase("preparing");
  }, [focusedIndex, heroPhase]);

  useEffect(() => {
    if (heroPhase !== "preparing") return;

    const first = window.requestAnimationFrame(() => {
      const second = window.requestAnimationFrame(() => {
        setHeroMetrics(measureSponsorCanvas(backMediaRef.current));
        setHeroPhase("flipping");

        if (flipTimerRef.current) window.clearTimeout(flipTimerRef.current);
        flipTimerRef.current = window.setTimeout(() => {
          setFocusedIndex(incomingIndex);
          setHeroPhase("idle");
        }, 760);
      });
      prepareRafRef.current = second;
    });
    prepareRafRef.current = first;

    return () => {
      if (prepareRafRef.current) window.cancelAnimationFrame(prepareRafRef.current);
    };
  }, [heroPhase, incomingIndex]);

  useEffect(() => {
    if (heroPhase !== "idle") return;
    setIncomingIndex((focusedIndex + 1) % SPONSORS_2026.length);
  }, [focusedIndex, heroPhase]);

  useEffect(() => {
    if (paused || heroPhase !== "idle") return;
    const timer = window.setInterval(requestNextSponsor, 2800);
    return () => window.clearInterval(timer);
  }, [paused, heroPhase, requestNextSponsor]);

  useEffect(() => () => {
    if (flipTimerRef.current) window.clearTimeout(flipTimerRef.current);
    if (prepareRafRef.current) window.cancelAnimationFrame(prepareRafRef.current);
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
  const incomingSponsor = SPONSORS_2026[incomingIndex];
  const heroStyle: HeroStyle = {
    "--mmd-hero-width": `${heroMetrics.width}px`,
    "--mmd-hero-media-height": `${heroMetrics.mediaHeight}px`,
  };

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
                <span className="mmd-sponsor-orbit-card-media">
                  <SponsorVisual2026 index={sponsor.index} label={sponsor.name} />
                </span>
              </span>
            ))}
          </div>
        </div>

        <button
          className={`mmd-sponsor-orbit-hero ${heroPhase === "flipping" ? "is-flipping" : ""}`}
          style={heroStyle}
          type="button"
          onClick={requestNextSponsor}
          aria-label={`${focusedSponsor.name}. Afficher le partenaire suivant.`}
        >
          <span className="mmd-sponsor-orbit-hero-flipper">
            <span className="mmd-sponsor-orbit-hero-face mmd-sponsor-orbit-hero-face--front">
              <span className="mmd-sponsor-orbit-hero-inner" ref={frontMediaRef}>
                <SponsorVisual2026 key={`front-${focusedSponsor.index}`} index={focusedSponsor.index} label={focusedSponsor.name} />
              </span>
              <small>{focusedSponsor.name}</small>
            </span>

            <span className="mmd-sponsor-orbit-hero-face mmd-sponsor-orbit-hero-face--back" aria-hidden={heroPhase === "idle"}>
              <span className="mmd-sponsor-orbit-hero-inner" ref={backMediaRef}>
                <SponsorVisual2026 key={`back-${incomingSponsor.index}`} index={incomingSponsor.index} label={incomingSponsor.name} />
              </span>
              <small>{incomingSponsor.name}</small>
            </span>
          </span>
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
