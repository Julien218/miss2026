import { Link } from "wouter";
import { Copyright, Globe, Mail, Scale, Shield } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { BRANDING } from "@/config/branding";

const UPDATED = "10 septembre 2026";

export default function LegalNotice() {
  return <div className="mmd-public-page mmd-legal-page">
    <SEOHead title="Mentions légales — Miss & Mister Dour" description="Mentions légales et informations d’édition du site officiel Miss & Mister Dour." url="https://missetmisterdour.be/mentions-legales" />
    <section className="mmd-public-hero mmd-legal-hero"><div className="mmd-container"><div className="mmd-public-kicker"><span>LEGAL</span><i/>MENTIONS LÉGALES</div><h1>Qui porte <em>la plateforme.</em></h1><p>Informations mises à jour le {UPDATED}.</p></div></section>
    <section className="mmd-section"><div className="mmd-container mmd-legal-layout">
      <aside className="mmd-legal-summary"><Scale/><strong>Site officiel</strong><p>missetmisterdour.be est la plateforme numérique officielle utilisée pour l’édition 2027 et les archives de Miss & Mister Dour.</p><Link href="/contact">Contacter l’équipe →</Link></aside>
      <div className="mmd-legal-content">
        <LegalSection icon={<Scale/>} title="1. Organisation et publication"><p>L’événement Miss & Mister Dour est organisé par <strong>{BRANDING.contact.organizer}</strong>, {BRANDING.contact.address}. Le contact de l’organisation est disponible à l’adresse <a href={`mailto:${BRANDING.contact.email}`}>{BRANDING.contact.email}</a> et au <a href={`tel:${BRANDING.contact.phone.replace(/\s/g, "")}`}>{BRANDING.contact.phone}</a>.</p><p>La conception, le développement et la maintenance de l’expérience numérique sont assurés avec <strong>JS-Innov.IA®</strong>.</p></LegalSection>
        <LegalSection icon={<Globe/>} title="2. Infrastructure technique"><p>L’application web et la base de données MySQL sont hébergées sur <strong>Railway</strong>. Les médias de candidature et autres fichiers applicatifs concernés sont stockés sur <strong>Cloudflare R2</strong>. L’authentification principale des espaces réservés est gérée par le système local de la plateforme.</p><p>Ces services techniques peuvent évoluer si cela est nécessaire à la sécurité, aux performances ou à la continuité du site ; la politique de confidentialité est mise à jour lorsqu’un changement affecte le traitement des données personnelles.</p></LegalSection>
        <LegalSection icon={<Copyright/>} title="3. Propriété intellectuelle"><p>La marque, le logo, les textes, photographies, vidéos, créations graphiques et éléments logiciels sont protégés selon leurs titulaires respectifs. Le logo officiel ne doit pas être déformé, recoloré ou utilisé comme élément commercial sans autorisation.</p><p>Les ressources mises à disposition de la presse restent soumises aux conditions précisées sur la <Link href="/press">page Presse</Link>.</p></LegalSection>
        <LegalSection icon={<Shield/>} title="4. Responsabilité"><p>Les informations publiques sont mises à jour avec soin. Les dates, lieux et règles d’une édition ne sont considérés comme définitifs que lorsqu’ils sont explicitement annoncés par l’organisation. Le site peut être momentanément indisponible pour maintenance ou en raison d’un incident chez un prestataire technique.</p></LegalSection>
        <LegalSection icon={<Mail/>} title="5. Contact"><p>Pour une question liée à l’événement, une candidature, un partenariat, une demande média ou l’exercice d’un droit relatif aux données personnelles, utilisez la <Link href="/contact">page Contact</Link> ou écrivez à <a href={`mailto:${BRANDING.contact.email}`}>{BRANDING.contact.email}</a>.</p></LegalSection>
      </div>
    </div></section>
  </div>;
}

function LegalSection({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return <section className="mmd-legal-section"><header>{icon}<h2>{title}</h2></header><div>{children}</div></section>;
}
