import { useState } from "react";
import { Link } from "wouter";
import {
  ArrowRight,
  Award,
  Camera,
  Crown,
  LogIn,
  Menu,
  Play,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { BRANDING } from "@/config/branding";
import { useAuth } from "@/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { SEOHead } from "@/components/SEOHead";
import { FloatingCandidateCards } from "@/components/FloatingCandidateCards";
import { trpc } from "@/lib/trpc";
import { HISTORICAL_SPONSORS } from "@/data/sponsors";

const NAV_LINKS = [
  { href: "/about", label: "À propos" },
  { href: "/candidates", label: "Candidats" },
  { href: "/gallery", label: "Galerie" },
  { href: "/sponsors", label: "Sponsors" },
  { href: "/press", label: "Presse" },
];

const JOURNEY = [
  {
    phase: "01",
    eyebrow: "Candidater",
    title: "Entrez dans l’aventure",
    text: "Une inscription claire et progressive, pensée pour présenter chaque personnalité avec justesse.",
  },
  {
    phase: "02",
    eyebrow: "Sélection",
    title: "Rencontrer le comité",
    text: "Échanges, présentation et sélection des profils qui porteront la nouvelle édition.",
  },
  {
    phase: "03",
    eyebrow: "Expérience",
    title: "Vivre la campagne",
    text: "Shooting, contenus, rencontres, partenaires et moments partagés tout au long du parcours.",
  },
  {
    phase: "04",
    eyebrow: "Gala",
    title: "Monter sur scène",
    text: "Le point culminant d’une aventure humaine mise en scène comme un véritable événement.",
  },
];

const ARCHIVES = [
  {
    year: "2026",
    miss: null,
    mister: null,
    note: "Palmarès officiel en cours de consolidation depuis les données historiques.",
  },
  {
    year: "2025",
    miss: "Shanice Lambert",
    mister: null,
    note: "Miss Dour 2025 confirmée. Le titulaire Mister sera publié après validation des archives du comité.",
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
  const items = [
    "Édition 2027",
    "Inscriptions",
    "Candidats",
    "Backstage",
    "Archives",
    "Partenaires",
    "Dour · Belgique",
  ];
  const loop = [...items, ...items, ...items];

  return (
    <div className="mmd-marquee" aria-hidden="true">
      <div className="mmd-marquee-track">
        {loop.map((item, index) => (
          <span key={`${item}-${index}`}>
            {item}
            <i />
          </span>
        ))}
      </div>
    </div>
  );
}

function ArchiveTitleholder({ label, name }: { label: string; name: string | null }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 p-5">
      <span className="text-[9px] font-bold uppercase tracking-[.2em] text-[#d9b978]">{label}</span>
      <strong className="mt-2 block text-lg text-white">
        {name ?? "À confirmer"}
      </strong>
      {!name && <small className="mt-1 block text-[11px] text-white/35">Archive en consolidation</small>}
    </div>
  );
}

export default function Homepage() {
  const { isAuthenticated, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: backstagePhotos } = trpc.photos.listPublic.useQuery({ category: "backstage" });
  const backstage = (backstagePhotos || []).slice(0, 4);

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
        title="Miss & Mister Dour 2027 — Digital Experience"
        description="Miss & Mister Dour 2027 : candidats, parcours, backstage, archives, partenaires, galerie et inscriptions."
        url="https://missetmisterdour.be"
        tags={["Miss Dour", "Mister Dour", "Miss Mister Dour 2027", "Dour", "Hainaut", "STARLIGHT ASBL"]}
      />

      <div className="mmd-topline">
        <span>ÉDITION 2027</span>
        <span>DOUR · HAINAUT · BELGIQUE</span>
        <span>DIGITAL EXPERIENCE</span>
      </div>

      <header className="mmd-nav-shell sticky top-0 z-50">
        <div className="mmd-nav">
          <Link href="/" className="mmd-brand" aria-label="Accueil Miss & Mister Dour">
            <img src={BRANDING.logoIdentity} alt="Logo officiel Miss & Mister Dour" loading="eager" />
          </Link>

          <nav className="mmd-desktop-nav" aria-label="Navigation principale">
            {NAV_LINKS.map((item) => (
              <Link key={item.href} href={item.href}>{item.label}</Link>
            ))}
            <a href="#archives">Archives</a>
          </nav>

          <div className="mmd-nav-actions">
            {isAuthenticated ? (
              <Link href={getDashboardUrl()} className="mmd-account-button">
                <Crown className="h-4 w-4" />
                {user?.role === "admin" || user?.role === "super_admin" ? "Espace Admin" : "Mon espace"}
              </Link>
            ) : (
              <a href={getLoginUrl()} className="mmd-login-button">
                <LogIn className="h-4 w-4" /> Connexion
              </a>
            )}
            <Link href="/inscription-candidat" className="mmd-primary-button mmd-nav-cta">Candidater</Link>
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
              <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}>{item.label}</Link>
            ))}
            <a href="#archives" onClick={() => setMobileMenuOpen(false)}>Archives</a>
            <Link href="/inscription-candidat" className="mmd-primary-button" onClick={() => setMobileMenuOpen(false)}>
              Candidater 2027
            </Link>
          </nav>
        )}
      </header>

      <main>
        {/* 01 — HERO */}
        <section className="mmd-hero">
          <div className="mmd-hero-ambient" aria-hidden="true" />
          <div className="mmd-hero-frame" aria-hidden="true" />
          <div className="mmd-container mmd-hero-content">
            <div className="mmd-hero-kicker"><span>Nouvelle génération</span><i /><span>2027</span></div>
            <h1 className="mmd-display-title" aria-label="Miss & Mister Dour">
              <span className="mmd-title-miss">Miss</span>
              <span className="mmd-title-middle"><em>&amp;</em><strong>Mister</strong></span>
              <span className="mmd-title-dour">Dour</span>
            </h1>
            <div className="mmd-hero-bottom">
              <p>
                Plus qu’une élection : une <strong>expérience humaine, scénique et digitale</strong>
                qui révèle des personnalités et crée des souvenirs à Dour.
              </p>
              <div className="mmd-hero-actions">
                <Link href="/inscription-candidat" className="mmd-primary-button mmd-large-button">
                  Devenir candidat <ArrowRight className="h-5 w-5" />
                </Link>
                <Link href="/candidates" className="mmd-secondary-button mmd-large-button">Découvrir les candidats</Link>
              </div>
            </div>
            <div className="mmd-hero-signature"><span>Une expérience digitale</span><strong>amplifiée par l’humain.</strong></div>
          </div>
        </section>

        <Marquee />

        {/* 02 — INTRO */}
        <section className="mmd-section mmd-manifesto-section">
          <div className="mmd-container">
            <SectionLabel index="02">Plus qu’une élection</SectionLabel>
            <div className="grid gap-10 lg:grid-cols-[1.25fr_.75fr] lg:items-end">
              <p className="mmd-manifesto-copy">
                Une aventure <em>humaine.</em> Une scène où chaque personnalité peut prendre sa place,
                et où le digital prolonge l’émotion sans jamais remplacer la rencontre.
              </p>
              <p className="max-w-lg text-sm leading-7 text-white/45 lg:justify-self-end">
                Le site accompagne l’expérience : découvrir, suivre, partager, retrouver les moments forts
                et préserver la mémoire des éditions précédentes.
              </p>
            </div>
          </div>
        </section>

        {/* 03 — CANDIDATS */}
        <section className="mmd-section mmd-candidates-section">
          <div className="mmd-container">
            <SectionLabel index="03">Les candidats</SectionLabel>
            <div className="mmd-section-heading">
              <h2>Découvrez celles et ceux qui donnent un visage à <em>l’édition 2027.</em></h2>
              <Link href="/candidates" className="mmd-text-link">Tous les profils <ArrowRight /></Link>
            </div>
          </div>
          <div className="mmd-candidate-stage"><FloatingCandidateCards /></div>
        </section>

        {/* 04 — JOURNEY */}
        <section className="mmd-section mmd-journey-section">
          <div className="mmd-container">
            <SectionLabel index="04">The Journey</SectionLabel>
            <div className="mmd-section-heading mmd-journey-heading">
              <h2>De la première candidature jusqu’aux <em>lumières du gala.</em></h2>
            </div>
            <div className="mmd-journey-grid">
              {JOURNEY.map((step) => (
                <article key={step.phase}>
                  <span>{step.phase} · {step.eyebrow}</span>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 05 — BACKSTAGE */}
        <section className="mmd-section border-y border-white/10 bg-white/[.018]">
          <div className="mmd-container">
            <SectionLabel index="05">Backstage</SectionLabel>
            <div className="mmd-section-heading">
              <h2>Les moments qui se vivent <em>hors scène.</em></h2>
              <Link href="/gallery" className="mmd-text-link">Toute la galerie <ArrowRight /></Link>
            </div>

            {backstage.length > 0 ? (
              <div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
                {backstage.map((photo, index) => (
                  <Link
                    key={photo.id}
                    href="/gallery"
                    className={`group relative overflow-hidden rounded-[24px] border border-white/10 bg-[#111] ${index === 0 ? "md:-translate-y-4" : index === 2 ? "md:translate-y-5" : ""}`}
                  >
                    <div className="aspect-[9/14] overflow-hidden">
                      <img
                        src={photo.url}
                        alt={photo.title || "Backstage Miss & Mister Dour"}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                        loading="lazy"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                      <span className="text-[9px] font-bold uppercase tracking-[.16em] text-white/70">Coulisses</span>
                      <Play className="h-4 w-4 text-[#d9b978]" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <Link
                href="/gallery"
                className="mt-12 grid min-h-[280px] place-items-center rounded-[30px] border border-[#d9b978]/18 bg-[radial-gradient(circle_at_center,rgba(217,185,120,.09),transparent_48%)] text-center"
              >
                <div>
                  <Camera className="mx-auto h-8 w-8 text-[#d9b978]" />
                  <strong className="mt-5 block text-2xl">Les coulisses arrivent ici</strong>
                  <span className="mt-2 block text-sm text-white/40">La section se remplit automatiquement avec la galerie Backstage.</span>
                </div>
              </Link>
            )}
          </div>
        </section>

        {/* 06 — PARTICIPER */}
        <section className="mmd-section">
          <div className="mmd-container">
            <SectionLabel index="06">Participer</SectionLabel>
            <div className="grid gap-8 overflow-hidden rounded-[34px] border border-[#d9b978]/20 bg-[linear-gradient(135deg,rgba(217,185,120,.12),rgba(255,255,255,.02))] p-7 md:grid-cols-[1fr_auto] md:items-end md:p-12">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[.22em] text-[#d9b978]">Casting 2027</span>
                <h2 className="mt-5 max-w-4xl text-4xl font-semibold leading-[.98] tracking-[-.045em] md:text-6xl">
                  Et si le prochain visage de Dour était le vôtre ?
                </h2>
                <p className="mt-6 max-w-2xl text-sm leading-7 text-white/48">
                  Le parcours d’inscription vous guide étape par étape, sur mobile comme sur ordinateur.
                </p>
              </div>
              <Link href="/inscription-candidat" className="mmd-primary-button mmd-large-button">
                Commencer l’inscription <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* 07 — ARCHIVES */}
        <section id="archives" className="mmd-section scroll-mt-28 border-y border-white/10 bg-white/[.018]">
          <div className="mmd-container">
            <SectionLabel index="07">Archives</SectionLabel>
            <div className="mmd-section-heading">
              <h2>Chaque couronne laisse une <em>trace.</em></h2>
              <p className="max-w-md text-sm leading-7 text-white/45">
                Les anciens titulaires et éditions restent visibles : l’histoire du concours ne recommence pas à zéro chaque année.
              </p>
            </div>

            <div className="mt-12 grid gap-5 lg:grid-cols-2">
              {ARCHIVES.map((edition) => (
                <article key={edition.year} className="relative overflow-hidden rounded-[30px] border border-[#d9b978]/18 bg-[#111214] p-6 md:p-8">
                  <div className="pointer-events-none absolute right-[-12%] top-[-20%] text-[180px] font-black leading-none text-white/[.025]">{edition.year.slice(2)}</div>
                  <div className="relative">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-[.22em] text-[#d9b978]">Édition</span>
                        <strong className="mt-2 block text-4xl">{edition.year}</strong>
                      </div>
                      <Crown className="h-8 w-8 text-[#d9b978]/65" />
                    </div>
                    <div className="mt-8 grid gap-3 sm:grid-cols-2">
                      <ArchiveTitleholder label={`Miss Dour ${edition.year}`} name={edition.miss} />
                      <ArchiveTitleholder label={`Mister Dour ${edition.year}`} name={edition.mister} />
                    </div>
                    <p className="mt-5 text-xs leading-6 text-white/38">{edition.note}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 08 — PARTENAIRES */}
        <section className="mmd-section">
          <div className="mmd-container">
            <SectionLabel index="08">Partenaires</SectionLabel>
            <div className="mmd-section-heading">
              <h2>Une aventure soutenue par un <em>écosystème local.</em></h2>
              <Link href="/sponsors" className="mmd-text-link">Tous les partenaires <ArrowRight /></Link>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {HISTORICAL_SPONSORS.slice(0, 12).map((sponsor) => (
                <div key={sponsor.name} className="grid min-h-24 place-items-center rounded-2xl border border-white/10 bg-white/[.025] px-4 text-center">
                  <span className="text-xs font-semibold text-white/72">{sponsor.name}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-5 border-t border-white/10 pt-7">
              <p className="text-xs text-white/35">Les partenaires des éditions précédentes restent conservés dans la mémoire du site.</p>
              <Link href="/sponsors" className="mmd-secondary-button">Voir le mur sponsors</Link>
            </div>
          </div>
        </section>

        {/* 09 — GALERIE */}
        <section className="mmd-section border-y border-white/10 bg-white/[.018]">
          <div className="mmd-container">
            <SectionLabel index="09">Galerie</SectionLabel>
            <div className="grid gap-8 md:grid-cols-[1.1fr_.9fr] md:items-end">
              <h2 className="text-4xl font-semibold leading-[1] tracking-[-.045em] md:text-6xl">
                Portraits, scène, coulisses : <em className="font-light text-[#d9b978]">revivez l’expérience.</em>
              </h2>
              <div className="md:justify-self-end">
                <p className="max-w-md text-sm leading-7 text-white/45">Une galerie connectée qui rassemble les contenus approuvés et les moments forts.</p>
                <Link href="/gallery" className="mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.1em] text-[#d9b978]">
                  Explorer la galerie <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 10 — FINAL CTA */}
        <section className="mmd-final-cta">
          <div className="mmd-final-year" aria-hidden="true">27</div>
          <div className="mmd-container mmd-final-content">
            <span className="mmd-final-eyebrow">La prochaine histoire commence ici.</span>
            <h2>Votre place<br /><em>sur la scène.</em></h2>
            <p>Candidat, partenaire ou visiteur : entrez dans l’univers Miss & Mister Dour 2027.</p>
            <div className="mmd-final-actions">
              <Link href="/inscription-candidat" className="mmd-final-dark-button">Devenir candidat</Link>
              <Link href="/sponsors" className="mmd-final-outline-button">Devenir sponsor</Link>
              <Link href="/contact" className="mmd-final-text-button">Nous contacter</Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="mmd-editorial-footer">
        <div className="mmd-container">
          <div className="mmd-footer-main">
            <img src={BRANDING.logoIdentity} alt="Miss & Mister Dour" />
            <nav aria-label="Navigation pied de page">
              {NAV_LINKS.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}
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
