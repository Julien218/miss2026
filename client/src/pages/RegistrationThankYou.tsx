import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight, Check, Facebook, Home, Instagram, Share2 } from "lucide-react";
import { BRANDING } from "@/config/branding";
import { SEOHead } from "@/components/SEOHead";

export default function RegistrationThankYou() {
  const share = async () => {
    const payload = {
      title: "Miss & Mister Dour 2027",
      text: "Je viens d'envoyer ma candidature pour Miss & Mister Dour 2027.",
      url: window.location.origin,
    };
    if (navigator.share) {
      await navigator.share(payload).catch(() => undefined);
      return;
    }
    await navigator.clipboard?.writeText(window.location.origin).catch(() => undefined);
  };

  return (
    <div className="mmd-public-page mmd-thankyou-page">
      <SEOHead
        title="Candidature enregistrée — Miss & Mister Dour 2027"
        description="Confirmation de candidature à Miss & Mister Dour 2027."
        url="https://missetmisterdour.be/inscription-merci"
      />
      <section className="mmd-public-hero mmd-thankyou-hero">
        <div className="mmd-container mmd-thankyou-wrap">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mmd-thankyou-check"
          >
            <Check />
          </motion.div>
          <div className="mmd-public-kicker"><span>2027</span><i/>CANDIDATURE REÇUE</div>
          <h1>Votre candidature est <em>enregistrée.</em></h1>
          <p>Merci d’avoir rejoint l’aventure Miss & Mister Dour 2027. L’équipe examinera votre dossier et vous contactera pour la suite.</p>
        </div>
      </section>

      <section className="mmd-section">
        <div className="mmd-container mmd-thankyou-grid">
          <article><span>01</span><h2>Vérification</h2><p>L’équipe contrôle les informations et les éléments nécessaires à votre candidature.</p></article>
          <article><span>02</span><h2>Validation</h2><p>Après validation, votre profil pourra être complété et préparé pour sa publication officielle.</p></article>
          <article><span>03</span><h2>Publication</h2><p>Les profils approuvés apparaissent dans l’expérience publique Miss & Mister Dour.</p></article>
          <article><span>04</span><h2>La suite</h2><p>Les dates, rendez-vous et informations de l’édition 2027 vous seront communiqués lorsqu’ils seront confirmés.</p></article>
        </div>
      </section>

      <section className="mmd-section mmd-thankyou-actions-section">
        <div className="mmd-container mmd-thankyou-actions">
          <div><span className="mmd-overline">RESTEZ CONNECTÉ</span><h2>Suivez <em>l’aventure.</em></h2></div>
          <div className="mmd-thankyou-buttons">
            <Link href="/" className="mmd-primary-button"><Home />Retour à l’accueil</Link>
            <button type="button" onClick={share} className="mmd-secondary-button"><Share2 />Partager</button>
          </div>
          <div className="mmd-social-links">
            <a href={BRANDING.socialMedia.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Instagram /></a>
            <a href={BRANDING.socialMedia.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook"><Facebook /></a>
          </div>
        </div>
      </section>

      <section className="mmd-final-cta mmd-final-cta--compact">
        <div className="mmd-container mmd-final-content">
          <span className="mmd-final-eyebrow">DÉCOUVRIR L’ÉDITION</span>
          <h2>Les autres <em>candidats.</em></h2>
          <p>Découvrez les profils déjà validés et publiés.</p>
          <div className="mmd-final-actions"><Link href="/candidates" className="mmd-final-dark-button">Voir les profils <ArrowRight /></Link></div>
        </div>
      </section>
    </div>
  );
}
