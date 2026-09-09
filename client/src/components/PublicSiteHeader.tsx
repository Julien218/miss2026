import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X } from "lucide-react";
import { BRANDING } from "@/config/branding";

const NAV_ITEMS = [
  { href: "/about", label: "À propos" },
  { href: "/candidates", label: "Candidats" },
  { href: "/ranking", label: "Classement" },
  { href: "/gallery", label: "Galerie" },
  { href: "/sponsors", label: "Sponsors" },
  { href: "/press", label: "Presse" },
];

function isActive(pathname: string, href: string) {
  if (href === "/candidates") {
    return pathname === href || pathname.startsWith("/candidat/") || pathname.startsWith("/candidates/");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function PublicSiteHeader() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="mmd-global-topline" aria-hidden="true">
        <span>MISS &amp; MISTER DOUR</span>
        <span>ÉDITION 2027</span>
        <span>DOUR · BELGIQUE</span>
      </div>

      <header className="mmd-global-header">
        <div className="mmd-global-header__inner">
          <Link href="/" className="mmd-global-brand" aria-label="Accueil Miss & Mister Dour">
            <img src={BRANDING.logoIdentity} alt="Miss & Mister Dour" />
          </Link>

          <nav className="mmd-global-nav" aria-label="Navigation principale">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={isActive(location, item.href) ? "is-active" : ""}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mmd-global-actions">
            <Link href="/inscription-candidat" className="mmd-global-cta">
              Candidater 2027
            </Link>
            <button
              type="button"
              className="mmd-global-menu"
              aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={open}
              onClick={() => setOpen((value) => !value)}
            >
              {open ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {open && (
          <nav className="mmd-global-mobile" aria-label="Navigation mobile">
            {NAV_ITEMS.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
                <span>{item.label}</span>
                <span aria-hidden="true">↗</span>
              </Link>
            ))}
            <Link href="/contact" onClick={() => setOpen(false)}>
              <span>Contact</span>
              <span aria-hidden="true">↗</span>
            </Link>
            <Link href="/inscription-candidat" className="mmd-global-mobile__cta" onClick={() => setOpen(false)}>
              Devenir candidat
            </Link>
          </nav>
        )}
      </header>
    </>
  );
}
