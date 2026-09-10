import { Link } from "wouter";
import { useMemo, useState as useMenuState } from "react";
import {
  ArrowRight,
  Award,
  Camera,
  Crown,
  History,
  LogIn,
  Menu,
  PlayCircle,
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

const NAV_LINKS = [
  { href: "/about", label: "À propos" },
  { href: "/candidates", label: "Candidats" },
  { href: "/ranking", label: "Classement" },
  { href: "/gallery", label: "Galerie" },
  { href: "/sponsors", label: "Partenaires" },
  { href: "/press", label: "Presse" },
];

const MARQUEE_ITEMS = [
  "Édition 2027",
  "Inscriptions ouvertes",
  "Miss & Mister Dour",
  "Portraits officiels",
  "Backstage",
  "Dour · Belgique",
];

const JOURNEY = [
  { phase: "01", title: "Candidater", text: "Un parcours d’inscription clair et progressif pour entrer dans l’aventure." },
  { phase: "02", title: "Rencontrer", text: "Échanges, sélection et découverte des personnalités qui porteront l’édition." },
  { phase: "03", title: "Vivre", text: "Shootings, préparation, contenus, événements et moments partagés." },
  { phase: "04", title: "Monter sur scène", text: "Le gala vient couronner une aventure construite bien avant les projecteurs." },
];

const ARCHIVES = [
  {
    year: "2025",
    label: "Édition 2025",
    miss: "Shanice Lambert",
    mister: "Archive à confirmer",
    note: "Miss Dour 2025 vérifiée · identité Mister en cours de récupération",
  },
  {
    year: "2026",
    label: "Édition 2026",
    miss: "Palmarès à relier",
    mister: "Palmarès à relier",
    note: "Les données historiques seront affichées dès validation du palmarès officiel",
  },
];

const SPONSOR_PREVIEW = [
  ["belfius.jpg", "Belfius"],
  ["beobank.png", "Beobank"],
  ["fun-zone.png", "Fun Zone Dour"],
  ["dour-materiaux.jpg", "Dour Matériaux"],
  ["la-perla.png", "La Perla"],
  ["publidesign.png", "PubliDesign"],
] as const;

const SPONSOR_ASSET_BASE = "https://raw.githubusercontent.com/Julien218/miss-mister-dour-web/main/client/public/sponsors";

function SectionLabel({ index, children }: { index: string; children: string }) {
  return <div className="mmd-section-label"><span>{index}</span><i aria-hidden="true"/><strong>{children}</strong></div>;
}

function Marquee() {
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return <div className="mmd-marquee" aria-hidden="true"><div className="mmd-marquee-track">
    {items.map((item,index)=><span key={`${item}-${index}`}>{item}<i/></span>)}
  </div></div>;
}

export default function Homepage() {
  const { isAuthenticated, user } = useAuth();
  const [mobileMenuOpen,setMobileMenuOpen]=useMenuState(false);
  const { data: photos } = trpc.photos.listPublic.useQuery();

  const backstage = useMemo(() => {
    const all = photos ?? [];
    const selected = all.filter((photo) => photo.category === "backstage");
    return (selected.length ? selected : all).slice(0,4);
  }, [photos]);
  const galleryPreview = useMemo(() => (photos ?? []).slice(0,6), [photos]);

  const getDashboardUrl=()=>{
    if(!user)return "/dashboard";
    switch(user.role){
      case "super_admin": case "admin": return "/admin";
      case "staff": case "organizer": return "/choreographer";
      case "photographer": return "/photographer";
      case "press": return "/press";
      default:return "/dashboard";
    }
  };

  return <div className="editorial-home min-h-screen bg-black text-white">
    <SEOHead
      title="Miss & Mister Dour 2027 — L'expérience officielle"
      description="Miss & Mister Dour 2027 : candidats, backstage, galerie, archives, classement, inscriptions et partenaires."
      url="https://missetmisterdour.be"
      tags={["Miss Dour","Mister Dour","Miss Mister Dour 2027","Dour","Hainaut","STARLIGHT ASBL"]}
    />

    <div className="mmd-topline"><span>ÉDITION 2027</span><span>DOUR · HAINAUT · BELGIQUE</span><span>DIGITAL EXPERIENCE</span></div>
    <header className="mmd-nav-shell sticky top-0 z-50"><div className="mmd-nav">
      <Link href="/" className="mmd-brand" aria-label="Accueil Miss & Mister Dour"><img src={BRANDING.logoIdentity} alt="Logo officiel Miss & Mister Dour" loading="eager"/></Link>
      <nav className="mmd-desktop-nav" aria-label="Navigation principale">{NAV_LINKS.map(item=><Link key={item.href} href={item.href}>{item.label}</Link>)}</nav>
      <div className="mmd-nav-actions">
        {isAuthenticated?<Link href={getDashboardUrl()} className="mmd-account-button"><Crown className="h-4 w-4"/>{user?.role==="admin"||user?.role==="super_admin"?"Espace Admin":"Mon espace"}</Link>:<a href={getLoginUrl()} className="mmd-login-button"><LogIn className="h-4 w-4"/>Connexion</a>}
        <Link href="/inscription-candidat" className="mmd-primary-button mmd-nav-cta">Candidater</Link>
      </div>
      <button type="button" className="mmd-menu-button" onClick={()=>setMobileMenuOpen(open=>!open)} aria-label="Ouvrir le menu" aria-expanded={mobileMenuOpen}>{mobileMenuOpen?<X/>:<Menu/>}</button>
    </div>{mobileMenuOpen&&<nav className="mmd-mobile-menu" aria-label="Navigation mobile">
      {NAV_LINKS.map(item=><Link key={item.href} href={item.href} onClick={()=>setMobileMenuOpen(false)}>{item.label}</Link>)}
      <Link href="/inscription-candidat" className="mmd-primary-button" onClick={()=>setMobileMenuOpen(false)}>Candidater 2027</Link>
      {isAuthenticated?<Link href={getDashboardUrl()} className="mmd-mobile-account" onClick={()=>setMobileMenuOpen(false)}>Mon espace</Link>:<a href={getLoginUrl()} className="mmd-mobile-account">Connexion</a>}
    </nav>}</header>

    <main>
      {/* 01 — HERO */}
      <section className="mmd-hero">
        <div className="mmd-hero-ambient" aria-hidden="true"/><div className="mmd-hero-frame" aria-hidden="true"/>
        <div className="mmd-container mmd-hero-content">
          <div className="mmd-hero-kicker"><span>Nouvelle génération</span><i/><span>2027</span></div>
          <img src={BRANDING.logoIdentity} alt="" className="mmd-home-hero-logo" aria-hidden="true"/>
          <h1 className="mmd-display-title" aria-label="Miss & Mister Dour"><span className="mmd-title-miss">Miss</span><span className="mmd-title-middle"><em>&amp;</em><strong>Mister</strong></span><span className="mmd-title-dour">Dour</span></h1>
          <div className="mmd-hero-bottom"><p>Une <strong>expérience humaine, scénique et digitale</strong> pensée pour révéler des personnalités, créer des souvenirs et faire vivre Dour autrement.</p><div className="mmd-hero-actions"><Link href="/inscription-candidat" className="mmd-primary-button mmd-large-button">Devenir candidat <ArrowRight className="h-5 w-5"/></Link><Link href="/candidates" className="mmd-secondary-button mmd-large-button">Découvrir les candidats</Link></div></div>
        </div>
      </section>
      <Marquee/>

      {/* 02 — INTRO */}
      <section className="mmd-section mmd-home-intro"><div className="mmd-container">
        <SectionLabel index="02">L’expérience</SectionLabel>
        <div className="mmd-home-intro-grid"><h2>Plus qu’une élection.<br/><em>Une aventure humaine.</em></h2><p>Une scène où chaque personnalité peut prendre sa place, où le digital prolonge l’émotion et où l’innovation reste au service de l’humain.</p></div>
      </div></section>

      {/* 03 — CANDIDATS */}
      <section className="mmd-section mmd-candidates-section"><div className="mmd-container"><SectionLabel index="03">Les candidats</SectionLabel><div className="mmd-section-heading"><h2>Les visages qui donnent vie à <em>l’édition 2027.</em></h2><Link href="/candidates" className="mmd-text-link">Tous les profils <ArrowRight/></Link></div></div><div className="mmd-candidate-stage"><FloatingCandidateCards/></div><div className="mmd-container mmd-candidate-cta"><Link href="/inscription-candidat" className="mmd-primary-button">Rejoindre l’édition 2027 <ArrowRight className="h-4 w-4"/></Link></div></section>

      {/* 04 — JOURNEY */}
      <section className="mmd-section mmd-journey-section"><div className="mmd-container"><SectionLabel index="04">The Journey</SectionLabel><div className="mmd-section-heading mmd-journey-heading"><h2>De la première candidature aux <em>lumières du gala.</em></h2></div><div className="mmd-journey-grid">{JOURNEY.map(step=><article key={step.phase}><span>{step.phase}</span><h3>{step.title}</h3><p>{step.text}</p></article>)}</div></div></section>

      {/* 05 — BACKSTAGE */}
      <section className="mmd-section mmd-home-backstage"><div className="mmd-container"><SectionLabel index="05">Backstage</SectionLabel><div className="mmd-section-heading"><h2>Ce qui se passe <em>hors champ.</em></h2><Link href="/gallery" className="mmd-text-link">Voir tout <ArrowRight/></Link></div>
        {backstage.length>0?<div className="mmd-home-media-strip">{backstage.map((photo,index)=><Link href="/gallery" key={photo.id} className={index===0?"is-featured":""}><img src={photo.thumbnail||photo.url} alt={photo.candidateName||photo.title||"Backstage Miss & Mister Dour"} loading="lazy"/><span><PlayCircle/>{photo.candidateName||"Backstage"}</span></Link>)}</div>:<Link href="/gallery" className="mmd-home-empty-media"><Camera/><strong>Le backstage arrive ici</strong><span>Les premiers contenus apparaîtront automatiquement dès leur publication.</span></Link>}
      </div></section>

      {/* 06 — PARTICIPER */}
      <section className="mmd-section mmd-home-participate"><div className="mmd-container"><SectionLabel index="06">Participer</SectionLabel><div className="mmd-home-participate-card"><div><span>ÉDITION 2027</span><h2>Votre candidature.<br/><em>Votre histoire.</em></h2><p>Le formulaire accompagne chaque candidat étape par étape et permet ensuite de compléter son profil officiel.</p></div><div className="mmd-home-participate-actions"><Link href="/inscription-candidat" className="mmd-primary-button mmd-large-button">Commencer ma candidature <ArrowRight/></Link><small>Date de clôture communiquée prochainement</small></div></div></div></section>

      {/* 07 — ARCHIVES */}
      <section className="mmd-section mmd-home-archives"><div className="mmd-container"><SectionLabel index="07">Archives</SectionLabel><div className="mmd-section-heading"><h2>Les visages qui ont marqué <em>les éditions précédentes.</em></h2><Link href="/about" className="mmd-text-link">Notre histoire <History/></Link></div><div className="mmd-archive-grid">{ARCHIVES.map(edition=><article key={edition.year}><div className="mmd-archive-year">{edition.year}</div><span>{edition.label}</span><div className="mmd-archive-titles"><div><small>MISS DOUR</small><strong className={edition.miss.includes("relier")?"is-pending":""}>{edition.miss}</strong></div><div><small>MISTER DOUR</small><strong className={edition.mister.includes("Archive")||edition.mister.includes("relier")?"is-pending":""}>{edition.mister}</strong></div></div><p>{edition.note}</p></article>)}</div><p className="mmd-archive-disclaimer">Aucun nom n’est publié comme lauréat sans source vérifiée. Le palmarès historique sera complété au fur et à mesure de sa récupération.</p></div></section>

      {/* 08 — PARTENAIRES */}
      <section className="mmd-section mmd-home-partners"><div className="mmd-container"><SectionLabel index="08">Partenaires</SectionLabel><div className="mmd-section-heading"><h2>Ils ont accompagné <em>l’aventure.</em></h2><Link href="/sponsors" className="mmd-text-link">Tous les partenaires <ArrowRight/></Link></div><div className="mmd-home-sponsor-preview">{SPONSOR_PREVIEW.map(([file,name])=><div key={file}><img src={`${SPONSOR_ASSET_BASE}/${file}`} alt={`Logo ${name}`} loading="lazy"/></div>)}</div><p className="mmd-home-partner-note">Aperçu des partenaires de l’édition 2026. Les partenaires 2027 seront identifiés séparément.</p></div></section>

      {/* 09 — GALERIE */}
      <section className="mmd-section mmd-home-gallery"><div className="mmd-container"><SectionLabel index="09">Galerie</SectionLabel><div className="mmd-section-heading"><h2>Portraits, scène et <em>moments forts.</em></h2><Link href="/gallery" className="mmd-text-link">Explorer la galerie <ArrowRight/></Link></div>{galleryPreview.length>0?<div className="mmd-home-gallery-grid">{galleryPreview.map((photo,index)=><Link href="/gallery" key={photo.id} className={index===0||index===3?"is-large":""}><img src={photo.thumbnail||photo.url} alt={photo.candidateName||photo.title||"Galerie Miss & Mister Dour"} loading="lazy"/></Link>)}</div>:<div className="mmd-home-gallery-placeholder"><Camera/><span>La galerie se remplira automatiquement avec les médias validés.</span></div>}</div></section>

      {/* 10 — FINAL CTA */}
      <section className="mmd-final-cta"><div className="mmd-final-year" aria-hidden="true">27</div><div className="mmd-container mmd-final-content"><span className="mmd-final-eyebrow">Et si le prochain visage de Dour était le vôtre ?</span><h2>Votre place<br/><em>sur la scène.</em></h2><p>Candidat, partenaire ou simplement curieux : entrez dans l’univers Miss & Mister Dour 2027.</p><div className="mmd-final-actions"><Link href="/inscription-candidat" className="mmd-final-dark-button">Devenir candidat</Link><Link href="/sponsors" className="mmd-final-outline-button">Devenir partenaire</Link><Link href="/contact" className="mmd-final-text-button">Nous contacter</Link></div></div></section>
    </main>

    <footer className="mmd-editorial-footer"><div className="mmd-container"><div className="mmd-footer-main"><img src={BRANDING.logoIdentity} alt="Miss & Mister Dour"/><nav aria-label="Navigation pied de page">{NAV_LINKS.map(item=><Link key={item.href} href={item.href}>{item.label}</Link>)}<Link href="/contact">Contact</Link></nav></div><div className="mmd-footer-bottom"><span>Miss & Mister Dour · Dour, Belgique</span><span>Expérience digitale par JS-Innov.IA®</span></div></div></footer>
  </div>;
}
