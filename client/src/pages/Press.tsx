import { Copyright, ExternalLink, Image, Mail, Newspaper } from "lucide-react";
import { Link } from "wouter";
import { BRANDING } from "@/config/branding";
import { SEOHead } from "@/components/SEOHead";

export default function Press(){
  return <div className="mmd-public-page">
    <SEOHead title="Presse — Miss & Mister Dour 2027" description="Espace presse officiel de Miss & Mister Dour : identité visuelle, galerie et contacts." url="https://missetmisterdour.be/press" />
    <section className="mmd-public-hero"><div className="mmd-container">
      <div className="mmd-public-kicker"><span>MEDIA</span><i/>ESPACE PRESSE</div>
      <img src={BRANDING.logoIdentity} alt="Miss & Mister Dour" className="mmd-public-logo-mark"/>
      <h1>L’histoire à raconter. <em>Les ressources pour la raconter.</em></h1>
      <p>Identité officielle, contenus visuels et point de contact pour les journalistes, médias et créateurs couvrant Miss & Mister Dour.</p>
    </div></section>

    <section className="mmd-section"><div className="mmd-container"><div className="mmd-section-heading"><h2>Ressources <em>officielles.</em></h2></div><div className="mmd-press-grid">
      <a className="mmd-press-card" href={BRANDING.logoIdentity} target="_blank" rel="noopener noreferrer"><Image/><span>IDENTITÉ</span><h3>Logo officiel</h3><p>Le logo de référence Miss & Mister Dour, à utiliser sans déformation ni modification de couleur.</p><strong>Ouvrir le visuel <ExternalLink/></strong></a>
      <Link className="mmd-press-card" href="/gallery"><Newspaper/><span>IMAGES</span><h3>Galerie officielle</h3><p>Portraits, shootings et contenus publiés de l’événement.</p><strong>Voir la galerie <ExternalLink/></strong></Link>
      <Link className="mmd-press-card" href="/contact"><Mail/><span>CONTACT</span><h3>Demande média</h3><p>Interview, information, collaboration ou demande d’accréditation.</p><strong>Nous écrire <ExternalLink/></strong></Link>
    </div></div></section>

    <section className="mmd-section mmd-press-identity"><div className="mmd-container mmd-about-intro"><div><span className="mmd-overline">IDENTITÉ VISUELLE</span><h2>Une marque à respecter <em>dans chaque publication.</em></h2></div><div className="mmd-logo-showcase"><div className="is-dark"><img src={BRANDING.logoIdentity} alt="Logo sur fond noir"/></div><div className="is-light"><img src={BRANDING.logoIdentity} alt="Logo sur fond clair"/></div></div></div></section>

    <section className="mmd-section"><div className="mmd-container"><div className="mmd-legal-note"><Copyright/><div><h3>Utilisation presse</h3><p>Les contenus, visuels et logos restent protégés. L’utilisation éditoriale dans le cadre d’une couverture presse doit conserver l’identité du visuel et créditer Miss & Mister Dour lorsque cela est pertinent.</p></div></div></div></section>

    <section className="mmd-final-cta mmd-final-cta--compact"><div className="mmd-container mmd-final-content"><span className="mmd-final-eyebrow">CONTACT MÉDIA</span><h2>Une question, une interview, <em>un projet ?</em></h2><p>Utilisez le formulaire de contact pour orienter votre demande vers l’équipe.</p><div className="mmd-final-actions"><Link href="/contact" className="mmd-final-dark-button">Contacter l’équipe</Link></div></div></section>
  </div>;
}
