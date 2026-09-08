import { Share2 } from "lucide-react";
import { motion } from "framer-motion";

interface ShareCountBadgeProps {
  shareCount: number;
  className?: string;
}

/**
 * Badge affichant le nombre de partages d'un candidat
 * Design glassmorphism cohérent avec l'identité Liligaga Mirror
 */
export function ShareCountBadge({ shareCount, className = "" }: ShareCountBadgeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#C8A45C]/20 via-[#D4AF37]/20 to-[#EC4899]/20 backdrop-blur-xl border border-[#C8A45C]/30 ${className}`}
    >
      <Share2 className="w-3.5 h-3.5 text-[#D4AF37]" />
      <span className="text-sm font-semibold text-white">
        {shareCount.toLocaleString()}
      </span>
      <span className="text-xs text-gray-300">
        {shareCount === 1 ? "partage" : "partages"}
      </span>
    </motion.div>
  );
}
