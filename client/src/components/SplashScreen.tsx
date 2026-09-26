/**
 * SplashScreen — Intro vidéo officielle Miss & Mister Dour 2027
 * Affichée une fois par session via App.tsx.
 */
import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, X } from "lucide-react";

const INTRO_VIDEO = "/media/intro-site-miss-mister-dour-2027.mp4";

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [muted, setMuted] = useState(true);
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    const controlsTimer = window.setTimeout(() => setShowControls(true), 900);
    const safetyTimer = window.setTimeout(() => onComplete(), 15000);

    return () => {
      window.clearTimeout(controlsTimer);
      window.clearTimeout(safetyTimer);
    };
  }, [onComplete]);

  const toggleSound = async () => {
    const video = videoRef.current;
    if (!video) return;

    const nextMuted = !muted;
    video.muted = nextMuted;
    setMuted(nextMuted);

    if (!nextMuted) {
      try {
        await video.play();
      } catch {
        video.muted = true;
        setMuted(true);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden bg-black">
      <video
        ref={videoRef}
        src={INTRO_VIDEO}
        className="h-full w-full object-cover"
        autoPlay
        muted={muted}
        playsInline
        preload="auto"
        onEnded={onComplete}
        onError={onComplete}
        aria-label="Intro officielle Miss et Mister Dour 2027"
      />

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,.12) 0%, transparent 32%, transparent 70%, rgba(0,0,0,.36) 100%)",
        }}
      />

      {showControls && (
        <div className="absolute right-4 top-4 flex items-center gap-2 md:right-7 md:top-7">
          <button
            type="button"
            onClick={toggleSound}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-black/45 text-white/90 backdrop-blur-xl transition hover:border-[#DCB464]/70 hover:text-[#F5E6C8]"
            aria-label={muted ? "Activer le son" : "Couper le son"}
            title={muted ? "Activer le son" : "Couper le son"}
          >
            {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>

          <button
            type="button"
            onClick={onComplete}
            className="flex h-11 items-center gap-2 rounded-full border border-white/25 bg-black/45 px-4 font-grotesk text-xs uppercase tracking-[0.16em] text-white/90 backdrop-blur-xl transition hover:border-[#DCB464]/70 hover:text-[#F5E6C8]"
            aria-label="Passer l'introduction"
          >
            <span className="hidden sm:inline">Passer</span>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap font-grotesk text-[9px] uppercase tracking-[0.28em] text-white/45 md:bottom-7 md:text-[10px]">
        Miss &amp; Mister Dour 2027 · JS-Innov.IA
      </div>
    </div>
  );
}
