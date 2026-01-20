import { useState } from "react";
import { Plus, Car, MoreVertical, Fuel, Calendar, Gauge, Trash2, X } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useVehicles } from "@/hooks/use-vehicles";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function Veiculos() {
  const { vehicles, createVehicle, deleteVehicle, setDefaultVehicle, isLoading } = useVehicles();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    plate: "",
    year: new Date().getFullYear().toString(),
    fuelType: "Flex",
    color: "",
  });

  const hasVehicles = vehicles.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        title: "Erro",
        description: "Informe o nome do veículo.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.plate.trim()) {
      toast({
        title: "Erro",
        description: "Informe a placa do veículo.",
        variant: "destructive",
      });
      return;
    }

    const year = parseInt(formData.year);
    if (!year || year < 1900 || year > new Date().getFullYear() + 1) {
      toast({
        title: "Erro",
        description: "Informe um ano válido.",
        variant: "destructive",
      });
      return;
    }

    createVehicle({
      name: formData.name.trim(),
      plate: formData.plate.trim().toUpperCase(),
      year,
      fuelType: formData.fuelType,
      color: formData.color.trim() || undefined,
    });

    toast({
      title: "Sucesso!",
      description: "Veículo adicionado com sucesso.",
    });

    setFormData({
      name: "",
      plate: "",
      year: new Date().getFullYear().toString(),
      fuelType: "Flex",
      color: "",
    });
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o veículo "${name}"?`)) {
      deleteVehicle(id);
      toast({
        title: "Veículo excluído",
        description: `O veículo "${name}" foi removido.`,
      });
    }
  };

  const handleSetDefault = (id: string) => {
    setDefaultVehicle(id);
    toast({
      title: "Veículo padrão alterado",
      description: "Este veículo será usado como padrão nos novos abastecimentos.",
    });
  };

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight">
            Veículos
          </h1>
          <p className="text-foreground-tertiary mt-1">
            Gerencie seus veículos cadastrados
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="accent" className="gap-2">
              <Plus size={18} />
              Adicionar veículo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Adicionar Veículo</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <Label htmlFor="name">Nome do veículo *</Label>
                <Input
                  id="name"
                  placeholder="Ex: Honda Civic"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="plate">Placa *</Label>
                <Input
                  id="plate"
                  placeholder="Ex: ABC-1234"
                  value={formData.plate}
                  onChange={(e) => setFormData({ ...formData, plate: e.target.value.toUpperCase() })}
                  maxLength={8}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="year">Ano *</Label>
                  <Input
                    id="year"
                    type="number"
                    placeholder="2024"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="fuelType">Combustível *</Label>
                  <select
                    id="fuelType"
                    value={formData.fuelType}
                    onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    required
                  >
                    <option value="Flex">Flex</option>
                    <option value="Gasolina">Gasolina</option>
                    <option value="Etanol">Etanol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="GNV">GNV</option>
                  </select>
                </div>
              </div>
              <div>
                <Label htmlFor="color">Cor (opcional)</Label>
                <Input
                  id="color"
                  placeholder="Ex: Preto"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="accent">
                  Adicionar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-foreground-tertiary">Carregando...</div>
      ) : hasVehicles ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className={cn(
                "bg-card border rounded-2xl p-6 transition-all duration-200",
                "hover:bg-card-hover hover:border-border-secondary",
                vehicle.isDefault ? "border-accent/50" : "border-border"
              )}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center">
                    <Car size={26} className="text-foreground-secondary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-foreground">
                        {vehicle.name}
                      </h3>
                      {vehicle.isDefault && (
                        <span className="px-2 py-0.5 bg-accent/15 text-accent text-2xs font-medium rounded-full">
                          Principal
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-foreground-tertiary">
                      {vehicle.plate}
                    </p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical size={18} className="text-foreground-tertiary" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {!vehicle.isDefault && (
                      <DropdownMenuItem onClick={() => handleSetDefault(vehicle.id)}>
                        Definir como principal
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => handleDelete(vehicle.id, vehicle.name)}
                      className="text-destructive"
                    >
                      <Trash2 size={16} className="mr-2" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Details */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-foreground-tertiary" />
                  <div>
                    <p className="text-xs text-foreground-tertiary">Ano</p>
                    <p className="text-sm font-medium text-foreground">{vehicle.year}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Fuel size={16} className="text-foreground-tertiary" />
                  <div>
                    <p className="text-xs text-foreground-tertiary">Combustível</p>
                    <p className="text-sm font-medium text-foreground">{vehicle.fuelType}</p>
                  </div>
                </div>
                {vehicle.color && (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded border border-border" style={{ backgroundColor: vehicle.color.toLowerCase() }} />
                    <div>
                      <p className="text-xs text-foreground-tertiary">Cor</p>
                      <p className="text-sm font-medium text-foreground">{vehicle.color}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Car size={28} />}
          title="Nenhum veículo cadastrado"
          description="Adicione seu primeiro veículo para começar a registrar abastecimentos."
          actionLabel="Adicionar veículo"
          onAction={() => setIsDialogOpen(true)}
        />
      )}
    </AppLayout>
  );
}
