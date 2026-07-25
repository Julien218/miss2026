import { motion } from "framer-motion";

export function CrownAnimation() {
  return (
    <div className="relative w-32 h-32 flex items-center justify-center">
      {/* Outer Glow Ring */}
      <motion.div
        className="absolute inset-0 rounded-full bg-[#D4AF37]/20 blur-2xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Middle Glow Ring */}
      <motion.div
        className="absolute inset-4 rounded-full bg-[#D4AF37]/30 blur-xl"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
      />

      {/* Crown SVG */}
      <motion.svg
        viewBox="0 0 100 100"
        className="w-20 h-20 relative z-10"
        animate={{
          y: [0, -10, 0],
          rotateZ: [0, 5, 0, -5, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <defs>
          <linearGradient id="crownGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="50%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#B8941E" />
          </linearGradient>
          <filter id="crownGlow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Crown Path */}
        <path
          d="M 50 20 L 55 35 L 70 30 L 65 45 L 80 50 L 70 60 L 75 75 L 25 75 L 30 60 L 20 50 L 35 45 L 30 30 L 45 35 Z"
          fill="url(#crownGradient)"
          stroke="#FFD700"
          strokeWidth="2"
          filter="url(#crownGlow)"
        />

        {/* Jewels */}
        <motion.circle
          cx="50"
          cy="45"
          r="4"
          fill="#FF6B6B"
          animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.circle
          cx="35"
          cy="50"
          r="3"
          fill="#4ECDC4"
          animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
        />
        <motion.circle
          cx="65"
          cy="50"
          r="3"
          fill="#95E1D3"
          animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
        />
      </motion.svg>

      {/* Sparkles */}
      {[...Array(8)].map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const distance = 60;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;

        return (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-[#D4AF37] rounded-full"
            style={{
              left: `calc(50% + ${x}px)`,
              top: `calc(50% + ${y}px)`,
            }}
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.25,
              ease: "easeInOut",
            }}
          />
        );
      })}
    </div>
  );
}
