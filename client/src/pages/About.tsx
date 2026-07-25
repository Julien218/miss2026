import { Link } from "wouter";
import { Crown, Heart, Users, Calendar, Sparkles, Award, MapPin, ExternalLink, Navigation } from "lucide-react";
import { useRef } from "react";
import { MapView } from "@/components/Map";
import { BRANDING } from "@/config/branding";
import { SEOHead } from "@/components/SEOHead";

// Coordonnées GPS du Centre Sportif d'Elouges, Rue de la Tournelle 10, 7370 Elouges
const VENUE_COORDS = { lat: 50.3978, lng: 3.7732 };

export default function About() {
  const mapRef = useRef<google.maps.Map | null>(null);

  const handleMapReady = (map: google.maps.Map) => {
    mapRef.current = map;

    // Marqueur avancé pour le Centre Sportif d'Elouges
    const marker = new window.google.maps.marker.AdvancedMarkerElement({
      map,
      position: VENUE_COORDS,
      title: "Centre Sportif d'Elouges",
    });

    // InfoWindow avec les détails du lieu
    const infoWindow = new window.google.maps.InfoWindow({
      content: `
        <div style="font-family: sans-serif; padding: 8px; max-width: 220px;">
          <h3 style="margin: 0 0 6px; color: #D4AF37; font-size: 15px; font-weight: bold;">Centre Sportif d'Elouges</h3>
          <p style="margin: 0 0 4px; font-size: 13px; color: #333;">Rue de la Tournelle 10<br/>7370 Elouges, Belgique</p>
          <p style="margin: 6px 0 0; font-size: 12px; color: #666;">📅 19 Avril 2026 — Miss & Mister Dour</p>
        </div>
      `,
    });

    // Ouvrir l'InfoWindow par défaut
    infoWindow.open(map, marker);

    // Clic sur le marqueur pour rouvrir l'InfoWindow
    marker.addListener("click", () => {
      infoWindow.open(map, marker);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white">
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

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gold/10 via-transparent to-gold/10" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <Crown className="w-16 h-16 mx-auto mb-6 text-gold animate-pulse" />
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-gold via-yellow-300 to-gold bg-clip-text text-transparent">
            À Propos
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
            Une soirée de prestige nationale belge célébrant l'élégance, le talent et le charisme
          </p>
        </div>
      </section>

      {/* Concept */}
      <section className="py-16 bg-gradient-to-b from-transparent to-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <Sparkles className="w-8 h-8 text-gold" />
              <h2 className="text-4xl font-bold text-gold">Le Concept</h2>
            </div>
            <div className="prose prose-invert prose-lg max-w-none">
              <p className="text-gray-300 leading-relaxed mb-6">
                <strong className="text-gold">Miss & Mister Dour</strong> est bien plus qu'un simple concours de beauté. 
                C'est une <strong>plateforme événementielle nationale belge</strong> qui célèbre l'excellence, 
                la diversité et le talent sous toutes ses formes.
              </p>
              <p className="text-gray-300 leading-relaxed mb-6">
                Chaque année, nous réunissons des candidats exceptionnels venus de toute la Belgique 
                pour une soirée de prestige inoubliable. Notre mission est de révéler les ambassadeurs 
                de demain, capables de représenter les valeurs d'élégance, d'authenticité et d'engagement social.
              </p>
              <p className="text-gray-300 leading-relaxed">
                Grâce à une <strong className="text-gold">technologie de pointe développée par Js-Innov.IA</strong>, 
                nous offrons une expérience immersive unique : votes en temps réel, génération de contenu vidéo 
                par IA, certificats blockchain, et bien plus encore.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Organisation */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <Users className="w-8 h-8 text-gold" />
              <h2 className="text-4xl font-bold text-gold">Organisation</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gray-800/50 border border-gold/20 rounded-lg p-6 hover:border-gold/40 transition-colors">
                <h3 className="text-2xl font-bold text-gold mb-4">STARLIGHT asbl</h3>
                <p className="text-gray-300 leading-relaxed">
                  Organisateur principal de l'événement depuis 2002, STARLIGHT asbl met son expertise 
                  et son expérience de plus de 20 ans au service de Miss & Mister Dour.
                  <br /><br />
                  <strong className="text-gold">Organisateur :</strong> Olivier Trevis<br />
                  <strong className="text-gold">Téléphone :</strong> +32 475 42 69 42<br />
                  <strong className="text-gold">Email :</strong> Olivier.trevis@outlook.be<br />
                  <strong className="text-gold">Adresse :</strong> Grand Place 9, 7370 Dour, Belgique
                </p>
              </div>
              <div className="bg-gray-800/50 border border-gold/20 rounded-lg p-6 hover:border-gold/40 transition-colors">
                <h3 className="text-2xl font-bold text-gold mb-4">Centre Sportif d'Elouges</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Lieu d'accueil officiel de la soirée de couronnement 2026, le Centre Sportif d'Elouges
                  dispose d'infrastructures modernes et spacieuses, idéales pour accueillir un événement
                  de prestige national. Sa grande salle polyvalente offre une scène professionnelle,
                  un éclairage scénique de qualité et une capacité d'accueil adaptée à un public nombreux.
                </p>
                <ul className="space-y-2 text-gray-300 text-sm mb-4">
                  <li className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                    <span><strong className="text-gold">Adresse :</strong> Rue de la Tournelle 10, 7370 Elouges, Belgique</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                    <span><strong className="text-gold">Date :</strong> 19 Avril 2026 — Soirée de Couronnement</span>
                  </li>
                </ul>
                <a
                  href="https://maps.google.com/?q=Rue+de+la+Tournelle+10,+7370+Elouges,+Belgique"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-gold hover:text-gold/80 transition-colors text-sm font-medium"
                >
                  <ExternalLink className="w-4 h-4" />
                  Voir sur Google Maps
                </a>
              </div>
              <div className="bg-gray-800/50 border border-gold/20 rounded-lg p-6 hover:border-gold/40 transition-colors md:col-span-2">
                <h3 className="text-2xl font-bold text-gold mb-4">Js-Innov.IA</h3>
                <p className="text-gray-300 leading-relaxed">
                  Partenaire technologique officiel, Js-Innov.IA développe la plateforme digitale 
                  complète : gestion des candidats, votes en temps réel, génération de contenu IA, 
                  certificats blockchain, et toutes les innovations technologiques de l'événement.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Valeurs */}
      <section className="py-16 bg-gradient-to-b from-transparent to-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <Heart className="w-8 h-8 text-gold" />
              <h2 className="text-4xl font-bold text-gold">Nos Valeurs</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gold/20 rounded-full flex items-center justify-center">
                  <Crown className="w-8 h-8 text-gold" />
                </div>
                <h3 className="text-xl font-bold text-gold mb-2">Excellence</h3>
                <p className="text-gray-300">
                  Nous recherchons l'excellence dans chaque détail, de la sélection des candidats 
                  à l'organisation de la soirée.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gold/20 rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-gold" />
                </div>
                <h3 className="text-xl font-bold text-gold mb-2">Diversité</h3>
                <p className="text-gray-300">
                  Nous célébrons la diversité sous toutes ses formes : origines, talents, 
                  personnalités uniques.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gold/20 rounded-full flex items-center justify-center">
                  <Heart className="w-8 h-8 text-gold" />
                </div>
                <h3 className="text-xl font-bold text-gold mb-2">Authenticité</h3>
                <p className="text-gray-300">
                  Nous valorisons l'authenticité et l'engagement sincère de nos candidats 
                  envers les causes qui leur tiennent à cœur.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Historique */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <Calendar className="w-8 h-8 text-gold" />
              <h2 className="text-4xl font-bold text-gold">Historique</h2>
            </div>
            <div className="space-y-8">
              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-24 text-right">
                  <span className="text-3xl font-bold text-gold">2002</span>
                </div>
                <div className="flex-1 bg-gray-800/50 border border-gold/20 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-gold mb-2">Naissance de l'Événement</h3>
                  <p className="text-gray-300">
                    Création de Miss & Mister Dour par STARLIGHT asbl sous la direction d'Olivier Trevis. 
                    Une première édition qui pose les fondations d'un événement de prestige durable.
                  </p>
                </div>
              </div>
              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-24 text-right">
                  <span className="text-3xl font-bold text-gold">2002-2025</span>
                </div>
                <div className="flex-1 bg-gray-800/50 border border-gold/20 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-gold mb-2">20+ Années d'Excellence</h3>
                  <p className="text-gray-300">
                    Plus de deux décennies d'événements couronneés de succès, avec des milliers de candidats, 
                    des dizaines de lauréats, et une réputation d'excellence qui dépasse les frontières de Dour.
                  </p>
                </div>
              </div>
              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-24 text-right">
                  <span className="text-3xl font-bold text-gold">2026</span>
                </div>
                <div className="flex-1 bg-gray-800/50 border border-gold/20 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-gold mb-2">Édition Nationale 2026</h3>
                  <p className="text-gray-300">
                    Édition nationale avec l'intégration de technologies IA avancées 
                    (génération vidéo, certificats blockchain, votes temps réel) et rayonnement à travers toute la Belgique.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision 2026 */}
      <section className="py-16 bg-gradient-to-b from-transparent to-black">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <Award className="w-8 h-8 text-gold" />
              <h2 className="text-4xl font-bold text-gold">Vision 2026</h2>
            </div>
            <div className="bg-gradient-to-br from-gold/10 to-transparent border border-gold/30 rounded-lg p-8">
              <p className="text-gray-300 leading-relaxed text-lg mb-6">
                Pour l'édition 2026, notre ambition est de faire de <strong className="text-gold">Miss & Mister Dour</strong> 
                la référence européenne des concours de beauté nouvelle génération.
              </p>
              <ul className="space-y-4 text-gray-300">
                <li className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-gold flex-shrink-0 mt-1" />
                  <span>
                    <strong className="text-gold">Technologie IA avancée</strong> : Génération automatique de vidéos 
                    de présentation, voix synthétiques personnalisées, certificats blockchain infalsifiables.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-gold flex-shrink-0 mt-1" />
                  <span>
                    <strong className="text-gold">Rayonnement national</strong> : Partenariats avec des centres
                    sportifs et culturels belges, diffusion en direct sur les réseaux sociaux, candidats de toute la Belgique.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-gold flex-shrink-0 mt-1" />
                  <span>
                    <strong className="text-gold">Engagement social</strong> : Chaque candidat s'engage pour une cause 
                    (environnement, éducation, santé) et bénéficie d'une visibilité médiatique.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Carte Google Maps */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <MapPin className="w-8 h-8 text-gold" />
              <h2 className="text-4xl font-bold text-gold">Accès & Localisation</h2>
            </div>
            <div className="bg-gray-800/50 border border-gold/20 rounded-xl overflow-hidden">
              {/* En-tête de la carte */}
              <div className="px-6 py-4 border-b border-gold/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-white font-semibold">Centre Sportif d'Elouges</p>
                  <p className="text-gray-400 text-sm">Rue de la Tournelle 10, 7370 Elouges, Belgique</p>
                </div>
                <a
                  href="https://maps.google.com/?q=Rue+de+la+Tournelle+10,+7370+Elouges,+Belgique"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gold text-black text-sm font-bold rounded-lg hover:bg-gold/90 transition-colors flex-shrink-0"
                >
                  <Navigation className="w-4 h-4" />
                  Itinéraire
                </a>
              </div>
              {/* Carte interactive */}
              <MapView
                initialCenter={VENUE_COORDS}
                initialZoom={15}
                onMapReady={handleMapReady}
                className="h-[420px] w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gold mb-6">Rejoignez l'aventure</h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Que vous soyez candidat, sponsor, partenaire ou simplement passionné, 
            il y a une place pour vous dans l'univers Miss & Mister Dour.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/inscription-candidat" className="px-8 py-3 bg-gold text-black font-bold rounded-lg hover:bg-gold/90 transition-colors">
                Devenir Candidat
              </Link>
            <Link href="/contact" className="px-8 py-3 bg-transparent border-2 border-gold text-gold font-bold rounded-lg hover:bg-gold/10 transition-colors">
                Nous Contacter
              </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
