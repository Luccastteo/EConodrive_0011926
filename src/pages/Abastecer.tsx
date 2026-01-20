import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Fuel, Car, MapPin, DollarSign, Gauge, Calendar, Loader2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRefuels } from "@/hooks/use-refuels";
import { useVehicles } from "@/hooks/use-vehicles";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/budget-utils";

const fuelTypes = [
  { id: "gasolina", label: "Gasolina", color: "warning" },
  { id: "etanol", label: "Etanol", color: "accent" },
  { id: "diesel", label: "Diesel", color: "info" },
];

export default function Abastecer() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { vehicles, defaultVehicle } = useVehicles();
  const { createRefuel } = useRefuels();
  const { toast } = useToast();

  const [selectedFuel, setSelectedFuel] = useState("gasolina");
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");
  const [station, setStation] = useState("");
  const [liters, setLiters] = useState("");
  const [pricePerLiter, setPricePerLiter] = useState("");
  const [odometer, setOdometer] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // ProtectedRoute handles authentication redirect
    // Just set default vehicle if available
    if (defaultVehicle) {
      setSelectedVehicleId(defaultVehicle.id);
    } else if (vehicles.length > 0) {
      setSelectedVehicleId(vehicles[0].id);
    }
  }, [defaultVehicle, vehicles]);

  const calculateTotal = () => {
    const litersNum = parseFloat(liters) || 0;
    const priceNum = parseFloat(pricePerLiter) || 0;
    return litersNum * priceNum;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar autenticado para registrar um abastecimento.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedVehicleId) {
      toast({
        title: "Erro",
        description: "Selecione um veículo.",
        variant: "destructive",
      });
      return;
    }

    if (!station.trim()) {
      toast({
        title: "Erro",
        description: "Informe o nome do posto.",
        variant: "destructive",
      });
      return;
    }

    const litersNum = parseFloat(liters);
    const priceNum = parseFloat(pricePerLiter);

    if (!litersNum || litersNum <= 0) {
      toast({
        title: "Erro",
        description: "Informe a quantidade de litros válida.",
        variant: "destructive",
      });
      return;
    }

    if (!priceNum || priceNum <= 0) {
      toast({
        title: "Erro",
        description: "Informe o preço por litro válido.",
        variant: "destructive",
      });
      return;
    }

    const totalCents = Math.round(calculateTotal() * 100);
    const odometerNum = odometer ? parseInt(odometer) : null;

    setIsSubmitting(true);
    try {
      await createRefuel.mutateAsync({
        station: station.trim(),
        fuel_type: selectedFuel,
        liters: litersNum,
        price_per_liter: priceNum,
        total_cost_cents: totalCents,
        odometer: odometerNum,
        consumption: null, // Will be calculated later if we have previous odometer
      });

      toast({
        title: "Sucesso!",
        description: "Abastecimento registrado com sucesso.",
      });

      // Reset form
      setStation("");
      setLiters("");
      setPricePerLiter("");
      setOdometer("");
      setDate(new Date().toISOString().split('T')[0]);

      // Navigate to history
      setTimeout(() => {
        navigate('/historico');
      }, 1000);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível registrar o abastecimento.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight">
          Novo Abastecimento
        </h1>
        <p className="text-foreground-tertiary mt-1">
          Registre um novo abastecimento
        </p>
      </div>

      <div className="max-w-2xl">
        {/* Fuel Type Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-foreground-secondary mb-3">
            Tipo de combustível
          </label>
          <div className="flex gap-3">
            {fuelTypes.map((fuel) => (
              <button
                key={fuel.id}
                onClick={() => setSelectedFuel(fuel.id)}
                className={cn(
                  "flex-1 py-3 px-4 rounded-xl border text-sm font-medium transition-all duration-200",
                  selectedFuel === fuel.id
                    ? fuel.color === "warning"
                      ? "bg-warning/15 border-warning/50 text-warning"
                      : fuel.color === "accent"
                        ? "bg-accent/15 border-accent/50 text-accent"
                        : "bg-info/15 border-info/50 text-info"
                    : "bg-card border-border text-foreground-secondary hover:bg-card-hover"
                )}
              >
                {fuel.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Vehicle Select */}
          <div>
            <label className="block text-sm font-medium text-foreground-secondary mb-2">
              Veículo
            </label>
            <div className="relative">
              <Car size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-disabled" />
              <select
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
                required
                className="w-full bg-card border border-border rounded-xl py-3.5 pl-11 pr-4 text-foreground appearance-none focus:outline-none focus:border-border-focus transition-colors"
              >
                {vehicles.length === 0 ? (
                  <option value="">Nenhum veículo cadastrado</option>
                ) : (
                  vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.name} - {vehicle.plate}
                    </option>
                  ))
                )}
              </select>
            </div>
            {vehicles.length === 0 && (
              <p className="text-sm text-foreground-tertiary mt-2">
                <button
                  type="button"
                  onClick={() => navigate('/veiculos')}
                  className="text-accent hover:underline"
                >
                  Cadastre um veículo primeiro
                </button>
              </p>
            )}
          </div>

          {/* Station */}
          <div>
            <label className="block text-sm font-medium text-foreground-secondary mb-2">
              Posto
            </label>
            <div className="relative">
              <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-disabled" />
              <input
                type="text"
                placeholder="Nome do posto"
                value={station}
                onChange={(e) => setStation(e.target.value)}
                required
                className="w-full bg-card border border-border rounded-xl py-3.5 pl-11 pr-4 text-foreground placeholder:text-foreground-disabled focus:outline-none focus:border-border-focus transition-colors"
              />
            </div>
          </div>

          {/* Liters and Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground-secondary mb-2">
                Litros
              </label>
              <div className="relative">
                <Fuel size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-disabled" />
                <input
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  value={liters}
                  onChange={(e) => setLiters(e.target.value)}
                  required
                  className="w-full bg-card border border-border rounded-xl py-3.5 pl-11 pr-4 text-foreground placeholder:text-foreground-disabled focus:outline-none focus:border-border-focus transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground-secondary mb-2">
                Preço por litro
              </label>
              <div className="relative">
                <DollarSign size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-disabled" />
                <input
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  value={pricePerLiter}
                  onChange={(e) => setPricePerLiter(e.target.value)}
                  required
                  className="w-full bg-card border border-border rounded-xl py-3.5 pl-11 pr-4 text-foreground placeholder:text-foreground-disabled focus:outline-none focus:border-border-focus transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Odometer */}
          <div>
            <label className="block text-sm font-medium text-foreground-secondary mb-2">
              Quilometragem atual (opcional)
            </label>
            <div className="relative">
              <Gauge size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-disabled" />
              <input
                type="number"
                placeholder="0"
                min="0"
                value={odometer}
                onChange={(e) => setOdometer(e.target.value)}
                className="w-full bg-card border border-border rounded-xl py-3.5 pl-11 pr-4 text-foreground placeholder:text-foreground-disabled focus:outline-none focus:border-border-focus transition-colors"
              />
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-foreground-secondary mb-2">
              Data
            </label>
            <div className="relative">
              <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-disabled" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full bg-card border border-border rounded-xl py-3.5 pl-11 pr-4 text-foreground focus:outline-none focus:border-border-focus transition-colors"
              />
            </div>
          </div>

          {/* Total Preview */}
          <div className="bg-card border border-border rounded-xl p-5 mt-6">
            <div className="flex items-center justify-between">
              <span className="text-foreground-secondary">Total</span>
              <span className="text-2xl font-bold text-foreground">
                {formatCurrency(Math.round(calculateTotal() * 100))}
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="uber"
            size="lg"
            className="w-full mt-6"
            disabled={isSubmitting || vehicles.length === 0}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar abastecimento"
            )}
          </Button>
        </form>
      </div>
    </AppLayout>
  );
}
