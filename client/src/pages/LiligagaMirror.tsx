/**
 * Miss & Mister Dour 2026 - Liligaga Mirror
 * Plateforme Vocale Immersive Ultra-Premium
 * 
 * Orchestrée par JS-Innov.IA
 * Créé par Pagin Julien - Dour, Belgique
 * © 2026 JS-Innov.IA - Tous droits réservés
 */

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Sparkles, Play, Pause, Volume2, VolumeX, Award, Users, Calendar, MapPin, Heart, Share2, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Types
interface Candidate {
  id: string;
  name: string;
  age: number;
  city: string;
  bio: string;
  bioFull: string;
  interests: string[];
  motivations: string;
  photos: string[];
  category: "miss" | "mister";
  audioUrl?: string;
}

export default function LiligagaMirror() {
  const [introComplete, setIntroComplete] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [showOutro, setShowOutro] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Données candidats (exemple)
  const candidates: Candidate[] = [
    {
      id: "miss-1",
      name: "Sophie Dubois",
      age: 23,
      city: "Dour",
      bio: "Passionnée de mode et d'art, je crois en l'élégance naturelle.",
      bioFull: "Passionnée de mode et d'art depuis mon plus jeune âge, je crois fermement que l'élégance véritable vient de l'intérieur. Mon parcours dans le mannequinat m'a appris l'importance de la confiance en soi et de l'authenticité.",
      interests: ["Mode", "Photographie", "Voyages"],
      motivations: "Représenter la beauté de notre région et inspirer les jeunes femmes à poursuivre leurs rêves.",
      photos: ["/placeholder-miss-1.jpg"],
      category: "miss"
    },
    {
      id: "mister-1",
      name: "Thomas Martin",
      age: 25,
      city: "Dour",
      bio: "Entrepreneur et sportif, je défends les valeurs de dépassement de soi.",
      bioFull: "Entrepreneur dans le domaine du sport et passionné de fitness, je crois que le dépassement de soi est la clé du succès. Mon engagement associatif auprès des jeunes me tient particulièrement à cœur.",
      interests: ["Sport", "Entrepreneuriat", "Bénévolat"],
      motivations: "Montrer qu'on peut allier ambition professionnelle et engagement social.",
      photos: ["/placeholder-mister-1.jpg"],
      category: "mister"
    }
  ];

  // Effet audio intro
  useEffect(() => {
    if (!introComplete && audioRef.current && !muted) {
      // Simuler la voix de Julian (à remplacer par ElevenLabs)
      // audioRef.current.play();
    }
  }, [introComplete, muted]);

  // Skip intro
  const skipIntro = () => {
    setIntroComplete(true);
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Audio Julian (voix ElevenLabs à intégrer) */}
      <audio ref={audioRef} src="/audio/julian-intro.mp3" />

      {/* Bouton Mute Global */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed top-6 right-6 z-50 w-12 h-12 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
        onClick={() => setMuted(!muted)}
      >
        {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
      </motion.button>

      {/* Intro Cinématique */}
      <AnimatePresence>
        {!introComplete && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="fixed inset-0 z-40 flex items-center justify-center bg-black"
          >
            {/* Effet Miroir Brisé */}
            <div className="absolute inset-0 overflow-hidden">
              {/* Particules argentées */}
              {[...Array(30)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ 
                    x: Math.random() * window.innerWidth, 
                    y: Math.random() * window.innerHeight,
                    scale: 0,
                    opacity: 0
                  }}
                  animate={{ 
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0],
                    x: Math.random() * window.innerWidth,
                    y: Math.random() * window.innerHeight
                  }}
                  transition={{ 
                    duration: 3,
                    delay: i * 0.1,
                    repeat: Infinity,
                    repeatDelay: Math.random() * 2
                  }}
                  className="absolute w-2 h-2 bg-gradient-to-br from-silver-400 to-purple-400 rounded-full blur-sm"
                  style={{
                    boxShadow: '0 0 20px rgba(192, 192, 192, 0.5)'
                  }}
                />
              ))}

              {/* Éclats de verre */}
              <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="glass-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#C0C0C0" stopOpacity="0.3" />
                    <stop offset="50%" stopColor="#E8E8E8" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#4A0E4E" stopOpacity="0.3" />
                  </linearGradient>
                </defs>
                {[...Array(8)].map((_, i) => (
                  <motion.polygon
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ 
                      opacity: [0, 0.7, 0],
                      scale: [0, 1.2, 0],
                      rotate: [0, 360]
                    }}
                    transition={{ 
                      duration: 2,
                      delay: i * 0.2,
                      ease: "easeOut"
                    }}
                    points={`${Math.random() * 100},${Math.random() * 100} ${Math.random() * 100},${Math.random() * 100} ${Math.random() * 100},${Math.random() * 100}`}
                    fill="url(#glass-gradient)"
                    stroke="#C0C0C0"
                    strokeWidth="1"
                    style={{
                      filter: 'drop-shadow(0 0 10px rgba(192, 192, 192, 0.5))'
                    }}
                  />
                ))}
              </svg>
            </div>

            {/* Contenu Intro */}
            <div className="relative z-10 text-center px-6">
              {/* Logo JS-Innov.IA */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 1, delay: 0.5 }}
                className="mb-12"
              >
                <img 
                  src="https://files.manuscdn.com/user_upload_by_module/session_file/87304619/TSTzHwjZoWSIonON.jpg" 
                  alt="JS-Innov.IA Logo" 
                  className="w-32 h-32 mx-auto object-contain mb-4"
                  style={{
                    filter: 'drop-shadow(0 0 40px rgba(212, 175, 55, 0.5))'
                  }}
                />
                <div className="text-sm text-gray-400 mt-2">présente</div>
              </motion.div>

              {/* Titre Liligaga */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 1 }}
              >
                <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-silver-300 via-purple-400 to-silver-300 bg-clip-text text-transparent"
                  style={{
                    textShadow: '0 0 30px rgba(192, 192, 192, 0.5)'
                  }}
                >
                  Liligaga Mirror
                </h1>
                <p className="text-xl md:text-2xl text-gray-300 mb-4">
                  Miss & Mister Dour 2026
                </p>
              </motion.div>

              {/* Message Julian */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 2 }}
                className="mt-12 max-w-2xl mx-auto"
              >
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold">Julian</div>
                      <div className="text-sm text-gray-400">Agent IA d'accueil</div>
                    </div>
                  </div>
                  <p className="text-lg italic text-gray-300">
                    "Bienvenue dans le miroir de l'élégance augmentée… Liligaga 2026."
                  </p>
                  
                  {/* Onde sonore animée */}
                  <div className="flex items-center justify-center gap-1 mt-6">
                    {[...Array(20)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{
                          scaleY: [1, Math.random() * 2 + 1, 1]
                        }}
                        transition={{
                          duration: 0.5,
                          repeat: Infinity,
                          delay: i * 0.05
                        }}
                        className="w-1 h-8 bg-gradient-to-t from-purple-500 to-blue-400 rounded-full"
                      />
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Bouton Skip */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 3 }}
                className="mt-12"
              >
                <Button
                  onClick={skipIntro}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-none px-8 py-6 text-lg"
                >
                  Entrer dans l'expérience
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contenu Principal */}
      {introComplete && (
        <div className="relative z-10">
          {/* Navigation */}
          <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="fixed top-0 left-0 right-0 z-30 bg-black/80 backdrop-blur-xl border-b border-white/10"
          >
            <div className="container mx-auto px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src="https://files.manuscdn.com/user_upload_by_module/session_file/87304619/TnnTVaRgkxfghmQM.png" 
                  alt="Miss & Mister Dour Logo" 
                  className="h-12 w-auto object-contain"
                />
              </div>
              <div className="hidden md:flex items-center gap-6">
                <a href="#miss" className="text-gray-300 hover:text-white transition-colors">Miss</a>
                <a href="#mister" className="text-gray-300 hover:text-white transition-colors">Mister</a>
                <a href="#vote" className="text-gray-300 hover:text-white transition-colors">Voter</a>
                <a href="#sponsors" className="text-gray-300 hover:text-white transition-colors">Partenaires</a>
              </div>
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-none">
                Voter maintenant
              </Button>
            </div>
          </motion.nav>

          {/* Hero Section */}
          <section className="min-h-screen flex items-center justify-center pt-20 relative overflow-hidden">
            {/* Background animé */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20" />
            
            {/* Particules */}
            <div className="absolute inset-0">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    y: [0, -30, 0],
                    x: [0, Math.random() * 20 - 10, 0],
                    opacity: [0.3, 0.7, 0.3]
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                  className="absolute w-1 h-1 bg-silver-400 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    boxShadow: '0 0 10px rgba(192, 192, 192, 0.5)'
                  }}
                />
              ))}
            </div>

            <div className="relative z-10 container mx-auto px-6 text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
              >
                <h1 className="text-5xl md:text-7xl font-bold mb-6">
                  L'élégance{" "}
                  <span className="bg-gradient-to-r from-purple-400 via-silver-300 to-blue-400 bg-clip-text text-transparent">
                    augmentée
                  </span>
                </h1>
                <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
                  Découvrez les candidats Miss & Mister Dour 2026 dans une expérience immersive 
                  propulsée par l'intelligence artificielle.
                </p>

                <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                  {[
                    { icon: Calendar, label: "19 Avril 2026", desc: "Soirée finale" },
                    { icon: MapPin, label: "Dour, Belgique", desc: "Centre Sportif d'Elouges" },
                    { icon: Users, label: "20 Candidats", desc: "Miss & Mister" }
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
                    >
                      <item.icon className="w-8 h-8 text-purple-400 mx-auto mb-4" />
                      <div className="font-semibold mb-2">{item.label}</div>
                      <div className="text-sm text-gray-400">{item.desc}</div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </section>

          {/* Section Candidats Miss */}
          <section id="miss" className="py-32 bg-gradient-to-b from-black to-purple-900/10">
            <div className="container mx-auto px-6">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-20"
              >
                <h2 className="text-4xl md:text-6xl font-bold mb-6">
                  Candidates <span className="text-purple-400">Miss</span>
                </h2>
                <p className="text-xl text-gray-400">
                  Découvrez les candidates qui incarnent l'élégance et la grâce
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {candidates.filter(c => c.category === "miss").map((candidate, i) => (
                  <CandidateCard 
                    key={candidate.id} 
                    candidate={candidate} 
                    index={i}
                    onSelect={setSelectedCandidate}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* Section Candidats Mister */}
          <section id="mister" className="py-32 bg-gradient-to-b from-purple-900/10 to-blue-900/10">
            <div className="container mx-auto px-6">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-20"
              >
                <h2 className="text-4xl md:text-6xl font-bold mb-6">
                  Candidats <span className="text-blue-400">Mister</span>
                </h2>
                <p className="text-xl text-gray-400">
                  Découvrez les candidats qui incarnent le charisme et l'élégance
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {candidates.filter(c => c.category === "mister").map((candidate, i) => (
                  <CandidateCard 
                    key={candidate.id} 
                    candidate={candidate} 
                    index={i}
                    onSelect={setSelectedCandidate}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* Section Vote */}
          <section id="vote" className="py-32 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20">
            <div className="container mx-auto px-6">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="max-w-4xl mx-auto text-center"
              >
                <h2 className="text-4xl md:text-6xl font-bold mb-8">
                  Votez pour votre{" "}
                  <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                    favori(te)
                  </span>
                </h2>
                <p className="text-xl text-gray-300 mb-12">
                  Votre vote compte ! Soutenez le candidat ou la candidate qui vous inspire le plus.
                </p>
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-none text-xl px-12 py-8"
                >
                  <Heart className="w-6 h-6 mr-2" />
                  Voter maintenant
                </Button>
              </motion.div>
            </div>
          </section>

          {/* Section Tech JS-Innov.IA */}
          <section className="py-32 bg-black">
            <div className="container mx-auto px-6">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <img 
                  src="https://files.manuscdn.com/user_upload_by_module/session_file/87304619/TSTzHwjZoWSIonON.jpg" 
                  alt="JS-Innov.IA Logo" 
                  className="w-40 h-40 mx-auto object-contain mb-8"
                  style={{
                    filter: 'drop-shadow(0 0 60px rgba(212, 175, 55, 0.5))'
                  }}
                />
                <h2 className="text-3xl md:text-5xl font-bold mb-6">
                  Propulsé par{" "}
                  <span className="text-blue-400">JS-Innov.IA</span>
                </h2>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12">
                  Toute cette expérience immersive est rendue possible grâce à l'intelligence artificielle 
                  et aux technologies de pointe développées par JS-Innov.IA.
                </p>
                <Button 
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                  onClick={() => window.open('/', '_blank')}
                >
                  Découvrir JS-Innov.IA
                </Button>
              </motion.div>
            </div>
          </section>

          {/* Footer */}
          <footer className="bg-black border-t border-white/10 py-12">
            <div className="container mx-auto px-6 text-center">
              <p className="text-gray-400 mb-4">
                Toutes les technologies, images, agents et voix sont la propriété exclusive de JS-Innov.IA.
              </p>
              <p className="text-sm text-gray-500">
                Créé par Pagin Julien - Dour, Belgique<br />
                © 2026 JS-Innov.IA - Tous droits réservés
              </p>
            </div>
          </footer>
        </div>
      )}

      {/* Modal Candidat Détaillé */}
      <AnimatePresence>
        {selectedCandidate && (
          <CandidateModal 
            candidate={selectedCandidate} 
            onClose={() => setSelectedCandidate(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Composant Card Candidat
function CandidateCard({ candidate, index, onSelect }: { 
  candidate: Candidate; 
  index: number;
  onSelect: (candidate: Candidate) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -10, scale: 1.02 }}
      onClick={() => onSelect(candidate)}
      className="cursor-pointer"
    >
      <Card className="bg-white/5 border-white/10 backdrop-blur-xl overflow-hidden hover:bg-white/10 transition-all duration-300">
        {/* Photo */}
        <div className="aspect-[3/4] bg-gradient-to-br from-purple-900/30 to-blue-900/30 relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center text-6xl font-bold text-white/10">
            {candidate.name.charAt(0)}
          </div>
          {/* Effet miroir au hover */}
          <motion.div
            whileHover={{ opacity: 0.3 }}
            className="absolute inset-0 bg-gradient-to-br from-silver-300/0 to-silver-300/20"
          />
        </div>

        {/* Infos */}
        <div className="p-6">
          <h3 className="text-2xl font-bold mb-2">{candidate.name}</h3>
          <div className="text-sm text-gray-400 mb-4">
            {candidate.age} ans • {candidate.city}
          </div>
          <p className="text-gray-300 mb-6">{candidate.bio}</p>
          <Button 
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-none"
          >
            Découvrir
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}

// Composant Modal Candidat
function CandidateModal({ candidate, onClose }: { 
  candidate: Candidate; 
  onClose: () => void;
}) {
  const [audioPlaying, setAudioPlaying] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white/5 border border-white/10 rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h2 className="text-4xl font-bold mb-2">{candidate.name}</h2>
            <div className="text-gray-400">
              {candidate.age} ans • {candidate.city}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bio Complète */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Biographie</h3>
          <p className="text-gray-300 leading-relaxed">{candidate.bioFull}</p>
        </div>

        {/* Audio Bio */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-semibold">Voix IA</div>
                <div className="text-sm text-gray-400">Écoutez la biographie</div>
              </div>
            </div>
            <Button
              onClick={() => setAudioPlaying(!audioPlaying)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-none"
            >
              {audioPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
          </div>
          
          {/* Onde sonore */}
          {audioPlaying && (
            <div className="flex items-center justify-center gap-1">
              {[...Array(30)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    scaleY: [1, Math.random() * 2 + 1, 1]
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    delay: i * 0.03
                  }}
                  className="w-1 h-6 bg-gradient-to-t from-purple-500 to-blue-400 rounded-full"
                />
              ))}
            </div>
          )}
        </div>

        {/* Centres d'intérêt */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Centres d'intérêt</h3>
          <div className="flex flex-wrap gap-3">
            {candidate.interests.map((interest, i) => (
              <span
                key={i}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>

        {/* Motivations */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Motivations</h3>
          <p className="text-gray-300 leading-relaxed">{candidate.motivations}</p>
        </div>

        {/* CTAs */}
        <div className="flex gap-4">
          <Button 
            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-none"
          >
            <Heart className="w-4 h-4 mr-2" />
            Voter pour {candidate.name.split(' ')[0]}
          </Button>
          <Button 
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Partager
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
