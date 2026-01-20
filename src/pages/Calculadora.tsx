import { useState, useEffect } from "react";
import { Fuel, TrendingUp, AlertCircle } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { cn } from "@/lib/utils";

export default function Calculadora() {
  const [gasolinaPrice, setGasolinaPrice] = useState("");
  const [etanolPrice, setEtanolPrice] = useState("");
  const [result, setResult] = useState<{
    ratio: number;
    recommendation: "gasolina" | "etanol" | null;
    economy: number;
  } | null>(null);

  useEffect(() => {
    if (gasolinaPrice && etanolPrice) {
      const gas = parseFloat(gasolinaPrice);
      const eth = parseFloat(etanolPrice);
      
      if (gas > 0 && eth > 0) {
        const ratio = eth / gas;
        const recommendation = ratio < 0.7 ? "etanol" : "gasolina";
        const economy = Math.abs((ratio - 0.7) * 100);
        
        setResult({ ratio, recommendation, economy });
      }
    } else {
      setResult(null);
    }
  }, [gasolinaPrice, etanolPrice]);

  return (
    <AppLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight">
          Calculadora
        </h1>
        <p className="text-foreground-tertiary mt-1">
          Descubra qual combustível é mais vantajoso
        </p>
      </div>

      <div className="max-w-md">
        {/* Info Card */}
        <div className="bg-info/10 border border-info/20 rounded-xl p-4 mb-6 flex gap-3">
          <AlertCircle size={20} className="text-info flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-foreground">
              Se o preço do etanol for até <strong>70%</strong> do preço da gasolina, compensa usar etanol.
            </p>
          </div>
        </div>

        {/* Inputs */}
        <div className="space-y-4 mb-8">
          <div>
            <label className="block text-sm font-medium text-foreground-secondary mb-2">
              Preço da Gasolina (R$/L)
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-warning/15 flex items-center justify-center">
                <Fuel size={16} className="text-warning" />
              </div>
              <input
                type="number"
                placeholder="0.00"
                step="0.01"
                value={gasolinaPrice}
                onChange={(e) => setGasolinaPrice(e.target.value)}
                className="w-full bg-card border border-border rounded-xl py-4 pl-16 pr-4 text-lg font-medium text-foreground placeholder:text-foreground-disabled focus:outline-none focus:border-border-focus transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground-secondary mb-2">
              Preço do Etanol (R$/L)
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center">
                <Fuel size={16} className="text-accent" />
              </div>
              <input
                type="number"
                placeholder="0.00"
                step="0.01"
                value={etanolPrice}
                onChange={(e) => setEtanolPrice(e.target.value)}
                className="w-full bg-card border border-border rounded-xl py-4 pl-16 pr-4 text-lg font-medium text-foreground placeholder:text-foreground-disabled focus:outline-none focus:border-border-focus transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Result */}
        {result && (
          <div className="animate-scale-in">
            <div
              className={cn(
                "rounded-2xl p-6 border",
                result.recommendation === "etanol"
                  ? "bg-accent/10 border-accent/30"
                  : "bg-warning/10 border-warning/30"
              )}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    result.recommendation === "etanol"
                      ? "bg-accent/20"
                      : "bg-warning/20"
                  )}
                >
                  <TrendingUp
                    size={24}
                    className={
                      result.recommendation === "etanol"
                        ? "text-accent"
                        : "text-warning"
                    }
                  />
                </div>
                <div>
                  <p className="text-sm text-foreground-secondary">Recomendação</p>
                  <p
                    className={cn(
                      "text-xl font-bold",
                      result.recommendation === "etanol"
                        ? "text-accent"
                        : "text-warning"
                    )}
                  >
                    Abasteça com {result.recommendation === "etanol" ? "Etanol" : "Gasolina"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                <div>
                  <p className="text-xs text-foreground-tertiary mb-1">Proporção</p>
                  <p className="text-lg font-semibold text-foreground">
                    {(result.ratio * 100).toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-foreground-tertiary mb-1">
                    {result.ratio < 0.7 ? "Economia" : "Diferença"}
                  </p>
                  <p className="text-lg font-semibold text-foreground">
                    {result.economy.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
