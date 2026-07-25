import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShareCountdownButton } from "./ShareCountdownButton";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface CountdownTimerProps {
  targetDate: Date;
}

export function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = targetDate.getTime() - new Date().getTime();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="flex flex-col items-center gap-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="flex gap-3 md:gap-6 justify-center items-center"
      >
        <TimeUnit value={timeLeft.days} label="Jours" />
        <Separator />
        <TimeUnit value={timeLeft.hours} label="Heures" />
        <Separator />
        <TimeUnit value={timeLeft.minutes} label="Minutes" />
        <Separator />
        <TimeUnit value={timeLeft.seconds} label="Secondes" />
      </motion.div>

      {/* Share Button */}
      <ShareCountdownButton 
        daysLeft={timeLeft.days}
        hoursLeft={timeLeft.hours}
        minutesLeft={timeLeft.minutes}
      />
    </div>
  );
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  const digits = String(value).padStart(2, '0').split('');

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Flip cards container */}
      <div className="flex gap-1">
        {digits.map((digit, index) => (
          <FlipCard key={`${label}-${index}`} value={digit} />
        ))}
      </div>
      
      {/* Label */}
      <div className="text-xs md:text-sm font-semibold text-[#D4AF37] uppercase tracking-widest">
        {label}
      </div>
    </div>
  );
}

function FlipCard({ value }: { value: string }) {
  return (
    <div className="relative w-12 h-16 md:w-16 md:h-20">
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-[#D4AF37] to-[#B8941E] rounded-lg blur-xl opacity-30"
        animate={{
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Card */}
      <div className="relative h-full bg-gradient-to-br from-[#1A1A1A]/90 to-[#0A0A0A]/90 backdrop-blur-xl border border-[#D4AF37]/30 rounded-lg shadow-2xl overflow-hidden">
        {/* Top half */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1A1A1A]/50 to-transparent h-1/2" />
        
        {/* Bottom half */}
        <div className="absolute inset-0 top-1/2 bg-gradient-to-t from-[#0A0A0A]/80 to-transparent h-1/2" />
        
        {/* Middle line */}
        <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-[#D4AF37]/20 transform -translate-y-1/2" />

        {/* Animated number */}
        <div className="absolute inset-0 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={value}
              initial={{ rotateX: -90, opacity: 0 }}
              animate={{ rotateX: 0, opacity: 1 }}
              exit={{ rotateX: 90, opacity: 0 }}
              transition={{
                duration: 0.6,
                ease: [0.4, 0.0, 0.2, 1],
              }}
              className="text-3xl md:text-5xl font-bold bg-gradient-to-br from-[#E8C547] via-[#D4AF37] to-[#B8941E] bg-clip-text text-transparent drop-shadow-lg"
              style={{ transformStyle: "preserve-3d" }}
            >
              {value}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Inner glow */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#D4AF37]/10 to-transparent rounded-lg pointer-events-none" />
        
        {/* Shine effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
            repeatDelay: 5,
          }}
        />
      </div>
    </div>
  );
}

function Separator() {
  return (
    <motion.div
      className="flex flex-col gap-2 items-center justify-center h-16 md:h-20"
      animate={{
        opacity: [1, 0.3, 1],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-br from-[#E8C547] to-[#D4AF37] shadow-lg shadow-[#D4AF37]/50" />
      <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-br from-[#E8C547] to-[#D4AF37] shadow-lg shadow-[#D4AF37]/50" />
    </motion.div>
  );
}
