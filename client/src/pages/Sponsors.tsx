import { Link } from "wouter";
import { SEOHead } from "@/components/SEOHead";
import { Award, ExternalLink, Heart, Crown } from "lucide-react";
import { BRANDING } from "@/config/branding";

export default function Sponsors() {
  const mainSponsors = [
    { name: "Centre Sportif d'Elouges", logo: "https://via.placeholder.com/300x150/D4AF37/000000?text=Centre+Culturel+Dour", description: "Organisateur principal et partenaire culturel majeur de l'événement.", website: "https://centrecultureldour.be", tier: "Partenaire Principal" },
    { name: "Js-Innov.IA", logo: "https://via.placeholder.com/300x150/D4AF37/000000?text=Js-Innov.IA", description: "Partenaire technologique officiel - Développement plateforme IA, blockchain, génération vidéo.", website: "https://jsinnovia.com", tier: "Partenaire Technologique" }
  ];
  const goldSponsors = [
    { name: "Sponsor Gold 1", logo: "https://via.placeholder.com/250x125/FFD700/000000?text=Gold+Sponsor+1", description: "Description du sponsor gold 1.", website: "#" },
    { name: "Sponsor Gold 2", logo: "https://via.placeholder.com/250x125/FFD700/000000?text=Gold+Sponsor+2", description: "Description du sponsor gold 2.", website: "#" }
  ];
  const silverSponsors = [
    { name: "Sponsor Silver 1", logo: "https://via.placeholder.com/200x100/C0C0C0/000000?text=Silver+1", website: "#" },
    { name: "Sponsor Silver 2", logo: "https://via.placeholder.com/200x100/C0C0C0/000000?text=Silver+2", website: "#" },
    { name: "Sponsor Silver 3", logo: "https://via.placeholder.com/200x100/C0C0C0/000000?text=Silver+3", website: "#" }
  ];

  return <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white overflow-x-hidden">
    <SEOHead title="Sponsors & Partenaires — Miss & Mister Dour 2026" description="Découvrez les sponsors et partenaires officiels du concours Miss & Mister Dour 2026. Rejoignez-nous pour soutenir l'excellence belge." url="https://missetmisterdour.be/sponsors" tags={["sponsors Miss Dour", "partenaires Dour", "STARLIGHT ASBL"]} />
    <header className="sticky top-0 z-50 backdrop-blur-lg bg-black/80 border-b border-gold/20">
      <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center min-w-0 hover:opacity-80 transition-opacity"><img src={BRANDING.logoIdentity} alt="Logo officiel Miss & Mister Dour 2026" className="h-10 sm:h-14 max-w-[150px] object-contain drop-shadow-[0_0_8px_rgba(212,175,55,0.6)]" loading="eager" /></Link>
        <Link href="/" className="text-gold hover:text-gold/80 transition-colors font-medium text-sm sm:text-base whitespace-nowrap">Retour à l'accueil</Link>
      </div>
    </header>

    <section className="relative py-12 sm:py-20 overflow-hidden"><div className="absolute inset-0 bg-gradient-to-r from-gold/10 via-transparent to-gold/10" /><div className="container mx-auto px-4 text-center relative z-10"><Award className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 text-gold animate-pulse" /><h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-gold via-yellow-300 to-gold bg-clip-text text-transparent">Nos Sponsors</h1><p className="text-base sm:text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">Ils nous font confiance et soutiennent l'excellence</p></div></section>

    <SponsorSection title="Partenaires Principaux" icon={<Crown className="w-7 h-7 sm:w-8 sm:h-8 text-gold flex-none" />}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8">{mainSponsors.map((sponsor, index) => <div key={index} className="bg-gradient-to-br from-gold/10 to-transparent border-2 border-gold/40 rounded-xl p-5 sm:p-8 hover:border-gold/60 transition-all group"><LogoBox src={sponsor.logo} name={sponsor.name} large /><span className="inline-block px-3 py-1 bg-gold/20 text-gold text-xs sm:text-sm font-bold rounded-full mb-3">{sponsor.tier}</span><h3 className="text-xl sm:text-2xl font-bold text-white mb-2 break-words">{sponsor.name}</h3><p className="text-sm sm:text-base text-gray-300 mb-4 leading-relaxed">{sponsor.description}</p><SponsorLink website={sponsor.website} label="Visiter le site" /></div>)}</div>
    </SponsorSection>

    <SponsorSection title="Sponsors Gold" icon={<Award className="w-7 h-7 sm:w-8 sm:h-8 text-yellow-400 flex-none" />} className="bg-gradient-to-b from-transparent to-gray-900/50" titleClass="text-yellow-400">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8">{goldSponsors.map((sponsor, index) => <div key={index} className="bg-gray-800/50 border border-yellow-400/30 rounded-xl p-5 sm:p-6"><LogoBox src={sponsor.logo} name={sponsor.name} /><h3 className="text-lg sm:text-xl font-bold text-white mb-2">{sponsor.name}</h3><p className="text-gray-400 text-sm mb-3">{sponsor.description}</p><SponsorLink website={sponsor.website} label="En savoir plus" /></div>)}</div>
    </SponsorSection>

    <SponsorSection title="Sponsors Silver" icon={<Award className="w-7 h-7 sm:w-8 sm:h-8 text-gray-400 flex-none" />} titleClass="text-gray-400">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">{silverSponsors.map((sponsor, index) => <a key={index} href={sponsor.website} target="_blank" rel="noopener noreferrer" className="bg-gray-800/50 border border-gray-400/20 rounded-xl p-4 hover:border-gray-400/40 transition-all"><LogoBox src={sponsor.logo} name={sponsor.name} compact /><p className="text-center text-gray-300 text-sm mt-3">{sponsor.name}</p></a>)}</div>
    </SponsorSection>

    <section className="py-12 sm:py-16 bg-gradient-to-b from-transparent to-black"><div className="container mx-auto px-4"><div className="max-w-4xl mx-auto text-center"><Heart className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-5 text-gold" /><h2 className="text-3xl sm:text-4xl font-bold text-gold mb-5">Devenez Sponsor</h2><p className="text-gray-300 text-base sm:text-lg leading-relaxed mb-7">Rejoignez les partenaires qui soutiennent Miss & Mister Dour et bénéficiez d'une visibilité exceptionnelle lors de l'événement.</p><div className="bg-gradient-to-br from-gold/10 to-transparent border border-gold/30 rounded-xl p-5 sm:p-8 mb-8"><h3 className="text-xl sm:text-2xl font-bold text-gold mb-4">Avantages Sponsors</h3><ul className="text-left text-sm sm:text-base text-gray-300 space-y-3 max-w-2xl mx-auto"><li>✓ Logo affiché sur les supports de communication</li><li>✓ Mention lors de la soirée de couronnement</li><li>✓ Accès VIP avec places réservées</li><li>✓ Visibilité via les médias et diffusions de l'événement</li></ul></div><Link href="/contact" className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3 bg-gold text-black font-bold rounded-lg hover:bg-gold/90 transition-colors">Nous Contacter <ExternalLink className="w-5 h-5" /></Link></div></div></section>
  </div>;
}

function SponsorSection({ title, icon, children, className = "", titleClass = "text-gold" }: { title: string; icon: React.ReactNode; children: React.ReactNode; className?: string; titleClass?: string }) {
  return <section className={`py-10 sm:py-16 ${className}`}><div className="container mx-auto px-4"><div className="max-w-6xl mx-auto"><div className="flex items-center gap-2 sm:gap-3 mb-7 sm:mb-12 justify-center text-center">{icon}<h2 className={`text-2xl sm:text-4xl font-bold ${titleClass}`}>{title}</h2></div>{children}</div></div></section>;
}
function LogoBox({ src, name, large = false, compact = false }: { src: string; name: string; large?: boolean; compact?: boolean }) {
  return <div className={`bg-white rounded-lg p-3 sm:p-5 mb-4 sm:mb-6 flex items-center justify-center ${large ? "h-28 sm:h-32" : compact ? "h-20" : "h-24"}`}><img src={src} alt={`Logo ${name}`} className="max-h-full max-w-full object-contain" /></div>;
}
function SponsorLink({ website, label }: { website: string; label: string }) {
  return <a href={website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-gold hover:text-gold/80 transition-colors text-sm sm:text-base font-medium">{label}<ExternalLink className="w-4 h-4" /></a>;
}
