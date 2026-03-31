/**
 * GagaNightCountdown.tsx
 * Badge "Born to Dance" avec compte à rebours animé
 * Soirée de clôture Miss & Mister Dour 2026 — 19 Avril 2026
 *
 * Palette : noir obsidian, cuivre #C87941, champagne #E8D5B7,
 *           or #D4AF37, rose accent #C45E6A
 *
 * Créé par JS-Innov.IA® — Tous droits réservés
 */
import { useEffect, useState } from "react";
import { BRANDING } from "@/config/branding";

// ── Date cible lue depuis la variable centrale BRANDING.closingNight ─────────
const EVENT_NIGHT = new Date(BRANDING.closingNight.dateISO);

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

function calcTimeLeft(): TimeLeft {
  const diff = EVENT_NIGHT.getTime() - Date.now();
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

// ── Icône SVG Danseuse élégante ──────────────────────────────────────────────
function DancerIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Tête */}
      <circle cx="32" cy="10" r="5" fill="url(#dancer-gold)" />
      {/* Corps - pose de danse arabesque */}
      <path
        d="M32 15 C32 15 30 22 30 26 C30 28 31 29 32 30 L28 42 C27 44 25 45 23 44 L16 40"
        stroke="url(#dancer-gold)"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
      {/* Jambe arrière étendue */}
      <path
        d="M28 42 C29 44 31 47 34 50 C36 52 39 53 42 52"
        stroke="url(#dancer-gold)"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
      {/* Jambe avant en pointe */}
      <path
        d="M28 42 C26 46 24 50 22 54 C21 56 21 57 22 58"
        stroke="url(#dancer-gold)"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
      {/* Bras droit levé gracieusement */}
      <path
        d="M32 20 C34 18 37 14 40 10 C42 8 44 7 46 8"
        stroke="url(#dancer-rose)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      {/* Bras gauche étendu */}
      <path
        d="M32 20 C30 19 27 17 24 16 C22 15 20 15 18 16"
        stroke="url(#dancer-rose)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      {/* Jupe/robe fluide */}
      <path
        d="M30 26 C28 30 24 36 20 40 C18 42 19 43 21 42 C24 40 27 37 30 34"
        stroke="url(#dancer-copper)"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="url(#dancer-dress)"
        opacity="0.6"
      />
      {/* Étoiles décoratives */}
      <circle cx="46" cy="8" r="1.2" fill="#D4AF37" opacity="0.8" />
      <circle cx="18" cy="16" r="1" fill="#C45E6A" opacity="0.7" />
      <circle cx="42" cy="52" r="1" fill="#D4AF37" opacity="0.6" />
      {/* Gradients */}
      <defs>
        <linearGradient id="dancer-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D4AF37" />
          <stop offset="50%" stopColor="#E8C547" />
          <stop offset="100%" stopColor="#C87941" />
        </linearGradient>
        <linearGradient id="dancer-rose" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C45E6A" />
          <stop offset="100%" stopColor="#D4AF37" />
        </linearGradient>
        <linearGradient id="dancer-copper" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C87941" />
          <stop offset="100%" stopColor="#E8D5B7" />
        </linearGradient>
        <linearGradient id="dancer-dress" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C45E6A" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#C87941" stopOpacity="0.1" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ── Notes de musique flottantes ──────────────────────────────────────────────
function FloatingNotes() {
  const notes = ["♪", "♫", "♬", "♩", "♪", "♫"];
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
      {notes.map((note, i) => (
        <div
          key={i}
          className="absolute text-sm"
          style={{
            left: `${10 + i * 15}%`,
            top: `${20 + (i % 3) * 25}%`,
            color: i % 2 === 0 ? "#D4AF37" : "#C45E6A",
            opacity: 0.15 + (i % 3) * 0.1,
            animation: `dance-note ${4 + (i % 3)}s ease-in-out ${i * 0.7}s infinite alternate`,
            fontSize: `${12 + (i % 3) * 4}px`,
          }}
        >
          {note}
        </div>
      ))}
    </div>
  );
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
      {/* ── Particules glitter ── */}
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
              animation: `dance-float ${3 + (i % 4)}s ease-in-out ${i * 0.4}s infinite alternate`,
            }}
          />
        ))}
      </div>

      {/* ── Notes de musique flottantes ── */}
      <FloatingNotes />

      {/* ── Ligne décorative haut ── */}
      <div
        className="absolute top-0 inset-x-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, #C87941, #D4AF37, #C87941, transparent)" }}
      />

      <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">

        {/* ── Badge Born to Dance avec icône danseuse ── */}
        <div className="flex justify-center mb-8">
          <div
            className="relative inline-flex items-center gap-4 px-8 py-4 rounded-full"
            style={{
              background: "linear-gradient(135deg, rgba(196,94,106,0.12), rgba(200,121,65,0.12), rgba(212,175,55,0.08))",
              border: "1px solid rgba(196,94,106,0.4)",
              boxShadow: "0 0 40px rgba(196,94,106,0.15), 0 0 80px rgba(200,121,65,0.08), inset 0 1px 0 rgba(232,213,183,0.1)",
            }}
          >
            {/* Halo pulsant */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: "linear-gradient(135deg, rgba(196,94,106,0.06), rgba(200,121,65,0.06))",
                animation: "dance-badge-pulse 3s ease-in-out infinite",
              }}
            />

            {/* Icône danseuse SVG animée */}
            <div className="relative z-10" style={{ animation: "dance-sway 4s ease-in-out infinite" }}>
              <DancerIcon className="w-12 h-12 sm:w-14 sm:h-14" />
            </div>

            {/* Texte du badge */}
            <div className="relative z-10 text-left">
              <div
                className="text-[10px] sm:text-xs font-bold tracking-[0.35em] uppercase"
                style={{ color: "#C45E6A" }}
              >
                {BRANDING.closingNight.theme}
              </div>
              <div
                className="text-xl sm:text-2xl font-bold tracking-wide"
                style={{
                  background: "linear-gradient(135deg, #E8D5B7, #D4AF37, #C87941)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontFamily: "'Playfair Display', serif",
                  textShadow: "none",
                  filter: "drop-shadow(0 0 12px rgba(212,175,55,0.3))",
                }}
              >
                {BRANDING.closingNight.label}
              </div>
            </div>

            {/* Icône danseuse miroir (côté droit) */}
            <div className="relative z-10" style={{ animation: "dance-sway-reverse 4s ease-in-out infinite", transform: "scaleX(-1)" }}>
              <DancerIcon className="w-10 h-10 sm:w-12 sm:h-12 opacity-60" />
            </div>
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
            💃 La soirée {BRANDING.closingNight.label} est en cours !
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

      {/* ── Keyframes CSS ── */}
      <style>{`
        @keyframes dance-float {
          from { transform: translateY(0px) scale(1); opacity: 0.3; }
          to   { transform: translateY(-12px) scale(1.3); opacity: 0.7; }
        }
        @keyframes dance-badge-pulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50%       { opacity: 1;   transform: scale(1.02); }
        }
        @keyframes dance-sway {
          0%, 100% { transform: rotate(-3deg) translateY(0); }
          25%      { transform: rotate(2deg) translateY(-2px); }
          50%      { transform: rotate(-1deg) translateY(1px); }
          75%      { transform: rotate(3deg) translateY(-1px); }
        }
        @keyframes dance-sway-reverse {
          0%, 100% { transform: scaleX(-1) rotate(3deg) translateY(0); }
          25%      { transform: scaleX(-1) rotate(-2deg) translateY(-2px); }
          50%      { transform: scaleX(-1) rotate(1deg) translateY(1px); }
          75%      { transform: scaleX(-1) rotate(-3deg) translateY(-1px); }
        }
        @keyframes dance-note {
          from { transform: translateY(0) rotate(0deg); opacity: 0.15; }
          to   { transform: translateY(-20px) rotate(15deg); opacity: 0.4; }
        }
      `}</style>
    </section>
  );
}
