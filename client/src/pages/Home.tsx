import { useAuth } from "@/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { BRANDING } from "@/config/branding";
import { GoldenParticles } from "@/components/home/GoldenParticles";
import { CrownAnimation } from "@/components/home/CrownAnimation";
import { FloatingCarousel } from "@/components/home/FloatingCarousel";
import { CountdownTimer } from "@/components/home/CountdownTimer";
import { Crown, Calendar, Users, Award, LogIn, ArrowRight, Sparkles, Music, Star } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

// Mock data candidats pour le carrousel
const mockCandidates = [
  { id: "1", name: "Sophie Martin", photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=600&fit=crop", city: "Dour", category: "miss" as const },
  { id: "2", name: "Lucas Dubois", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop", city: "Mons", category: "mister" as const },
  { id: "3", name: "Emma Laurent", photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop", city: "Tournai", category: "miss" as const },
  { id: "4", name: "Thomas Bernard", photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop", city: "Charleroi", category: "mister" as const },
  { id: "5", name: "Chloé Leroy", photo: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=600&fit=crop", city: "Namur", category: "miss" as const },
  { id: "6", name: "Alexandre Petit", photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop", city: "Liège", category: "mister" as const },
];

// Couleurs signature Lady Gaga × Miss & Mister Dour
const COPPER = "#C87941";
const COPPER_LIGHT = "#D4956A";
const CHAMPAGNE = "#E8D5B7";
const GOLD = "#D4AF37";
const OBSIDIAN = "#0A0A0F";
const GAGA_ROSE = "#C45E6A";

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const eventDate = new Date('2026-04-19T19:30:00');

  const getDashboardUrl = () => {
    if (!user) return '/dashboard';
    switch (user.role) {
      case 'super_admin': case 'admin': return '/admin';
      case 'staff': case 'organizer': return '/choreographer';
      case 'photographer': return '/photographer';
      case 'press': return '/presse';
      default: return '/dashboard';
    }
  };

  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{
        background: `linear-gradient(160deg, ${OBSIDIAN} 0%, #12080A 30%, #0F0A05 60%, ${OBSIDIAN} 100%)`,
      }}
    >
      {/* Particules dorées */}
      <GoldenParticles />

      {/* Halo cuivré en arrière-plan */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: `
            radial-gradient(ellipse 60% 40% at 20% 80%, ${COPPER}18 0%, transparent 60%),
            radial-gradient(ellipse 50% 30% at 80% 20%, ${GAGA_ROSE}12 0%, transparent 50%),
            radial-gradient(ellipse 40% 50% at 50% 50%, ${GOLD}08 0%, transparent 70%)
          `,
        }}
      />

      {/* ── Navigation ── */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-2xl"
        style={{
          background: `${OBSIDIAN}CC`,
          borderBottom: `1px solid ${COPPER}30`,
        }}
      >
        <div className="container flex h-20 items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <motion.img
              src={BRANDING.logoIdentity}
              alt="Miss & Mister Dour"
              className="h-12 w-auto drop-shadow-2xl"
              whileHover={{ scale: 1.08 }}
            />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {[
              { href: "/candidates", label: "Candidats" },
              { href: "/classement", label: "Classement" },
              { href: "/sponsors", label: "Sponsors" },
              { href: "/presse", label: "Presse" },
            ].map((item, i) => (
              <motion.div key={item.href} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Link
                  href={item.href}
                  className="text-sm font-medium transition-colors relative group"
                  style={{ color: `${CHAMPAGNE}99` }}
                >
                  <span className="group-hover:text-[#E8D5B7] transition-colors">{item.label}</span>
                  <span
                    className="absolute -bottom-1 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300"
                    style={{ background: `linear-gradient(90deg, ${COPPER}, ${GOLD})` }}
                  />
                </Link>
              </motion.div>
            ))}

            {isAuthenticated ? (
              <Link href={getDashboardUrl()}>
                <Button
                  className="font-semibold text-sm"
                  style={{
                    background: `linear-gradient(135deg, ${COPPER}, ${COPPER_LIGHT})`,
                    color: OBSIDIAN,
                    border: `1px solid ${COPPER_LIGHT}`,
                  }}
                >
                  <Crown className="h-4 w-4 mr-2" />
                  {user?.role === 'admin' || user?.role === 'super_admin' ? 'Admin' : 'Dashboard'}
                </Button>
              </Link>
            ) : (
              <a href={getLoginUrl()}>
                <Button
                  variant="ghost"
                  className="text-sm transition-colors"
                  style={{ color: `${CHAMPAGNE}99` }}
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Connexion
                </Button>
              </a>
            )}
          </nav>
        </div>
      </motion.header>

      {/* ── Hero Section ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 px-4">

        {/* Badge thème soirée */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-2 mb-8 px-5 py-2 rounded-full text-xs font-semibold tracking-widest uppercase"
          style={{
            background: `linear-gradient(135deg, ${GAGA_ROSE}20, ${COPPER}20)`,
            border: `1px solid ${GAGA_ROSE}40`,
            color: `${CHAMPAGNE}CC`,
          }}
        >
          <Music className="w-3 h-3" style={{ color: GAGA_ROSE }} />
          Soirée de clôture · Thème Lady Gaga
          <Star className="w-3 h-3" style={{ color: GOLD }} />
        </motion.div>

        {/* Crown Animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, type: "spring" }}
          className="mb-8"
        >
          <CrownAnimation />
        </motion.div>

        {/* Countdown */}
        <div className="mb-12">
          <CountdownTimer targetDate={eventDate} />
        </div>

        {/* Titre principal */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="font-playfair text-5xl md:text-7xl font-bold text-center mb-6"
          style={{
            background: `linear-gradient(135deg, ${CHAMPAGNE} 0%, ${GOLD} 35%, ${COPPER} 65%, ${CHAMPAGNE} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            textShadow: "none",
          }}
        >
          Miss & Mister Dour 2026
        </motion.h1>

        {/* Sous-titre */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-xl md:text-2xl text-center max-w-3xl mb-4"
          style={{ color: `${CHAMPAGNE}80` }}
        >
          La soirée de prestige qui célèbre l'élégance, le talent et le charisme
        </motion.p>

        {/* Infos événement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="flex flex-wrap items-center justify-center gap-3 mb-12"
          style={{ color: COPPER_LIGHT }}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-lg font-medium">19 Avril 2026</span>
          <span style={{ color: `${CHAMPAGNE}30` }}>|</span>
          <span className="text-lg" style={{ color: `${CHAMPAGNE}70` }}>Centre Sportif d'Elouges, Belgique</span>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 items-center"
        >
          <Link href="/candidates">
            <Button
              size="lg"
              className="font-bold text-lg px-8 py-6 rounded-full group transition-all duration-300"
              style={{
                background: `linear-gradient(135deg, ${COPPER}, ${COPPER_LIGHT})`,
                color: OBSIDIAN,
                boxShadow: `0 8px 32px ${COPPER}40`,
                border: `1px solid ${COPPER_LIGHT}`,
              }}
            >
              <Users className="w-5 h-5 mr-2" />
              Découvrir les Candidats
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>

          <Link href="/about">
            <Button
              size="lg"
              variant="ghost"
              className="font-semibold text-lg px-8 py-6 rounded-full transition-all duration-300"
              style={{
                color: CHAMPAGNE,
                border: `1px solid ${CHAMPAGNE}25`,
              }}
            >
              En savoir plus
            </Button>
          </Link>
        </motion.div>

        {/* Séparateur décoratif */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
          className="mt-20 w-64 h-px"
          style={{
            background: `linear-gradient(90deg, transparent, ${COPPER}, ${GOLD}, ${COPPER}, transparent)`,
          }}
        />
      </section>

      {/* ── Carrousel Candidats ── */}
      <section className="relative py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Sparkles className="w-6 h-6" style={{ color: COPPER }} />
              <h2
                className="font-playfair text-4xl md:text-5xl font-bold"
                style={{
                  background: `linear-gradient(135deg, ${CHAMPAGNE}, ${GOLD}, ${COPPER})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Nos Candidats 2026
              </h2>
              <Sparkles className="w-6 h-6" style={{ color: COPPER }} />
            </div>
            <p className="text-lg" style={{ color: `${CHAMPAGNE}60` }}>
              Découvrez les visages qui incarnent l'élégance et le charisme
            </p>
          </motion.div>

          <FloatingCarousel candidates={mockCandidates} />
        </div>
      </section>

      {/* ── Stats Section ── */}
      <section
        className="relative py-20"
        style={{
          background: `linear-gradient(180deg, transparent, ${COPPER}08, transparent)`,
        }}
      >
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Users, value: "19", label: "Candidats" },
              { icon: Award, value: "10+", label: "Prix à Gagner" },
              { icon: Crown, value: "2", label: "Couronnes Royales" },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="text-center"
              >
                <div
                  className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4"
                  style={{
                    background: `linear-gradient(135deg, ${COPPER}20, ${GOLD}15)`,
                    border: `1px solid ${COPPER}40`,
                  }}
                >
                  <stat.icon className="w-10 h-10" style={{ color: COPPER_LIGHT }} />
                </div>
                <div
                  className="font-playfair text-5xl font-bold mb-2"
                  style={{
                    background: `linear-gradient(135deg, ${CHAMPAGNE}, ${GOLD})`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {stat.value}
                </div>
                <div className="text-lg" style={{ color: `${CHAMPAGNE}60` }}>{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bandeau Lady Gaga (thème soirée) ── */}
      <section className="relative py-16 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${GAGA_ROSE}15, ${COPPER}20, ${GOLD}10)`,
            borderTop: `1px solid ${COPPER}25`,
            borderBottom: `1px solid ${COPPER}25`,
          }}
        />
        <div className="container relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Music className="w-6 h-6" style={{ color: GAGA_ROSE }} />
              <span
                className="text-xs font-semibold tracking-widest uppercase"
                style={{ color: `${CHAMPAGNE}80` }}
              >
                Soirée de clôture
              </span>
              <Music className="w-6 h-6" style={{ color: GAGA_ROSE }} />
            </div>
            <h3
              className="font-playfair text-3xl md:text-4xl font-bold mb-4"
              style={{ color: CHAMPAGNE }}
            >
              Thème Officiel · Lady Gaga
            </h3>
            <p className="text-base max-w-2xl mx-auto" style={{ color: `${CHAMPAGNE}60` }}>
              La soirée de clôture du 19 Avril 2026 sera placée sous le signe du glamour et de l'audace,
              en hommage à l'icône mondiale Lady Gaga. Préparez vos tenues les plus extravagantes.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
