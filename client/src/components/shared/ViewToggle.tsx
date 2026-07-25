import { Grid3x3, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ViewMode = "grid" | "list";

interface ViewToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
  className?: string;
}

export function ViewToggle({ value, onChange, className }: ViewToggleProps) {
  return (
    <div className={cn("flex gap-2", className)}>
      <Button
        variant={value === "grid" ? "default" : "outline"}
        size="sm"
        onClick={() => onChange("grid")}
        className={cn(
          value === "grid"
            ? "bg-gradient-to-r from-[#D4AF37] to-[#B8941E] text-white"
            : "border-[#D4AF37]/30 text-[#8B7355]"
        )}
      >
        <Grid3x3 className="w-4 h-4" />
      </Button>
      <Button
        variant={value === "list" ? "default" : "outline"}
        size="sm"
        onClick={() => onChange("list")}
        className={cn(
          value === "list"
            ? "bg-gradient-to-r from-[#D4AF37] to-[#B8941E] text-white"
            : "border-[#D4AF37]/30 text-[#8B7355]"
        )}
      >
        <List className="w-4 h-4" />
      </Button>
    </div>
  );
}
