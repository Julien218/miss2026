import { motion, AnimatePresence } from "framer-motion";
import { X, Award, Heart, Share2, Crown, Sparkles, Zap, Star } from "lucide-react";
import { useEffect, useState } from "react";
import confetti from "canvas-confetti";

interface Badge {
  code: string;
  name: string;
  description: string;
  icon: string;
  rarity: "common" | "rare" | "epic" | "legendary";
}

interface BadgeNotificationProps {
  badge: Badge;
  onClose: () => void;
}

const iconMap: Record<string, any> = {
  Heart,
  Share2,
  Award,
  Crown,
  Sparkles,
  Zap,
  Star,
};

const rarityColors = {
  common: {
    bg: "from-gray-500/20 to-gray-600/20",
    border: "border-gray-500/50",
    glow: "shadow-gray-500/30",
    text: "text-gray-300",
  },
  rare: {
    bg: "from-blue-500/20 to-blue-600/20",
    border: "border-blue-500/50",
    glow: "shadow-blue-500/30",
    text: "text-blue-300",
  },
  epic: {
    bg: "from-purple-500/20 to-pink-500/20",
    border: "border-purple-500/50",
    glow: "shadow-purple-500/30",
    text: "text-purple-300",
  },
  legendary: {
    bg: "from-yellow-500/20 to-orange-500/20",
    border: "border-yellow-500/50",
    glow: "shadow-yellow-500/30",
    text: "text-yellow-300",
  },
};

/**
 * BadgeNotification - Premium toast notification when a badge is earned
 * Shows with confetti animation and elegant reveal
 */
export function BadgeNotification({ badge, onClose }: BadgeNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const Icon = iconMap[badge.icon] || Award;
  const colors = rarityColors[badge.rarity];

  useEffect(() => {
    // Confetti animation
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { x: 0.9, y: 0.1 },
      colors: badge.rarity === "legendary" ? ["#FFD700", "#FFA500"] : ["#EC4899", "#8B5CF6"],
    });

    // Auto close after 5 seconds
    const timer = setTimeout(() => {
      handleClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 100, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 100, scale: 0.8 }}
          className="fixed top-4 right-4 z-50 max-w-sm"
        >
          <div
            className={`
              relative p-6 rounded-2xl backdrop-blur-xl
              bg-gradient-to-br ${colors.bg}
              border-2 ${colors.border}
              shadow-2xl ${colors.glow}
            `}
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>

            {/* Badge icon with glow */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex justify-center mb-4"
            >
              <div className={`p-4 rounded-full bg-gradient-to-br ${colors.bg} ${colors.glow} shadow-lg`}>
                <Icon className={`w-12 h-12 ${colors.text}`} />
              </div>
            </motion.div>

            {/* Badge info */}
            <div className="text-center">
              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-xl font-display font-bold text-white mb-2"
              >
                🎉 Badge Débloqué !
              </motion.h3>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className={`text-lg font-semibold ${colors.text} mb-1`}
              >
                {badge.name}
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-sm text-gray-300"
              >
                {badge.description}
              </motion.p>

              {/* Rarity indicator */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-3 inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm"
              >
                <span className={`text-xs font-semibold uppercase ${colors.text}`}>
                  {badge.rarity}
                </span>
              </motion.div>
            </div>

            {/* Sparkle animation */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -top-2 -right-2"
            >
              <Sparkles className="w-6 h-6 text-yellow-400" />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
