import { useNavigate } from "react-router-dom";
import { Wallet, Droplet, MapPin, Gauge, Plus, Car, Fuel, Sparkles } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { RefuelCard } from "@/components/dashboard/RefuelCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { InsightCard } from "@/components/dashboard/InsightCard";
import { Button } from "@/components/ui/button";
import { useRefuels } from "@/hooks/use-refuels";
import { useInsights } from "@/hooks/use-insights";
import { formatCurrency } from "@/lib/budget-utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Dashboard() {
  const navigate = useNavigate();
  const { refuels, isLoading } = useRefuels();
  const { insights, criticalInsights, warningInsights, infoInsights, hasInsights } = useInsights();

  const recentRefuels = refuels.slice(0, 3);
  const hasRefuels = recentRefuels.length > 0;

  // Calculate metrics from refuels
  const totalSpent = refuels.reduce((sum, r) => sum + r.total_cost_cents, 0);
  const totalLiters = refuels.reduce((sum, r) => sum + Number(r.liters), 0);

  // Calculate average consumption if we have odometer data
  const refuelsWithOdometer = refuels.filter(r => r.odometer !== null);
  const avgConsumption = refuelsWithOdometer.length > 1
    ? refuelsWithOdometer.reduce((sum, r) => sum + (r.consumption || 0), 0) / refuelsWithOdometer.length
    : 0;

  // Show top 3 insights (prioritizing critical and warning)
  const topInsights = [...criticalInsights, ...warningInsights, ...infoInsights].slice(0, 3);

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex flex-col gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-2xl lg:text-3xl font-bold text-foreground tracking-tight">
            Dashboard
          </h1>
          <p className="text-foreground-tertiary mt-1 text-sm sm:text-base">
            Acompanhe seus gastos e consumo de combustível
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline" className="gap-2 justify-center sm:justify-start" onClick={() => navigate('/veiculos')}>
            <Car size={18} />
            <span className="hidden sm:inline">Meus veículos</span>
            <span className="sm:hidden">Veículos</span>
          </Button>
          <Button className="gap-2 justify-center sm:justify-start" onClick={() => navigate('/abastecer')}>
            <Plus size={18} />
            <span className="hidden sm:inline">Novo abastecimento</span>
            <span className="sm:hidden">Abastecer</span>
          </Button>
        </div>
      </div>

      {/* Insights Section */}
      {hasInsights && topInsights.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={20} className="text-accent" />
            <h2 className="text-xl font-semibold text-foreground">
              Assistente Inteligente
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topInsights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        </section>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        <MetricCard
          label="Total gasto"
          value={formatCurrency(totalSpent).replace('R$', '').trim().split(',')[0]}
          unit={totalSpent > 0 ? `,${formatCurrency(totalSpent).split(',')[1]}` : ',00'}
          icon={<Wallet size={20} />}
          iconVariant="money"
        />
        <MetricCard
          label="Litros"
          value={Math.floor(totalLiters).toLocaleString('pt-BR')}
          unit={`,${(totalLiters % 1).toFixed(1).split('.')[1] || '0'} L`}
          icon={<Droplet size={20} />}
          iconVariant="fuel"
        />
        <MetricCard
          label="Abastec."
          value={refuels.length.toString()}
          unit=" regs"
          icon={<MapPin size={20} />}
          iconVariant="distance"
        />
        <MetricCard
          label="Consumo"
          value={avgConsumption > 0 ? avgConsumption.toFixed(1).replace('.', ',') : '0,0'}
          unit=" km/L"
          icon={<Gauge size={20} />}
          iconVariant="consumption"
        />
      </div>

      {/* Recent Refuels Section */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <h2 className="text-xl font-semibold text-foreground">
            Últimos abastecimentos
          </h2>
          {hasRefuels && (
            <button
              onClick={() => navigate('/historico')}
              className="text-sm font-medium text-foreground-secondary hover:text-foreground transition-colors self-start sm:self-auto"
            >
              Ver todos
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-foreground-tertiary">Carregando...</div>
        ) : hasRefuels ? (
          <div className="space-y-3">
            {recentRefuels.map((refuel, index) => (
              <div
                key={refuel.id}
                style={{ animationDelay: `${index * 50}ms` }}
                className="animate-fade-in"
              >
                <RefuelCard
                  station={refuel.station}
                  date={format(new Date(refuel.created_at), "dd MMM yyyy", { locale: ptBR })}
                  liters={Number(refuel.liters)}
                  pricePerLiter={Number(refuel.price_per_liter)}
                  total={refuel.total_cost_cents / 100}
                  consumption={refuel.consumption ? Number(refuel.consumption) : undefined}
                  fuelType={refuel.fuel_type as "gasolina" | "etanol" | "diesel"}
                  onClick={() => navigate('/historico')}
                />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Fuel size={28} />}
            title="Nenhum abastecimento"
            description="Registre seu primeiro abastecimento para começar a acompanhar seus gastos."
            actionLabel="Registrar abastecimento"
            onAction={() => navigate('/abastecer')}
          />
        )}
      </section>
    </AppLayout >
  );
}
