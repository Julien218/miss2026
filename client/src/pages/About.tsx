import { Link } from "wouter";
import { ArrowRight, Heart, Sparkles, Users } from "lucide-react";
import { BRANDING } from "@/config/branding";
import { SEOHead } from "@/components/SEOHead";

const VALUES = [
  { icon: Heart, title: "Humain", text: "Mettre la personnalité, le parcours et l’expérience vécue avant le simple concours." },
  { icon: Users, title: "Collectif", text: "Créer des rencontres entre candidats, public, partenaires, bénévoles et acteurs de Dour." },
  { icon: Sparkles, title: "Nouvelle génération", text: "Utiliser le digital avec mesure pour prolonger l’événement, jamais pour remplacer l’émotion." },
];

export default function About(){
  return <div className="mmd-public-page">
    <SEOHead title="À propos — Miss & Mister Dour 2027" description="Découvrez l’histoire, les valeurs et la vision de Miss & Mister Dour." url="https://missetmisterdour.be/about" />
    <section className="mmd-public-hero"><div className="mmd-container">
      <div className="mmd-public-kicker"><span>02</span><i/>À PROPOS</div>
      <img src={BRANDING.logoIdentity} alt="Miss & Mister Dour" className="mmd-public-logo-mark"/>
      <h1>Plus qu’une élection. <em>Une aventure humaine.</em></h1>
      <p>Miss & Mister Dour réunit scène, rencontres, création de contenus et expérience digitale autour d’un même objectif : donner à chaque personnalité l’espace pour s’exprimer.</p>
    </div></section>

    <section className="mmd-section"><div className="mmd-container mmd-about-intro">
      <div><span className="mmd-overline">DEPUIS 2002</span><h2>Une histoire ancrée à <em>Dour.</em></h2></div>
      <div className="mmd-rich-copy"><p>Porté par STARLIGHT ASBL, l’événement s’inscrit dans une histoire locale de plus de deux décennies. Les éditions successives ont réuni candidats, familles, partenaires et public autour d’une soirée devenue un rendez-vous de la région.</p><p>L’édition 2027 poursuit cette histoire avec une direction plus éditoriale, plus immersive et résolument mobile, tout en conservant ce qui fait l’identité du projet : la proximité et l’humain.</p></div>
    </div></section>

    <section className="mmd-section mmd-values-section"><div className="mmd-container"><div className="mmd-section-heading"><h2>Ce que nous voulons <em>faire vivre.</em></h2></div><div className="mmd-values-grid">{VALUES.map(({icon:Icon,title,text},index)=><article key={title}><span>0{index+1}</span><Icon/><h3>{title}</h3><p>{text}</p></article>)}</div></div></section>

    <section className="mmd-section"><div className="mmd-container"><div className="mmd-public-kicker"><span>HISTOIRE</span><i/>LES ÉDITIONS</div><div className="mmd-history-track">
      <article><strong>2002</strong><div><h3>Le début</h3><p>Naissance de Miss & Mister Dour et premières éditions portées par STARLIGHT ASBL.</p></div></article>
      <article><strong>2002—2025</strong><div><h3>Une histoire qui grandit</h3><p>Des générations de candidats et de lauréats font vivre le concours et son ancrage local.</p></div></article>
      <article><strong>2026</strong><div><h3>Le virage digital</h3><p>La plateforme en ligne prend une place plus importante dans les profils, la galerie et le suivi de l’événement.</p></div></article>
      <article className="is-current"><strong>2027</strong><div><h3>Digital Experience</h3><p>Cinematic Editorial, Bento UI, contenus mobiles, backstage et expérience connectée deviennent le nouveau langage de la marque.</p></div></article>
    </div></div></section>

    <section className="mmd-section mmd-organization-section"><div className="mmd-container"><div className="mmd-section-heading"><h2>Organisation & <em>expérience digitale.</em></h2></div><div className="mmd-featured-partners"><article className="mmd-featured-partner-card"><span>ORGANISATION</span><h3>STARLIGHT ASBL</h3><p>Coordination et organisation de Miss & Mister Dour à Dour, Belgique.</p></article><article className="mmd-featured-partner-card"><span>EXPÉRIENCE DIGITALE</span><h3>JS-Innov.IA®</h3><p>Technologie, contenus et expérience connectée, avec une présence volontairement discrète au service de l’événement.</p></article></div></div></section>

    <section className="mmd-final-cta mmd-final-cta--compact"><div className="mmd-container mmd-final-content"><span className="mmd-final-eyebrow">ÉDITION 2027</span><h2>Entrez dans <em>l’aventure.</em></h2><p>Candidat, partenaire ou public : découvrez la prochaine édition.</p><div className="mmd-final-actions"><Link href="/inscription-candidat" className="mmd-final-dark-button">Candidater <ArrowRight/></Link><Link href="/candidates" className="mmd-final-outline-button">Les candidats</Link></div></div></section>
  </div>;
}
