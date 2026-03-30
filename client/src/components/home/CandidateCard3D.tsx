import { motion } from "framer-motion";
import { Crown, MapPin, Star } from "lucide-react";

interface CandidateCard3DProps {
  name: string;
  photo: string;
  city: string;
  category: "miss" | "mister";
  index: number;
  total: number;
}

export function CandidateCard3D({ name, photo, city, category, index, total }: CandidateCard3DProps) {
  // Calculate position in circular layout
  const angle = (index / total) * Math.PI * 2;
  const radius = 300;
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;

  return (
    <motion.div
      className="absolute"
      style={{
        transform: `translate3d(${x}px, 0, ${z}px) rotateY(${(angle * 180) / Math.PI}deg)`,
        transformStyle: "preserve-3d",
      }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: [0, -20, 0],
      }}
      transition={{
        opacity: { duration: 0.5, delay: index * 0.1 },
        scale: { duration: 0.5, delay: index * 0.1 },
        y: {
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
          delay: index * 0.2,
        },
      }}
      whileHover={{
        scale: 1.1,
        rotateY: 15,
        rotateX: -10,
        z: 50,
        transition: { duration: 0.3 },
      }}
    >
      <div className="relative w-64 h-80 rounded-2xl overflow-hidden bg-gradient-to-br from-[#1A1A1A]/90 to-[#0A0A0A]/90 backdrop-blur-xl border-2 border-[#D4AF37]/30 shadow-2xl">
        {/* Photo Background */}
        <div className="absolute inset-0">
          <img
            src={photo}
            alt={name}
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        </div>

        {/* Crown Badge */}
        <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#B8941E] flex items-center justify-center shadow-lg">
          <Crown className="w-6 h-6 text-white" />
        </div>

        {/* Category Badge */}
        <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
          <span className="text-xs font-semibold text-white uppercase tracking-wider">
            {category === "miss" ? "Miss" : "Mister"}
          </span>
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 space-y-3">
          {/* Name */}
          <h3 className="font-playfair text-2xl font-bold text-white leading-tight">
            {name}
          </h3>

          {/* City */}
          <div className="flex items-center gap-2 text-[#D4AF37]">
            <MapPin className="w-4 h-4" />
            <span className="text-sm font-medium">{city}</span>
          </div>

          {/* Stars */}
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className="w-4 h-4 fill-[#D4AF37] text-[#D4AF37]"
              />
            ))}
          </div>
        </div>

        {/* Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#D4AF37]/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>
    </motion.div>
  );
}
