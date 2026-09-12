import { Link } from "wouter";
import { ArrowRight, ExternalLink } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { SponsorOrbit2027 } from "@/components/SponsorOrbit2027";

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

      <SponsorOrbit2027 />

      <div className="mmd-sponsor-below">
        <section className="mmd-section">
          <div className="mmd-container">
            <div className="mmd-sponsor-featured-intro">
              <h2>
                Les piliers de <em>l'expérience.</em>
              </h2>
              <p>
                Entreprises, commerces, associations et partenaires : leur soutien accompagne
                Miss & Mister Dour sur scène, dans les coulisses et dans son développement.
              </p>
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
    </div>
  );
}
