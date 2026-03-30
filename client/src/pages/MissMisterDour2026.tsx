import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { Link } from "wouter";
import { Calendar, MapPin, Clock, Heart, Share2, Trophy, Sparkles, Menu, X } from "lucide-react";

// Hook pour détecter mobile
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

// Composant Particules dorées
function GoldenParticles({ count }: { count: number }) {
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
      speedX: number;
      speedY: number;
      opacity: number;
    }> = [];

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.3,
      });
    }

    let animationFrameId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212, 175, 55, ${particle.opacity})`;
        ctx.fill();

        particle.x += particle.speedX;
        particle.y += particle.speedY;

        if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;
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
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ mixBlendMode: "screen" }}
    />
  );
}

// Composant Compte à rebours
function Countdown() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const targetDate = new Date("2026-04-19T20:00:00+02:00").getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-4 gap-4 md:gap-6 max-w-2xl mx-auto">
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
          transition={{ delay: index * 0.1 + 0.5 }}
          className="relative"
        >
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-[#D4AF37]/30">
            <div className="text-3xl md:text-5xl font-bold bg-gradient-to-br from-[#E8C547] via-[#D4AF37] to-[#B8941E] bg-clip-text text-transparent">
              {String(item.value).padStart(2, "0")}
            </div>
            <div className="text-xs md:text-sm text-[#C0C0C0] mt-2 uppercase tracking-wider">
              {item.label}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// Données des candidats (exemple)
const candidatesMiss = [
  {
    id: 1,
    name: "Sophie Laurent",
    age: 22,
    city: "Dour",
    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=500&fit=crop",
    bio: "Passionnée de mode et d'art, je rêve de représenter Dour avec élégance et grâce.",
  },
  {
    id: 2,
    name: "Emma Dubois",
    age: 24,
    city: "Mons",
    photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=500&fit=crop",
    bio: "Étudiante en communication, j'aime partager ma passion pour la culture belge.",
  },
  {
    id: 3,
    name: "Léa Martin",
    age: 21,
    city: "Tournai",
    photo: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=500&fit=crop",
    bio: "Danseuse professionnelle, je souhaite inspirer les jeunes à poursuivre leurs rêves.",
  },
];

const candidatesMister = [
  {
    id: 4,
    name: "Thomas Bernard",
    age: 25,
    city: "Dour",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop",
    bio: "Entrepreneur passionné, je veux montrer qu'élégance et ambition vont de pair.",
  },
  {
    id: 5,
    name: "Lucas Petit",
    age: 23,
    city: "Charleroi",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop",
    bio: "Sportif de haut niveau, je crois en l'importance de représenter notre région.",
  },
  {
    id: 6,
    name: "Alexandre Roux",
    age: 26,
    city: "Mons",
    photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=500&fit=crop",
    bio: "Musicien et artiste, je souhaite apporter ma créativité à cet événement prestigieux.",
  },
];

// Composant Card Candidat
function CandidateCard({ candidate, category }: { candidate: typeof candidatesMiss[0]; category: "miss" | "mister" }) {
  const gradientColor = category === "miss" 
    ? "from-[#EC4899] via-[#F472B6] to-[#D4AF37]"
    : "from-[#3B82F6] via-[#06B6D4] to-[#D4AF37]";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.05, y: -10 }}
      className="group relative"
    >
      <div className="relative overflow-hidden rounded-2xl bg-black/40 backdrop-blur-xl border border-[#D4AF37]/30 hover:border-[#D4AF37] transition-all duration-300">
        {/* Photo */}
        <div className="relative h-80 overflow-hidden">
          <img
            src={candidate.photo}
            alt={candidate.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          <div className={`absolute inset-0 bg-gradient-to-t ${gradientColor} opacity-0 group-hover:opacity-30 transition-opacity duration-300`} />
        </div>

        {/* Informations */}
        <div className="p-6">
          <h3 className="text-2xl font-bold text-white mb-2">{candidate.name}</h3>
          <div className="flex items-center gap-4 text-[#C0C0C0] text-sm mb-3">
            <span>{candidate.age} ans</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {candidate.city}
            </span>
          </div>
          <p className="text-[#C0C0C0] text-sm mb-4 line-clamp-2">{candidate.bio}</p>

          {/* Boutons */}
          <div className="flex gap-3">
            <Link href={`/candidate/${candidate.id}`}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex-1 px-4 py-2 rounded-xl bg-gradient-to-r ${gradientColor} text-white font-semibold text-sm hover:shadow-lg hover:shadow-[#D4AF37]/50 transition-all duration-300`}
              >
                Voir le profil
              </motion.button>
            </Link>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 rounded-xl bg-black/60 backdrop-blur-xl border border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all duration-300"
            >
              <Heart className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function MissMisterDour2026() {
  const isMobile = useIsMobile();
  const particleCount = isMobile ? 15 : 50;
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fermer le menu avec Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [mobileMenuOpen]);

  // Bloquer le scroll du body quand le menu est ouvert
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white overflow-x-hidden">
      {/* Particules dorées */}
      <GoldenParticles count={particleCount} />

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] md:hidden"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-black/95 backdrop-blur-2xl border-l border-[#D4AF37]/30 z-[70] md:hidden overflow-y-auto"
            >
              <div className="p-6">
                {/* Header avec logo et bouton fermer */}
                <div className="flex items-center justify-between mb-8">
                  <img
                    src="https://files.manuscdn.com/user_upload_by_module/session_file/87304619/eiRLiShMPFEUcfRq.png"
                    alt="Miss & Mister Dour"
                    className="h-12 drop-shadow-[0_0_20px_rgba(212,175,55,0.6)]"
                  />
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-black/40 border border-[#D4AF37]/30 hover:border-[#D4AF37] transition-colors"
                    aria-label="Fermer le menu"
                  >
                    <X className="w-6 h-6 text-[#D4AF37]" />
                  </motion.button>
                </div>

                {/* Navigation Links */}
                <nav className="space-y-2 mb-8">
                  <a
                    href="#candidats-miss"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-black/40 border border-[#D4AF37]/20 hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all group"
                  >
                    <Sparkles className="w-5 h-5 text-[#EC4899] group-hover:text-[#F472B6] transition-colors" />
                    <span className="text-white font-semibold">Candidates Miss</span>
                  </a>
                  <a
                    href="#candidats-mister"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-black/40 border border-[#D4AF37]/20 hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all group"
                  >
                    <Trophy className="w-5 h-5 text-[#3B82F6] group-hover:text-[#06B6D4] transition-colors" />
                    <span className="text-white font-semibold">Candidats Mister</span>
                  </a>
                  <a
                    href="#vote"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-black/40 border border-[#D4AF37]/20 hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all group"
                  >
                    <Heart className="w-5 h-5 text-[#D4AF37] group-hover:text-[#E8C547] transition-colors" />
                    <span className="text-white font-semibold">Voter</span>
                  </a>
                  <Link href="/liligaga">
                    <a
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl bg-black/40 border border-[#D4AF37]/20 hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all group"
                    >
                      <Sparkles className="w-5 h-5 text-[#7C3AED] group-hover:text-[#A855F7] transition-colors" />
                      <span className="text-white font-semibold">Liligaga Mirror</span>
                    </a>
                  </Link>
                  <Link href="/js-innov">
                    <a
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl bg-black/40 border border-[#D4AF37]/20 hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all group"
                    >
                      <Sparkles className="w-5 h-5 text-[#06B6D4] group-hover:text-[#22D3EE] transition-colors" />
                      <span className="text-white font-semibold">JS-Innov.IA</span>
                    </a>
                  </Link>
                </nav>

                {/* CTA Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full px-6 py-4 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#E8C547] to-[#D4AF37] text-black font-bold text-lg hover:shadow-lg hover:shadow-[#D4AF37]/50 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Heart className="w-5 h-5 fill-current" />
                  Voter maintenant
                </motion.button>

                {/* Footer du drawer */}
                <div className="mt-8 pt-6 border-t border-[#D4AF37]/20">
                  <p className="text-[#C0C0C0] text-sm text-center">
                    © 2026 Miss & Mister Dour
                  </p>
                  <p className="text-[#C0C0C0] text-xs text-center mt-2">
                    Créé par <span className="text-[#D4AF37]">Pagin Julien</span>
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Navigation Sticky */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-2xl border-b border-[#D4AF37]/20"
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <motion.img
              whileHover={{ scale: 1.05, rotate: 5 }}
              src="https://files.manuscdn.com/user_upload_by_module/session_file/87304619/eiRLiShMPFEUcfRq.png"
              alt="Miss & Mister Dour"
              className="h-12 md:h-16 drop-shadow-[0_0_20px_rgba(212,175,55,0.6)]"
            />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#candidats-miss" className="text-[#C0C0C0] hover:text-[#D4AF37] transition-colors">
              Miss
            </a>
            <a href="#candidats-mister" className="text-[#C0C0C0] hover:text-[#D4AF37] transition-colors">
              Mister
            </a>
            <a href="#vote" className="text-[#C0C0C0] hover:text-[#D4AF37] transition-colors">
              Voter
            </a>
            <Link href="/liligaga">
              <span className="text-[#C0C0C0] hover:text-[#D4AF37] transition-colors cursor-pointer">
                Liligaga Mirror
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="hidden md:block px-6 py-2 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#E8C547] to-[#D4AF37] text-black font-bold text-sm md:text-base hover:shadow-lg hover:shadow-[#D4AF37]/50 transition-all duration-300"
            >
              Voter maintenant
            </motion.button>

            {/* Bouton Hamburger Mobile */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-11 h-11 flex flex-col items-center justify-center gap-1.5 rounded-lg bg-black/40 backdrop-blur-xl border border-[#D4AF37]/30 hover:border-[#D4AF37] transition-colors"
              aria-label="Menu"
            >
              <motion.span
                animate={{
                  rotate: mobileMenuOpen ? 45 : 0,
                  y: mobileMenuOpen ? 8 : 0,
                }}
                className="w-6 h-0.5 bg-[#D4AF37] rounded-full"
              />
              <motion.span
                animate={{
                  opacity: mobileMenuOpen ? 0 : 1,
                }}
                className="w-6 h-0.5 bg-[#D4AF37] rounded-full"
              />
              <motion.span
                animate={{
                  rotate: mobileMenuOpen ? -45 : 0,
                  y: mobileMenuOpen ? -8 : 0,
                }}
                className="w-6 h-0.5 bg-[#D4AF37] rounded-full"
              />
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.section
        style={{ opacity }}
        className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-24"
      >
        {/* Logo animé */}
        <motion.img
          initial={{ scale: 0, rotate: -180, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          src="https://files.manuscdn.com/user_upload_by_module/session_file/87304619/eiRLiShMPFEUcfRq.png"
          alt="Miss & Mister Dour"
          className="w-48 md:w-64 mb-8 drop-shadow-[0_0_60px_rgba(212,175,55,0.8)]"
        />

        {/* Titre principal */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-5xl md:text-7xl lg:text-8xl font-bold text-center mb-6"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Miss & Mister{" "}
          <span className="bg-gradient-to-r from-[#E8C547] via-[#D4AF37] to-[#B8941E] bg-clip-text text-transparent">
            Dour 2026
          </span>
        </motion.h1>

        {/* Sous-titre */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-xl md:text-2xl text-[#C0C0C0] text-center mb-12 max-w-3xl"
        >
          L'élégance, la grâce et le prestige se rencontrent pour célébrer l'excellence
        </motion.p>

        {/* Compte à rebours */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="mb-12 w-full max-w-4xl"
        >
          <Countdown />
        </motion.div>

        {/* Boutons CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col md:flex-row gap-4"
        >
          <motion.a
            href="#candidats-miss"
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#E8C547] to-[#D4AF37] text-black font-bold text-lg hover:shadow-2xl hover:shadow-[#D4AF37]/50 transition-all duration-300 flex items-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            Découvrir les candidats
          </motion.a>
          <motion.a
            href="#vote"
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 rounded-full bg-black/60 backdrop-blur-xl border-2 border-[#D4AF37] text-[#D4AF37] font-bold text-lg hover:bg-[#D4AF37]/10 transition-all duration-300 flex items-center gap-2"
          >
            <Heart className="w-5 h-5" />
            Voter maintenant
          </motion.a>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, repeat: Infinity, duration: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 rounded-full border-2 border-[#D4AF37] flex items-start justify-center p-2">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full"
            />
          </div>
        </motion.div>
      </motion.section>

      {/* Section Présentation Événement */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-black/40 backdrop-blur-xl rounded-3xl border border-[#D4AF37]/30 p-8 md:p-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-8" style={{ fontFamily: "'Playfair Display', serif" }}>
              Un Événement{" "}
              <span className="bg-gradient-to-r from-[#E8C547] via-[#D4AF37] to-[#B8941E] bg-clip-text text-transparent">
                Prestigieux
              </span>
            </h2>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="flex flex-col items-center text-center p-6 bg-black/40 rounded-2xl border border-[#D4AF37]/20">
                <Calendar className="w-12 h-12 text-[#D4AF37] mb-4" />
                <h3 className="text-xl font-bold mb-2">Date</h3>
                <p className="text-[#C0C0C0]">Samedi 19 Avril 2026</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-black/40 rounded-2xl border border-[#D4AF37]/20">
                <MapPin className="w-12 h-12 text-[#D4AF37] mb-4" />
                <h3 className="text-xl font-bold mb-2">Lieu</h3>
                <p className="text-[#C0C0C0]">Salle des Fêtes, Dour</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-black/40 rounded-2xl border border-[#D4AF37]/20">
                <Clock className="w-12 h-12 text-[#D4AF37] mb-4" />
                <h3 className="text-xl font-bold mb-2">Horaire</h3>
                <p className="text-[#C0C0C0]">20h00 - 02h00</p>
              </div>
            </div>

            <p className="text-lg text-[#C0C0C0] text-center leading-relaxed">
              Rejoignez-nous pour une soirée inoubliable célébrant l'élégance, le charme et le talent. 
              Miss & Mister Dour 2026 promet d'être un événement exceptionnel où se mêlent tradition, 
              modernité et prestige international. Venez découvrir nos candidats exceptionnels et 
              participez à l'élection de nos ambassadeurs 2026.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Section Candidats Miss */}
      <section id="candidats-miss" className="relative py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              Candidates{" "}
              <span className="bg-gradient-to-r from-[#EC4899] via-[#F472B6] to-[#D4AF37] bg-clip-text text-transparent">
                Miss Dour 2026
              </span>
            </h2>
            <p className="text-xl text-[#C0C0C0]">
              Découvrez nos candidates exceptionnelles
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {candidatesMiss.map((candidate) => (
              <CandidateCard key={candidate.id} candidate={candidate} category="miss" />
            ))}
          </div>
        </div>
      </section>

      {/* Section Candidats Mister */}
      <section id="candidats-mister" className="relative py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              Candidats{" "}
              <span className="bg-gradient-to-r from-[#3B82F6] via-[#06B6D4] to-[#D4AF37] bg-clip-text text-transparent">
                Mister Dour 2026
              </span>
            </h2>
            <p className="text-xl text-[#C0C0C0]">
              Découvrez nos candidats d'exception
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {candidatesMister.map((candidate) => (
              <CandidateCard key={candidate.id} candidate={candidate} category="mister" />
            ))}
          </div>
        </div>
      </section>

      {/* Section Vote CTA */}
      <section id="vote" className="relative py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#D4AF37]/20 via-[#EC4899]/20 to-[#3B82F6]/20 backdrop-blur-xl border border-[#D4AF37]/30 p-12 text-center"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(212,175,55,0.1),transparent_70%)]" />
            
            <Trophy className="w-20 h-20 text-[#D4AF37] mx-auto mb-6" />
            
            <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
              Votez pour votre{" "}
              <span className="bg-gradient-to-r from-[#E8C547] via-[#D4AF37] to-[#B8941E] bg-clip-text text-transparent">
                Favori(te)
              </span>
            </h2>
            
            <p className="text-xl text-[#C0C0C0] mb-8 max-w-2xl mx-auto">
              Votre voix compte ! Soutenez votre candidat(e) préféré(e) et aidez-le/la à remporter 
              le titre de Miss ou Mister Dour 2026.
            </p>

            <motion.button
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              className="px-12 py-5 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#E8C547] to-[#D4AF37] text-black font-bold text-xl hover:shadow-2xl hover:shadow-[#D4AF37]/50 transition-all duration-300 flex items-center gap-3 mx-auto"
            >
              <Heart className="w-6 h-6 fill-current" />
              Voter maintenant
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Footer Premium */}
      <footer className="relative bg-black/60 backdrop-blur-xl border-t border-[#D4AF37]/20 py-12 px-4 mt-20">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Logo et description */}
            <div className="md:col-span-2">
              <img
                src="https://files.manuscdn.com/user_upload_by_module/session_file/87304619/eiRLiShMPFEUcfRq.png"
                alt="Miss & Mister Dour"
                className="h-16 mb-4 drop-shadow-[0_0_20px_rgba(212,175,55,0.6)]"
              />
              <p className="text-[#C0C0C0] mb-4">
                L'événement de prestige qui célèbre l'élégance et le talent à Dour depuis 2026.
              </p>
            </div>

            {/* Navigation */}
            <div>
              <h3 className="text-[#D4AF37] font-bold mb-4">Navigation</h3>
              <ul className="space-y-2 text-[#C0C0C0]">
                <li><a href="#candidats-miss" className="hover:text-[#D4AF37] transition-colors">Miss</a></li>
                <li><a href="#candidats-mister" className="hover:text-[#D4AF37] transition-colors">Mister</a></li>
                <li><a href="#vote" className="hover:text-[#D4AF37] transition-colors">Voter</a></li>
                <li><Link href="/liligaga"><span className="hover:text-[#D4AF37] transition-colors cursor-pointer">Liligaga Mirror</span></Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-[#D4AF37] font-bold mb-4">Contact</h3>
              <ul className="space-y-2 text-[#C0C0C0]">
                <li>Dour, Belgique</li>
                <li>info@missmisterdour.be</li>
              </ul>
            </div>
          </div>

          {/* Séparateur */}
          <div className="border-t border-[#D4AF37]/20 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[#C0C0C0] text-sm">
              <p>© 2026 Miss & Mister Dour - Tous droits réservés</p>
              <p>
                Créé par <span className="text-[#D4AF37] font-semibold">Pagin Julien</span> - Dour, Belgique
              </p>
              <Link href="/js-innov">
                <span className="text-[#D4AF37] hover:text-[#E8C547] transition-colors cursor-pointer font-semibold">
                  JS-Innov.IA
                </span>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
