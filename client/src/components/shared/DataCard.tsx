import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DataCardProps {
  children: ReactNode;
  variant?: "default" | "compact" | "image";
  hover?: boolean;
  className?: string;
  onClick?: () => void;
}

export function DataCard({
  children,
  variant = "default",
  hover = true,
  className,
  onClick,
}: DataCardProps) {
  return (
    <div
      className={cn(
        "bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-[#D4AF37]/20 overflow-hidden",
        hover && "hover:scale-105 transition-transform duration-300 cursor-pointer",
        variant === "compact" && "shadow-md",
        variant === "image" && "shadow-2xl",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

interface DataCardContentProps {
  children: ReactNode;
  className?: string;
}

export function DataCardContent({ children, className }: DataCardContentProps) {
  return <div className={cn("p-6 space-y-3", className)}>{children}</div>;
}

DataCard.Content = DataCardContent;
