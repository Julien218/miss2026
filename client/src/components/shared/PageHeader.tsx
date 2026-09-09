import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  variant?: "gradient" | "solid";
  className?: string;
}

export function PageHeader({
  title,
  description,
  action,
  variant = "gradient",
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <div>
        <h1
          className={cn(
            "text-4xl font-playfair font-bold mb-2",
            variant === "gradient"
              ? "bg-gradient-to-r from-[#DCB464] to-[#AA8228] bg-clip-text text-transparent"
              : "text-[#8B7355]"
          )}
        >
          {title}
        </h1>
        {description && <p className="text-[#8B7355]/70">{description}</p>}
      </div>

      {action && <div>{action}</div>}
    </div>
  );
}
