import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Zap } from "lucide-react";

interface InfluenceBadgeProps {
  influenceIndex: number; // 0-1000
  influenceTrend: number; // Daily change
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function InfluenceBadge({
  influenceIndex,
  influenceTrend,
  size = "md",
  showLabel = true,
  className = "",
}: InfluenceBadgeProps) {
  // Size variants
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-5 py-2.5 text-lg",
  };

  const iconSizes = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  // Determine color based on influence level
  const getInfluenceColor = (value: number) => {
    if (value >= 800) return { from: "#D4AF37", to: "#FFD700", text: "#D4AF37", glow: "rgba(212, 175, 55, 0.4)" }; // Gold
    if (value >= 600) return { from: "#C8A45C", to: "#D4AF37", text: "#C8A45C", glow: "rgba(200, 164, 92, 0.3)" }; // Warm gold
    if (value >= 400) return { from: "#F59E0B", to: "#FCD34D", text: "#F59E0B", glow: "rgba(245, 158, 11, 0.3)" }; // Orange
    if (value >= 200) return { from: "#10B981", to: "#34D399", text: "#10B981", glow: "rgba(16, 185, 129, 0.2)" }; // Green
    return { from: "#6B7280", to: "#9CA3AF", text: "#9CA3AF", glow: "rgba(107, 114, 128, 0.2)" }; // Gray
  };

  const colors = getInfluenceColor(influenceIndex);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`${sizeClasses[size]} ${className} inline-flex items-center gap-2 rounded-full backdrop-blur-xl relative overflow-hidden`}
      style={{
        background: `linear-gradient(135deg, ${colors.from}20 0%, ${colors.to}30 100%)`,
        border: `1.5px solid ${colors.from}40`,
        boxShadow: `0 0 20px ${colors.glow}`,
      }}
    >
      {/* Gradient overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: `radial-gradient(circle at 20% 50%, ${colors.to}80, transparent 70%)`,
        }}
      />

      {/* Icon */}
      <Zap className={`${iconSizes[size]} relative z-10`} style={{ color: colors.text }} />

      {/* Index value */}
      <div className="relative z-10 flex items-center gap-1.5">
        {showLabel && (
          <span className="text-white/70 font-medium">Indice</span>
        )}
        <span className="font-bold" style={{ color: colors.text }}>
          {influenceIndex}
        </span>
      </div>

      {/* Trend indicator */}
      {influenceTrend !== 0 && (
        <div className="relative z-10 flex items-center gap-1">
          {influenceTrend > 0 ? (
            <TrendingUp className={`${iconSizes[size]} text-green-400`} />
          ) : (
            <TrendingDown className={`${iconSizes[size]} text-red-400`} />
          )}
          <span className={`text-xs font-semibold ${influenceTrend > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {influenceTrend > 0 ? '+' : ''}{influenceTrend}
          </span>
        </div>
      )}
    </motion.div>
  );
}
