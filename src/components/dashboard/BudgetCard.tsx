import { Wallet, AlertTriangle, CheckCircle, XCircle, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/budget-utils";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface BudgetCardProps {
  stats: {
    spentCents: number;
    limitCents: number;
    remaining: number;
    percentage: number;
    status: 'ok' | 'warning' | 'busted';
  } | null;
  hasBudget: boolean;
}

export function BudgetCard({ stats, hasBudget }: BudgetCardProps) {
  const navigate = useNavigate();

  const statusConfig = {
    ok: {
      icon: CheckCircle,
      label: "OK",
      color: "text-accent",
      bgColor: "bg-accent/15",
      progressColor: "bg-accent",
    },
    warning: {
      icon: AlertTriangle,
      label: "Atenção",
      color: "text-warning",
      bgColor: "bg-warning/15",
      progressColor: "bg-warning",
    },
    busted: {
      icon: XCircle,
      label: "Estourado",
      color: "text-destructive",
      bgColor: "bg-destructive/15",
      progressColor: "bg-destructive",
    },
  };

  if (!hasBudget || !stats) {
    return (
      <div
        className={cn(
          "bg-card border border-border rounded-2xl p-6",
          "transition-all duration-200 ease-out animate-fade-in",
          "hover:bg-card-hover hover:border-border-secondary",
          "col-span-1 sm:col-span-2"
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-info/15 flex items-center justify-center">
              <Wallet size={20} className="text-info" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-foreground">Orçamento do mês</h3>
              <p className="text-xs text-foreground-tertiary">
                Defina um limite para controlar seus gastos
              </p>
            </div>
          </div>
          <Button 
            variant="accent" 
            size="sm" 
            onClick={() => navigate('/orcamento')}
            className="gap-2"
          >
            <Settings2 size={16} />
            Definir orçamento
          </Button>
        </div>
      </div>
    );
  }

  const config = statusConfig[stats.status];
  const StatusIcon = config.icon;

  return (
    <div
      className={cn(
        "bg-card border border-border rounded-2xl p-6",
        "transition-all duration-200 ease-out animate-fade-in",
        "hover:bg-card-hover hover:border-border-secondary",
        "col-span-1 sm:col-span-2"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-info/15 flex items-center justify-center">
            <Wallet size={20} className="text-info" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-foreground">Orçamento do mês</h3>
            <p className="text-xs text-foreground-tertiary">
              Limite: {formatCurrency(stats.limitCents)}
            </p>
          </div>
        </div>
        <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full", config.bgColor)}>
          <StatusIcon size={14} className={config.color} />
          <span className={cn("text-xs font-medium", config.color)}>{config.label}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <p className="text-xs text-foreground-tertiary mb-1">Gasto</p>
          <p className="text-lg font-bold text-foreground">{formatCurrency(stats.spentCents)}</p>
        </div>
        <div>
          <p className="text-xs text-foreground-tertiary mb-1">Restante</p>
          <p className={cn("text-lg font-bold", stats.remaining > 0 ? "text-accent" : "text-destructive")}>
            {formatCurrency(stats.remaining)}
          </p>
        </div>
        <div>
          <p className="text-xs text-foreground-tertiary mb-1">Usado</p>
          <p className="text-lg font-bold text-foreground">{stats.percentage.toFixed(0)}%</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <Progress 
          value={Math.min(100, stats.percentage)} 
          className="h-2 bg-muted"
        />
      </div>

      {/* Action */}
      <Button 
        variant="outline" 
        size="sm" 
        className="w-full"
        onClick={() => navigate('/orcamento')}
      >
        <Settings2 size={14} className="mr-2" />
        Gerenciar orçamento
      </Button>
    </div>
  );
}
