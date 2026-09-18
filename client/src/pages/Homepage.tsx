import { Link } from "wouter";
import { useMemo, useState as useMenuState } from "react";
import {
  ArrowRight,
  Camera,
  Crown,
  History,
  LogIn,
  Menu,
  PlayCircle,
  Sparkles,
  X,
} from "lucide-react";
import { BRANDING } from "@/config/branding";
import { useAuth } from "@/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { SEOHead } from "@/components/SEOHead";
import { FloatingCandidateCards } from "@/components/FloatingCandidateCards";
import { SponsorVisual2026 } from "@/components/SponsorVisual2026";
import { trpc } from "@/lib/trpc";
import { ImmersiveHero2027, useDepthReveals } from "@/components/ImmersiveHero2027";

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
    missAwards: ["Miss Dour 2025 — Shanice Lambert"],
    misterAwards: ["Palmarès Mister 2025 en cours de récupération"],
    note: "Shanice Lambert confirmée Miss Dour 2025 · les visuels affichés doivent être nominativement identifiés avant publication.",
  },
  {
    year: "2026",
    label: "Édition 2026",
    miss: "Aliya Ammour",
    mister: "Hugo Puma",
    missAwards: [
      "Miss Dour 2026 — Aliya Ammour",
      "1ère dauphine — Manon Vaillant",
      "2ème dauphine — Giulia Leonetti",
      "Prix de l’espoir — Alessia Jouffin",
    ],
    misterAwards: [
      "Mister Dour 2026 — Hugo Puma",
      "1er dauphin — Lylian Paternottre",
      "2ème dauphin — Noé Cauderlier",
      "Prix de l’espoir — Dawson Ostrowki",
    ],
    note: "Palmarès 2026 intégré à l’archive officielle de l’édition.",
  },
];

const SHANICE_ARCHIVE_PHOTOS = [
  {
    src: "https://www.dropbox.com/scl/fi/qof5lblh61xaa2eole3xj/miss-hainaut-dour-34.jpg?rlkey=vuzz7fvejrva4bhunwyki0zv7&raw=1",
    label: "Archive · visite Miss Hainaut Dour · 08/02/2026",
  },
  {
    src: "https://www.dropbox.com/scl/fi/4vuvj25j4rrmkii109ujs/miss-hainaut-dour-110.jpg?rlkey=8qh7w6jpfos5owccd8hrh93fo&raw=1",
    label: "Archive · visite Miss Hainaut Dour · 08/02/2026",
  },
  {
    src: "https://www.dropbox.com/scl/fi/8l540gejwremodb3h8ygh/miss-hainaut-dour-119.jpg?rlkey=3hd7lga7j7olq7nwylm1p4tj7&raw=1",
    label: "Archive · visite Miss Hainaut Dour · 08/02/2026",
  },
  {
    src: "https://www.dropbox.com/scl/fi/74u69nsm9blt7hpd6kcgb/miss-hainaut-dour-156.jpg?rlkey=tq5kd10civvhbpvpy83bqvts5&raw=1",
    label: "Archive · visite Miss Hainaut Dour · 08/02/2026",
  },
] as const;

const SHANICE_ARCHIVE_MEDIA = [
  {
    src: "https://www.dropbox.com/scl/fi/8dtkhrwaxrbrdkfsw34t8/MMD2026-shanice-Dour-HT.mp4?rlkey=gzpilj2431uvoolvwd0kbhqyu&raw=1",
    label: "Shanice · archive officielle",
  },
  {
    src: "https://www.dropbox.com/scl/fi/loia7ylvs3m9qdwo1ejdm/video-Shanice-1.mp4?rlkey=c26ja2qm7ukru2ywl6c0ca6bd&raw=1",
    label: "Shanice · capsule vidéo",
  },
] as const;

const SPONSOR_PREVIEW = [
  { index: 3, name: "Belfius" },
  { index: 28, name: "Beobank" },
  { index: 29, name: "Fun Zone Dour" },
  { index: 21, name: "Dour Matériaux" },
  { index: 0, name: "La Perla" },
  { index: 38, name: "PubliDesign" },
] as const;

const EXPERIENCE_PORTALS = [
  { href: "/about", index: "01", label: "L’élection", detail: "Découvrir l’histoire", Icon: Crown },
  { href: "/candidates", index: "02", label: "Les candidats", detail: "Rencontrer les profils", Icon: Camera },
  { href: "/inscription", index: "03", label: "Votre candidature", detail: "Commencer le parcours", Icon: Sparkles },
  { href: "/gallery", index: "04", label: "Les coulisses", detail: "Entrer dans le backstage", Icon: PlayCircle },
] as const;

function SectionLabel({ index, children }: { index: string; children: string }) {
  return <div className="mmd-section-label"><span>{index}</span><i aria-hidden="true"/><strong>{children}</strong></div>;
}

function Marquee() {
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return <div className="mmd-marquee" aria-hidden="true"><div className="mmd-marquee-track">
    {items.map((item,index)=><span key={`${item}-${index}`}>{item}<i/></span>)}
  </div></div>;
}

function normalizeArchiveText(value?: string | null) {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("fr-BE");
}

export default function Homepage() {
  const { isAuthenticated, user } = useAuth();
  const [mobileMenuOpen,setMobileMenuOpen]=useMenuState(false);
  const { data: photos } = trpc.photos.listPublic.useQuery();
  useDepthReveals();

  const backstage = useMemo(() => {
    const all = photos ?? [];
    const selected = all.filter((photo) => photo.category === "backstage");
    return (selected.length ? selected : all).slice(0,4);
  }, [photos]);
  const galleryPreview = useMemo(() => (photos ?? []).slice(0,6), [photos]);
  const archiveMedia = useMemo(() => {
    const all = photos ?? [];
    const textFor = (photo: (typeof all)[number]) => normalizeArchiveText(`${photo.candidateName || ""} ${photo.title || ""} ${photo.category || ""}`);
    const photosMatching = (...terms: string[]) => all.filter((photo) => {
      const haystack = textFor(photo);
      return terms.some((term) => haystack.includes(normalizeArchiveText(term)));
    });
    const firstMatching = (...terms: string[]) => photosMatching(...terms)[0];
    const unique = (items: Array<(typeof all)[number] | undefined>) => items.filter((photo, index, array): photo is (typeof all)[number] => Boolean(photo) && array.findIndex((item) => item?.id === photo?.id) === index);

    return {
      // Important : aucun fallback vers une photo générique. Si Shanice n'est pas
      // identifiée dans les métadonnées publiques, on préfère afficher le bloc
      // « média en cours de liaison » plutôt qu'un mauvais visage.
      "2025": unique(photosMatching("shanice lambert", "shanice")).slice(0,3),
      "2026": unique([
        firstMatching("aliya ammour", "aliya"),
        firstMatching("hugo puma", "hugo"),
        firstMatching("miss mister dour 2026", "photo officielle 2026"),
      ]).slice(0,3),
    } as const;
  }, [photos]);

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
        <Link href="/inscription" className="mmd-primary-button mmd-nav-cta">Candidater</Link>
      </div>
      <button type="button" className="mmd-menu-button" onClick={()=>setMobileMenuOpen(open=>!open)} aria-label="Ouvrir le menu" aria-expanded={mobileMenuOpen}>{mobileMenuOpen?<X/>:<Menu/>}</button>
    </div>{mobileMenuOpen&&<nav className="mmd-mobile-menu" aria-label="Navigation mobile">
      {NAV_LINKS.map(item=><Link key={item.href} href={item.href} onClick={()=>setMobileMenuOpen(false)}>{item.label}</Link>)}
      <Link href="/inscription" className="mmd-primary-button" onClick={()=>setMobileMenuOpen(false)}>Candidater 2027</Link>
      {isAuthenticated?<Link href={getDashboardUrl()} className="mmd-mobile-account" onClick={()=>setMobileMenuOpen(false)}>Mon espace</Link>:<a href={getLoginUrl()} className="mmd-mobile-account">Connexion</a>}
    </nav>}</header>

    <main>
      {/* 01 — HERO IMMERSIF */}
      <ImmersiveHero2027 />
      <Marquee/>

      {/* 02 — INTRO */}
      <section id="experience" className="mmd-section mmd-home-intro" data-depth-reveal><div className="mmd-container">
        <SectionLabel index="02">L’expérience</SectionLabel>
        <div className="mmd-home-intro-grid"><h2>Plus qu’une élection.<br/><em>Une aventure humaine.</em></h2><p>Une scène où chaque personnalité peut prendre sa place, où le digital prolonge l’émotion et où l’innovation reste au service de l’humain.</p></div>
        <div className="mmd-experience-portals" aria-label="Explorer l’expérience">
          {EXPERIENCE_PORTALS.map(({href,index,label,detail,Icon})=><Link key={href} href={href} className="mmd-experience-portal"><span>{index}</span><Icon/><strong>{label}</strong><small>{detail}<ArrowRight/></small></Link>)}
        </div>
      </div></section>

      {/* 03 — CANDIDATS */}
      <section className="mmd-section mmd-candidates-section" data-depth-reveal><div className="mmd-container"><SectionLabel index="03">Les candidats</SectionLabel><div className="mmd-section-heading"><h2>Les visages qui donnent vie à <em>l’édition 2027.</em></h2><Link href="/candidates" className="mmd-text-link">Tous les profils <ArrowRight/></Link></div></div><div className="mmd-candidate-stage"><FloatingCandidateCards/></div><div className="mmd-container mmd-candidate-cta"><Link href="/inscription" className="mmd-primary-button">Rejoindre l’édition 2027 <ArrowRight className="h-4 w-4"/></Link></div></section>

      {/* 04 — JOURNEY */}
      <section className="mmd-section mmd-journey-section" data-depth-reveal><div className="mmd-container"><SectionLabel index="04">The Journey</SectionLabel><div className="mmd-section-heading mmd-journey-heading"><h2>De la première candidature aux <em>lumières du gala.</em></h2></div><div className="mmd-journey-grid">{JOURNEY.map(step=><article key={step.phase}><span>{step.phase}</span><h3>{step.title}</h3><p>{step.text}</p></article>)}</div></div></section>

      {/* 05 — BACKSTAGE */}
      <section className="mmd-section mmd-home-backstage" data-depth-reveal><div className="mmd-container"><SectionLabel index="05">Backstage</SectionLabel><div className="mmd-section-heading"><h2>Ce qui se passe <em>hors champ.</em></h2><Link href="/gallery" className="mmd-text-link">Voir tout <ArrowRight/></Link></div>
        {backstage.length>0?<div className="mmd-home-media-strip">{backstage.map((photo,index)=><Link href="/gallery" key={photo.id} className={index===0?"is-featured":""}><img src={photo.thumbnail||photo.url} alt={photo.candidateName||photo.title||"Backstage Miss & Mister Dour"} loading="lazy"/><span><PlayCircle/>{photo.candidateName||"Backstage"}</span></Link>)}</div>:<Link href="/gallery" className="mmd-home-empty-media"><Camera/><strong>Le backstage arrive ici</strong><span>Les premiers contenus apparaîtront automatiquement dès leur publication.</span></Link>}
      </div></section>

      {/* 06 — PARTICIPER */}
      <section className="mmd-section mmd-home-participate" data-depth-reveal><div className="mmd-container"><SectionLabel index="06">Participer</SectionLabel><div className="mmd-home-participate-card"><div><span>ÉDITION 2027</span><h2>Votre candidature.<br/><em>Votre histoire.</em></h2><p>Le formulaire accompagne chaque candidat étape par étape et permet ensuite de compléter son profil officiel.</p></div><div className="mmd-home-participate-actions"><Link href="/inscription" className="mmd-primary-button mmd-large-button">Commencer ma candidature <ArrowRight/></Link><small>Date de clôture communiquée prochainement</small></div></div></div></section>

      {/* 07 — ARCHIVES */}
      <section className="mmd-section mmd-home-archives" data-depth-reveal><div className="mmd-container"><SectionLabel index="07">Archives</SectionLabel><div className="mmd-section-heading"><h2>Les visages qui ont marqué <em>les éditions précédentes.</em></h2><Link href="/about" className="mmd-text-link">Notre histoire <History/></Link></div><div className="mmd-archive-grid">{ARCHIVES.map((edition, editionIndex)=>{
        const media = archiveMedia[edition.year as keyof typeof archiveMedia] || [];
        return <article key={edition.year} className="mmd-archive-card-2027" style={{"--archive-delay": `${editionIndex * 120}ms`} as React.CSSProperties}><div className="mmd-archive-year">{edition.year}</div><span>{edition.label}</span>{media.length>0?<div className="mmd-archive-media-2027">{media.map((photo,index)=><div key={`${edition.year}-${photo?.id}-${index}`} className={index===0?"is-main":""}>{photo&&<img src={photo.thumbnail||photo.url} alt={photo.candidateName||photo.title||`Archive ${edition.year}`} loading="lazy"/>}</div>)}</div>:edition.year!=="2025"?<div className="mmd-archive-media-pending"><Camera/><div><strong>Médias officiels en cours de liaison</strong><span>Seuls les médias nominativement identifiés sont publiés ici.</span></div></div>:null}{edition.year==="2025"&&<div className="mmd-shanice-archive-wrap"><div className="mmd-shanice-photo-grid" aria-label="Archives photo de l’édition 2025">{SHANICE_ARCHIVE_PHOTOS.map((item,index)=><figure key={item.src} className={index===0?"is-main":""}><img src={item.src} alt={item.label} loading="lazy"/><figcaption><Camera/>{item.label}</figcaption></figure>)}</div><div className="mmd-shanice-archive-media" aria-label="Médias vidéo de l’archive 2025">{SHANICE_ARCHIVE_MEDIA.map((item)=><figure key={item.src}><video src={item.src} controls playsInline preload="metadata" aria-label={item.label}/><figcaption><PlayCircle/>{item.label}</figcaption></figure>)}</div></div>}<div className="mmd-archive-titles mmd-archive-palmares"><div><small>MISS DOUR</small><strong>{edition.miss}</strong><ul>{edition.missAwards.map(item=><li key={item}>{item}</li>)}</ul></div><div><small>MISTER DOUR</small><strong className={edition.mister.includes("confirmer")?"is-pending":""}>{edition.mister}</strong><ul>{edition.misterAwards.map(item=><li key={item}>{item}</li>)}</ul></div></div><p>{edition.note}</p></article>;
      })}</div><p className="mmd-archive-disclaimer">Le palmarès 2026 est intégré. Pour 2025, seuls les éléments vérifiés et les médias identifiés sont affichés.</p><p className="mmd-archive-digital-credit"><Sparkles/>Direction digitale & mise en scène visuelle par JS-Innov.IA®</p></div></section>

      {/* 08 — PARTENAIRES */}
      <section className="mmd-section mmd-home-partners" data-depth-reveal><div className="mmd-container"><SectionLabel index="08">Partenaires</SectionLabel><div className="mmd-section-heading"><h2>Ils ont accompagné <em>l’aventure.</em></h2><Link href="/sponsors" className="mmd-text-link">Tous les partenaires <ArrowRight/></Link></div><div className="mmd-home-sponsor-preview">{SPONSOR_PREVIEW.map((sponsor)=><div key={sponsor.index}><SponsorVisual2026 index={sponsor.index} label={sponsor.name}/></div>)}</div><p className="mmd-home-partner-note">Aperçu des partenaires de l’édition 2026. Les partenaires 2027 seront identifiés séparément.</p><p className="mmd-archive-digital-credit"><Sparkles/>Direction digitale & mise en scène visuelle par JS-Innov.IA®</p></div></section>

      {/* 09 — GALERIE */}
      <section className="mmd-section mmd-home-gallery" data-depth-reveal><div className="mmd-container"><SectionLabel index="09">Galerie</SectionLabel><div className="mmd-section-heading"><h2>Portraits, scène et <em>moments forts.</em></h2><Link href="/gallery" className="mmd-text-link">Explorer la galerie <ArrowRight/></Link></div>{galleryPreview.length>0?<div className="mmd-home-gallery-grid">{galleryPreview.map((photo,index)=><Link href="/gallery" key={photo.id} className={index===0||index===3?"is-large":""}><img src={photo.thumbnail||photo.url} alt={photo.candidateName||photo.title||"Galerie Miss & Mister Dour"} loading="lazy"/></Link>)}</div>:<div className="mmd-home-gallery-placeholder"><Camera/><span>La galerie se remplira automatiquement avec les médias validés.</span></div>}</div></section>

      {/* 10 — FINAL CTA */}
      <section className="mmd-final-cta" data-depth-reveal><div className="mmd-final-year" aria-hidden="true">27</div><div className="mmd-container mmd-final-content"><span className="mmd-final-eyebrow">Et si le prochain visage de Dour était le vôtre ?</span><h2>Votre place<br/><em>sur la scène.</em></h2><p>Candidat, partenaire ou simplement curieux : entrez dans l’univers Miss & Mister Dour 2027.</p><div className="mmd-final-actions"><Link href="/inscription" className="mmd-final-dark-button">Devenir candidat</Link><Link href="/sponsors" className="mmd-final-outline-button">Devenir partenaire</Link><Link href="/contact" className="mmd-final-text-button">Nous contacter</Link></div></div></section>
    </main>

    <footer className="mmd-editorial-footer"><div className="mmd-container"><div className="mmd-footer-main"><img src={BRANDING.logoIdentity} alt="Miss & Mister Dour"/><nav aria-label="Navigation pied de page">{NAV_LINKS.map(item=><Link key={item.href} href={item.href}>{item.label}</Link>)}<Link href="/contact">Contact</Link></nav></div><div className="mmd-footer-bottom"><span>Miss & Mister Dour · Dour, Belgique</span><span>Direction digitale & mise en scène visuelle par JS-Innov.IA®</span></div></div></footer>
  </div>;
}