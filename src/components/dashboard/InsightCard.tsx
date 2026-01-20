import { AlertCircle, AlertTriangle, Info, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import type { Insight } from "@/services/insightsEngine";

interface InsightCardProps {
  insight: Insight;
}

export function InsightCard({ insight }: InsightCardProps) {
  const navigate = useNavigate();

  const statusConfig = {
    critical: {
      icon: AlertCircle,
      bgColor: "bg-destructive/10",
      borderColor: "border-destructive/30",
      iconColor: "text-destructive",
      titleColor: "text-destructive",
    },
    warning: {
      icon: AlertTriangle,
      bgColor: "bg-warning/10",
      borderColor: "border-warning/30",
      iconColor: "text-warning",
      titleColor: "text-warning",
    },
    info: {
      icon: Info,
      bgColor: "bg-info/10",
      borderColor: "border-info/30",
      iconColor: "text-info",
      titleColor: "text-info",
    },
  };

  const config = statusConfig[insight.status];
  const Icon = config.icon;

  const handleAction = () => {
    if (insight.actionRoute) {
      navigate(insight.actionRoute);
    }
  };

  return (
    <div
      className={cn(
        "bg-card border rounded-xl p-4 transition-all duration-200",
        "hover:bg-card-hover hover:border-border-secondary",
        config.borderColor
      )}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
          config.bgColor
        )}>
          <Icon size={20} className={config.iconColor} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className={cn(
            "text-sm font-semibold mb-1",
            config.titleColor
          )}>
            {insight.title}
          </h3>
          <p className="text-sm text-foreground-tertiary mb-3">
            {insight.message}
          </p>

          {/* Action Button */}
          {insight.actionLabel && insight.actionRoute && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAction}
              className={cn(
                "h-8 text-xs gap-1.5",
                config.titleColor,
                "hover:" + config.bgColor
              )}
            >
              {insight.actionLabel}
              <ArrowRight size={14} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
