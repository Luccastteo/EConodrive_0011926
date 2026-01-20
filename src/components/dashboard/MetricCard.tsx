import { ReactNode } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string;
  unit?: string;
  icon: ReactNode;
  iconVariant?: "money" | "fuel" | "distance" | "consumption";
  change?: {
    value: number;
    type: "positive" | "negative";
  };
  onClick?: () => void;
}

export function MetricCard({
  label,
  value,
  unit,
  icon,
  iconVariant = "consumption",
  change,
  onClick,
}: MetricCardProps) {
  const iconStyles = {
    money: "metric-icon-money",
    fuel: "metric-icon-fuel",
    distance: "metric-icon-distance",
    consumption: "metric-icon-consumption",
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-card border border-border rounded-2xl p-6",
        "transition-all duration-200 ease-out animate-fade-in",
        "hover:bg-card-hover hover:border-border-secondary",
        onClick && "cursor-pointer"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <span className="text-xs font-medium text-foreground-secondary uppercase tracking-wide">
          {label}
        </span>
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center",
          iconStyles[iconVariant]
        )}>
          {icon}
        </div>
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold text-foreground tracking-tight">
          {value}
        </span>
        {unit && (
          <span className="text-base text-foreground-tertiary font-normal">
            {unit}
          </span>
        )}
      </div>

      {/* Change */}
      {change && (
        <div className="flex items-center gap-1 mt-2">
          {change.type === "positive" ? (
            <TrendingUp size={14} className="text-accent" />
          ) : (
            <TrendingDown size={14} className="text-destructive" />
          )}
          <span
            className={cn(
              "text-sm font-medium",
              change.type === "positive" ? "text-accent" : "text-destructive"
            )}
          >
            {change.value}% vs mês anterior
          </span>
        </div>
      )}
    </div>
  );
}
