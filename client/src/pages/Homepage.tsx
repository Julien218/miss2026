import { Link } from "wouter";
import { useState as useMenuState } from "react";
import { Crown, Calendar, Users, Award, Newspaper, Mail, ArrowRight, Sparkles, LogIn, Menu, X } from "lucide-react";
import { BRANDING } from "@/config/branding";
import { useAuth } from "@/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { GagaNightCountdown } from "@/components/GagaNightCountdown";
import { SEOHead } from "@/components/SEOHead";

export default function Homepage() {
  const { isAuthenticated, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useMenuState(false);
  
  // Redirection intelligente selon rôle
  const getDashboardUrl = () => {
    if (!user) return '/dashboard';
    
    switch (user.role) {
      case 'super_admin':
      case 'admin':
        return '/admin';
      case 'staff':
      case 'organizer':
        return '/choreographer';
      case 'photographer':
        return '/photographer';
      case 'press':
        return '/presse';
      default:
        return '/dashboard';
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white">
      <SEOHead
        title="Miss &amp; Mister Dour 2026 — Dour, Belgique"
        description="Concours de beauté officiel de Dour. Gala le 19 avril 2026. Inscriptions ouvertes — Votez pour vos candidats !"
        url="https://missetmisterdour.be"
        tags={["Miss Dour", "Mister Dour", "concours beauté Belgique", "gala Dour 2026", "Lady Gaga Night", "Hainaut", "Starlight ASBL"]}
      />
      {/* Header/Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-black/80 border-b border-gold/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <img
                src={BRANDING.logoIdentity}
                alt="Logo officiel Miss & Mister Dour 2026"
                className="h-14 max-[640px]:h-10 object-contain drop-shadow-[0_0_8px_rgba(212,175,55,0.6)]"
                loading="eager"
              />
            </Link>
            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/about" className="text-gray-300 hover:text-gold transition-colors">À Propos</Link>
              <Link href="/candidates" className="text-gray-300 hover:text-gold transition-colors">Candidats</Link>
              <Link href="/ranking" className="text-gray-300 hover:text-gold transition-colors">Classement</Link>
              <Link href="/sponsors" className="text-gray-300 hover:text-gold transition-colors">Sponsors</Link>
              <Link href="/press" className="text-gray-300 hover:text-gold transition-colors">Presse</Link>
              <Link href="/contact" className="px-4 py-2 bg-transparent border border-gold text-gold font-medium rounded-lg hover:bg-gold/10 transition-colors">Contact</Link>
              {isAuthenticated ? (
                <Link href={getDashboardUrl()} className="px-4 py-2 bg-gold text-black font-bold rounded-lg hover:bg-gold/90 transition-colors flex items-center gap-2">
                  <Crown className="w-4 h-4" />
                  {user?.role === 'admin' || user?.role === 'super_admin' ? 'Admin' : 'Dashboard'}
                </Link>
              ) : (
                <a href={getLoginUrl()} className="px-4 py-2 bg-gold text-black font-bold rounded-lg hover:bg-gold/90 transition-colors flex items-center gap-2">
                  <LogIn className="w-4 h-4" />
                  Se connecter
                </a>
              )}
            </nav>
            {/* Hamburger mobile */}
            <button
              className="md:hidden p-2 text-gold hover:bg-gold/10 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
          {/* Mobile menu dropdown */}
          {mobileMenuOpen && (
            <nav className="md:hidden py-4 border-t border-gold/20 flex flex-col gap-3">
              <Link href="/about" className="block py-2 px-3 text-gray-300 hover:text-gold hover:bg-gold/5 rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>À Propos</Link>
              <Link href="/candidates" className="block py-2 px-3 text-gray-300 hover:text-gold hover:bg-gold/5 rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>Candidats</Link>
              <Link href="/ranking" className="block py-2 px-3 text-gray-300 hover:text-gold hover:bg-gold/5 rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>Classement</Link>
              <Link href="/sponsors" className="block py-2 px-3 text-gray-300 hover:text-gold hover:bg-gold/5 rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>Sponsors</Link>
              <Link href="/press" className="block py-2 px-3 text-gray-300 hover:text-gold hover:bg-gold/5 rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>Presse</Link>
              <Link href="/contact" className="block py-2 px-3 border border-gold text-gold rounded-lg hover:bg-gold/10 transition-colors text-center" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
              {isAuthenticated ? (
                <Link href={getDashboardUrl()} className="flex items-center justify-center gap-2 py-3 bg-gold text-black font-bold rounded-lg hover:bg-gold/90 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                  <Crown className="w-4 h-4" />
                  {user?.role === 'admin' || user?.role === 'super_admin' ? 'Admin' : 'Dashboard'}
                </Link>
              ) : (
                <a href={getLoginUrl()} className="flex items-center justify-center gap-2 py-3 bg-gold text-black font-bold rounded-lg hover:bg-gold/90 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                  <LogIn className="w-4 h-4" />
                  Se connecter
                </a>
              )}
            </nav>
          )}
        </div>
      </header>

      {/* Section 1: Hero */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gold/20 via-transparent to-gold/20" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyMTIsIDE3NSwgNTUsIDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <Crown className="w-20 h-20 mx-auto mb-8 text-gold animate-pulse" />
          <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-gold via-yellow-300 to-gold bg-clip-text text-transparent leading-tight">
            Miss & Mister Dour 2026
          </h1>
          <p className="text-2xl md:text-3xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
            La soirée de prestige nationale belge qui célèbre l'élégance, le talent et le charisme
          </p>
          <div className="flex items-center justify-center gap-3 text-gold text-xl mb-12">
            <Calendar className="w-6 h-6" />
            <span className="font-bold">19 Avril 2026</span>
            <span className="text-gray-400">|</span>
            <span>Centre Sportif d'Elouges, Belgique</span>
          </div>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/inscription-candidat" className="px-8 py-4 bg-gold text-black text-lg font-bold rounded-lg hover:bg-gold/90 transition-all hover:scale-105 flex items-center gap-2">
              Devenir Candidat
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/candidates" className="px-8 py-4 bg-transparent border-2 border-gold text-gold text-lg font-bold rounded-lg hover:bg-gold/10 transition-all flex items-center gap-2">
              Découvrir les Candidats
              <Users className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Lady Gaga Night Countdown ── */}
      <GagaNightCountdown />

      {/* Section 2: À Propos (Résumé) */}
      <section className="py-20 bg-gradient-to-b from-transparent to-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto text-center">
            <Sparkles className="w-12 h-12 mx-auto mb-6 text-gold" />
            <h2 className="text-4xl md:text-5xl font-bold text-gold mb-6">Une Expérience Unique</h2>
            <p className="text-xl text-gray-300 leading-relaxed mb-8">
              <strong className="text-gold">Miss & Mister Dour</strong> est bien plus qu'un simple concours de beauté. 
              C'est une plateforme événementielle nationale belge qui célèbre l'excellence, la diversité et le talent 
              sous toutes ses formes. Grâce à une technologie de pointe développée par <strong className="text-gold">Js-Innov.IA</strong>, 
              nous offrons une expérience immersive unique : votes en temps réel, génération de contenu vidéo par IA, 
              certificats blockchain, et bien plus encore.
            </p>
            <Link href="/about" className="inline-flex items-center gap-2 text-gold hover:text-gold/80 transition-colors font-medium text-lg">
              En savoir plus sur notre concept
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Section 3: Candidats (Aperçu) */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Users className="w-12 h-12 mx-auto mb-6 text-gold" />
            <h2 className="text-4xl md:text-5xl font-bold text-gold mb-4">Nos Candidats</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Découvrez les candidats exceptionnels qui participent à l'édition 2026
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-800/50 border border-gold/20 rounded-lg overflow-hidden hover:border-gold/40 transition-all group">
                <div className="aspect-[3/4] bg-gradient-to-br from-gold/20 to-transparent flex items-center justify-center">
                  <Crown className="w-16 h-16 text-gold/50 group-hover:scale-110 transition-transform" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2">Candidat {i}</h3>
                  <p className="text-gray-400 text-sm mb-4">Catégorie • Ville</p>
                  <Link href={`/candidate/${i}`} className="text-gold hover:text-gold/80 transition-colors font-medium flex items-center gap-2">
                    Voir le profil
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link href="/candidates" className="inline-flex items-center gap-2 px-8 py-3 bg-gold text-black font-bold rounded-lg hover:bg-gold/90 transition-colors">
              Voir tous les candidats
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Section 4: Timeline / Dates Clés */}
      <section className="py-20 bg-gradient-to-b from-transparent to-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Calendar className="w-12 h-12 mx-auto mb-6 text-gold" />
              <h2 className="text-4xl md:text-5xl font-bold text-gold mb-4">Dates Clés</h2>
              <p className="text-xl text-gray-300">Ne manquez aucune étape de l'événement</p>
            </div>
            <div className="space-y-6">
              {[
                { date: "1er Février 2026", title: "Clôture des inscriptions", description: "Dernière chance de devenir candidat" },
                { date: "15 Mars 2026", title: "Ouverture des votes", description: "Le public peut commencer à voter pour ses candidats préférés" },
                { date: "10 Avril 2026", title: "Clôture des votes", description: "Fin de la période de vote en ligne" },
                { date: "19 Avril 2026", title: "Soirée de Couronnement", description: "Grande finale au Centre Sportif d'Elouges, Rue de la Tournelle 10, 7370 Elouges" }
              ].map((event, index) => (
                <div key={index} className="flex gap-6 items-start bg-gray-800/50 border border-gold/20 rounded-lg p-6 hover:border-gold/40 transition-colors">
                  <div className="flex-shrink-0 w-32 text-right">
                    <span className="text-2xl font-bold text-gold">{event.date.split(' ')[0]}</span>
                    <br />
                    <span className="text-sm text-gray-400">{event.date.split(' ').slice(1).join(' ')}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
                    <p className="text-gray-300">{event.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Sponsors (Aperçu) */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Award className="w-12 h-12 mx-auto mb-6 text-gold" />
            <h2 className="text-4xl md:text-5xl font-bold text-gold mb-4">Nos Partenaires</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Ils nous font confiance et soutiennent l'excellence
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
            <div className="bg-gray-800/50 border border-gold/30 rounded-lg p-8 text-center flex flex-col items-center justify-center">
              <div className="bg-black rounded-xl p-4 mb-4 h-32 flex items-center justify-center border border-white/10">
                <img
                  src="https://d2xsxph8kpxj0f.cloudfront.net/87304619/fqSYuBaSqJ2z2N7q3F6MzD/logo-miss-mister-dour-2026-hq-Adp7ZVWHkGZq6PXgB37nFv.webp"
                  alt="Miss & Mister Dour 2026"
                  className="h-20 w-auto object-contain"
                />
              </div>
              <p className="text-gold font-bold text-lg">Miss & Mister Dour</p>
              <p className="text-gray-400 text-sm">Partenaire Officiel</p>
            </div>
            <div className="bg-gray-800/50 border border-gold/30 rounded-lg p-8 text-center flex flex-col items-center justify-center">
              <div className="bg-black rounded-xl p-4 mb-4 h-32 flex items-center justify-center border border-white/10">
                <img
                  src="https://d2xsxph8kpxj0f.cloudfront.net/87304619/fqSYuBaSqJ2z2N7q3F6MzD/Logo_JS-Innov.IA_EvoluTion_Autonome_02-26_85ca048d.png"
                  alt="JS-Innov.IA® - Julien Pagin"
                  className="h-20 w-auto object-contain"
                />
              </div>
              <p className="text-gold font-bold text-lg">JS-Innov.IA®</p>
              <p className="text-gray-400 text-sm">Créateur & Partenaire Technologique</p>
            </div>
          </div>
          <div className="text-center">
            <Link href="/sponsors" className="inline-flex items-center gap-2 text-gold hover:text-gold/80 transition-colors font-medium text-lg">
              Découvrir tous nos sponsors
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Section 6: Presse / Actualités */}
      <section className="py-20 bg-gradient-to-b from-transparent to-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Newspaper className="w-12 h-12 mx-auto mb-6 text-gold" />
            <h2 className="text-4xl md:text-5xl font-bold text-gold mb-4">Espace Presse</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Ressources officielles pour les médias et journalistes
            </p>
          </div>
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-gold/10 to-transparent border border-gold/30 rounded-lg p-8">
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gold/20 rounded-full flex items-center justify-center">
                  <Newspaper className="w-8 h-8 text-gold" />
                </div>
                <h3 className="font-bold text-white mb-2">Kit Presse</h3>
                <p className="text-gray-400 text-sm">Logos, photos, dossier de presse</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gold/20 rounded-full flex items-center justify-center">
                  <Mail className="w-8 h-8 text-gold" />
                </div>
                <h3 className="font-bold text-white mb-2">Contact Presse</h3>
                <p className="text-gray-400 text-sm">presse@miss-mister-dour.be</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gold/20 rounded-full flex items-center justify-center">
                  <Award className="w-8 h-8 text-gold" />
                </div>
                <h3 className="font-bold text-white mb-2">Accréditation</h3>
                <p className="text-gray-400 text-sm">Demande d'accréditation média</p>
              </div>
            </div>
            <div className="text-center">
              <Link href="/press" className="inline-flex items-center gap-2 px-6 py-3 bg-gold text-black font-bold rounded-lg hover:bg-gold/90 transition-colors">
                Accéder à l'espace presse
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Section 7: CTA Final */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center bg-gradient-to-br from-gold/20 to-transparent border-2 border-gold/40 rounded-lg p-12">
            <Crown className="w-16 h-16 mx-auto mb-6 text-gold" />
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Rejoignez l'Aventure</h2>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Que vous soyez candidat, sponsor, partenaire ou simplement passionné, 
              il y a une place pour vous dans l'univers Miss & Mister Dour 2026.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/inscription-candidat" className="px-8 py-4 bg-gold text-black text-lg font-bold rounded-lg hover:bg-gold/90 transition-all hover:scale-105">
                Devenir Candidat
              </Link>
              <Link href="/sponsors" className="px-8 py-4 bg-transparent border-2 border-gold text-gold text-lg font-bold rounded-lg hover:bg-gold/10 transition-all">
                Devenir Sponsor
              </Link>
              <Link href="/contact" className="px-8 py-4 bg-transparent border-2 border-gold text-gold text-lg font-bold rounded-lg hover:bg-gold/10 transition-all">
                Nous Contacter
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
