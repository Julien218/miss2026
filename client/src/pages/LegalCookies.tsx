import { Cookie, Database, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";

const UPDATED = "11 septembre 2026";

export default function LegalCookies() {
  return <div className="mmd-public-page mmd-legal-page">
    <SEOHead title="Cookies — Miss & Mister Dour" description="Cookies et stockage local utilisés par la plateforme Miss & Mister Dour." url="https://missetmisterdour.be/legal/cookies" />
    <section className="mmd-public-hero mmd-legal-hero"><div className="mmd-container"><div className="mmd-public-kicker"><span>PRIVACY</span><i/>COOKIES</div><h1>Le minimum nécessaire <em>pour faire fonctionner le site.</em></h1><p>Politique mise à jour le {UPDATED}. Aucun outil publicitaire ou de suivi marketing n’est actuellement activé.</p></div></section>
    <section className="mmd-section"><div className="mmd-container mmd-legal-layout">
      <aside className="mmd-legal-summary"><Cookie/><strong>Choix simple</strong><p>Les mécanismes techniques indispensables à la session et à la sécurité ne peuvent pas être désactivés depuis le site. Aucune catégorie publicitaire n’est actuellement activée.</p></aside>
      <div className="mmd-legal-content">
        <LegalSection icon={<ShieldCheck/>} title="1. Cookies strictement nécessaires"><p>Les espaces connectés utilisent un cookie de session HttpOnly indispensable à l’authentification et à la sécurité. En production, ce cookie est transmis uniquement en HTTPS et utilise une politique SameSite limitant les requêtes cross-site.</p></LegalSection>
        <LegalSection icon={<Database/>} title="2. Stockage local sur votre appareil"><p>Le site utilise également le stockage local du navigateur pour mémoriser certains choix d’interface. Le formulaire de candidature peut y conserver un <strong>brouillon texte</strong> afin d’éviter de perdre votre saisie avant l’envoi. La photo sélectionnée n’est pas sauvegardée dans ce brouillon local.</p><p>La PWA utilise le cache du navigateur pour accélérer les ressources statiques. Les réponses de l’API ne sont pas mises en cache par le service worker.</p></LegalSection>
        <LegalSection icon={<SlidersHorizontal/>} title="3. Analytics et marketing"><p>Le script Analytics historique a été retiré de la version 2027. Aucun cookie marketing, publicitaire ou de profilage n’est actuellement requis par le site.</p><p>Si une catégorie optionnelle est activée à l’avenir, cette politique et l’interface de consentement devront être mises à jour avant son utilisation lorsque le consentement est requis.</p></LegalSection>
        <LegalSection icon={<Cookie/>} title="4. Effacer les données locales"><p>Vous pouvez effacer les cookies, le stockage local et le cache depuis les réglages de votre navigateur. La bannière actuelle sert à informer et à mémoriser que cette information a été lue ; elle n’active aucun tracker optionnel.</p><p>La suppression des données de session entraîne généralement une déconnexion des espaces privés.</p></LegalSection>
      </div>
    </div></section>
  </div>;
}

function LegalSection({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return <section className="mmd-legal-section"><header>{icon}<h2>{title}</h2></header><div>{children}</div></section>;
}
