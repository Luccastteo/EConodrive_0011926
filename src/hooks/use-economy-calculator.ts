import { useMemo } from 'react';
import { useRefuels } from './use-refuels';
import { useVehicles } from './use-vehicles';

interface EconomyCalculation {
    investment: number; // valor investido em reais
    fuelType: 'gasolina' | 'etanol' | 'diesel';
    averageConsumption: number; // km/L
    estimatedKilometers: number; // km que pode rodar
    costPerKilometer: number; // custo por km
    efficiency: 'excelente' | 'bom' | 'regular' | 'ruim';
    savings: number; // economia potencial vs média
}

interface EconomyProjection {
    investment: number;
    projectedKilometers: number;
    monthlyProjection: number; // km por mês com esse investimento
    weeklyProjection: number; // km por semana
    dailyProjection: number; // km por dia
}

export function useEconomyCalculator() {
    const { refuels } = useRefuels();
    const { vehicles } = useVehicles();

    // Cálculos baseados nos dados reais
    const calculations = useMemo(() => {
        if (refuels.length === 0) return null;

        // Agrupar por tipo de combustível
        const fuelGroups = refuels.reduce((acc, refuel) => {
            const fuelType = refuel.fuel_type as 'gasolina' | 'etanol' | 'diesel';
            if (!acc[fuelType]) {
                acc[fuelType] = {
                    totalLiters: 0,
                    totalCost: 0,
                    totalKm: 0,
                    count: 0,
                    consumptions: []
                };
            }
            acc[fuelType].totalLiters += Number(refuel.liters);
            acc[fuelType].totalCost += refuel.total_cost_cents / 100;
            acc[fuelType].count += 1;

            if (refuel.consumption) {
                acc[fuelType].consumptions.push(refuel.consumption);
            }

            return acc;
        }, {} as Record<string, any>);

        // Calcular médias para cada tipo
        const results: Record<string, EconomyCalculation> = {};

        Object.entries(fuelGroups).forEach(([fuelType, data]) => {
            const avgConsumption = data.consumptions.length > 0
                ? data.consumptions.reduce((sum: number, cons: number) => sum + cons, 0) / data.consumptions.length
                : 10; // padrão caso não tenha dados

            const avgPricePerLiter = data.totalCost / data.totalLiters;
            const costPerKilometer = avgPricePerLiter / avgConsumption;

            // Classificar eficiência
            let efficiency: EconomyCalculation['efficiency'] = 'regular';
            if (fuelType === 'gasolina') {
                if (avgConsumption >= 12) efficiency = 'excelente';
                else if (avgConsumption >= 10) efficiency = 'bom';
                else if (avgConsumption >= 8) efficiency = 'regular';
                else efficiency = 'ruim';
            } else if (fuelType === 'etanol') {
                if (avgConsumption >= 10) efficiency = 'excelente';
                else if (avgConsumption >= 8) efficiency = 'bom';
                else if (avgConsumption >= 6) efficiency = 'regular';
                else efficiency = 'ruim';
            } else { // diesel
                if (avgConsumption >= 15) efficiency = 'excelente';
                else if (avgConsumption >= 12) efficiency = 'bom';
                else if (avgConsumption >= 10) efficiency = 'regular';
                else efficiency = 'ruim';
            }

            // Calcular economia vs média nacional
            const nationalAverage = fuelType === 'gasolina' ? 9 : fuelType === 'etanol' ? 7 : 11;
            const savings = ((avgConsumption - nationalAverage) / nationalAverage) * 100;

            results[fuelType] = {
                investment: data.totalCost,
                fuelType: fuelType as EconomyCalculation['fuelType'],
                averageConsumption: avgConsumption,
                estimatedKilometers: data.totalLiters * avgConsumption,
                costPerKilometer,
                efficiency,
                savings
            };
        });

        return results;
    }, [refuels]);

    // Função para calcular projeção com investimento personalizado
    const calculateProjection = (
        investment: number,
        fuelType: 'gasolina' | 'etanol' | 'diesel'
    ): EconomyProjection | null => {
        if (!calculations || !calculations[fuelType]) return null;

        const baseCalc = calculations[fuelType];
        const avgPricePerLiter = baseCalc.investment / (baseCalc.estimatedKilometers / baseCalc.averageConsumption);
        const litersCanBuy = investment / avgPricePerLiter;
        const projectedKilometers = litersCanBuy * baseCalc.averageConsumption;

        return {
            investment,
            projectedKilometers,
            monthlyProjection: projectedKilometers,
            weeklyProjection: projectedKilometers / 4.33, // média de semanas no mês
            dailyProjection: projectedKilometers / 30
        };
    };

    // Função para encontrar melhor combustível para o investimento
    const getBestFuelForInvestment = (investment: number): {
        fuelType: 'gasolina' | 'etanol' | 'diesel';
        projection: EconomyProjection;
        reason: string;
    } | null => {
        if (!calculations) return null;

        const projections = Object.entries(calculations).map(([fuelType, calc]) => ({
            fuelType: fuelType as 'gasolina' | 'etanol' | 'diesel',
            projection: calculateProjection(investment, fuelType as 'gasolina' | 'etanol' | 'diesel')!,
            efficiency: calc.efficiency,
            costPerKm: calc.costPerKilometer
        }));

        // Ordenar por quilometragem (maior primeiro)
        projections.sort((a, b) => b.projection.projectedKilometers - a.projection.projectedKilometers);

        const best = projections[0];
        if (!best) return null;

        let reason = '';
        if (best.efficiency === 'excelente') {
            reason = `Melhor eficiência com ${best.fuelType}`;
        } else if (best.costPerKm < 0.50) {
            reason = `Menor custo por quilômetro`;
        } else {
            reason = `Maior quilometragem por real investido`;
        }

        return {
            fuelType: best.fuelType,
            projection: best.projection,
            reason
        };
    };

    // Estatísticas gerais
    const stats = useMemo(() => {
        if (!calculations) return null;

        const fuelTypes = Object.keys(calculations);
        const totalInvestment = Object.values(calculations).reduce((sum, calc) => sum + calc.investment, 0);
        const totalKilometers = Object.values(calculations).reduce((sum, calc) => sum + calc.estimatedKilometers, 0);
        const avgCostPerKm = totalInvestment / totalKilometers;

        return {
            totalInvestment,
            totalKilometers,
            avgCostPerKm,
            fuelTypesCount: fuelTypes.length,
            mostEfficientFuel: fuelTypes.reduce((best, current) =>
                calculations[current].averageConsumption > (calculations[best]?.averageConsumption || 0) ? current : best
                , fuelTypes[0])
        };
    }, [calculations]);

    return {
        calculations,
        calculateProjection,
        getBestFuelForInvestment,
        stats,
        hasData: refuels.length > 0
    };
}
