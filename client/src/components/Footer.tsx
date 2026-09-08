/**
 * Footer Component - Design JS-Innov.IA® Tech Ecosystem
 * Fond sombre texturé avec particules dorées
 * 
 * Créé par JS-Innov.IA® (Pagin Julien) - Dour, Belgique
 * © Tous droits réservés - Copie strictement interdite
 */

import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

// URLs CDN des logos
const LOGO_JS_INNOV = "https://d2xsxph8kpxj0f.cloudfront.net/87304619/fqSYuBaSqJ2z2N7q3F6MzD/Logo_JS-Innov.IA_EvoluTion_Autonome_02-26_85ca048d.png";

// Particules dorées flottantes
function FooterParticles() {
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1.5,
    duration: Math.random() * 4 + 3,
    delay: Math.random() * 3,
    opacity: Math.random() * 0.4 + 0.1,
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
            y: [0, -20, 0],
            opacity: [p.opacity, p.opacity * 1.8, p.opacity],
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

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [showLegal, setShowLegal] = useState(false);

  return (
    <footer className="relative mt-auto overflow-hidden" style={{
      background: "radial-gradient(ellipse at center, #1a1000 0%, #0d0800 40%, #050300 70%, #000000 100%)"
    }}>
      {/* Particules dorées */}
      <FooterParticles />

      {/* Ligne dorée supérieure */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#D4AF37]/60 to-transparent" />

      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Section Tech Ecosystem */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <p className="text-[10px] uppercase tracking-[0.5em] text-gray-500 mb-6">
            Tech Ecosystem
          </p>

          {/* Logo JS-Innov.IA */}
          <motion.div
            className="flex justify-center mb-4"
            animate={{
              filter: [
                "drop-shadow(0 0 8px rgba(212,175,55,0.2))",
                "drop-shadow(0 0 16px rgba(212,175,55,0.4))",
                "drop-shadow(0 0 8px rgba(212,175,55,0.2))",
              ],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <img
              src={LOGO_JS_INNOV}
              alt="JS-Innov.IA®"
              className="h-24 w-auto object-contain rounded-xl"
            />
          </motion.div>

          {/* Nom et slogan */}
          <h3 className="text-lg font-semibold mb-1" style={{
            background: "linear-gradient(135deg, #D4AF37, #E8C547, #C87941)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            JS-Innov.IA®
          </h3>
          <p className="text-gray-500 text-sm italic">
            When Vision meets Intelligence.
          </p>
        </motion.div>

        {/* Ligne séparatrice */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-6" />

        {/* Catégories tech */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 mb-8"
        >
          <span className="text-[11px] uppercase tracking-[0.3em] text-gray-500">AI Creative Direction</span>
          <span className="text-gray-700">|</span>
          <span className="text-[11px] uppercase tracking-[0.3em] text-gray-500">Automation Systems</span>
          <span className="text-gray-700">|</span>
          <span className="text-[11px] uppercase tracking-[0.3em] text-gray-500">Digital Cinema Engine</span>
        </motion.div>

        {/* Designed & Engineered by */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mb-6"
        >
          <p className="text-gray-500 text-sm">
            Designed & Engineered by{" "}
            <span className="font-bold" style={{
              background: "linear-gradient(135deg, #D4AF37, #E8C547)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>JS-Innov.IA®</span>
          </p>
          <p className="text-gray-600 text-xs mt-1">
            Artificial Intelligence Creative Systems
          </p>
        </motion.div>

        {/* Copyright */}
        <div className="text-center mb-6">
          <p className="text-gray-600 text-xs">
            © {currentYear} STARLIGHT ASBL — Miss & Mister Dour {currentYear} — Tous droits réservés
          </p>
        </div>

        {/* Bouton Mentions Légales (discret, cliquable) */}
        <div className="flex justify-center">
          <button
            onClick={() => setShowLegal(!showLegal)}
            className="flex items-center gap-2 px-6 py-2 rounded-full border border-white/10 text-gray-500 text-xs uppercase tracking-[0.2em] hover:border-[#D4AF37]/30 hover:text-gray-400 transition-all duration-300"
          >
            Mentions Légales
            <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${showLegal ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* Contenu Mentions Légales (déroulant) */}
        <motion.div
          initial={false}
          animate={{ height: showLegal ? "auto" : 0, opacity: showLegal ? 1 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="overflow-hidden"
        >
          <div className="pt-6 flex flex-wrap justify-center gap-4 text-xs">
            <Link href="/mentions-legales" className="text-gray-500 hover:text-[#D4AF37] transition-colors">
              Mentions légales
            </Link>
            <span className="text-gray-700">·</span>
            <Link href="/legal/cgu" className="text-gray-500 hover:text-[#D4AF37] transition-colors">
              CGU
            </Link>
            <span className="text-gray-700">·</span>
            <Link href="/legal/privacy" className="text-gray-500 hover:text-[#D4AF37] transition-colors">
              Politique de confidentialité
            </Link>
            <span className="text-gray-700">·</span>
            <Link href="/legal/cookies" className="text-gray-500 hover:text-[#D4AF37] transition-colors">
              Cookies
            </Link>
            <span className="text-gray-700">·</span>
            <Link href="/contact" className="text-gray-500 hover:text-[#D4AF37] transition-colors">
              Contact
            </Link>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
