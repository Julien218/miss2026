import { Link } from "wouter";
import { useState as useMenuState } from "react";
import { Crown, ArrowRight, LogIn, Menu, X } from "lucide-react";
import { BRANDING } from "@/config/branding";
import { useAuth } from "@/hooks/useAuth";
import { SEOHead } from "@/components/SEOHead";
import { FloatingCandidateCards } from "@/components/FloatingCandidateCards";

/* ────────────────────────────────────────────────────────────
   Page d'accueil — Direction artistique « Affiche éditoriale »
   Typographie géante · bandeau défilant · sections numérotées
   Fond noir obsidienne · accents cuivre / champagne / or
   ──────────────────────────────────────────────────────────── */

const MARQUEE_ITEMS = [
  "Inscriptions 2027 ouvertes",
  "Élection nationale — Dour, Belgique",
  "Miss & Mister Dour",
  "Gala de couronnement",
  "Votez pour vos favoris",
];

function Marquee() {
  const row = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return (
    <div className="relative overflow-hidden border-y border-black/20 bg-copper py-3 select-none" aria-hidden="true">
      <div className="marquee-track flex items-center gap-8 whitespace-nowrap w-max">
        {row.map((item, i) => (
          <span key={i} className="flex items-center gap-8 text-sm font-semibold uppercase tracking-[0.25em] text-black/90">
            {item}
            <span className="inline-block h-1.5 w-1.5 rotate-45 bg-black/70" />
          </span>
        ))}
      </div>
    </div>
  );
}

function SectionLabel({ index, children }: { index: string; children: string }) {
  return (
    <div className="flex items-baseline gap-4 mb-8 md:mb-12">
      <span className="font-grotesk text-sm font-medium text-copper-light tracking-[0.3em]">{index}</span>
      <span className="h-px w-16 md:w-24 bg-gradient-to-r from-copper to-transparent" />
      <span className="font-grotesk text-xs md:text-sm uppercase tracking-[0.3em] text-white/50">{children}</span>
    </div>
  );
}

export default function Homepage() {
  const { isAuthenticated, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useMenuState(false);

  const getDashboardUrl = () => {
    if (!user) return '/dashboard';
    switch (user.role) {
      case 'super_admin':
      case 'admin':
        return '/admin';
      case 'staff':
      case 'organizer':
        return '/choreographer';
      case 'photographer':
        return '/photographer';
      case 'press':
        return '/presse';
      default:
        return '/dashboard';
    }
  };

  const navLinks = [
    { href: "/about", label: "À propos" },
    { href: "/candidates", label: "Candidats" },
    { href: "/ranking", label: "Classement" },
    { href: "/gallery", label: "Galerie" },
    { href: "/sponsors", label: "Sponsors" },
    { href: "/press", label: "Presse" },
  ];

  return (
    <div className="min-h-screen bg-black text-white editorial-home">
      <SEOHead
        title="Miss &amp; Mister Dour 2027 — Dour, Belgique"
        description="L'élection Miss & Mister Dour : inscriptions 2027 ouvertes. Gala, vote du public, candidats et galeries officielles."
        url="https://missetmisterdour.be"
        tags={["Miss Dour", "Mister Dour", "concours beauté Belgique", "gala Dour", "inscriptions 2027", "Hainaut", "Starlight ASBL"]}
      />

      {/* ── Liseré haut façon billet ── */}
      <div className="hidden md:flex items-center justify-center gap-10 border-b border-white/10 bg-black py-1.5">
        {["Édition 2027", "Dour — Hainaut, Belgique", "Un événement JS-Innov.IA"].map((t) => (
          <span key={t} className="font-grotesk text-[10px] uppercase tracking-[0.35em] text-white/40">{t}</span>
        ))}
      </div>

      {/* ── Navigation ── */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:py-5">
          <Link href="/" className="flex items-center gap-3">
            <img
              src={BRANDING.logoIdentity}
              alt="Logo officiel Miss & Mister Dour"
              className="h-12 max-[640px]:h-9 w-auto object-contain"
              loading="eager"
            />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group font-grotesk text-[13px] uppercase tracking-[0.18em] text-white/60 transition-colors hover:text-white"
              >
                {item.label}
                <span className="block h-px max-w-0 bg-copper-light transition-all duration-300 group-hover:max-w-full" />
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                href={getDashboardUrl()}
                className="flex items-center gap-2 bg-gold px-5 py-2.5 font-grotesk text-sm font-semibold text-black transition-transform hover:-translate-y-0.5"
              >
                <Crown className="h-4 w-4" />
                {user?.role === 'admin' || user?.role === 'super_admin' ? 'Espace Admin' : 'Mon espace'}
              </Link>
            ) : (
              <>
                <Link href="/login" className="flex items-center gap-2 border border-white/25 px-4 py-2.5 font-grotesk text-sm text-white/80 transition-colors hover:border-copper-light hover:text-white">
                  <LogIn className="h-4 w-4" />
                  Connexion
                </Link>
                <Link
                  href="/inscription-candidat"
                  className="bg-copper px-5 py-2.5 font-grotesk text-sm font-semibold text-black transition-transform hover:-translate-y-0.5"
                >
                  Candidater
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden flex flex-col gap-1 border-t border-white/10 px-4 py-4">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="py-2.5 px-3 font-grotesk text-sm uppercase tracking-[0.15em] text-white/70 hover:bg-white/5 hover:text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link href="/inscription-candidat" className="mt-2 bg-copper px-4 py-3 text-center font-grotesk font-semibold text-black" onClick={() => setMobileMenuOpen(false)}>
              Candidater 2027
            </Link>
            {isAuthenticated ? (
              <Link href={getDashboardUrl()} className="mt-1 bg-gold px-4 py-3 text-center font-grotesk font-semibold text-black" onClick={() => setMobileMenuOpen(false)}>
                {user?.role === 'admin' || user?.role === 'super_admin' ? 'Espace Admin' : 'Mon espace'}
              </Link>
            ) : (
              <Link href="/login" className="mt-1 border border-white/25 px-4 py-3 text-center font-grotesk text-white/80" onClick={() => setMobileMenuOpen(false)}>
                Connexion
              </Link>
            )}
          </nav>
        )}
      </header>

      {/* ── Hero éditorial ── */}
      <section className="relative overflow-hidden px-4 pt-16 pb-10 md:pt-24 md:pb-16">
        {/* Halo cuivré */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute -top-32 left-1/2 h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse,rgba(184,115,66,0.22)_0%,transparent_65%)] blur-2xl" />
          <div className="grain-overlay absolute inset-0" />
        </div>

        {/* Année filigrane géante */}
        <div className="pointer-events-none absolute -right-10 top-6 hidden select-none lg:block" aria-hidden="true">
          <span className="block rotate-90 text-stroke-thin text-[11rem] font-bold leading-none tracking-tighter text-transparent">
            2027
          </span>
        </div>

        <div className="relative mx-auto max-w-7xl">
          <p className="hero-fade font-grotesk text-xs uppercase tracking-[0.45em] text-copper-light md:text-sm">
            Élection nationale · Dour, Belgique
          </p>

          <h1 className="mt-6 md:mt-8">
            <span className="hero-fade block font-serif text-[17vw] leading-[0.85] tracking-tight text-white md:text-[10.5rem]">
              Miss
            </span>
            <span className="hero-fade flex items-center gap-4 md:gap-8">
              <span className="font-serif text-[9vw] italic leading-[0.9] text-copper-light md:text-[6rem]">&amp;</span>
              <span className="text-stroke-gold block text-[17vw] font-bold leading-[0.85] tracking-tight text-transparent md:text-[10.5rem]">
                Mister
              </span>
            </span>
            <span className="hero-fade mt-2 block bg-gradient-to-r from-copper-light via-gold to-copper bg-clip-text font-serif text-[17vw] leading-[0.85] tracking-tight text-transparent md:text-[10.5rem]">
              Dour
            </span>
          </h1>

          <div className="mt-10 grid gap-10 md:mt-16 md:grid-cols-12 md:gap-6">
            <p className="hero-fade md:col-span-5 md:col-start-1 max-w-xl text-lg leading-relaxed text-white/60 md:text-xl">
              Bien plus qu'un concours de beauté — une scène nationale qui célèbre
              le talent, la diversité et l'audace. Votes en temps réel, vidéos générées
              par IA, certificats vérifiables : l'élection réinventée par{" "}
              <em className="font-serif italic text-champagne">JS-Innov.IA</em>.
            </p>
            <div className="hero-fade flex flex-wrap items-center gap-4 md:col-span-6 md:col-start-7 md:justify-end">
              <Link
                href="/inscription-candidat"
                className="group flex items-center gap-3 bg-copper px-8 py-4 font-grotesk text-base font-semibold text-black transition-all hover:-translate-y-0.5 hover:bg-copper-light"
              >
                Devenir candidat
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/voter"
                className="group flex items-center gap-3 border border-white/25 px-8 py-4 font-grotesk text-base text-white/85 transition-colors hover:border-copper-light hover:text-white"
              >
                Voter pour vos favoris
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Bandeau défilant ── */}
      <Marquee />

      {/* ── 01 · La scène ── */}
      <section className="relative px-4 py-16 md:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionLabel index="01">La scène</SectionLabel>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h2 className="font-serif text-4xl leading-tight text-white md:text-6xl">
              Les visages de <span className="italic text-copper-light">l'édition</span>
            </h2>
            <Link href="/candidates" className="group mb-2 flex items-center gap-2 font-grotesk text-sm uppercase tracking-[0.2em] text-white/50 transition-colors hover:text-white">
              Tous les profils
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
        <div className="relative mt-10">
          <FloatingCandidateCards />
        </div>
        <div className="mx-auto mt-10 flex max-w-7xl flex-wrap gap-4 px-4">
          <Link href="/inscription-candidat" className="group flex items-center gap-3 bg-copper px-7 py-3.5 font-grotesk font-semibold text-black transition-transform hover:-translate-y-0.5">
            Rejoindre la scène 2027
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>

      {/* ── 02 · Manifeste ── */}
      <section className="border-y border-white/10 px-4 py-16 md:py-28">
        <div className="mx-auto max-w-7xl">
          <SectionLabel index="02">Le concours, autrement</SectionLabel>
          <p className="max-w-4xl font-serif text-3xl leading-snug text-white/85 md:text-5xl">
            Un gala où le public <span className="italic text-copper-light">décide</span>,
            où chaque candidat vit son <span className="italic text-copper-light">épopée</span> —
            des coulisses à la couronne, filmée par l'IA, racontée en direct.
          </p>
          <div className="mt-12 grid gap-8 border-t border-white/10 pt-10 sm:grid-cols-3">
            {[
              { value: "2026", label: "Édition précédente — 19 finalistes sur scène" },
              { value: "IA", label: "Génération vidéo & suivi en temps réel" },
              { value: "2027", label: "Inscriptions ouvertes — votre année" },
            ].map((s) => (
              <div key={s.value} className="flex flex-col gap-2">
                <span className="font-serif text-5xl italic text-gold md:text-6xl">{s.value}</span>
                <span className="max-w-xs font-grotesk text-sm uppercase tracking-[0.15em] leading-relaxed text-white/45">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 03 · Explorer (affiches) ── */}
      <section className="px-4 py-16 md:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionLabel index="03">Explorer</SectionLabel>
          <div className="grid gap-6 md:grid-cols-2">
            <Link
              href="/candidates"
              className="group relative flex min-h-[380px] flex-col justify-end overflow-hidden border border-white/10 bg-gradient-to-br from-[#3a1a12] via-[#1c0e08] to-black p-8 transition-all duration-500 hover:border-copper/60 md:min-h-[460px] md:p-10"
            >
              <span className="absolute right-6 top-6 font-grotesk text-xs uppercase tracking-[0.3em] text-white/35">13 Miss · 6 Mister</span>
              <span className="pointer-events-none absolute -bottom-8 -left-4 font-serif text-[10rem] italic leading-none text-white/[0.06] transition-colors duration-500 group-hover:text-copper/15">01</span>
              <h3 className="font-serif text-4xl text-white md:text-5xl">Les candidats</h3>
              <p className="mt-3 max-w-sm text-white/55">
                Parcours, profils publics et votes — découvrez celles et ceux qui montent sur scène.
              </p>
              <span className="mt-6 flex items-center gap-2 font-grotesk text-sm uppercase tracking-[0.2em] text-copper-light">
                Voir les profils
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1.5" />
              </span>
            </Link>
            <Link
              href="/gallery"
              className="group relative flex min-h-[380px] flex-col justify-end overflow-hidden border border-white/10 bg-gradient-to-br from-[#2e2306] via-[#171004] to-black p-8 transition-all duration-500 hover:border-gold/60 md:min-h-[460px] md:p-10"
            >
              <span className="absolute right-6 top-6 font-grotesk text-xs uppercase tracking-[0.3em] text-white/35">Galerie officielle</span>
              <span className="pointer-events-none absolute -bottom-8 -left-4 font-serif text-[10rem] italic leading-none text-white/[0.06] transition-colors duration-500 group-hover:text-gold/15">02</span>
              <h3 className="font-serif text-4xl text-white md:text-5xl">La galerie</h3>
              <p className="mt-3 max-w-sm text-white/55">
                Shooting officiel, coulisses et moments de prestige de l'édition 2026.
              </p>
              <span className="mt-6 flex items-center gap-2 font-grotesk text-sm uppercase tracking-[0.2em] text-champagne">
                Ouvrir la galerie
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1.5" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── 04 · Le parcours 2027 ── */}
      <section className="border-t border-white/10 px-4 py-16 md:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionLabel index="04">Le parcours 2027</SectionLabel>
          <div className="grid gap-0 md:grid-cols-2">
            {[
              { phase: "Maintenant", title: "Inscriptions ouvertes", text: "Candidatures ouvertes aux 18–35 ans résidant en Belgique. Formulaire officiel en ligne." },
              { phase: "Sélection", title: "Choix du jury", text: "Étude des candidatures, entretiens et présélection des finalistes." },
              { phase: "Campagne", title: "Ouverture des votes", text: "Le public vote en ligne pour ses candidats favoris, en temps réel." },
              { phase: "Gala", title: "Soirée de couronnement", text: "La grande finale au Centre Sportif d'Elouges — le couronnement en direct." },
            ].map((step, i) => (
              <div
                key={step.phase}
                className={`border-b border-white/10 py-8 md:py-10 ${i % 2 === 0 ? "md:border-r md:pr-10" : "md:pl-10"} ${i === 2 ? "border-t-0" : ""}`}
              >
                <span className="font-grotesk text-xs uppercase tracking-[0.35em] text-copper-light">{step.phase}</span>
                <h3 className="mt-3 font-serif text-2xl text-white md:text-3xl">{step.title}</h3>
                <p className="mt-2 max-w-md text-white/55">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 05 · Partenaires ── */}
      <section className="border-t border-white/10 px-4 py-16 md:py-20">
        <div className="mx-auto max-w-7xl">
          <SectionLabel index="05">Partenaires</SectionLabel>
          <div className="grid items-center gap-10 md:grid-cols-[1fr_auto_1fr]">
            <Link href="/sponsors" className="group flex flex-col items-center gap-4 text-center">
              <div className="flex h-32 items-center justify-center rounded-xl border border-white/10 bg-black p-4 transition-colors group-hover:border-gold/40">
                <img src={BRANDING.logoIdentity} alt="Miss & Mister Dour" className="h-20 w-auto object-contain" />
              </div>
              <span className="font-grotesk text-xs uppercase tracking-[0.25em] text-white/45">Comité organisateur</span>
            </Link>
            <span className="hidden justify-self-center font-serif text-3xl italic text-white/25 md:block">+</span>
            <Link href="/sponsors" className="group flex flex-col items-center gap-4 text-center">
              <div className="flex h-32 items-center justify-center rounded-xl border border-white/10 bg-black p-4 transition-colors group-hover:border-gold/40">
                <img
                  src="https://d2xsxph8kpxj0f.cloudfront.net/87304619/fqSYuBaSqJ2z2N7q3F6MzD/Logo_JS-Innov.IA_EvoluTion_Autonome_02-26_85ca048d.png"
                  alt="JS-Innov.IA® - Julien Pagin"
                  className="h-20 w-auto object-contain"
                />
              </div>
              <span className="font-grotesk text-xs uppercase tracking-[0.25em] text-white/45">Créateur & partenaire technologique</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Bandeau presse ── */}
      <div className="border-t border-white/10 bg-white/[0.03] px-4 py-5">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <span className="font-grotesk text-xs uppercase tracking-[0.3em] text-white/40">Espace presse — presse@miss-mister-dour.be</span>
          <Link href="/press" className="group flex items-center gap-2 font-grotesk text-xs uppercase tracking-[0.25em] text-white/70 transition-colors hover:text-white">
            Accréditations médias
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      {/* ── CTA final pleine largeur cuivre ── */}
      <section className="relative overflow-hidden bg-copper px-4 py-20 md:py-28">
        <div className="grain-overlay pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl">
          <p className="font-grotesk text-xs uppercase tracking-[0.4em] text-black/60">Il reste une place — la vôtre</p>
          <h2 className="mt-4 font-serif text-5xl leading-[0.95] text-black md:text-8xl">
            Votre place<br />
            <span className="italic">sur la scène.</span>
          </h2>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/inscription-candidat" className="bg-black px-8 py-4 font-grotesk font-semibold text-white transition-transform hover:-translate-y-0.5">
              Devenir candidat
            </Link>
            <Link href="/sponsors" className="border-2 border-black/70 px-8 py-4 font-grotesk font-semibold text-black transition-colors hover:bg-black hover:text-white">
              Devenir sponsor
            </Link>
            <Link href="/contact" className="px-8 py-4 font-grotesk font-semibold text-black underline decoration-black/40 underline-offset-8 transition-colors hover:decoration-black">
              Nous contacter
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-black/20 bg-black px-4 pt-14 pb-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center gap-6 text-center">
            <img src={BRANDING.logoIdentity} alt="Miss & Mister Dour" className="h-16 w-auto object-contain" />
            <nav className="flex flex-wrap justify-center gap-x-8 gap-y-2">
              {navLinks.map((item) => (
                <Link key={item.href} href={item.href} className="font-grotesk text-xs uppercase tracking-[0.25em] text-white/45 transition-colors hover:text-white">
                  {item.label}
                </Link>
              ))}
              <Link href="/contact" className="font-grotesk text-xs uppercase tracking-[0.25em] text-white/45 transition-colors hover:text-white">Contact</Link>
            </nav>
          </div>
          <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-center md:flex-row md:text-left">
            <span className="font-grotesk text-[11px] uppercase tracking-[0.2em] text-white/35">
              Miss &amp; Mister Dour — Starlight ASBL · Dour, Belgique
            </span>
            <span className="font-grotesk text-[11px] uppercase tracking-[0.2em] text-white/35">
              Une création JS-Innov.IA® — Julien Pagin
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
