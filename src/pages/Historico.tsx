import { useState } from "react";
import { Filter, Search, History } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { RefuelCard } from "@/components/dashboard/RefuelCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Button } from "@/components/ui/button";
import { useRefuels } from "@/hooks/use-refuels";
import { formatCurrency } from "@/lib/budget-utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Historico() {
  const { refuels, isLoading } = useRefuels();
  const [searchQuery, setSearchQuery] = useState("");
  const hasHistory = refuels.length > 0;

  const filteredHistory = refuels.filter((item) =>
    item.station.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight">
            Histórico
          </h1>
          <p className="text-foreground-tertiary mt-1">
            Todos os seus abastecimentos registrados
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-disabled" />
          <input
            type="text"
            placeholder="Buscar por posto..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-card border border-border rounded-xl py-3 pl-11 pr-4 text-foreground placeholder:text-foreground-disabled focus:outline-none focus:border-border-focus transition-colors"
          />
        </div>
        <Button variant="outline" size="icon" className="h-[46px] w-[46px]">
          <Filter size={18} />
        </Button>
      </div>

      {/* Summary */}
      {hasHistory && (
        <div className="flex items-center gap-4 mb-6 text-sm">
          <span className="text-foreground-secondary">
            {filteredHistory.length} abastecimentos
          </span>
          <span className="text-foreground-disabled">•</span>
          <span className="text-foreground-secondary">
            Total: {formatCurrency(filteredHistory.reduce((sum, item) => sum + item.total_cost_cents, 0))}
          </span>
        </div>
      )}

      {/* History List */}
      {isLoading ? (
        <div className="text-center py-12 text-foreground-tertiary">Carregando...</div>
      ) : hasHistory && filteredHistory.length > 0 ? (
        <div className="space-y-3">
          {filteredHistory.map((refuel, index) => (
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
              />
            </div>
          ))}
        </div>
      ) : searchQuery ? (
        <EmptyState
          icon={<Search size={28} />}
          title="Nenhum resultado"
          description={`Nenhum abastecimento encontrado para "${searchQuery}"`}
        />
      ) : (
        <EmptyState
          icon={<History size={28} />}
          title="Sem histórico"
          description="Seus abastecimentos aparecerão aqui após o primeiro registro."
        />
      )}
    </AppLayout>
  );
}
