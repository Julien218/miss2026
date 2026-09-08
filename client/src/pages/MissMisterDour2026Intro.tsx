/**
 * Miss & Mister Dour 2026 - Animation d'Ouverture Cinématique
 * 
 * Animation digne d'un film avec:
 * - Effet miroir Liligaga (éclats, lumière, particules dorées)
 * - Logo JS-Innov.IA animé (rotation, scale, glow)
 * - Message "Ce site est une création exclusive JS-Innov.IA – Tous droits réservés"
 * - Transition fluide vers site principal
 * 
 * Créé par JS-Innov.IA - Tous droits réservés
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';

export default function MissMisterDour2026Intro() {
  const [, navigate] = useLocation();
  const [showSkip, setShowSkip] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<'mirror' | 'logo' | 'message' | 'transition'>('mirror');

  useEffect(() => {
    // Afficher bouton Skip après 3 secondes
    const skipTimer = setTimeout(() => setShowSkip(true), 3000);

    // Phases d'animation
    const mirrorTimer = setTimeout(() => setAnimationPhase('logo'), 2000);
    const logoTimer = setTimeout(() => setAnimationPhase('message'), 4500);
    const messageTimer = setTimeout(() => setAnimationPhase('transition'), 7000);
    const endTimer = setTimeout(() => navigate('/miss-mister-dour-2026'), 8500);

    return () => {
      clearTimeout(skipTimer);
      clearTimeout(mirrorTimer);
      clearTimeout(logoTimer);
      clearTimeout(messageTimer);
      clearTimeout(endTimer);
    };
  }, [navigate]);

  const handleSkip = () => {
    navigate('/miss-mister-dour-2026');
  };

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Effet miroir en arrière-plan */}
      <div className="absolute inset-0">
        <AnimatePresence>
          {animationPhase === 'mirror' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0"
            >
              {/* Éclats de miroir (SVG) */}
              <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="mirror-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.3" />
                    <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#B8941E" stopOpacity="0.3" />
                  </linearGradient>
                </defs>
                
                {/* Éclats de miroir animés */}
                {[...Array(20)].map((_, i) => {
                  const x = Math.random() * 100;
                  const y = Math.random() * 100;
                  const size = Math.random() * 50 + 20;
                  const rotation = Math.random() * 360;
                  
                  return (
                    <motion.polygon
                      key={i}
                      points={`${x},${y} ${x + size},${y + size/2} ${x + size/2},${y + size} ${x - size/2},${y + size/2}`}
                      fill="url(#mirror-gradient)"
                      initial={{ opacity: 0, scale: 0, rotate: 0 }}
                      animate={{ 
                        opacity: [0, 1, 0],
                        scale: [0, 1, 1.5],
                        rotate: [0, rotation, rotation + 180]
                      }}
                      transition={{ 
                        duration: 2,
                        delay: i * 0.1,
                        ease: "easeOut"
                      }}
                    />
                  );
                })}
              </svg>

              {/* Particules dorées */}
              {[...Array(30)].map((_, i) => {
                const x = Math.random() * 100;
                const y = Math.random() * 100;
                
                return (
                  <motion.div
                    key={`particle-${i}`}
                    className="absolute w-2 h-2 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-600"
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      boxShadow: '0 0 10px rgba(212, 175, 55, 0.8)'
                    }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ 
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                      y: [0, -100, -200]
                    }}
                    transition={{ 
                      duration: 3,
                      delay: i * 0.05,
                      ease: "easeOut"
                    }}
                  />
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Logo JS-Innov.IA animé */}
      <AnimatePresence>
        {(animationPhase === 'logo' || animationPhase === 'message') && (
          <motion.div
            initial={{ opacity: 0, scale: 0, rotate: -180 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <motion.img
              src="https://files.manuscdn.com/user_upload_by_module/session_file/87304619/eiRLiShMPFEUcfRq.png"
              alt="Miss & Mister Dour Logo"
              className="w-80 h-80 object-contain"
              style={{
                filter: 'drop-shadow(0 0 60px rgba(212, 175, 55, 0.8))'
              }}
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message propriété exclusive */}
      <AnimatePresence>
        {animationPhase === 'message' && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 1 }}
            className="absolute bottom-32 left-0 right-0 text-center px-6"
          >
            <motion.p
              className="text-xl md:text-2xl text-white font-light tracking-wide"
              style={{
                textShadow: '0 0 20px rgba(212, 175, 55, 0.5)'
              }}
              animate={{
                opacity: [0.7, 1, 0.7]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              Ce site est une création exclusive <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-600">JS-Innov.IA</span>
            </motion.p>
            <motion.p
              className="text-sm md:text-base text-gray-400 mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Tous droits réservés
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transition finale */}
      <AnimatePresence>
        {animationPhase === 'transition' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 bg-gradient-to-b from-black via-purple-900/20 to-black"
          />
        )}
      </AnimatePresence>

      {/* Bouton Skip */}
      <AnimatePresence>
        {showSkip && animationPhase !== 'transition' && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            onClick={handleSkip}
            className="absolute top-8 right-8 px-6 py-2 text-sm text-white/70 hover:text-white border border-white/30 hover:border-white/60 rounded-full transition-all duration-300"
            style={{
              backdropFilter: 'blur(10px)',
              background: 'rgba(255, 255, 255, 0.05)'
            }}
          >
            Passer l'intro →
          </motion.button>
        )}
      </AnimatePresence>

      {/* Signature en bas */}
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <motion.p
          className="text-xs text-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          Créé par Pagin Julien - Dour, Belgique
        </motion.p>
      </div>
    </div>
  );
}
