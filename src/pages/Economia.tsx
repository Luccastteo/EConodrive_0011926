import { useState } from "react";
import { Calculator, TrendingUp, DollarSign, Gauge, Info, ChevronRight, Target, Zap } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEconomyCalculator } from "@/hooks/use-economy-calculator";
import { formatCurrency } from "@/lib/budget-utils";

export default function Economia() {
    const [investment, setInvestment] = useState<string>("100");
    const [selectedFuel, setSelectedFuel] = useState<'gasolina' | 'etanol' | 'diesel'>('gasolina');
    const { calculations, calculateProjection, getBestFuelForInvestment, stats, hasData } = useEconomyCalculator();

    const investmentValue = parseFloat(investment) || 0;
    const projection = calculateProjection(investmentValue, selectedFuel);
    const bestOption = getBestFuelForInvestment(investmentValue);

    const getEfficiencyColor = (efficiency: string) => {
        switch (efficiency) {
            case 'excelente': return 'bg-green-100 text-green-800 border-green-200';
            case 'bom': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'regular': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'ruim': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getFuelIcon = (fuelType: string) => {
        switch (fuelType) {
            case 'gasolina': return '⛽';
            case 'etanol': return '🌱';
            case 'diesel': return '🚛';
            default: return '⛽';
        }
    };

    if (!hasData) {
        return (
            <AppLayout>
                <div className="max-w-2xl mx-auto">
                    <div className="text-center py-12">
                        <Calculator className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h2 className="text-2xl font-semibold mb-2">Calculadora de Economia</h2>
                        <p className="text-muted-foreground mb-6">
                            Registre alguns abastecimentos primeiro para poder calcular sua economia e quilometragem.
                        </p>
                        <Button onClick={() => window.location.href = '/abastecer'}>
                            Registrar primeiro abastecimento
                        </Button>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight">
                        Calculadora de Economia
                    </h1>
                    <p className="text-foreground-tertiary mt-1">
                        Descubra quanto você pode rodar com seu investimento em combustível
                    </p>
                </div>

                {/* Stats Overview */}
                {stats && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2">
                                    <DollarSign className="h-4 w-4 text-green-600" />
                                    <span className="text-sm text-muted-foreground">Total investido</span>
                                </div>
                                <p className="text-2xl font-bold mt-1">{formatCurrency(stats.totalInvestment)}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-blue-600" />
                                    <span className="text-sm text-muted-foreground">Quilometragem total</span>
                                </div>
                                <p className="text-2xl font-bold mt-1">{Math.floor(stats.totalKilometers).toLocaleString('pt-BR')} km</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2">
                                    <Gauge className="h-4 w-4 text-purple-600" />
                                    <span className="text-sm text-muted-foreground">Custo por km</span>
                                </div>
                                <p className="text-2xl font-bold mt-1">R$ {stats.avgCostPerKm.toFixed(3)}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2">
                                    <Target className="h-4 w-4 text-orange-600" />
                                    <span className="text-sm text-muted-foreground">Melhor combustível</span>
                                </div>
                                <p className="text-2xl font-bold mt-1 capitalize">{stats.mostEfficientFuel}</p>
                            </CardContent>
                        </Card>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Calculator */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calculator className="h-5 w-5" />
                                    Simulador de Investimento
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Investment Input */}
                                <div className="space-y-2">
                                    <Label htmlFor="investment">Valor do investimento (R$)</Label>
                                    <Input
                                        id="investment"
                                        type="number"
                                        value={investment}
                                        onChange={(e) => setInvestment(e.target.value)}
                                        placeholder="100"
                                        min="1"
                                        step="10"
                                    />
                                </div>

                                {/* Fuel Selection */}
                                <div className="space-y-2">
                                    <Label>Tipo de combustível</Label>
                                    <Tabs value={selectedFuel} onValueChange={(value) => setSelectedFuel(value as any)}>
                                        <TabsList className="grid w-full grid-cols-3">
                                            <TabsTrigger value="gasolina">⛽ Gasolina</TabsTrigger>
                                            <TabsTrigger value="etanol">🌱 Etanol</TabsTrigger>
                                            <TabsTrigger value="diesel">🚛 Diesel</TabsTrigger>
                                        </TabsList>
                                    </Tabs>
                                </div>

                                {/* Projection Results */}
                                {projection && (
                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-lg">Resultado da Simulação</h3>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                                                <CardContent className="p-4">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <TrendingUp className="h-4 w-4 text-blue-600" />
                                                        <span className="text-sm font-medium text-blue-800">Quilometragem total</span>
                                                    </div>
                                                    <p className="text-2xl font-bold text-blue-900">
                                                        {Math.floor(projection.projectedKilometers).toLocaleString('pt-BR')} km
                                                    </p>
                                                </CardContent>
                                            </Card>

                                            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                                                <CardContent className="p-4">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Target className="h-4 w-4 text-green-600" />
                                                        <span className="text-sm font-medium text-green-800">Por mês</span>
                                                    </div>
                                                    <p className="text-2xl font-bold text-green-900">
                                                        {Math.floor(projection.monthlyProjection).toLocaleString('pt-BR')} km
                                                    </p>
                                                </CardContent>
                                            </Card>

                                            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                                                <CardContent className="p-4">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Zap className="h-4 w-4 text-purple-600" />
                                                        <span className="text-sm font-medium text-purple-800">Por semana</span>
                                                    </div>
                                                    <p className="text-2xl font-bold text-purple-900">
                                                        {Math.floor(projection.weeklyProjection).toLocaleString('pt-BR')} km
                                                    </p>
                                                </CardContent>
                                            </Card>

                                            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                                                <CardContent className="p-4">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Info className="h-4 w-4 text-orange-600" />
                                                        <span className="text-sm font-medium text-orange-800">Por dia</span>
                                                    </div>
                                                    <p className="text-2xl font-bold text-orange-900">
                                                        {Math.floor(projection.dailyProjection).toLocaleString('pt-BR')} km
                                                    </p>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </div>
                                )}

                                {/* Best Option */}
                                {bestOption && (
                                    <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h4 className="font-semibold text-emerald-800 mb-1">Melhor opção para R$ {investmentValue}</h4>
                                                    <p className="text-sm text-emerald-600">{bestOption.reason}</p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <span className="text-2xl">{getFuelIcon(bestOption.fuelType)}</span>
                                                        <span className="font-medium capitalize text-emerald-900">{bestOption.fuelType}</span>
                                                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                                                            {Math.floor(bestOption.projection.projectedKilometers).toLocaleString('pt-BR')} km
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <ChevronRight className="h-5 w-5 text-emerald-600" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Performance Analysis */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Gauge className="h-5 w-5" />
                                    Análise de Desempenho
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {calculations && Object.entries(calculations).map(([fuelType, calc]) => (
                                    <div key={fuelType} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xl">{getFuelIcon(fuelType)}</span>
                                                <span className="font-medium capitalize">{fuelType}</span>
                                            </div>
                                            <Badge className={getEfficiencyColor(calc.efficiency)}>
                                                {calc.efficiency}
                                            </Badge>
                                        </div>
                                        <div className="text-sm text-muted-foreground space-y-1">
                                            <div className="flex justify-between">
                                                <span>Consumo médio:</span>
                                                <span className="font-medium">{calc.averageConsumption.toFixed(1)} km/L</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Custo por km:</span>
                                                <span className="font-medium">R$ {calc.costPerKilometer.toFixed(3)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Economia vs média:</span>
                                                <span className={`font-medium ${calc.savings > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {calc.savings > 0 ? '+' : ''}{calc.savings.toFixed(1)}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Tips */}
                        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                            <CardContent className="p-4">
                                <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                                    <Info className="h-4 w-4" />
                                    Dicas de Economia
                                </h4>
                                <ul className="text-sm text-blue-800 space-y-1">
                                    <li>• Mantenha a pressão dos pneus correta</li>
                                    <li>• Evite acelerações bruscas</li>
                                    <li>• Use o ar condicionado com moderação</li>
                                    <li>• Faça manutenções regularmente</li>
                                    <li>• Compare preços antes de abastecer</li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
