import { Link } from "wouter";
import { SEOHead } from "@/components/SEOHead";

import { Award, ExternalLink, Heart, Crown } from "lucide-react";
import { BRANDING } from "@/config/branding";

export default function Sponsors() {
  // Sponsors officiels (à remplacer par données dynamiques depuis DB)
  const mainSponsors = [
    {
      name: "Centre Sportif d'Elouges",
      logo: "https://via.placeholder.com/300x150/D4AF37/000000?text=Centre+Culturel+Dour",
      description: "Organisateur principal et partenaire culturel majeur de l'événement.",
      website: "https://centrecultureldour.be",
      tier: "Partenaire Principal"
    },
    {
      name: "Js-Innov.IA",
      logo: "https://via.placeholder.com/300x150/D4AF37/000000?text=Js-Innov.IA",
      description: "Partenaire technologique officiel - Développement plateforme IA, blockchain, génération vidéo.",
      website: "https://jsinnovia.com",
      tier: "Partenaire Technologique"
    }
  ];

  const goldSponsors = [
    {
      name: "Sponsor Gold 1",
      logo: "https://via.placeholder.com/250x125/FFD700/000000?text=Gold+Sponsor+1",
      description: "Description du sponsor gold 1.",
      website: "#"
    },
    {
      name: "Sponsor Gold 2",
      logo: "https://via.placeholder.com/250x125/FFD700/000000?text=Gold+Sponsor+2",
      description: "Description du sponsor gold 2.",
      website: "#"
    }
  ];

  const silverSponsors = [
    {
      name: "Sponsor Silver 1",
      logo: "https://via.placeholder.com/200x100/C0C0C0/000000?text=Silver+1",
      website: "#"
    },
    {
      name: "Sponsor Silver 2",
      logo: "https://via.placeholder.com/200x100/C0C0C0/000000?text=Silver+2",
      website: "#"
    },
    {
      name: "Sponsor Silver 3",
      logo: "https://via.placeholder.com/200x100/C0C0C0/000000?text=Silver+3",
      website: "#"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white">
      <SEOHead
        title="Sponsors & Partenaires — Miss & Mister Dour 2026"
        description="Découvrez les sponsors et partenaires officiels du concours Miss & Mister Dour 2026. Rejoignez-nous pour soutenir l'excellence belge."
        url="https://missetmisterdour.be/sponsors"
        tags={["sponsors Miss Dour", "partenaires Dour", "STARLIGHT ASBL"]}
      />
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-black/80 border-b border-gold/20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <img
                src={BRANDING.logoIdentity}
                alt="Logo officiel Miss & Mister Dour 2026"
                className="h-14 max-[640px]:h-10 object-contain drop-shadow-[0_0_8px_rgba(212,175,55,0.6)]"
                loading="eager"
              />
            </Link>
          <Link href="/" className="text-gold hover:text-gold/80 transition-colors font-medium">
              Retour à l'accueil
            </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gold/10 via-transparent to-gold/10" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <Award className="w-16 h-16 mx-auto mb-6 text-gold animate-pulse" />
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-gold via-yellow-300 to-gold bg-clip-text text-transparent">
            Nos Sponsors
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
            Ils nous font confiance et soutiennent l'excellence
          </p>
        </div>
      </section>

      {/* Partenaires Principaux */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-12 justify-center">
              <Crown className="w-8 h-8 text-gold" />
              <h2 className="text-4xl font-bold text-gold">Partenaires Principaux</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {mainSponsors.map((sponsor, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-gold/10 to-transparent border-2 border-gold/40 rounded-lg p-8 hover:border-gold/60 transition-all group"
                >
                  <div className="bg-white rounded-lg p-6 mb-6 flex items-center justify-center h-32">
                    <img
                      src={sponsor.logo}
                      alt={`Logo ${sponsor.name}`}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <div className="mb-3">
                    <span className="inline-block px-3 py-1 bg-gold/20 text-gold text-sm font-bold rounded-full mb-3">
                      {sponsor.tier}
                    </span>
                    <h3 className="text-2xl font-bold text-white mb-2">{sponsor.name}</h3>
                  </div>
                  <p className="text-gray-300 mb-4 leading-relaxed">{sponsor.description}</p>
                  <a
                    href={sponsor.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-gold hover:text-gold/80 transition-colors font-medium group-hover:gap-3"
                  >
                    Visiter le site
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Sponsors Gold */}
      <section className="py-16 bg-gradient-to-b from-transparent to-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-12 justify-center">
              <Award className="w-8 h-8 text-yellow-400" />
              <h2 className="text-4xl font-bold text-yellow-400">Sponsors Gold</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {goldSponsors.map((sponsor, index) => (
                <div
                  key={index}
                  className="bg-gray-800/50 border border-yellow-400/30 rounded-lg p-6 hover:border-yellow-400/50 transition-all group"
                >
                  <div className="bg-white rounded-lg p-4 mb-4 flex items-center justify-center h-24">
                    <img
                      src={sponsor.logo}
                      alt={`Logo ${sponsor.name}`}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{sponsor.name}</h3>
                  <p className="text-gray-400 text-sm mb-3">{sponsor.description}</p>
                  <a
                    href={sponsor.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-yellow-400 hover:text-yellow-300 transition-colors text-sm"
                  >
                    En savoir plus
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Sponsors Silver */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-12 justify-center">
              <Award className="w-8 h-8 text-gray-400" />
              <h2 className="text-4xl font-bold text-gray-400">Sponsors Silver</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {silverSponsors.map((sponsor, index) => (
                <a
                  key={index}
                  href={sponsor.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-800/50 border border-gray-400/20 rounded-lg p-4 hover:border-gray-400/40 transition-all group"
                >
                  <div className="bg-white rounded-lg p-3 flex items-center justify-center h-20">
                    <img
                      src={sponsor.logo}
                      alt={`Logo ${sponsor.name}`}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <p className="text-center text-gray-300 text-sm mt-3 group-hover:text-white transition-colors">
                    {sponsor.name}
                  </p>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Devenir Sponsor */}
      <section className="py-16 bg-gradient-to-b from-transparent to-black">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Heart className="w-16 h-16 mx-auto mb-6 text-gold" />
            <h2 className="text-4xl font-bold text-gold mb-6">Devenez Sponsor</h2>
            <p className="text-gray-300 text-lg leading-relaxed mb-8">
              Rejoignez les partenaires qui soutiennent Miss & Mister Dour et bénéficiez d'une 
              visibilité exceptionnelle lors de l'événement le plus prestigieux de Belgique.
            </p>
            <div className="bg-gradient-to-br from-gold/10 to-transparent border border-gold/30 rounded-lg p-8 mb-8">
              <h3 className="text-2xl font-bold text-gold mb-4">Avantages Sponsors</h3>
              <ul className="text-left text-gray-300 space-y-3 max-w-2xl mx-auto">
                <li className="flex items-start gap-3">
                  <span className="text-gold">✓</span>
                  <span>Logo affiché sur tous les supports de communication (site web, réseaux sociaux, affiches)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-gold">✓</span>
                  <span>Mention lors de la soirée de couronnement (avril 2026)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-gold">✓</span>
                  <span>Accès VIP à l'événement avec places réservées</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-gold">✓</span>
                  <span>Visibilité internationale (diffusion en direct, médias européens)</span>
                </li>
              </ul>
            </div>
            <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-3 bg-gold text-black font-bold rounded-lg hover:bg-gold/90 transition-colors">
                Nous Contacter
                <ExternalLink className="w-5 h-5" />
              </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
