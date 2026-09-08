import { Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterConfig {
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
  placeholder?: string;
}

interface FilterBarProps {
  filters: FilterConfig[];
  children?: React.ReactNode;
  className?: string;
  showIcon?: boolean;
}

export function FilterBar({ filters, children, className, showIcon = true }: FilterBarProps) {
  return (
    <div
      className={cn(
        "bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-[#D4AF37]/20 p-6",
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-4">
        {showIcon && (
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-[#D4AF37]" />
            <span className="font-medium text-[#8B7355]">Filtres:</span>
          </div>
        )}

        {filters.map((filter, index) => (
          <div key={index} className="flex items-center gap-2">
            {filter.label && (
              <span className="text-sm text-[#8B7355]/70">{filter.label}:</span>
            )}
            <Select value={filter.value} onValueChange={filter.onChange}>
              <SelectTrigger className="w-[200px] border-[#D4AF37]/30">
                <SelectValue placeholder={filter.placeholder || "Sélectionner..."} />
              </SelectTrigger>
              <SelectContent>
                {filter.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}

        {children && <div className="ml-auto">{children}</div>}
      </div>
    </div>
  );
}
