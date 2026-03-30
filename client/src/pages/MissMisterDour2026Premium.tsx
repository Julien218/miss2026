import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { Link } from "wouter";
import { Calendar, MapPin, Clock, Heart, Share2, Trophy, Sparkles, Menu, X, ArrowRight, Instagram, Facebook, ExternalLink, Crown, TrendingUp } from "lucide-react";
import { SEOHead } from "../components/SEOHead";
import { StructuredData, createEventSchema, createOrganizationSchema } from "../components/StructuredData";
import { SocialShareButtonsCompact } from "../components/SocialShareButtons";
import { ShareCountBadge } from "../components/ShareCountBadge";
import { NotificationBell } from "../components/NotificationBell";
import { BarometerOrb } from "../components/BarometerOrb";
import { trpc } from "../lib/trpc";

// ==================== HOOKS ====================

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
}

// ==================== COMPOSANTS ANIMATIONS ====================

// Particules subtiles (version premium)
function SubtleParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number;
      y: number;
      size: number;
      speedY: number;
      opacity: number;
    }> = [];

    // Moins de particules, plus subtiles
    for (let i = 0; i < 20; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        speedY: Math.random() * 0.3 + 0.1,
        opacity: Math.random() * 0.3 + 0.1,
      });
    }

    let animationFrameId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 164, 92, ${particle.opacity})`;
        ctx.fill();

        particle.y -= particle.speedY;

        if (particle.y < 0) {
          particle.y = canvas.height;
          particle.x = Math.random() * canvas.width;
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ mixBlendMode: "screen", opacity: 0.4 }}
    />
  );
}

// Overlay miroir violet
function MirrorOverlay() {
  return (
    <div 
      className="fixed inset-0 pointer-events-none z-[1]"
      style={{
        background: "radial-gradient(circle at 50% 50%, rgba(75, 0, 130, 0.15) 0%, transparent 70%)",
      }}
    />
  );
}

// Animation lumière subtile
function LightAnimation() {
  return (
    <motion.div
      className="fixed inset-0 pointer-events-none z-[2]"
      animate={{
        background: [
          "radial-gradient(circle at 20% 30%, rgba(200, 164, 92, 0.1) 0%, transparent 50%)",
          "radial-gradient(circle at 80% 70%, rgba(200, 164, 92, 0.1) 0%, transparent 50%)",
          "radial-gradient(circle at 20% 30%, rgba(200, 164, 92, 0.1) 0%, transparent 50%)",
        ],
      }}
      transition={{
        duration: 10,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

// Compte à rebours élégant
function Countdown() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const targetDate = new Date("2026-04-19T20:00:00").getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex gap-4 md:gap-8 justify-center">
      {[
        { label: "Jours", value: timeLeft.days },
        { label: "Heures", value: timeLeft.hours },
        { label: "Minutes", value: timeLeft.minutes },
        { label: "Secondes", value: timeLeft.seconds },
      ].map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 + index * 0.1 }}
          className="flex flex-col items-center"
        >
          <div className="bg-black/60 backdrop-blur-md border border-[#C8A45C]/30 rounded-xl px-4 py-3 md:px-6 md:py-4 min-w-[70px] md:min-w-[90px]">
            <div className="text-3xl md:text-5xl font-bold text-[#C8A45C]" style={{ fontFamily: "'Playfair Display', serif" }}>
              {String(item.value).padStart(2, "0")}
            </div>
          </div>
          <div className="text-xs md:text-sm text-[#B0B0B0] mt-2 uppercase tracking-wider">
            {item.label}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ==================== COMPOSANT VOTE LIVE ====================

function VoteLiveSection() {
  const { data: leaderboard, isLoading } = trpc.votes.getLeaderboard.useQuery({ contestId: 1, limit: 3 });

  if (isLoading) {
    return (
      <section className="relative py-32 px-4 bg-gradient-to-b from-black/40 to-black/20">
        <div className="container mx-auto text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-white/10 rounded w-64 mx-auto mb-4"></div>
            <div className="h-4 bg-white/10 rounded w-96 mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  if (!leaderboard || leaderboard.length === 0) {
    return null;
  }

  // Calculer le total des votes pour les pourcentages
  const totalVotes = leaderboard.reduce((sum, c) => sum + Number(c.voteCount), 0);

  // Ordre podium: 2ème, 1er, 3ème
  const podiumOrder = [
    leaderboard[1], // 2ème place
    leaderboard[0], // 1ère place
    leaderboard[2], // 3ème place
  ].filter(Boolean);

  return (
    <section className="relative py-32 px-4 bg-gradient-to-b from-black/40 to-black/20">
      <div className="container mx-auto">
        {/* Titre section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <TrendingUp className="w-8 h-8 text-[#EC4899]" />
            <h2
              className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-[#EC4899] via-[#F472B6] to-[#EC4899] bg-clip-text text-transparent"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Top 3 en Direct
            </h2>
            <TrendingUp className="w-8 h-8 text-[#EC4899]" />
          </div>
          <p className="text-[#B0B0B0] text-lg">
            Classement en temps réel • {totalVotes.toLocaleString()} votes
          </p>
        </motion.div>

        {/* Podium */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-end">
          {podiumOrder.map((candidate, index) => {
            if (!candidate) return null;

            // Position réelle (1er, 2ème, 3ème)
            const realPosition = index === 1 ? 1 : index === 0 ? 2 : 3;
            const percentage = totalVotes > 0 ? ((Number(candidate.voteCount) / totalVotes) * 100).toFixed(1) : '0';

            // Couleurs et hauteurs selon position
            const positionStyles = {
              1: {
                gradient: 'from-[#FFD700] via-[#FFA500] to-[#FFD700]',
                height: 'h-96',
                icon: <Crown className="w-12 h-12 text-[#FFD700] fill-[#FFD700]" />,
                glow: '0 0 40px rgba(255, 215, 0, 0.6)',
                delay: 0.3,
              },
              2: {
                gradient: 'from-[#C0C0C0] via-[#E8E8E8] to-[#C0C0C0]',
                height: 'h-80',
                icon: <Crown className="w-10 h-10 text-[#C0C0C0] fill-[#C0C0C0]" />,
                glow: '0 0 30px rgba(192, 192, 192, 0.5)',
                delay: 0.2,
              },
              3: {
                gradient: 'from-[#CD7F32] via-[#E6A157] to-[#CD7F32]',
                height: 'h-72',
                icon: <Crown className="w-8 h-8 text-[#CD7F32] fill-[#CD7F32]" />,
                glow: '0 0 25px rgba(205, 127, 50, 0.4)',
                delay: 0.4,
              },
            };

            const style = positionStyles[realPosition as 1 | 2 | 3];

            return (
              <motion.div
                key={candidate.candidateId}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: style.delay, duration: 0.6 }}
                whileHover={{ scale: 1.05, y: -10 }}
                className="relative"
              >
                {/* Card glassmorphism */}
                <div
                  className={`relative ${style.height} rounded-3xl overflow-hidden`}
                  style={{
                    background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.7) 0%, rgba(75, 0, 130, 0.4) 100%)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(200, 164, 92, 0.3)',
                    boxShadow: style.glow,
                  }}
                >
                  {/* Badge position */}
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <motion.div
                      animate={{
                        rotate: realPosition === 1 ? [0, 10, -10, 0] : 0,
                      }}
                      transition={{
                        duration: 2,
                        repeat: realPosition === 1 ? Infinity : 0,
                        ease: 'easeInOut',
                      }}
                    >
                      {style.icon}
                    </motion.div>
                  </div>

                  {/* Photo candidat */}
                  <div className="absolute inset-0">
                    <img
                      src={candidate.photoUrl || 'https://via.placeholder.com/400x500'}
                      alt={candidate.candidateName}
                      className="w-full h-full object-cover"
                    />
                    <div
                      className={`absolute inset-0 bg-gradient-to-t ${style.gradient} opacity-30`}
                    ></div>
                  </div>

                  {/* Informations */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/80 to-transparent">
                    <div className="text-center">
                      <p className="text-sm text-[#B0B0B0] mb-2">#{realPosition}</p>
                      <h3
                        className="text-2xl font-bold text-white mb-2"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                      >
                        {candidate.candidateName}
                      </h3>
                      <div className="flex items-center justify-center gap-2 mb-3">
                        <Heart className="w-4 h-4 text-[#EC4899] fill-[#EC4899]" />
                        <p className="text-lg font-bold text-white">
                          {Number(candidate.voteCount).toLocaleString()} votes
                        </p>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${percentage}%` }}
                          viewport={{ once: true }}
                          transition={{ delay: style.delay + 0.5, duration: 1 }}
                          className={`h-full bg-gradient-to-r ${style.gradient}`}
                        ></motion.div>
                      </div>
                      <p className="text-sm text-[#B0B0B0] mt-2">{percentage}% des votes</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA Voter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="text-center mt-16"
        >
          <Link href="/vote">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(236, 72, 153, 0.6)' }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-5 rounded-full bg-gradient-to-r from-[#EC4899] via-[#F472B6] to-[#EC4899] text-white font-bold text-xl flex items-center gap-3 mx-auto shadow-lg"
            >
              <Heart className="w-6 h-6 fill-white" />
              Votez pour votre favori(te)
              <Sparkles className="w-6 h-6" />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

// ==================== COMPOSANT PRINCIPAL ====================

export default function MissMisterDour2026Premium() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.95]);

  // Candidats Miss (données statiques pour l'instant)
  const candidatesMiss = [
    {
      id: 1,
      name: "Sophie Laurent",
      age: 24,
      city: "Dour",
      shareCount: 0,
      photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=500&fit=crop",
    },
    {
      id: 2,
      name: "Emma Dubois",
      age: 22,
      city: "Mons",
      shareCount: 0,
      photo: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=500&fit=crop",
    },
    {
      id: 3,
      name: "Léa Martin",
      age: 26,
      city: "Tournai",
      shareCount: 0,
      photo: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=500&fit=crop",
    },
  ];

  const candidatesMister = [
    {
      id: 4,
      name: "Thomas Bernard",
      age: 27,
      city: "Dour",
      shareCount: 0,
      photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop",
    },
    {
      id: 5,
      name: "Lucas Petit",
      age: 25,
      city: "Mons",
      shareCount: 0,
      photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop",
    },
    {
      id: 6,
      name: "Alexandre Durand",
      age: 28,
      city: "Charleroi",
      shareCount: 0,
      photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=500&fit=crop",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white overflow-x-hidden">
      {/* SEO Meta Tags */}
      <SEOHead
        title="Miss & Mister Dour 2026 - Candidats Officiels"
        description="Découvrez les candidats officiels Miss & Mister Dour 2026. Un miroir ne reflète pas seulement l'image… Il révèle l'essence. Finale le 19 avril 2026 au Liligaga Mirror."
        image="https://files.manuscdn.com/user_upload_by_module/session_file/87304619/eiRLiShMPFEUcfRq.png"
        url={typeof window !== 'undefined' ? window.location.href : undefined}
        type="website"
      />
      
      {/* Schema.org Structured Data */}
      <StructuredData data={createEventSchema(typeof window !== 'undefined' ? window.location.origin : 'https://missdourweb.manus.space')} />
      <StructuredData data={createOrganizationSchema(typeof window !== 'undefined' ? window.location.origin : 'https://missdourweb.manus.space')} />
      {/* Animations d'arrière-plan */}
      <SubtleParticles />
      <MirrorOverlay />
      <LightAnimation />

      {/* Navigation Premium */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-xl border-b border-[#C8A45C]/20"
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/miss-mister-dour-2026">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center"
            >
              <img
                src="https://files.manuscdn.com/user_upload_by_module/session_file/87304619/GRnxeynZwidOueul.png"
                alt="Miss & Mister Dour 2026"
                className="h-12 md:h-16 w-auto"
              />
            </motion.div>
          </Link>

          {/* Menu Desktop */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#candidats" className="text-[#B0B0B0] hover:text-[#C8A45C] transition-colors">
              Candidats
            </a>
            <a href="#concept" className="text-[#B0B0B0] hover:text-[#C8A45C] transition-colors">
              Concept
            </a>
            <a href="#galerie" className="text-[#B0B0B0] hover:text-[#C8A45C] transition-colors">
              Galerie
            </a>
            <Link href="/vote">
              <span className="text-[#B0B0B0] hover:text-[#C8A45C] transition-colors cursor-pointer">
                Voter
              </span>
            </Link>
            <NotificationBell />
            <Link href="/inscription-candidat">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2 rounded-full bg-gradient-to-r from-[#C8A45C] to-[#D4AF37] text-black font-semibold"
              >
                S'inscrire
              </motion.button>
            </Link>
          </div>

          {/* Bouton Menu Mobile */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-black/60 border border-[#C8A45C]/30"
          >
            {mobileMenuOpen ? <X className="w-6 h-6 text-[#C8A45C]" /> : <Menu className="w-6 h-6 text-[#C8A45C]" />}
          </button>
        </div>

        {/* Menu Mobile Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
              />
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25 }}
                className="fixed top-0 right-0 bottom-0 w-[280px] bg-black/95 backdrop-blur-xl border-l border-[#C8A45C]/30 z-50 p-8"
              >
                <div className="flex flex-col gap-6 mt-16">
                  <a
                    href="#candidats"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-lg text-[#B0B0B0] hover:text-[#C8A45C] transition-colors flex items-center gap-3"
                  >
                    <Trophy className="w-5 h-5" />
                    Candidats
                  </a>
                  <a
                    href="#concept"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-lg text-[#B0B0B0] hover:text-[#C8A45C] transition-colors flex items-center gap-3"
                  >
                    <Sparkles className="w-5 h-5" />
                    Concept
                  </a>
                  <a
                    href="#galerie"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-lg text-[#B0B0B0] hover:text-[#C8A45C] transition-colors flex items-center gap-3"
                  >
                    <Share2 className="w-5 h-5" />
                    Galerie
                  </a>
                  <Link href="/vote">
                    <span
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-lg text-[#B0B0B0] hover:text-[#C8A45C] transition-colors flex items-center gap-3 cursor-pointer"
                    >
                      <Heart className="w-5 h-5" />
                      Voter
                    </span>
                  </Link>
                  <div className="flex justify-start">
                    <NotificationBell />
                  </div>
                  <Link href="/inscription-candidat">
                    <button className="w-full px-6 py-3 rounded-full bg-gradient-to-r from-[#C8A45C] to-[#D4AF37] text-black font-semibold">
                      S'inscrire
                    </button>
                  </Link>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* HERO SECTION CINÉMATOGRAPHIQUE */}
      <motion.section
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative min-h-screen flex items-center justify-center px-4 pt-20"
      >
        <div className="relative z-10 text-center max-w-5xl mx-auto">
          {/* Logo officiel animé */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              rotate: 0,
            }}
            transition={{ 
              duration: 1.2, 
              ease: [0.6, 0.05, 0.01, 0.9],
              scale: {
                type: "spring",
                damping: 10,
                stiffness: 100,
              }
            }}
            className="mb-16 flex justify-center"
          >
            <motion.img
              src="https://files.manuscdn.com/user_upload_by_module/session_file/87304619/GRnxeynZwidOueul.png"
              alt="Miss & Mister Dour 2026"
              className="w-80 md:w-[500px] lg:w-[600px] h-auto"
              animate={{
                filter: [
                  "drop-shadow(0 0 20px rgba(200, 164, 92, 0.3))",
                  "drop-shadow(0 0 40px rgba(200, 164, 92, 0.5))",
                  "drop-shadow(0 0 20px rgba(200, 164, 92, 0.3))",
                ],
              }}
              transition={{
                filter: {
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }
              }}
            />
          </motion.div>

          {/* Sous-titre */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-xl md:text-2xl text-[#B0B0B0] mb-4"
          >
            19 Avril 2026 — <span className="text-[#4B0082]">Liligaga Mirror</span>
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-base md:text-lg text-[#B0B0B0] mb-12 max-w-2xl mx-auto"
          >
            Salle des Fêtes de Dour • 20h00
          </motion.p>

          {/* Baromètre Social Global */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            className="mb-8 flex justify-center"
          >
            <BarometerOrb size="lg" />
          </motion.div>

          {/* Compte à rebours */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mb-12"
          >
            <Countdown />
          </motion.div>

          {/* Boutons CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            {/* Bouton Voter maintenant - CTA principal */}
            <Link href="/vote">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(236, 72, 153, 0.6)" }}
                whileTap={{ scale: 0.95 }}
                animate={{
                  boxShadow: [
                    "0 0 20px rgba(236, 72, 153, 0.3)",
                    "0 0 30px rgba(236, 72, 153, 0.5)",
                    "0 0 20px rgba(236, 72, 153, 0.3)",
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="px-8 py-4 rounded-full bg-gradient-to-r from-[#EC4899] via-[#F472B6] to-[#EC4899] text-white font-bold text-lg flex items-center gap-2 shadow-lg"
              >
                <Heart className="w-5 h-5 fill-white" />
                Voter maintenant
                <Sparkles className="w-5 h-5" />
              </motion.button>
            </Link>

            <Link href="/inscription-candidat">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(200, 164, 92, 0.5)" }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 rounded-full bg-gradient-to-r from-[#C8A45C] to-[#D4AF37] text-black font-bold text-lg flex items-center gap-2"
              >
                Devenir candidat(e)
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>

            <motion.button
              whileHover={{ scale: 1.05, borderColor: "#C8A45C" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => document.getElementById("candidats")?.scrollIntoView({ behavior: "smooth" })}
              className="px-8 py-4 rounded-full border-2 border-white/30 text-white font-semibold text-lg hover:border-[#C8A45C] transition-colors"
            >
              Découvrir les candidats
            </motion.button>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, repeat: Infinity, duration: 1.5 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-[#C8A45C]/50 rounded-full flex justify-center">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-1.5 h-1.5 bg-[#C8A45C] rounded-full mt-2"
            />
          </div>
        </motion.div>
      </motion.section>

      {/* SECTION CONCEPT LILIGAGA MIRROR */}
      <section id="concept" className="relative py-32 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            {/* Card glassmorphism */}
            <div
              className="relative p-12 md:p-16 rounded-3xl overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(0, 0, 0, 0.6) 0%, rgba(75, 0, 130, 0.3) 100%)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(200, 164, 92, 0.3)",
              }}
            >
              {/* Citation */}
              <blockquote className="text-center">
                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl md:text-5xl font-light italic mb-8 text-white leading-relaxed"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  "Un miroir ne reflète pas seulement l'image…
                  <br />
                  <span className="text-[#C8A45C]">Il révèle l'essence.</span>"
                </motion.p>
                <motion.footer
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                  className="text-[#B0B0B0] text-lg"
                >
                  — Philosophie Liligaga Mirror
                </motion.footer>
              </blockquote>

              {/* Description */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.7 }}
                className="mt-12 text-center text-[#B0B0B0] text-lg leading-relaxed max-w-2xl mx-auto"
              >
                <p>
                  Miss & Mister Dour 2026 est bien plus qu'un concours de beauté. C'est une célébration de l'authenticité,
                  de l'élégance et du charisme. Inspiré par la philosophie Liligaga Mirror, cet événement révèle la vraie
                  essence de chaque candidat, au-delà des apparences.
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECTION TOP 3 EN TEMPS RÉEL */}
      <VoteLiveSection />

      {/* SECTION CANDIDATS MISS */}
      <section id="candidats" className="relative py-32 px-4">
        <div className="container mx-auto">
          {/* Titre section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2
              className="text-4xl md:text-6xl font-bold mb-4"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              <span className="text-white">Candidates</span>{" "}
              <span className="bg-gradient-to-r from-[#EC4899] to-[#C8A45C] bg-clip-text text-transparent">
                Miss Dour 2026
              </span>
            </h2>
            <p className="text-[#B0B0B0] text-lg">Élégance, charisme et authenticité</p>
          </motion.div>

          {/* Grille candidats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {candidatesMiss.map((candidate, index) => (
              <motion.div
                key={candidate.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -10 }}
                className="group relative"
              >
                {/* Card */}
                <div
                  className="relative rounded-2xl overflow-hidden"
                  style={{
                    background: "rgba(0, 0, 0, 0.4)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(236, 72, 153, 0.3)",
                  }}
                >
                  {/* Photo */}
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <img
                      src={candidate.photo}
                      alt={candidate.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Bouton hover */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 0 }}
                      whileHover={{ opacity: 1, y: 0 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <button className="px-6 py-3 rounded-full bg-gradient-to-r from-[#EC4899] to-[#C8A45C] text-white font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        Voir le profil
                      </button>
                    </motion.div>
                  </div>

                  {/* Infos */}
                  <div className="p-6">
                    <h3
                      className="text-2xl font-bold text-white mb-2"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {candidate.name}
                    </h3>
                    <div className="flex items-center gap-4 text-[#B0B0B0] text-sm mb-4">
                      <span>{candidate.age} ans</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {candidate.city}
                      </span>
                    </div>
                    
                    {/* Compteur de partages */}
                    <ShareCountBadge shareCount={candidate.shareCount || 0} className="mb-3" />
                    
                    {/* Boutons de partage social */}
                    <SocialShareButtonsCompact
                      candidateName={candidate.name}
                      candidateId={candidate.id}
                      contestId={1}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION CANDIDATS MISTER */}
      <section className="relative py-32 px-4 bg-black/20">
        <div className="container mx-auto">
          {/* Titre section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2
              className="text-4xl md:text-6xl font-bold mb-4"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              <span className="text-white">Candidats</span>{" "}
              <span className="bg-gradient-to-r from-[#3B82F6] to-[#C8A45C] bg-clip-text text-transparent">
                Mister Dour 2026
              </span>
            </h2>
            <p className="text-[#B0B0B0] text-lg">Charme, prestance et caractère</p>
          </motion.div>

          {/* Grille candidats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {candidatesMister.map((candidate, index) => (
              <motion.div
                key={candidate.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -10 }}
                className="group relative"
              >
                {/* Card */}
                <div
                  className="relative rounded-2xl overflow-hidden"
                  style={{
                    background: "rgba(0, 0, 0, 0.4)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(59, 130, 246, 0.3)",
                  }}
                >
                  {/* Photo */}
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <img
                      src={candidate.photo}
                      alt={candidate.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Bouton hover */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 0 }}
                      whileHover={{ opacity: 1, y: 0 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <button className="px-6 py-3 rounded-full bg-gradient-to-r from-[#3B82F6] to-[#C8A45C] text-white font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        Voir le profil
                      </button>
                    </motion.div>
                  </div>

                  {/* Infos */}
                  <div className="p-6">
                    <h3
                      className="text-2xl font-bold text-white mb-2"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {candidate.name}
                    </h3>
                    <div className="flex items-center gap-4 text-[#B0B0B0] text-sm mb-4">
                      <span>{candidate.age} ans</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {candidate.city}
                      </span>
                    </div>
                    
                    {/* Compteur de partages */}
                    <ShareCountBadge shareCount={candidate.shareCount || 0} className="mb-3" />
                    
                    {/* Boutons de partage social */}
                    <SocialShareButtonsCompact
                      candidateName={candidate.name}
                      candidateId={candidate.id}
                      contestId={1}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION CTA VOTE */}
      <section className="relative py-32 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative p-12 md:p-16 rounded-3xl overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(200, 164, 92, 0.2) 0%, rgba(75, 0, 130, 0.2) 100%)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(200, 164, 92, 0.3)",
            }}
          >
            <Trophy className="w-16 h-16 text-[#C8A45C] mx-auto mb-6" />
            <h2
              className="text-4xl md:text-5xl font-bold mb-6 text-white"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Votez pour votre favori(te)
            </h2>
            <p className="text-lg text-[#B0B0B0] mb-8 max-w-2xl mx-auto">
              Le vote du public compte ! Soutenez votre candidat(e) préféré(e) et aidez-le/la à remporter le titre
              de Miss ou Mister Dour 2026.
            </p>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(200, 164, 92, 0.6)" }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-4 rounded-full bg-gradient-to-r from-[#C8A45C] to-[#D4AF37] text-black font-bold text-lg flex items-center gap-2 mx-auto"
            >
              <Heart className="w-5 h-5" />
              Voter maintenant
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* FOOTER PREMIUM AVEC SIGNATURE JS-INNOV.IA */}
      <footer className="relative py-16 px-4 border-t border-[#C8A45C]/20">
        <div className="container mx-auto">
          {/* Signature JS-Innov.IA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Link href="/js-innov">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="inline-block"
              >
                <div className="text-sm text-[#B0B0B0] mb-2 uppercase tracking-wider">
                  Conception & Technologie
                </div>
                <div
                  className="text-3xl font-bold bg-gradient-to-r from-[#C8A45C] to-[#D4AF37] bg-clip-text text-transparent flex items-center gap-2 justify-center"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  <motion.span
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                  >
                    ✨
                  </motion.span>
                  JS-Innov.IA
                  <motion.span
                    animate={{ rotate: [0, -5, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                  >
                    ✨
                  </motion.span>
                </div>
                <div className="text-xs text-[#B0B0B0] mt-1">
                  Intelligence Artificielle & Innovation
                </div>
              </motion.div>
            </Link>
          </motion.div>

          {/* Navigation footer */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12 max-w-4xl mx-auto">
            <div>
              <h4 className="text-white font-semibold mb-4">Navigation</h4>
              <ul className="space-y-2 text-[#B0B0B0] text-sm">
                <li><a href="#candidats" className="hover:text-[#C8A45C] transition-colors">Candidats</a></li>
                <li><a href="#concept" className="hover:text-[#C8A45C] transition-colors">Concept</a></li>
                <li><a href="#galerie" className="hover:text-[#C8A45C] transition-colors">Galerie</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Participer</h4>
              <ul className="space-y-2 text-[#B0B0B0] text-sm">
                <li><Link href="/inscription-candidat" className="hover:text-[#C8A45C] transition-colors">S'inscrire</Link></li>
                <li><Link href="/vote" className="hover:text-[#C8A45C] transition-colors">Voter</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Partenaires</h4>
              <ul className="space-y-2 text-[#B0B0B0] text-sm">
                <li><Link href="/liligaga" className="hover:text-[#C8A45C] transition-colors">Liligaga Mirror</Link></li>
                <li><Link href="/js-innov" className="hover:text-[#C8A45C] transition-colors">JS-Innov.IA</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-[#B0B0B0] text-sm">
                <li><a href="mailto:contact@miss-mister-dour.be" className="hover:text-[#C8A45C] transition-colors">Email</a></li>
                <li><a href="tel:+32123456789" className="hover:text-[#C8A45C] transition-colors">Téléphone</a></li>
              </ul>
            </div>
          </div>

          {/* Réseaux sociaux */}
          <div className="flex justify-center gap-6 mb-8">
            <motion.a
              whileHover={{ scale: 1.1, y: -2 }}
              href="https://instagram.com/missmisterdour"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full bg-gradient-to-br from-[#E4405F] to-[#F77737] flex items-center justify-center"
            >
              <Instagram className="w-6 h-6 text-white" />
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.1, y: -2 }}
              href="https://facebook.com/missmisterdour"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full bg-[#3B82F6] flex items-center justify-center"
            >
              <Facebook className="w-6 h-6 text-white" />
            </motion.a>
          </div>

          {/* Copyright */}
          <div className="text-center text-[#B0B0B0] text-sm">
            <p>© 2026 Miss & Mister Dour - Tous droits réservés</p>
            <p className="mt-2">
              Créé par <span className="text-[#C8A45C]">Pagin Julien</span> - Dour, Belgique
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
