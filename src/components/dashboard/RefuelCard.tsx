import { Fuel, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface RefuelCardProps {
  station: string;
  date: string;
  liters: number;
  pricePerLiter: number;
  total: number;
  consumption?: number;
  fuelType: "gasolina" | "etanol" | "diesel";
  onClick?: () => void;
}

export function RefuelCard({
  station,
  date,
  liters,
  pricePerLiter,
  total,
  consumption,
  fuelType,
  onClick,
}: RefuelCardProps) {
  const fuelColors = {
    gasolina: "text-warning",
    etanol: "text-accent",
    diesel: "text-info",
  };

  const fuelBg = {
    gasolina: "bg-warning/10",
    etanol: "bg-accent/10",
    diesel: "bg-info/10",
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center gap-4 p-4 rounded-xl",
        "bg-card border border-border",
        "transition-all duration-200 ease-out",
        "hover:bg-card-hover hover:border-border-secondary",
        onClick && "cursor-pointer group"
      )}
    >
      {/* Icon */}
      <div className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
        fuelBg[fuelType]
      )}>
        <Fuel size={22} className={fuelColors[fuelType]} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-medium text-foreground truncate">
          {station}
        </p>
        <p className="text-sm text-foreground-tertiary">
          {date} • {liters.toFixed(1)}L • R$ {pricePerLiter.toFixed(2)}/L
        </p>
      </div>

      {/* Value */}
      <div className="text-right flex-shrink-0">
        <p className="text-[15px] font-semibold text-foreground">
          R$ {total.toFixed(2)}
        </p>
        {consumption && (
          <p className="text-sm text-accent font-medium">
            {consumption.toFixed(1)} km/L
          </p>
        )}
      </div>

      {/* Arrow */}
      <ChevronRight 
        size={18} 
        className="text-foreground-tertiary group-hover:text-foreground transition-colors flex-shrink-0" 
      />
    </div>
  );
}
