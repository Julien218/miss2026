import { motion, useReducedMotion } from "framer-motion";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useEffect, useState } from "react";

interface BarometerOrbProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function BarometerOrb({ size = "md", className = "" }: BarometerOrbProps) {
  const prefersReducedMotion = useReducedMotion();
  const [isClient, setIsClient] = useState(false);

  // Fetch barometer data
  const { data: barometer, refetch } = trpc.analytics.getGlobalBarometer.useQuery(undefined, {
    refetchInterval: 60000, // Refresh every 60 seconds
    staleTime: 30000, // Consider data stale after 30 seconds
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Size variants
  const sizeClasses = {
    sm: "w-24 h-24",
    md: "w-32 h-32",
    lg: "w-40 h-40",
  };

  const textSizes = {
    sm: "text-2xl",
    md: "text-3xl",
    lg: "text-4xl",
  };

  const subTextSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  if (!barometer || !isClient) {
    return (
      <div className={`${sizeClasses[size]} ${className} rounded-full bg-gradient-to-br from-[#C8A45C]/20 to-[#D4AF37]/20 border border-[#C8A45C]/30 flex items-center justify-center backdrop-blur-xl`}>
        <div className="animate-pulse text-[#C8A45C]">
          <Activity className="w-8 h-8" />
        </div>
      </div>
    );
  }

  const { intensity, trend24h, interactionsToday } = barometer;

  // Determine intensity color
  const getIntensityColor = (value: number) => {
    if (value >= 80) return { from: "#D4AF37", to: "#FFD700", glow: "rgba(212, 175, 55, 0.6)" }; // Gold
    if (value >= 60) return { from: "#C8A45C", to: "#D4AF37", glow: "rgba(200, 164, 92, 0.5)" }; // Warm gold
    if (value >= 40) return { from: "#F59E0B", to: "#FCD34D", glow: "rgba(245, 158, 11, 0.4)" }; // Orange
    if (value >= 20) return { from: "#10B981", to: "#34D399", glow: "rgba(16, 185, 129, 0.3)" }; // Green
    return { from: "#6B7280", to: "#9CA3AF", glow: "rgba(107, 114, 128, 0.2)" }; // Gray
  };

  const colors = getIntensityColor(intensity);

  // Pulse animation intensity based on device performance
  const getPulseAnimation = () => {
    if (prefersReducedMotion) {
      return {}; // No animation for reduced motion preference
    }

    const baseScale = 1;
    const pulseScale = intensity >= 80 ? 1.15 : intensity >= 60 ? 1.1 : 1.05;

    return {
      scale: [baseScale, pulseScale, baseScale],
      boxShadow: [
        `0 0 20px ${colors.glow}`,
        `0 0 40px ${colors.glow}`,
        `0 0 20px ${colors.glow}`,
      ],
    };
  };

  return (
    <div className={`${className} flex flex-col items-center gap-3`}>
      {/* Orb */}
      <motion.div
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center backdrop-blur-xl relative overflow-hidden`}
        style={{
          background: `linear-gradient(135deg, ${colors.from}20 0%, ${colors.to}30 100%)`,
          border: `2px solid ${colors.from}40`,
        }}
        animate={getPulseAnimation()}
        transition={{
          duration: intensity >= 80 ? 1.5 : intensity >= 60 ? 2 : 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* Gradient overlay */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(circle at 30% 30%, ${colors.to}80, transparent 70%)`,
          }}
        />

        {/* Intensity value */}
        <div className="relative z-10 text-center">
          <motion.div
            className={`${textSizes[size]} font-bold`}
            style={{ color: colors.from }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            {intensity}
          </motion.div>
          <div className={`${subTextSizes[size]} text-white/70 font-medium`}>
            Intensité
          </div>
        </div>

        {/* Rotating ring */}
        {!prefersReducedMotion && intensity >= 60 && (
          <motion.div
            className="absolute inset-2 rounded-full border-2 border-dashed opacity-30"
            style={{ borderColor: colors.from }}
            animate={{ rotate: 360 }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        )}
      </motion.div>

      {/* Stats */}
      <div className="flex flex-col items-center gap-1">
        {/* Trend */}
        <div className="flex items-center gap-1.5">
          {trend24h >= 0 ? (
            <TrendingUp className="w-4 h-4 text-green-400" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-400" />
          )}
          <span className={`text-sm font-semibold ${trend24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {trend24h >= 0 ? '+' : ''}{trend24h}% 24h
          </span>
        </div>

        {/* Interactions today */}
        <div className="text-xs text-white/60">
          {interactionsToday.toLocaleString()} interactions aujourd'hui
        </div>
      </div>
    </div>
  );
}
