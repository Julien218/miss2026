/**
 * GagaNightCountdown.tsx
 * Badge "Lady Gaga Night" avec compte à rebours animé
 * Soirée de clôture Miss & Mister Dour 2026 — 19 Avril 2026
 *
 * Palette : noir obsidian, cuivre #C87941, champagne #E8D5B7,
 *           or #D4AF37, rose Gaga #C45E6A
 */
import { useEffect, useState } from "react";
import { BRANDING } from "@/config/branding";

// ── Date cible lue depuis la variable centrale BRANDING.closingNight ─────────
const GAGA_NIGHT = new Date(BRANDING.closingNight.dateISO);

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

function calcTimeLeft(): TimeLeft {
  const diff = GAGA_NIGHT.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  return {
    total: diff,
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

// ── Unité du compte à rebours ─────────────────────────────────────────────────
function CountUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center font-bold text-2xl sm:text-3xl tabular-nums"
        style={{
          background: "linear-gradient(145deg, #1a0f08, #2a1a0a)",
          border: "1px solid #C87941",
          color: "#E8D5B7",
          boxShadow: "0 4px 20px #C8794130, inset 0 1px 0 #C8794140",
          fontFamily: "'Playfair Display', serif",
        }}
      >
        {pad(value)}
        {/* Reflet */}
        <div
          className="absolute inset-x-0 top-0 h-1/2 rounded-t-2xl pointer-events-none"
          style={{ background: "linear-gradient(180deg, #C8794115, transparent)" }}
        />
      </div>
      <span
        className="text-xs font-semibold tracking-widest uppercase"
        style={{ color: "#C87941", letterSpacing: "0.15em" }}
      >
        {label}
      </span>
    </div>
  );
}

// ── Composant principal ───────────────────────────────────────────────────────
export function GagaNightCountdown() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calcTimeLeft);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const tick = setInterval(() => {
      setTimeLeft(calcTimeLeft());
      setPulse(p => !p);
    }, 1000);
    return () => clearInterval(tick);
  }, []);

  const isOver = timeLeft.total === 0;

  return (
    <section
      className="relative w-full overflow-hidden py-12 sm:py-16"
      style={{ background: "linear-gradient(135deg, #0A0A0F 0%, #1a0f08 50%, #0A0A0F 100%)" }}
    >
      {/* ── Particules glitter (CSS pur) ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${2 + (i % 3)}px`,
              height: `${2 + (i % 3)}px`,
              background: i % 3 === 0 ? "#C87941" : i % 3 === 1 ? "#D4AF37" : "#C45E6A",
              left: `${(i * 5.3) % 100}%`,
              top: `${(i * 7.1) % 100}%`,
              opacity: 0.3 + (i % 4) * 0.15,
              animation: `gaga-float ${3 + (i % 4)}s ease-in-out ${i * 0.4}s infinite alternate`,
            }}
          />
        ))}
      </div>

      {/* ── Ligne décorative haut ── */}
      <div
        className="absolute top-0 inset-x-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, #C87941, #D4AF37, #C87941, transparent)" }}
      />

      <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">

        {/* ── Badge Lady Gaga Night ── */}
        <div className="flex justify-center mb-8">
          <div
            className="relative inline-flex items-center gap-3 px-6 py-3 rounded-full"
            style={{
              background: "linear-gradient(135deg, #C45E6A20, #C8794120)",
              border: "1px solid #C45E6A60",
              boxShadow: "0 0 30px #C45E6A25, 0 0 60px #C8794115",
            }}
          >
            {/* Halo pulsant */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: "linear-gradient(135deg, #C45E6A10, #C8794110)",
                animation: "gaga-pulse 2s ease-in-out infinite",
              }}
            />

            {/* Icône microphone stylisé */}
            <span className="text-2xl relative z-10" role="img" aria-label="microphone">🎤</span>

            <div className="relative z-10 text-left">
              <div
                className="text-xs font-bold tracking-[0.3em] uppercase"
                style={{ color: "#C45E6A" }}
              >
                {BRANDING.closingNight.theme}
              </div>
              <div
                className="text-lg sm:text-xl font-bold tracking-wide"
                style={{
                  color: "#E8D5B7",
                  fontFamily: "'Playfair Display', serif",
                  textShadow: "0 0 20px #C45E6A60",
                }}
              >
                {BRANDING.closingNight.label}
              </div>
            </div>

            {/* Étoile décorative */}
            <span className="text-xl relative z-10" role="img" aria-label="étoile">✨</span>
          </div>
        </div>

        {/* ── Titre et date ── */}
        <p
          className="text-sm font-semibold tracking-[0.25em] uppercase mb-2"
          style={{ color: "#C87941" }}
        >
          Miss &amp; Mister Dour 2026
        </p>
        <h2
          className="text-2xl sm:text-3xl font-bold mb-1"
          style={{
            color: "#E8D5B7",
            fontFamily: "'Playfair Display', serif",
          }}
        >
          {isOver ? "La soirée a commencé !" : "La grande finale approche"}
        </h2>
        <p className="text-sm mb-8" style={{ color: "#C8794180" }}>
          {BRANDING.closingNight.dateDisplay} · {BRANDING.closingNight.timeDisplay} · {BRANDING.closingNight.venue}, {BRANDING.closingNight.location}
        </p>

        {/* ── Compte à rebours ── */}
        {isOver ? (
          <div
            className="text-3xl font-bold py-6"
            style={{ color: "#D4AF37", fontFamily: "'Playfair Display', serif" }}
          >
            🎉 La soirée {BRANDING.closingNight.label} est en cours !
          </div>
        ) : (
          <div className="flex items-center justify-center gap-3 sm:gap-6">
            <CountUnit value={timeLeft.days} label="Jours" />

            {/* Séparateur animé */}
            <span
              className="text-3xl sm:text-4xl font-bold mb-5 transition-opacity duration-500"
              style={{ color: "#C87941", opacity: pulse ? 1 : 0.3 }}
            >
              :
            </span>

            <CountUnit value={timeLeft.hours} label="Heures" />

            <span
              className="text-3xl sm:text-4xl font-bold mb-5 transition-opacity duration-500"
              style={{ color: "#C87941", opacity: pulse ? 1 : 0.3 }}
            >
              :
            </span>

            <CountUnit value={timeLeft.minutes} label="Minutes" />

            <span
              className="text-3xl sm:text-4xl font-bold mb-5 transition-opacity duration-500"
              style={{ color: "#C87941", opacity: pulse ? 1 : 0.3 }}
            >
              :
            </span>

            <CountUnit value={timeLeft.seconds} label="Secondes" />
          </div>
        )}

        {/* ── CTA ── */}
        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          <a
            href="/inscription-candidat"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #C87941, #D4956A)",
              color: "#0A0A0F",
              boxShadow: "0 4px 20px #C8794140",
            }}
          >
            ✨ Rejoindre l'aventure
          </a>
          <a
            href="/candidates"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-105"
            style={{
              background: "transparent",
              border: "1px solid #C87941",
              color: "#E8D5B7",
            }}
          >
            👑 Voir les candidats
          </a>
        </div>
      </div>

      {/* ── Ligne décorative bas ── */}
      <div
        className="absolute bottom-0 inset-x-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, #C87941, #D4AF37, #C87941, transparent)" }}
      />

      {/* ── Keyframes CSS injectés ── */}
      <style>{`
        @keyframes gaga-float {
          from { transform: translateY(0px) scale(1); opacity: 0.3; }
          to   { transform: translateY(-12px) scale(1.3); opacity: 0.7; }
        }
        @keyframes gaga-pulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50%       { opacity: 1;   transform: scale(1.03); }
        }
      `}</style>
    </section>
  );
}
