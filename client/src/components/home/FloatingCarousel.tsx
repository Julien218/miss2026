import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CandidateCard3D } from "./CandidateCard3D";

interface Candidate {
  id: string;
  name: string;
  photo: string;
  city: string;
  category: "miss" | "mister";
}

interface FloatingCarouselProps {
  candidates: Candidate[];
}

export function FloatingCarousel({ candidates }: FloatingCarouselProps) {
  const [rotation, setRotation] = useState(0);

  // Auto-rotate carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setRotation((prev) => prev + 0.5);
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-[600px] flex items-center justify-center perspective-[2000px]">
      {/* 3D Container */}
      <motion.div
        className="relative w-full h-full"
        style={{
          transformStyle: "preserve-3d",
          transform: `rotateY(${rotation}deg)`,
        }}
      >
        {candidates.map((candidate, index) => (
          <CandidateCard3D
            key={candidate.id}
            name={candidate.name}
            photo={candidate.photo}
            city={candidate.city}
            category={candidate.category}
            index={index}
            total={candidates.length}
          />
        ))}
      </motion.div>

      {/* Center Glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-64 h-64 rounded-full bg-[#D4AF37]/10 blur-3xl animate-pulse" />
      </div>
    </div>
  );
}
