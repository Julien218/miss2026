import { motion } from "framer-motion";
import { Award, Heart, Share2, Crown, Sparkles, Zap, Star, Lock } from "lucide-react";
import { Card } from "@/components/ui/card";

interface Badge {
  code: string;
  name: string;
  description: string;
  icon: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  requirement?: string;
}

interface BadgeCardProps {
  badge: Badge;
  isEarned: boolean;
  earnedAt?: Date;
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
    bg: "from-gray-500/10 to-gray-600/10",
    border: "border-gray-500/30",
    text: "text-gray-300",
    icon: "text-gray-400",
  },
  rare: {
    bg: "from-blue-500/10 to-blue-600/10",
    border: "border-blue-500/30",
    text: "text-blue-300",
    icon: "text-blue-400",
  },
  epic: {
    bg: "from-purple-500/10 to-pink-500/10",
    border: "border-purple-500/30",
    text: "text-purple-300",
    icon: "text-purple-400",
  },
  legendary: {
    bg: "from-yellow-500/10 to-orange-500/10",
    border: "border-yellow-500/30",
    text: "text-yellow-300",
    icon: "text-yellow-400",
  },
};

/**
 * BadgeCard - Display a single badge in the collection
 * Shows locked state if not earned yet
 */
export function BadgeCard({ badge, isEarned, earnedAt }: BadgeCardProps) {
  const Icon = iconMap[badge.icon] || Award;
  const colors = rarityColors[badge.rarity];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: isEarned ? 1.05 : 1 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={`
          relative p-4 h-full
          bg-gradient-to-br ${colors.bg}
          border-2 ${colors.border}
          backdrop-blur-xl
          ${isEarned ? "opacity-100" : "opacity-40"}
          transition-all duration-300
        `}
      >
        {/* Lock overlay for unearned badges */}
        {!isEarned && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg backdrop-blur-sm">
            <Lock className="w-8 h-8 text-gray-500" />
          </div>
        )}

        {/* Badge icon */}
        <div className="flex justify-center mb-3">
          <div className={`p-3 rounded-full bg-gradient-to-br ${colors.bg}`}>
            <Icon className={`w-8 h-8 ${colors.icon}`} />
          </div>
        </div>

        {/* Badge info */}
        <div className="text-center">
          <h4 className={`text-sm font-display font-bold ${colors.text} mb-1`}>
            {badge.name}
          </h4>

          <p className="text-xs text-gray-400 mb-2 line-clamp-2">
            {badge.description}
          </p>

          {/* Rarity */}
          <div className="inline-block px-2 py-0.5 rounded-full bg-white/5 backdrop-blur-sm mb-2">
            <span className={`text-xs font-semibold uppercase ${colors.text}`}>
              {badge.rarity}
            </span>
          </div>

          {/* Earned date */}
          {isEarned && earnedAt && (
            <p className="text-xs text-gray-500 mt-2">
              Obtenu le {new Date(earnedAt).toLocaleDateString("fr-FR")}
            </p>
          )}

          {/* Requirement for locked badges */}
          {!isEarned && badge.requirement && (
            <p className="text-xs text-gray-500 mt-2">
              {badge.requirement}
            </p>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
