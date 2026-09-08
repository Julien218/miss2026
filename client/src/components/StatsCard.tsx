import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  delay?: number;
}

export function StatsCard({ title, value, icon: Icon, trend, delay = 0 }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
    >
      <Card className="border-[#D4AF37]/20 bg-gradient-to-br from-[#1A1A1A]/80 to-[#0A0A0A]/80 backdrop-blur-md hover:border-[#D4AF37]/40 transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm text-[#C0C0C0]">{title}</p>
              <p className="text-3xl font-bold bg-gradient-to-br from-[#E8C547] via-[#D4AF37] to-[#B8941E] bg-clip-text text-transparent">
                {value}
              </p>
              {trend && (
                <div className="flex items-center gap-1">
                  <span className={`text-xs font-semibold ${trend.value >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {trend.value >= 0 ? '+' : ''}{trend.value}%
                  </span>
                  <span className="text-xs text-[#C0C0C0]">{trend.label}</span>
                </div>
              )}
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-[#D4AF37]/20 to-[#B8941E]/20">
              <Icon className="h-6 w-6 text-[#D4AF37]" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
