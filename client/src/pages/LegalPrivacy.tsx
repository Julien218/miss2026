import { Link } from "wouter";
import { Database, Eye, Lock, Mail, Server, Shield, Trash2, UserCheck } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { BRANDING } from "@/config/branding";

const UPDATED = "11 septembre 2026";
const APD = "https://www.autoriteprotectiondonnees.be";

export default function LegalPrivacy() {
  return <div className="mmd-public-page mmd-legal-page">
    <SEOHead title="Confidentialité — Miss & Mister Dour" description="Informations sur le traitement des données personnelles sur la plateforme Miss & Mister Dour." url="https://missetmisterdour.be/legal/privacy" />
    <section className="mmd-public-hero mmd-legal-hero"><div className="mmd-container"><div className="mmd-public-kicker"><span>RGPD</span><i/>CONFIDENTIALITÉ</div><h1>Vos données, <em>avec transparence.</em></h1><p>Informations mises à jour le {UPDATED} pour refléter l’infrastructure et les protections effectivement utilisées par la plateforme.</p></div></section>
    <section className="mmd-section"><div className="mmd-container mmd-legal-layout">
      <aside className="mmd-legal-summary"><Shield/><strong>Principe</strong><p>Les données sont utilisées pour exploiter le site, traiter les candidatures, sécuriser les comptes et communiquer avec les personnes concernées. Elles ne sont pas vendues à des annonceurs.</p><a href={`mailto:${BRANDING.contact.email}`}>{BRANDING.contact.email}</a></aside>
      <div className="mmd-legal-content">
        <LegalSection icon={<UserCheck/>} title="1. Qui intervient ?"><p><strong>{BRANDING.contact.organizer}</strong> organise Miss & Mister Dour. JS-Innov.IA® assure la conception et la maintenance de la plateforme numérique. Les demandes relatives aux données peuvent être adressées à l’organisation via <a href={`mailto:${BRANDING.contact.email}`}>{BRANDING.contact.email}</a>.</p></LegalSection>
        <LegalSection icon={<Database/>} title="2. Données traitées"><p>Selon votre utilisation : nom, prénom, coordonnées, date de naissance, ville, catégorie de candidature, biographie, motivation, profession/études, réseaux sociaux facultatifs, photo, consentements, données techniques de connexion, votes, partages, commentaires et messages adressés à l’équipe.</p><p>Le formulaire public de candidature 2027 est configuré pour des personnes majeures. Les informations d’un dossier restent privées jusqu’à validation de l’équipe.</p></LegalSection>
        <LegalSection icon={<Eye/>} title="3. Finalités"><p>Les données servent notamment à traiter les candidatures, créer les profils approuvés, faire fonctionner les votes et classements, répondre aux demandes, administrer les espaces privés, prévenir les abus et publier les contenus autorisés.</p><p>Les commentaires publics passent par une modération humaine avant publication. Les données facultatives, comme certains réseaux sociaux ou l’abonnement aux actualités, ne sont utilisées que lorsqu’elles ont été fournies ou acceptées.</p></LegalSection>
        <LegalSection icon={<Server/>} title="4. Hébergement et stockage"><p>L’application et sa base MySQL sont exploitées sur <strong>Railway</strong>. Les médias envoyés via le formulaire sont stockés sur <strong>Cloudflare R2</strong>, service de stockage compatible S3. L’authentification principale des espaces protégés est gérée localement par la plateforme.</p><p>Les polices web peuvent être chargées depuis Google Fonts. Les prestataires techniques traitent uniquement les données nécessaires à la fourniture de leurs services, selon leurs propres engagements contractuels et les obligations applicables.</p></LegalSection>
        <LegalSection icon={<Lock/>} title="5. Durée et sécurité"><p>Les données sont conservées pendant la durée nécessaire aux finalités annoncées, à la gestion de l’édition et aux obligations légales ou de preuve applicables. Les dossiers refusés ou devenus inutiles peuvent être supprimés ou archivés selon les besoins légitimes de l’organisation.</p><p>Les accès administrateur sont protégés par authentification et contrôle de rôle. Les identifiants réseau utilisés par les mécanismes anti-abus (candidatures, votes, commentaires) sont transformés en empreintes cryptographiques afin d’éviter de conserver l’adresse IP brute dans ces workflows.</p></LegalSection>
        <LegalSection icon={<Trash2/>} title="6. Vos droits"><p>Selon les conditions prévues par le RGPD, vous pouvez demander l’accès, la rectification, l’effacement, la limitation ou la portabilité de vos données, retirer un consentement lorsqu’il constitue la base du traitement, ou vous opposer à certains traitements.</p><p>Pour exercer un droit, contactez <a href={`mailto:${BRANDING.contact.email}`}>{BRANDING.contact.email}</a> en précisant la demande. Une vérification d’identité proportionnée peut être demandée afin de protéger les données concernées.</p></LegalSection>
        <LegalSection icon={<Mail/>} title="7. Réclamation"><p>Vous pouvez également contacter l’<a href={APD} target="_blank" rel="noopener noreferrer">Autorité de protection des données</a> en Belgique si vous estimez que le traitement de vos données ne respecte pas vos droits.</p><p>Consultez également la <Link href="/legal/cookies">politique relative aux cookies et au stockage local</Link>.</p></LegalSection>
      </div>
    </div></section>
  </div>;
}

function LegalSection({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return <section className="mmd-legal-section"><header>{icon}<h2>{title}</h2></header><div>{children}</div></section>;
}
