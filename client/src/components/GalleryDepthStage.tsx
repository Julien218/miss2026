import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Grid3X3, Pause, Play, Rotate3D } from "lucide-react";

export type DepthGalleryPhoto = {
  id: number;
  url: string;
  thumbnail?: string | null;
  title?: string | null;
  candidateName?: string | null;
  category?: string | null;
  candidateCategory?: string | null;
};

type GalleryDepthStageProps = {
  photos: DepthGalleryPhoto[];
  categoryLabel: (category: string) => string;
  onOpen: (index: number) => void;
  onShowGrid: () => void;
};

const MAX_DEPTH_PHOTOS = 42;
const AUTO_DRIFT_ACCELERATION = 0.075;

function wrap(value: number, length: number) {
  return ((value % length) + length) % length;
}

export function GalleryDepthStage({
  photos,
  categoryLabel,
  onOpen,
  onShowGrid,
}: GalleryDepthStageProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const positionRef = useRef(0);
  const velocityRef = useRef(0);
  const pausedRef = useRef(false);
  const draggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0, position: 0 });
  const lastFocusRef = useRef(-1);
  const [paused, setPaused] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);

  const depthPhotos = useMemo(
    () => photos.slice(0, MAX_DEPTH_PHOTOS),
    [photos]
  );

  useEffect(() => {
    positionRef.current = 0;
    velocityRef.current = 0;
    lastFocusRef.current = -1;
    setFocusedIndex(0);
  }, [depthPhotos]);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || depthPhotos.length === 0) return;

    let frame = 0;
    let previousTime = performance.now();
    let visible = true;

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    observer.observe(stage);

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      velocityRef.current += Math.sign(event.deltaY) * Math.min(Math.abs(event.deltaY) / 260, 0.55);
    };

    stage.addEventListener("wheel", onWheel, { passive: false });

    const render = (time: number) => {
      const delta = Math.min((time - previousTime) / 1000, 0.05);
      previousTime = time;

      if (visible) {
        if (!pausedRef.current && !draggingRef.current) {
          velocityRef.current += delta * AUTO_DRIFT_ACCELERATION;
        }
        velocityRef.current *= Math.pow(0.9, delta * 60);
        positionRef.current += velocityRef.current * delta * 5.2;

        const count = depthPhotos.length;
        const focus = wrap(Math.round(positionRef.current), count);
        if (focus !== lastFocusRef.current) {
          lastFocusRef.current = focus;
          setFocusedIndex(focus);
        }

        const width = stage.clientWidth;
        const radius = Math.min(Math.max(width * 0.35, 290), 570);
        const verticalGap = width < 900 ? 88 : 116;

        for (let index = 0; index < count; index += 1) {
          const card = cardRefs.current[index];
          if (!card) continue;

          let offset = index - positionRef.current;
          if (offset > count / 2) offset -= count;
          if (offset < -count / 2) offset += count;

          const angle = offset * 0.58;
          const x = Math.sin(angle) * radius;
          const z = Math.cos(angle) * radius - radius;
          const y = offset * verticalGap;
          const proximity = Math.max(0, 1 - Math.abs(offset) / 7);
          const scale = 0.66 + proximity * 0.34;
          const opacity = Math.max(0.08, Math.min(1, proximity * 1.28));
          const tilt = Math.max(-48, Math.min(48, -angle * 22));

          card.style.transform = `translate3d(${x}px, ${y}px, ${z}px) rotateY(${tilt}deg) scale(${scale})`;
          card.style.opacity = String(opacity);
          card.style.zIndex = String(Math.round((z + radius) * 10));
          card.tabIndex = Math.abs(offset) < 4 ? 0 : -1;
          card.dataset.focused = Math.abs(offset) < 0.5 ? "true" : "false";
        }
      }

      frame = requestAnimationFrame(render);
    };

    frame = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      stage.removeEventListener("wheel", onWheel);
    };
  }, [depthPhotos]);

  const move = useCallback(
    (direction: number) => {
      if (!depthPhotos.length) return;
      positionRef.current += direction;
      velocityRef.current = direction * 0.08;
    },
    [depthPhotos.length]
  );

  const focused = depthPhotos[focusedIndex];

  return (
    <section
      ref={stageRef}
      className="mmd-depth-gallery"
      aria-label="Galerie immersive Miss & Mister Dour"
      onPointerDown={(event) => {
        draggingRef.current = true;
        dragStartRef.current = { x: event.clientX, y: event.clientY, position: positionRef.current };
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        if (!draggingRef.current) return;
        const isMobile = event.currentTarget.clientWidth <= 820;
        const delta = isMobile
          ? event.clientX - dragStartRef.current.x
          : event.clientY - dragStartRef.current.y;
        positionRef.current = dragStartRef.current.position - delta / (isMobile ? 82 : 105);
      }}
      onPointerUp={(event) => {
        draggingRef.current = false;
        event.currentTarget.releasePointerCapture(event.pointerId);
      }}
      onPointerCancel={() => {
        draggingRef.current = false;
      }}
    >
      <div className="mmd-depth-gallery-glow" aria-hidden="true" />
      <div className="mmd-depth-gallery-grid" aria-hidden="true" />

      <div className="mmd-depth-gallery-head">
        <div>
          <span>EXPÉRIENCE IMMERSIVE</span>
          <strong>{depthPhotos.length} images dans la sélection</strong>
        </div>
        <button type="button" onClick={onShowGrid}>
          <Grid3X3 /> Vue mosaïque
        </button>
      </div>

      <div className="mmd-depth-gallery-scene">
        {depthPhotos.map((photo, index) => (
          <button
            ref={(element) => {
              cardRefs.current[index] = element;
            }}
            key={photo.id}
            type="button"
            className="mmd-depth-gallery-card"
            aria-label={`Ouvrir ${photo.candidateName || photo.title || "la photo"}`}
            onClick={(event) => {
              const moved = Math.hypot(
                event.clientX - dragStartRef.current.x,
                event.clientY - dragStartRef.current.y
              );
              if (moved > 8) return;
              onOpen(index);
            }}
          >
            <img
              src={photo.thumbnail || photo.url}
              alt={photo.candidateName || photo.title || "Miss & Mister Dour"}
              loading={index < 8 ? "eager" : "lazy"}
              draggable={false}
            />
            <span>{photo.candidateName || photo.title || "Miss & Mister Dour"}</span>
          </button>
        ))}
      </div>

      <div className="mmd-depth-gallery-focus" aria-live="polite">
        <span>{categoryLabel(focused?.category || "other")}</span>
        <strong>{focused?.candidateName || focused?.title || "Miss & Mister Dour"}</strong>
        <small>Faites défiler ou glissez pour parcourir la galerie</small>
      </div>

      <div className="mmd-depth-gallery-controls">
        <button type="button" onClick={() => move(-1)} aria-label="Photo précédente">
          <ChevronLeft />
        </button>
        <button
          type="button"
          className="mmd-depth-gallery-pause"
          onClick={() => setPaused((value) => !value)}
          aria-label={paused ? "Reprendre le mouvement" : "Mettre le mouvement en pause"}
        >
          {paused ? <Play /> : <Pause />}
          <span>{paused ? "Reprendre" : "Pause"}</span>
        </button>
        <button type="button" onClick={() => move(1)} aria-label="Photo suivante">
          <ChevronRight />
        </button>
      </div>

      <div className="mmd-depth-gallery-orbit" aria-hidden="true">
        <Rotate3D />
      </div>
    </section>
  );
}
