import { ExternalLink, Sparkles } from "lucide-react";
import { SponsorOrbit2027 } from "@/components/SponsorOrbit2027";

export default function SponsorShowcase() {
  return (
    <main className="mmd-showcase mmd-showcase--sponsors">
      <header className="mmd-showcase-topbar">
        <div>
          <span>MISS & MISTER DOUR · 2027</span>
          <strong>Dossier partenaires interactif</strong>
        </div>
        <a href="https://www.missetmisterdour.be/sponsors" target="_blank" rel="noreferrer">
          Site officiel <ExternalLink />
        </a>
      </header>

      <SponsorOrbit2027 />

      <section className="mmd-showcase-note">
        <Sparkles />
        <div>
          <span>EXPÉRIENCE NUMÉRIQUE</span>
          <strong>Une présentation qui respecte chaque identité visuelle.</strong>
          <p>
            Logos, affiches et créations commerciales conservent leurs proportions. La carte centrale
            s’adapte au format réel de chaque partenaire et se retourne automatiquement pour présenter
            le suivant.
          </p>
        </div>
      </section>

      <footer className="mmd-showcase-signature">
        Direction digitale & mise en scène visuelle par JS-Innov.IA®
      </footer>
    </main>
  );
}
