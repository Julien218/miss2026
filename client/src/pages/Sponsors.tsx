import { Link } from "wouter";
import { ArrowRight, ExternalLink } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { BRANDING } from "@/config/branding";
import { SPONSORS_2026, SponsorVisual2026 } from "@/components/SponsorVisual2026";

const FEATURED = [
  {
    name: "STARLIGHT ASBL",
    role: "Organisation",
    description: "Organisation et coordination de l'événement Miss & Mister Dour.",
  },
  {
    name: "JS-Innov.IA®",
    role: "Expérience digitale",
    description: "Conception de l'expérience digitale et des outils connectés du projet.",
    website: "https://jsinnovia.com",
  },
];

export default function Sponsors() {
  return (
    <div className="mmd-public-page min-h-screen bg-black text-white">
      <SEOHead
        title="Partenaires & sponsors — Miss & Mister Dour 2027"
        description="Découvrez les partenaires de Miss & Mister Dour et les sponsors qui ont accompagné les éditions précédentes."
        url="https://missetmisterdour.be/sponsors"
        tags={["sponsors Miss Mister Dour", "partenaires Dour", "STARLIGHT ASBL"]}
      />

      <section className="mmd-public-hero">
        <div className="mmd-container">
          <div className="mmd-public-kicker">
            <span>08</span>
            <i />
            PARTENAIRES
          </div>
          <img
            src={BRANDING.logoIdentity}
            alt="Miss & Mister Dour"
            className="mmd-public-logo-mark"
          />
          <h1>
            Ceux qui font vivre <em>l'aventure.</em>
          </h1>
          <p>
            Entreprises, commerces, associations et partenaires : leur soutien accompagne
            Miss & Mister Dour sur scène, dans les coulisses et dans son développement.
          </p>
        </div>
      </section>

      <section className="mmd-section">
        <div className="mmd-container">
          <div className="mmd-section-heading">
            <h2>
              Les piliers de <em>l'expérience.</em>
            </h2>
          </div>
          <div className="mmd-featured-partners">
            {FEATURED.map((partner) => (
              <article key={partner.name} className="mmd-featured-partner-card">
                <span>{partner.role}</span>
                <h3>{partner.name}</h3>
                <p>{partner.description}</p>
                {partner.website && (
                  <a href={partner.website} target="_blank" rel="noopener noreferrer">
                    Découvrir <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mmd-section mmd-historical-sponsors-section">
        <div className="mmd-container">
          <div className="mmd-public-kicker">
            <span>2026</span>
            <i />
            ILS NOUS ONT SOUTENUS
          </div>
          <div className="mmd-section-heading">
            <h2>
              Les partenaires de <em>l'édition précédente.</em>
            </h2>
            <p className="mmd-section-copy">
              Nous conservons leur présence dans l'histoire du concours. Ces 43 visuels
              correspondent aux partenaires et communications de l'édition 2026 et ne préjugent
              pas des partenariats 2027.
            </p>
          </div>

          <div className="mmd-sponsor-wall">
            {SPONSORS_2026.map((sponsor) => (
              <article className="mmd-sponsor-tile" key={sponsor.index}>
                <SponsorVisual2026 index={sponsor.index} label={sponsor.name} />
                {sponsor.name && <span>{sponsor.name}</span>}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mmd-final-cta mmd-final-cta--compact">
        <div className="mmd-container mmd-final-content">
          <span className="mmd-final-eyebrow">Associer votre image à l'édition 2027</span>
          <h2>
            Devenez <em>partenaire.</em>
          </h2>
          <p>Construisons une collaboration visible, locale et cohérente avec votre activité.</p>
          <div className="mmd-final-actions">
            <Link href="/contact" className="mmd-final-dark-button">
              Nous contacter <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/" className="mmd-final-outline-button">
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
