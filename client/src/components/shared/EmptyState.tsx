import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-[#D4AF37]/20 p-12 text-center",
        className
      )}
    >
      <Icon className="w-16 h-16 text-[#D4AF37] mx-auto mb-4" />
      <h3 className="text-xl font-playfair text-[#8B7355] mb-2">{title}</h3>
      {description && <p className="text-[#8B7355]/70 mb-4">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
