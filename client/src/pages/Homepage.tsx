import { Link } from "wouter";
import { useState as useMenuState } from "react";
import {
  ArrowRight,
  Award,
  Camera,
  Crown,
  LogIn,
  Menu,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { BRANDING } from "@/config/branding";
import { useAuth } from "@/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { SEOHead } from "@/components/SEOHead";
import { FloatingCandidateCards } from "@/components/FloatingCandidateCards";

const NAV_LINKS = [
  { href: "/about", label: "À propos" },
  { href: "/candidates", label: "Candidats" },
  { href: "/ranking", label: "Classement" },
  { href: "/gallery", label: "Galerie" },
  { href: "/sponsors", label: "Sponsors" },
  { href: "/press", label: "Presse" },
];

const MARQUEE_ITEMS = [
  "Édition 2027",
  "Inscriptions ouvertes",
  "Miss & Mister Dour",
  "Profils officiels",
  "Expérience digitale",
  "Dour · Belgique",
];

const JOURNEY = [
  {
    phase: "01 · Candidater",
    title: "Entrez dans l’aventure",
    text: "Une inscription simple, un profil personnel et un parcours pensé pour valoriser chaque personnalité.",
  },
  {
    phase: "02 · Sélection",
    title: "Rencontrer le comité",
    text: "Présentation, échanges et sélection des profils qui porteront l’édition 2027.",
  },
  {
    phase: "03 · Expérience",
    title: "Vivre la campagne",
    text: "Shooting, contenus, événements, rencontres et visibilité digitale tout au long de l’aventure.",
  },
  {
    phase: "04 · Gala",
    title: "Monter sur scène",
    text: "Le point culminant de l’expérience : une soirée de gala conçue comme un véritable événement.",
  },
];

function SectionLabel({ index, children }: { index: string; children: string }) {
  return (
    <div className="mmd-section-label">
      <span>{index}</span>
      <i aria-hidden="true" />
      <strong>{children}</strong>
    </div>
  );
}

function Marquee() {
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS];

  return (
    <div className="mmd-marquee" aria-hidden="true">
      <div className="mmd-marquee-track">
        {items.map((item, index) => (
          <span key={`${item}-${index}`}>
            {item}
            <i />
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Homepage() {
  const { isAuthenticated, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useMenuState(false);

  const getDashboardUrl = () => {
    if (!user) return "/dashboard";

    switch (user.role) {
      case "super_admin":
      case "admin":
        return "/admin";
      case "staff":
      case "organizer":
        return "/choreographer";
      case "photographer":
        return "/photographer";
      case "press":
        return "/press";
      default:
        return "/dashboard";
    }
  };

  return (
    <div className="editorial-home min-h-screen bg-black text-white">
      <SEOHead
        title="Miss & Mister Dour 2027 — L'expérience officielle"
        description="Découvrez Miss & Mister Dour 2027 : candidats, galerie, classement, inscriptions et partenaires de l'expérience officielle à Dour."
        url="https://missetmisterdour.be"
        tags={[
          "Miss Dour",
          "Mister Dour",
          "Miss Mister Dour 2027",
          "Dour",
          "Hainaut",
          "Starlight ASBL",
          "JS-Innov.IA",
        ]}
      />

      <div className="mmd-topline">
        <span>ÉDITION 2027</span>
        <span>DOUR · HAINAUT · BELGIQUE</span>
        <span>DIGITAL EXPERIENCE</span>
      </div>

      <header className="mmd-nav-shell sticky top-0 z-50">
        <div className="mmd-nav">
          <Link href="/" className="mmd-brand" aria-label="Accueil Miss & Mister Dour">
            <img
              src={BRANDING.logoIdentity}
              alt="Logo officiel Miss & Mister Dour"
              loading="eager"
            />
          </Link>

          <nav className="mmd-desktop-nav" aria-label="Navigation principale">
            {NAV_LINKS.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mmd-nav-actions">
            {isAuthenticated ? (
              <Link href={getDashboardUrl()} className="mmd-account-button">
                <Crown className="h-4 w-4" />
                {user?.role === "admin" || user?.role === "super_admin"
                  ? "Espace Admin"
                  : "Mon espace"}
              </Link>
            ) : (
              <a href={getLoginUrl()} className="mmd-login-button">
                <LogIn className="h-4 w-4" />
                Connexion
              </a>
            )}
            <Link href="/inscription-candidat" className="mmd-primary-button mmd-nav-cta">
              Candidater
            </Link>
          </div>

          <button
            type="button"
            className="mmd-menu-button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label="Ouvrir le menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {mobileMenuOpen && (
          <nav className="mmd-mobile-menu" aria-label="Navigation mobile">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/inscription-candidat"
              className="mmd-primary-button"
              onClick={() => setMobileMenuOpen(false)}
            >
              Candidater 2027
            </Link>
            {isAuthenticated ? (
              <Link
                href={getDashboardUrl()}
                className="mmd-mobile-account"
                onClick={() => setMobileMenuOpen(false)}
              >
                Mon espace
              </Link>
            ) : (
              <a href={getLoginUrl()} className="mmd-mobile-account">
                Connexion
              </a>
            )}
          </nav>
        )}
      </header>

      <main>
        <section className="mmd-hero">
          <div className="mmd-hero-ambient" aria-hidden="true" />
          <div className="mmd-hero-frame" aria-hidden="true" />

          <div className="mmd-container mmd-hero-content">
            <div className="mmd-hero-kicker">
              <span>Nouvelle génération</span>
              <i />
              <span>2027</span>
            </div>

            <h1 className="mmd-display-title" aria-label="Miss & Mister Dour">
              <span className="mmd-title-miss">Miss</span>
              <span className="mmd-title-middle">
                <em>&amp;</em>
                <strong>Mister</strong>
              </span>
              <span className="mmd-title-dour">Dour</span>
            </h1>

            <div className="mmd-hero-bottom">
              <p>
                Plus qu’une élection : une <strong>expérience humaine, scénique et digitale</strong>
                pensée pour révéler des personnalités, créer des souvenirs et faire vivre Dour autrement.
              </p>

              <div className="mmd-hero-actions">
                <Link href="/inscription-candidat" className="mmd-primary-button mmd-large-button">
                  Devenir candidat
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link href="/candidates" className="mmd-secondary-button mmd-large-button">
                  Découvrir les candidats
                </Link>
              </div>
            </div>

            <div className="mmd-hero-signature">
              <span>Une expérience digitale</span>
              <strong>amplifiée par l’humain.</strong>
            </div>
          </div>
        </section>

        <Marquee />

        <section className="mmd-section mmd-candidates-section">
          <div className="mmd-container">
            <SectionLabel index="01">Les visages</SectionLabel>
            <div className="mmd-section-heading">
              <h2>
                Découvrez celles et ceux qui donnent un visage à <em>l’aventure.</em>
              </h2>
              <Link href="/candidates" className="mmd-text-link">
                Tous les profils
                <ArrowRight />
              </Link>
            </div>
          </div>

          <div className="mmd-candidate-stage">
            <FloatingCandidateCards />
          </div>

          <div className="mmd-container mmd-candidate-cta">
            <Link href="/inscription-candidat" className="mmd-primary-button">
              Rejoindre l’édition 2027
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <section className="mmd-section mmd-manifesto-section">
          <div className="mmd-container">
            <SectionLabel index="02">Le concours, autrement</SectionLabel>
            <div className="mmd-manifesto-grid">
              <p className="mmd-manifesto-copy">
                Une scène où chaque personnalité peut <em>prendre sa place</em>, où le digital
                prolonge l’émotion et où l’innovation reste au service de <em>l’humain.</em>
              </p>
              <div className="mmd-manifesto-note">
                <Sparkles />
                <span>Direction digitale</span>
                <strong>JS-Innov.IA®</strong>
                <p>Technologie, contenus et expérience connectée au service de l’événement.</p>
              </div>
            </div>

            <div className="mmd-stat-strip">
              <div>
                <strong>2027</strong>
                <span>Nouvelle édition</span>
              </div>
              <div>
                <strong>LIVE</strong>
                <span>Actualités & profils</span>
              </div>
              <div>
                <strong>HUMAIN</strong>
                <span>Au centre de l’expérience</span>
              </div>
            </div>
          </div>
        </section>

        <section className="mmd-section">
          <div className="mmd-container">
            <SectionLabel index="03">Explorer</SectionLabel>
            <div className="mmd-bento">
              <Link href="/candidates" className="mmd-bento-card mmd-bento-card--hero">
                <div className="mmd-bento-icon"><Users /></div>
                <span className="mmd-bento-eyebrow">Profils officiels</span>
                <h3>Les candidats</h3>
                <p>Portraits, parcours, personnalité et actualités de l’édition.</p>
                <span className="mmd-bento-link">Découvrir <ArrowRight /></span>
                <strong className="mmd-bento-number">01</strong>
              </Link>

              <Link href="/gallery" className="mmd-bento-card mmd-bento-card--gallery">
                <div className="mmd-bento-icon"><Camera /></div>
                <span className="mmd-bento-eyebrow">Backstage</span>
                <h3>La galerie</h3>
                <p>Shooting, coulisses et moments forts.</p>
                <span className="mmd-bento-link">Explorer <ArrowRight /></span>
                <strong className="mmd-bento-number">02</strong>
              </Link>

              <Link href="/ranking" className="mmd-bento-card mmd-bento-card--compact">
                <div className="mmd-bento-icon"><Crown /></div>
                <span className="mmd-bento-eyebrow">En direct</span>
                <h3>Classement</h3>
                <p>Suivez l’évolution de l’édition.</p>
                <span className="mmd-bento-link">Voir <ArrowRight /></span>
              </Link>

              <Link href="/sponsors" className="mmd-bento-card mmd-bento-card--compact">
                <div className="mmd-bento-icon"><Award /></div>
                <span className="mmd-bento-eyebrow">Partenaires</span>
                <h3>Devenir sponsor</h3>
                <p>Associez votre image à l’aventure.</p>
                <span className="mmd-bento-link">Découvrir <ArrowRight /></span>
              </Link>
            </div>
          </div>
        </section>

        <section className="mmd-section mmd-journey-section">
          <div className="mmd-container">
            <SectionLabel index="04">Le parcours 2027</SectionLabel>
            <div className="mmd-section-heading mmd-journey-heading">
              <h2>
                De la première candidature jusqu’aux <em>lumières du gala.</em>
              </h2>
            </div>

            <div className="mmd-journey-grid">
              {JOURNEY.map((step) => (
                <article key={step.phase}>
                  <span>{step.phase}</span>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mmd-section mmd-partners-section">
          <div className="mmd-container">
            <SectionLabel index="05">Écosystème</SectionLabel>
            <div className="mmd-partner-layout">
              <Link href="/sponsors" className="mmd-partner-card">
                <img src={BRANDING.logoIdentity} alt="Miss & Mister Dour" />
                <div>
                  <span>Organisation</span>
                  <strong>Miss & Mister Dour</strong>
                </div>
              </Link>

              <div className="mmd-partner-plus" aria-hidden="true">×</div>

              <Link href="/sponsors" className="mmd-partner-card">
                <div className="mmd-js-mark">JS</div>
                <div>
                  <span>Partenaire technologique</span>
                  <strong>JS-Innov.IA®</strong>
                </div>
              </Link>
            </div>
          </div>
        </section>

        <section className="mmd-final-cta">
          <div className="mmd-final-year" aria-hidden="true">27</div>
          <div className="mmd-container mmd-final-content">
            <span className="mmd-final-eyebrow">Et si la prochaine histoire était la vôtre ?</span>
            <h2>
              Votre place<br />
              <em>sur la scène.</em>
            </h2>
            <p>
              Candidat, partenaire ou simplement curieux : entrez dans l’univers Miss & Mister Dour 2027.
            </p>
            <div className="mmd-final-actions">
              <Link href="/inscription-candidat" className="mmd-final-dark-button">
                Devenir candidat
              </Link>
              <Link href="/sponsors" className="mmd-final-outline-button">
                Devenir sponsor
              </Link>
              <Link href="/contact" className="mmd-final-text-button">
                Nous contacter
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="mmd-editorial-footer">
        <div className="mmd-container">
          <div className="mmd-footer-main">
            <img src={BRANDING.logoIdentity} alt="Miss & Mister Dour" />
            <nav aria-label="Navigation pied de page">
              {NAV_LINKS.map((item) => (
                <Link key={item.href} href={item.href}>{item.label}</Link>
              ))}
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
