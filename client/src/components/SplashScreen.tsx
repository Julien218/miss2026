/**
 * SplashScreen - Animation d'intro Miss & Mister Dour 2026
 * Thème Born to Dance : noir, cuivre, champagne, particules dorées
 * Affiché uniquement à la première visite (sessionStorage)
 */

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BRANDING } from "@/config/branding";

const LOGO_HQ = "https://d2xsxph8kpxj0f.cloudfront.net/87304619/ikVKix4dpn7zVKKnzoiv6V/miss-mister-dour-logo-transparent_68980609.png";

// Particules dorées flottantes
function GoldenParticles({ count = 30 }: { count?: number }) {
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    duration: Math.random() * 3 + 2,
    delay: Math.random() * 2,
    opacity: Math.random() * 0.6 + 0.2,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: `radial-gradient(circle, #D4AF37, #C87941)`,
            opacity: p.opacity,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [p.opacity, p.opacity * 1.5, p.opacity],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// Lignes de lumière horizontales
function LightLines() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[0.3, 0.5, 0.7].map((pos, i) => (
        <motion.div
          key={i}
          className="absolute w-full h-px"
          style={{
            top: `${pos * 100}%`,
            background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.3), transparent)",
          }}
          animate={{
            scaleX: [0, 1, 0],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: 2.5,
            delay: 0.5 + i * 0.3,
            repeat: Infinity,
            repeatDelay: 1.5,
          }}
        />
      ))}
    </div>
  );
}

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<"enter" | "show" | "exit">("enter");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Phase 1: entrée (0.8s) → Phase 2: affichage (2.2s) → Phase 3: sortie
    timerRef.current = setTimeout(() => {
      setPhase("show");
      timerRef.current = setTimeout(() => {
        setPhase("exit");
        timerRef.current = setTimeout(() => {
          onComplete();
        }, 800);
      }, 2200);
    }, 800);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase !== "exit" && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
          style={{ background: "radial-gradient(ellipse at center, #1a0f00 0%, #0a0500 50%, #000000 100%)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          {/* Particules dorées */}
          <GoldenParticles count={35} />

          {/* Lignes de lumière */}
          <LightLines />

          {/* Halo central */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 400,
              height: 400,
              background: "radial-gradient(circle, rgba(200,121,65,0.15) 0%, rgba(212,175,55,0.08) 40%, transparent 70%)",
            }}
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Contenu principal */}
          <div className="relative z-10 flex flex-col items-center gap-6 px-8 text-center">
            {/* Logo */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 20 }}
              animate={
                phase === "enter"
                  ? { scale: 0.5, opacity: 0, y: 20 }
                  : { scale: 1, opacity: 1, y: 0 }
              }
              transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <motion.img
                src={LOGO_HQ}
                alt="Miss & Mister Dour 2026"
                className="w-48 h-48 md:w-64 md:h-64 object-contain drop-shadow-[0_0_30px_rgba(212,175,55,0.5)]"
                animate={{
                  filter: [
                    "drop-shadow(0 0 20px rgba(212,175,55,0.4))",
                    "drop-shadow(0 0 40px rgba(212,175,55,0.7))",
                    "drop-shadow(0 0 20px rgba(212,175,55,0.4))",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>

            {/* Ligne décorative */}
            <motion.div
              className="flex items-center gap-3 w-full max-w-xs"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={phase === "show" ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#D4AF37]" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
              <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#D4AF37]" />
            </motion.div>

            {/* Texte "Born to Dance" */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={phase === "show" ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex flex-col items-center gap-1"
            >
              <span
                className="text-xs font-semibold tracking-[0.4em] uppercase"
                style={{ color: "#C87941" }}
              >
                {BRANDING.closingNight.theme}
              </span>
              <span
                className="text-2xl md:text-3xl font-bold tracking-widest uppercase"
                style={{
                  background: "linear-gradient(135deg, #D4AF37, #F5E6C8, #C87941)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontFamily: "'Playfair Display', serif",
                  letterSpacing: "0.15em",
                }}
              >
                {BRANDING.closingNight.label}
              </span>
              <span
                className="text-xs tracking-[0.3em] uppercase mt-1"
                style={{ color: "rgba(245,230,200,0.6)" }}
              >
                {BRANDING.closingNight.dateDisplay} · {BRANDING.closingNight.location}
              </span>
            </motion.div>

            {/* Barre de chargement */}
            <motion.div
              className="w-48 h-0.5 rounded-full overflow-hidden"
              style={{ background: "rgba(255,255,255,0.1)" }}
              initial={{ opacity: 0 }}
              animate={phase === "show" ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: 0.6 }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: "linear-gradient(90deg, #C87941, #D4AF37, #F5E6C8)",
                }}
                initial={{ width: "0%" }}
                animate={phase === "show" ? { width: "100%" } : { width: "0%" }}
                transition={{ duration: 1.8, delay: 0.7, ease: "easeInOut" }}
              />
            </motion.div>
          </div>

          {/* Coins décoratifs */}
          {[
            "top-4 left-4 border-t-2 border-l-2",
            "top-4 right-4 border-t-2 border-r-2",
            "bottom-4 left-4 border-b-2 border-l-2",
            "bottom-4 right-4 border-b-2 border-r-2",
          ].map((cls, i) => (
            <motion.div
              key={i}
              className={`absolute w-8 h-8 ${cls}`}
              style={{ borderColor: "rgba(212,175,55,0.4)" }}
              initial={{ opacity: 0, scale: 0 }}
              animate={phase === "show" ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
              transition={{ duration: 0.4, delay: 0.2 + i * 0.05 }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
