import { useState } from "react";
import { Link } from "wouter";
import { ArrowRight, Menu, X } from "lucide-react";
import { BRANDING } from "@/config/branding";

const NAV = [
  { href: "/about", label: "À propos" },
  { href: "/candidates", label: "Candidats" },
  { href: "/ranking", label: "Classement" },
  { href: "/gallery", label: "Galerie" },
  { href: "/sponsors", label: "Partenaires" },
  { href: "/press", label: "Presse" },
];

export function PublicSiteChrome({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mmd-public-shell">
      <div className="mmd-topline">
        <span>ÉDITION 2027</span>
        <span>DOUR · HAINAUT · BELGIQUE</span>
        <span>MISS & MISTER DOUR</span>
      </div>

      <header className="mmd-nav-shell sticky top-0 z-50">
        <div className="mmd-nav">
          <Link href="/" className="mmd-brand" aria-label="Accueil Miss & Mister Dour">
            <img src={BRANDING.logoIdentity} alt="Logo officiel Miss & Mister Dour" />
          </Link>

          <nav className="mmd-desktop-nav" aria-label="Navigation principale">
            {NAV.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}
          </nav>

          <div className="mmd-nav-actions">
            <Link href="/inscription-candidat" className="mmd-primary-button mmd-nav-cta">
              Candidater <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <button
            type="button"
            className="mmd-menu-button"
            onClick={() => setOpen((value) => !value)}
            aria-label="Ouvrir le menu"
            aria-expanded={open}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>

        {open && (
          <nav className="mmd-mobile-menu" aria-label="Navigation mobile">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>{item.label}</Link>
            ))}
            <Link href="/inscription-candidat" className="mmd-primary-button" onClick={() => setOpen(false)}>
              Candidater 2027
            </Link>
          </nav>
        )}
      </header>

      <div className="mmd-public-route-content">{children}</div>

      <footer className="mmd-editorial-footer mmd-shared-footer">
        <div className="mmd-container">
          <div className="mmd-footer-main">
            <Link href="/" aria-label="Accueil"><img src={BRANDING.logoIdentity} alt="Miss & Mister Dour" /></Link>
            <nav aria-label="Navigation pied de page">
              {NAV.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}
              <Link href="/contact">Contact</Link>
            </nav>
          </div>
          <div className="mmd-footer-bottom">
            <span>Miss & Mister Dour · Dour, Belgique</span>
            <span>Expérience digitale par JS-Innov.IA®</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
