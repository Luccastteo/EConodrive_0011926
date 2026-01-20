import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAlerts } from "@/hooks/use-alerts";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AlertsBadgeProps {
  className?: string;
}

export function AlertsBadge({ className }: AlertsBadgeProps) {
  const { alerts, unreadCount, markAsRead, markAllAsRead, isLoading } = useAlerts();

  const alertTypeLabels = {
    budget_50: '50% do orçamento',
    budget_80: '80% do orçamento',
    budget_100: 'Orçamento estourado',
    projection_warning: 'Projeção de estouro',
  };

  const alertTypeColors = {
    budget_50: 'bg-info/15 text-info',
    budget_80: 'bg-warning/15 text-warning',
    budget_100: 'bg-destructive/15 text-destructive',
    projection_warning: 'bg-warning/15 text-warning',
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("relative", className)}
        >
          <Bell size={20} className="text-foreground-secondary" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-0 bg-card border-border" 
        align="end"
        sideOffset={8}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="font-semibold text-foreground">Notificações</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs text-accent"
              onClick={() => markAllAsRead.mutate()}
            >
              Marcar todas como lidas
            </Button>
          )}
        </div>
        
        <div className="max-h-[300px] overflow-y-auto scrollbar-uber">
          {isLoading ? (
            <div className="p-4 text-center text-foreground-tertiary">
              Carregando...
            </div>
          ) : alerts.length === 0 ? (
            <div className="p-8 text-center">
              <Bell size={32} className="mx-auto mb-2 text-foreground-tertiary" />
              <p className="text-sm text-foreground-tertiary">
                Nenhuma notificação
              </p>
            </div>
          ) : (
            alerts.slice(0, 10).map((alert) => (
              <button
                key={alert.id}
                onClick={() => !alert.read_at && markAsRead.mutate(alert.id)}
                className={cn(
                  "w-full text-left px-4 py-3 border-b border-border/50 last:border-0",
                  "transition-colors hover:bg-muted/50",
                  !alert.read_at && "bg-muted/30"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "mt-0.5 w-2 h-2 rounded-full flex-shrink-0",
                    !alert.read_at ? "bg-accent" : "bg-transparent"
                  )} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn(
                        "text-2xs px-2 py-0.5 rounded-full font-medium",
                        alertTypeColors[alert.type as keyof typeof alertTypeColors]
                      )}>
                        {alertTypeLabels[alert.type as keyof typeof alertTypeLabels]}
                      </span>
                    </div>
                    <p className="text-sm text-foreground line-clamp-2">
                      {alert.message}
                    </p>
                    <p className="text-xs text-foreground-tertiary mt-1">
                      {formatDistanceToNow(new Date(alert.created_at), { 
                        addSuffix: true,
                        locale: ptBR 
                      })}
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
