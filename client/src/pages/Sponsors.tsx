import { Link } from "wouter";
import { ArrowRight, Award, Crown, ExternalLink, Heart } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { BRANDING } from "@/config/branding";

const ASSET_BASE =
  "https://raw.githubusercontent.com/Julien218/miss-mister-dour-web/main/client/public/sponsors";

type HistoricalSponsor = { file: string; name?: string };

const HISTORICAL_SPONSORS: HistoricalSponsor[] = [
  { file: "aromes-et-delices.jpg", name: "Arômes et Délices" },
  { file: "art-2-danse.jpg", name: "ART 2 DANSE" },
  { file: "baccara.jpg", name: "Baccara" },
  { file: "barbara.jpg", name: "Barbara" },
  { file: "belfius.jpg", name: "Belfius" },
  { file: "beobank.png", name: "Beobank" },
  { file: "blio-nails.jpg", name: "Blio Nails" },
  { file: "business-marketing-agency.jpg", name: "Business Marketing Agency" },
  { file: "cg-car.jpg", name: "CG Car" },
  { file: "danse-dour.jpg", name: "Danse Dour" },
  { file: "don-bosco.png", name: "Don Bosco" },
  { file: "dour-materiaux.jpg", name: "Dour Matériaux" },
  { file: "drj.jpg", name: "DRJ" },
  { file: "etiacel.jpg", name: "Etiacel" },
  { file: "ferrbatir.jpg", name: "Ferrbatir" },
  { file: "fun-zone.png", name: "Fun Zone Dour" },
  { file: "js-innovia.jpg", name: "JS-Innov.IA" },
  { file: "l-indispensable.jpg", name: "L'Indispensable" },
  { file: "la-perla.png", name: "La Perla" },
  { file: "la-saline.jpg", name: "La Saline" },
  { file: "mmd-pics-prod.jpg", name: "MMD Pics & Prod" },
  { file: "piazetta.jpg", name: "Piazetta" },
  { file: "place-to-be.jpg", name: "Place To Be" },
  { file: "publidesign.png", name: "PubliDesign" },
  { file: "pv-dour.jpg", name: "PV Dour" },
  { file: "resto-cablerie.png", name: "Resto Cablerie" },
  { file: "rsmb.jpg", name: "RSMB" },
  { file: "sponsor-01.jpg" }, { file: "sponsor-02.jpg" }, { file: "sponsor-03.jpg" },
  { file: "sponsor-04.jpg" }, { file: "sponsor-05.jpg" }, { file: "sponsor-06.jpg" },
  { file: "sponsor-07.png" }, { file: "sponsor-08.png" }, { file: "sponsor-09.png" },
  { file: "sponsor-10.png" }, { file: "sponsor-11.png" }, { file: "sponsor-12.png" },
  { file: "sponsor-13.jpg" }, { file: "sponsor-14.jpg" },
  { file: "table-auguste.jpg", name: "Table Auguste" },
  { file: "verpoort-jb.jpg", name: "Verpoort JB" },
];

const FEATURED = [
  {
    name: "JS-Innov.IA®",
    role: "Expérience digitale",
    description: "Technologie et expérience connectée au service de Miss & Mister Dour.",
    website: "https://jsinnovia.com",
  },
  {
    name: "STARLIGHT ASBL",
    role: "Organisation",
    description: "Organisation et coordination de l'événement Miss & Mister Dour.",
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
          <div className="mmd-public-kicker"><span>08</span><i />PARTENAIRES</div>
          <img src={BRANDING.logoIdentity} alt="Miss & Mister Dour" className="mmd-public-logo-mark" />
          <h1>Ceux qui font vivre <em>l’aventure.</em></h1>
          <p>
            Entreprises, commerces, associations et partenaires : leur soutien accompagne
            Miss & Mister Dour sur scène, dans les coulisses et dans son développement.
          </p>
        </div>
      </section>

      <section className="mmd-section">
        <div className="mmd-container">
          <div className="mmd-section-heading">
            <h2>Les piliers de <em>l’expérience.</em></h2>
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
          <div className="mmd-public-kicker"><span>2026</span><i />ILS NOUS ONT SOUTENUS</div>
          <div className="mmd-section-heading">
            <h2>Les partenaires de <em>l’édition précédente.</em></h2>
            <p className="mmd-section-copy">
              Nous conservons leur présence dans l’histoire du concours. Ces logos correspondent
              au mur de partenaires de l’édition 2026 et ne préjugent pas des partenariats 2027.
            </p>
          </div>

          <div className="mmd-sponsor-wall">
            {HISTORICAL_SPONSORS.map((sponsor) => (
              <article className="mmd-sponsor-tile" key={sponsor.file}>
                <img
                  src={`${ASSET_BASE}/${sponsor.file}`}
                  alt={sponsor.name ? `Logo ${sponsor.name}` : "Logo partenaire Miss & Mister Dour 2026"}
                  loading="lazy"
                />
                {sponsor.name && <span>{sponsor.name}</span>}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mmd-final-cta mmd-final-cta--compact">
        <div className="mmd-container mmd-final-content">
          <span className="mmd-final-eyebrow">Associer votre image à l’édition 2027</span>
          <h2>Devenez <em>partenaire.</em></h2>
          <p>Construisons une collaboration visible, locale et cohérente avec votre activité.</p>
          <div className="mmd-final-actions">
            <Link href="/contact" className="mmd-final-dark-button">
              Nous contacter <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/" className="mmd-final-outline-button">Retour à l’accueil</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
