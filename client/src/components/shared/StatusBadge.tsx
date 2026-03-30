import { cn } from "@/lib/utils";

type StatusVariant = "success" | "warning" | "error" | "info" | "pending" | "approved" | "rejected";

interface StatusBadgeProps {
  status: string;
  variant?: StatusVariant;
  className?: string;
}

const variantStyles: Record<StatusVariant, string> = {
  success: "bg-green-100 text-green-800",
  warning: "bg-yellow-100 text-yellow-800",
  error: "bg-red-100 text-red-800",
  info: "bg-blue-100 text-blue-800",
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

export function StatusBadge({ status, variant, className }: StatusBadgeProps) {
  // Auto-detect variant from status if not provided
  const autoVariant: StatusVariant = variant || (status.toLowerCase() as StatusVariant) || "info";
  
  return (
    <span
      className={cn(
        "px-3 py-1 rounded-full text-xs font-medium",
        variantStyles[autoVariant] || variantStyles.info,
        className
      )}
    >
      {status}
    </span>
  );
}
