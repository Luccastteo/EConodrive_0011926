import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { 
  Wallet, 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  XCircle,
  Calendar,
  Bell,
  Save,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useBudget } from "@/hooks/use-budget";
import { formatCurrency, parseCurrency, getDaysInCurrentMonth, getDaysPassedInMonth } from "@/lib/budget-utils";
import { useToast } from "@/hooks/use-toast";

export default function Orcamento() {
  const { budget, stats, saveBudget, budgetLoading } = useBudget();
  const { toast } = useToast();
  
  const [monthlyLimit, setMonthlyLimit] = useState("");
  const [targetConsumption, setTargetConsumption] = useState("");
  const [autoReset, setAutoReset] = useState(true);
  const [alert50, setAlert50] = useState(true);
  const [alert80, setAlert80] = useState(true);
  const [alert100, setAlert100] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (budget) {
      setMonthlyLimit((budget.monthly_limit_cents / 100).toFixed(2).replace('.', ','));
      setTargetConsumption(budget.target_consumption?.toString() || "");
      setAutoReset(budget.auto_reset);
      setAlert50(budget.alert_50_enabled);
      setAlert80(budget.alert_80_enabled);
      setAlert100(budget.alert_100_enabled);
    }
  }, [budget]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveBudget.mutateAsync({
        monthlyLimitCents: parseCurrency(monthlyLimit),
        autoReset,
        alert50Enabled: alert50,
        alert80Enabled: alert80,
        alert100Enabled: alert100,
        targetConsumption: targetConsumption ? parseFloat(targetConsumption) : undefined,
      });
      toast({
        title: "Orçamento salvo!",
        description: "Suas configurações foram atualizadas com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o orçamento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const daysInMonth = getDaysInCurrentMonth();
  const daysPassed = getDaysPassedInMonth();

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight">
            Orçamento
          </h1>
          <p className="text-foreground-tertiary mt-1">
            Configure seu limite mensal e acompanhe seus gastos
          </p>
        </div>
        <Button 
          variant="accent" 
          className="gap-2"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          Salvar configurações
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Budget Settings Card */}
          <div className="bg-card border border-border rounded-2xl p-6 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center">
                <Wallet size={20} className="text-accent" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Definições</h2>
                <p className="text-sm text-foreground-tertiary">Configure seu orçamento mensal</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <Label htmlFor="monthlyLimit" className="text-foreground mb-2 block">
                  Orçamento mensal (R$)
                </Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-tertiary">
                    R$
                  </span>
                  <Input
                    id="monthlyLimit"
                    type="text"
                    placeholder="600,00"
                    value={monthlyLimit}
                    onChange={(e) => setMonthlyLimit(e.target.value)}
                    className="pl-12 text-lg font-medium"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="targetConsumption" className="text-foreground mb-2 block">
                  Meta de consumo (km/L) - opcional
                </Label>
                <div className="relative">
                  <Target size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-tertiary" />
                  <Input
                    id="targetConsumption"
                    type="number"
                    step="0.1"
                    placeholder="12.5"
                    value={targetConsumption}
                    onChange={(e) => setTargetConsumption(e.target.value)}
                    className="pl-12"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between py-3 border-t border-border">
                <div>
                  <p className="text-sm font-medium text-foreground">Zerar orçamento automaticamente</p>
                  <p className="text-xs text-foreground-tertiary">Todo dia 1º do mês</p>
                </div>
                <Switch checked={autoReset} onCheckedChange={setAutoReset} />
              </div>
            </div>
          </div>

          {/* Alerts Settings Card */}
          <div className="bg-card border border-border rounded-2xl p-6 animate-fade-in" style={{ animationDelay: '50ms' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-warning/15 flex items-center justify-center">
                <Bell size={20} className="text-warning" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Alertas</h2>
                <p className="text-sm text-foreground-tertiary">Configure quando receber notificações</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-info/15 flex items-center justify-center">
                    <span className="text-xs font-bold text-info">50%</span>
                  </div>
                  <p className="text-sm text-foreground">Alerta em 50% do orçamento</p>
                </div>
                <Switch checked={alert50} onCheckedChange={setAlert50} />
              </div>

              <div className="flex items-center justify-between py-3 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-warning/15 flex items-center justify-center">
                    <span className="text-xs font-bold text-warning">80%</span>
                  </div>
                  <p className="text-sm text-foreground">Alerta em 80% do orçamento</p>
                </div>
                <Switch checked={alert80} onCheckedChange={setAlert80} />
              </div>

              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-destructive/15 flex items-center justify-center">
                    <span className="text-xs font-bold text-destructive">100%</span>
                  </div>
                  <p className="text-sm text-foreground">Alerta ao estourar orçamento</p>
                </div>
                <Switch checked={alert100} onCheckedChange={setAlert100} />
              </div>
            </div>
          </div>
        </div>

        {/* Projections Column */}
        <div className="space-y-6">
          {/* Current Status Card */}
          {stats && (
            <div className="bg-card border border-border rounded-2xl p-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
              <div className="flex items-center gap-3 mb-6">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  stats.status === 'ok' && "bg-accent/15",
                  stats.status === 'warning' && "bg-warning/15",
                  stats.status === 'busted' && "bg-destructive/15"
                )}>
                  {stats.status === 'ok' && <CheckCircle size={20} className="text-accent" />}
                  {stats.status === 'warning' && <AlertTriangle size={20} className="text-warning" />}
                  {stats.status === 'busted' && <XCircle size={20} className="text-destructive" />}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Status atual</h2>
                  <p className="text-sm text-foreground-tertiary">
                    {stats.status === 'ok' && 'Dentro do orçamento'}
                    {stats.status === 'warning' && 'Atenção ao limite'}
                    {stats.status === 'busted' && 'Orçamento estourado'}
                  </p>
                </div>
              </div>

              <Progress 
                value={Math.min(100, stats.percentage)} 
                className={cn(
                  "h-3 mb-4",
                  stats.status === 'ok' && "[&>div]:bg-accent",
                  stats.status === 'warning' && "[&>div]:bg-warning",
                  stats.status === 'busted' && "[&>div]:bg-destructive"
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/50 rounded-xl p-3">
                  <p className="text-xs text-foreground-tertiary mb-1">Gasto</p>
                  <p className="text-lg font-bold text-foreground">{formatCurrency(stats.spentCents)}</p>
                </div>
                <div className="bg-muted/50 rounded-xl p-3">
                  <p className="text-xs text-foreground-tertiary mb-1">Restante</p>
                  <p className={cn(
                    "text-lg font-bold",
                    stats.remaining > 0 ? "text-accent" : "text-destructive"
                  )}>{formatCurrency(stats.remaining)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Projections Card */}
          {stats && (
            <div className="bg-card border border-border rounded-2xl p-6 animate-fade-in" style={{ animationDelay: '150ms' }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-info/15 flex items-center justify-center">
                  <TrendingUp size={20} className="text-info" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Projeções</h2>
                  <p className="text-sm text-foreground-tertiary">Baseado no seu ritmo atual</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-foreground-tertiary">Gasto diário médio</span>
                  <span className="text-sm font-medium text-foreground">
                    {formatCurrency(stats.dailyAverage)}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-foreground-tertiary">Projeção até fim do mês</span>
                  <span className={cn(
                    "text-sm font-medium",
                    stats.projectedTotal > stats.limitCents ? "text-destructive" : "text-accent"
                  )}>
                    {formatCurrency(stats.projectedTotal)}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-foreground-tertiary">Dias até estourar</span>
                  <span className={cn(
                    "text-sm font-medium",
                    stats.daysUntilBust <= 5 ? "text-destructive" : "text-foreground"
                  )}>
                    {stats.daysUntilBust > stats.daysRemaining 
                      ? `+${stats.daysRemaining} dias`
                      : `${stats.daysUntilBust} dias`
                    }
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Month Progress */}
          <div className="bg-card border border-border rounded-2xl p-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <Calendar size={20} className="text-foreground-secondary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Progresso do mês</h2>
                <p className="text-sm text-foreground-tertiary">
                  Dia {daysPassed} de {daysInMonth}
                </p>
              </div>
            </div>
            <Progress 
              value={(daysPassed / daysInMonth) * 100} 
              className="h-2"
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
