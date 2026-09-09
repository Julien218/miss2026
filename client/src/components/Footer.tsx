import { useState } from "react";
import { Link } from "wouter";
import { ChevronDown, Facebook, Instagram } from "lucide-react";
import { BRANDING } from "@/config/branding";

const FOOTER_LINKS = [
  { href: "/about", label: "À propos" },
  { href: "/candidates", label: "Candidats" },
  { href: "/gallery", label: "Galerie" },
  { href: "/ranking", label: "Classement" },
  { href: "/sponsors", label: "Sponsors" },
  { href: "/press", label: "Presse" },
  { href: "/contact", label: "Contact" },
];

export function Footer() {
  const [showLegal, setShowLegal] = useState(false);
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-auto overflow-hidden border-t border-[#d9b978]/15 bg-[#070707] text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(circle at 16% 0%, rgba(217,185,120,.10), transparent 30%), radial-gradient(circle at 86% 100%, rgba(126,83,51,.10), transparent 34%)",
        }}
      />

      <div className="relative z-10 mx-auto w-[min(1240px,92vw)] py-14 md:py-16">
        <div className="grid gap-10 border-b border-white/10 pb-12 md:grid-cols-[1.2fr_.8fr] md:items-end">
          <div>
            <Link href="/" className="inline-flex" aria-label="Accueil Miss & Mister Dour">
              <img
                src={BRANDING.logoIdentity}
                alt="Miss & Mister Dour"
                className="h-24 w-auto max-w-[230px] object-contain object-left drop-shadow-[0_0_22px_rgba(217,185,120,.16)]"
              />
            </Link>
            <p className="mt-5 max-w-xl text-sm leading-7 text-white/55">
              Une expérience humaine, scénique et digitale à Dour. Découvrez les candidats,
              les moments forts, les anciennes éditions et celles et ceux qui font vivre l’aventure.
            </p>
          </div>

          <div className="md:text-right">
            <p className="text-[10px] font-semibold uppercase tracking-[.28em] text-[#d9b978]">
              Édition 2027
            </p>
            <p className="mt-3 text-sm text-white/50">Dour · Hainaut · Belgique</p>
            <Link
              href="/inscription-candidat"
              className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full border border-[#d9b978]/50 bg-gradient-to-r from-[#e2c47e] to-[#b88849] px-6 text-xs font-bold uppercase tracking-[.08em] text-black"
            >
              Candidater 2027
            </Link>
          </div>
        </div>

        <div className="grid gap-10 py-10 lg:grid-cols-[1fr_auto] lg:items-center">
          <nav className="flex flex-wrap gap-x-7 gap-y-4" aria-label="Navigation pied de page">
            {FOOTER_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-xs font-medium uppercase tracking-[.08em] text-white/50 transition-colors hover:text-[#d9b978]"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3 lg:justify-end">
            <a
              href={BRANDING.socialMedia.facebook}
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook Miss & Mister Dour"
              className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-white/55 transition hover:border-[#d9b978]/40 hover:text-[#d9b978]"
            >
              <Facebook className="h-4 w-4" />
            </a>
            <a
              href={BRANDING.socialMedia.instagram}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram Miss & Mister Dour"
              className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-white/55 transition hover:border-[#d9b978]/40 hover:text-[#d9b978]"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              href={BRANDING.socialMedia.tiktok}
              target="_blank"
              rel="noreferrer"
              aria-label="TikTok Miss & Mister Dour"
              className="grid h-10 min-w-10 place-items-center rounded-full border border-white/10 px-3 text-[10px] font-bold uppercase tracking-[.08em] text-white/55 transition hover:border-[#d9b978]/40 hover:text-[#d9b978]"
            >
              TikTok
            </a>
          </div>
        </div>

        <div className="border-t border-white/10 pt-7">
          <div className="flex flex-col gap-4 text-xs text-white/35 md:flex-row md:items-center md:justify-between">
            <span>© {currentYear} STARLIGHT ASBL · Miss & Mister Dour · Tous droits réservés</span>
            <span>Expérience digitale par <strong className="font-semibold text-white/55">JS-Innov.IA®</strong></span>
          </div>

          <button
            type="button"
            onClick={() => setShowLegal((value) => !value)}
            className="mt-6 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.16em] text-white/35 transition hover:text-[#d9b978]"
            aria-expanded={showLegal}
          >
            Informations légales
            <ChevronDown className={`h-3 w-3 transition-transform ${showLegal ? "rotate-180" : ""}`} />
          </button>

          {showLegal && (
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-3 text-xs text-white/40">
              <Link href="/mentions-legales" className="hover:text-[#d9b978]">Mentions légales</Link>
              <Link href="/legal/cgu" className="hover:text-[#d9b978]">CGU</Link>
              <Link href="/legal/privacy" className="hover:text-[#d9b978]">Confidentialité</Link>
              <Link href="/legal/cookies" className="hover:text-[#d9b978]">Cookies</Link>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
