import { Link } from "wouter";
import { FileText, ShieldCheck, UserRound, Camera, Scale, Vote } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { BRANDING } from "@/config/branding";

const UPDATED = "10 septembre 2026";

export default function LegalCGU() {
  return <div className="mmd-public-page mmd-legal-page">
    <SEOHead title="Conditions d’utilisation — Miss & Mister Dour" description="Conditions d’utilisation de la plateforme officielle Miss & Mister Dour." url="https://missetmisterdour.be/legal/cgu" />
    <section className="mmd-public-hero mmd-legal-hero"><div className="mmd-container"><div className="mmd-public-kicker"><span>LEGAL</span><i/>CONDITIONS D’UTILISATION</div><h1>Un cadre clair pour <em>l’expérience digitale.</em></h1><p>Version mise à jour le {UPDATED}. Ces conditions concernent l’utilisation du site et de ses services numériques.</p></div></section>
    <section className="mmd-section"><div className="mmd-container mmd-legal-layout">
      <aside className="mmd-legal-summary"><FileText/><strong>À retenir</strong><p>Les dates, critères définitifs, modalités de sélection et règles de l’édition 2027 sont communiqués séparément par l’organisation lorsqu’ils sont officiellement confirmés.</p><Link href="/contact">Une question ? Nous contacter →</Link></aside>
      <div className="mmd-legal-content">
        <LegalSection icon={<FileText/>} title="1. Objet de la plateforme"><p>Le site <strong>missetmisterdour.be</strong> présente Miss & Mister Dour, ses candidats, contenus, partenaires, actualités et outils de participation. L’événement est organisé par <strong>{BRANDING.contact.organizer}</strong>. L’expérience digitale est conçue et maintenue avec JS-Innov.IA®.</p><p>L’utilisation du site implique le respect des présentes conditions ainsi que, pour les candidats, du règlement de participation communiqué par l’organisation.</p></LegalSection>
        <LegalSection icon={<UserRound/>} title="2. Candidatures et comptes"><p>Le formulaire public 2027 recueille les informations nécessaires à l’étude d’une candidature. Un envoi ne vaut pas acceptation : le dossier est examiné humainement dans le cockpit avant toute publication.</p><p>Le parcours public est actuellement configuré pour les personnes majeures jusqu’à 35 ans. L’organisation peut préciser les conditions définitives dans son règlement officiel avant validation d’une candidature.</p><p>Les utilisateurs disposant d’un espace privé doivent conserver leurs identifiants confidentiels et signaler rapidement toute utilisation non autorisée.</p></LegalSection>
        <LegalSection icon={<Camera/>} title="3. Photos, vidéos et droit à l’image"><p>Une candidature nécessite l’accord explicite aux conditions média présentées dans le formulaire. Les photos et vidéos ne sont pas automatiquement rendues publiques : elles sont soumises au workflow de validation de l’équipe.</p><p>Les contenus fournis doivent pouvoir être utilisés légitimement par leur auteur ou la personne qui les transmet. Toute demande de correction ou de retrait peut être adressée via la page Contact.</p></LegalSection>
        <LegalSection icon={<Vote/>} title="4. Votes, classements et interactions"><p>Les mécanismes de vote, partage et classement peuvent évoluer selon l’édition. Les mesures techniques de prévention des abus peuvent notamment limiter des actions répétées. L’organisation conserve la responsabilité de valider les résultats officiels.</p></LegalSection>
        <LegalSection icon={<ShieldCheck/>} title="5. Disponibilité et sécurité"><p>L’équipe met en œuvre des mesures raisonnables pour assurer la continuité et la sécurité du service. Une maintenance, une panne d’un prestataire ou un incident réseau peut toutefois rendre certaines fonctions temporairement indisponibles.</p><p>Il est interdit de tenter de contourner l’authentification, les limitations de vote, les contrôles d’accès ou toute autre mesure de sécurité.</p></LegalSection>
        <LegalSection icon={<Scale/>} title="6. Propriété intellectuelle et droit applicable"><p>L’identité Miss & Mister Dour, les contenus éditoriaux, photographies, créations et éléments logiciels restent protégés selon leurs titulaires respectifs. Aucune réutilisation commerciale ou modification du logo officiel n’est autorisée sans accord.</p><p>Le site est exploité depuis la Belgique. Les règles impératives du droit belge et européen applicables restent d’application. Pour toute question ou réclamation, privilégiez d’abord le contact avec l’organisation.</p></LegalSection>
      </div>
    </div></section>
  </div>;
}

function LegalSection({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return <section className="mmd-legal-section"><header>{icon}<h2>{title}</h2></header><div>{children}</div></section>;
}
