/**
 * Insights Engine - Motor de recomendações baseado em dados reais
 * 
 * Gera insights acionáveis baseados em:
 * - Histórico de abastecimentos
 * - Comparação com períodos anteriores
 * - Regras de negócio (teto mensal, consumo, preços)
 * - Análise de tendências
 */

import type { Refuel } from '@/hooks/use-refuels';
import { getCurrentMonthKey, getDaysInCurrentMonth, getDaysPassedInMonth } from '@/lib/budget-utils';

export type InsightStatus = 'info' | 'warning' | 'critical';

export interface Insight {
  id: string;
  status: InsightStatus;
  title: string;
  message: string;
  actionLabel?: string;
  actionRoute?: string;
  priority: number; // 1-10, maior = mais importante
}

export interface InsightsConfig {
  monthlyLimitCents?: number;
  ethanolFactor?: number; // Default 0.70 (70%)
  alertsEnabled?: boolean;
}

/**
 * Calcula insights baseados em dados reais
 */
export function generateInsights(
  refuels: Refuel[],
  config: InsightsConfig = {}
): Insight[] {
  const insights: Insight[] = [];
  
  if (refuels.length === 0) {
    return [
      {
        id: 'no-data',
        status: 'info',
        title: 'Comece a registrar abastecimentos',
        message: 'Registre seu primeiro abastecimento para começar a receber insights personalizados.',
        actionLabel: 'Registrar abastecimento',
        actionRoute: '/abastecer',
        priority: 5,
      },
    ];
  }

  const currentMonthKey = getCurrentMonthKey();
  const currentMonthRefuels = refuels.filter(r => {
    const refuelDate = new Date(r.created_at);
    const refuelMonthKey = `${refuelDate.getFullYear()}-${String(refuelDate.getMonth() + 1).padStart(2, '0')}`;
    return refuelMonthKey === currentMonthKey;
  });

  const previousMonthKey = getPreviousMonthKey(currentMonthKey);
  const previousMonthRefuels = refuels.filter(r => {
    const refuelDate = new Date(r.created_at);
    const refuelMonthKey = `${refuelDate.getFullYear()}-${String(refuelDate.getMonth() + 1).padStart(2, '0')}`;
    return refuelMonthKey === previousMonthKey;
  });

  // 1. Teto mensal e projeção
  if (config.monthlyLimitCents && config.monthlyLimitCents > 0) {
    const spentCents = currentMonthRefuels.reduce((sum, r) => sum + r.total_cost_cents, 0);
    const percentage = (spentCents / config.monthlyLimitCents) * 100;
    
    const daysInMonth = getDaysInCurrentMonth();
    const daysPassed = getDaysPassedInMonth();
    const dailyAverage = daysPassed > 0 ? spentCents / daysPassed : 0;
    const projectedTotal = dailyAverage * daysInMonth;
    const projectedPercentage = (projectedTotal / config.monthlyLimitCents) * 100;

    if (projectedPercentage >= 100) {
      insights.push({
        id: 'budget-projection-bust',
        status: 'critical',
        title: 'Projeção: Orçamento será estourado',
        message: `Com base no consumo atual, você vai estourar o orçamento em ${Math.ceil((config.monthlyLimitCents - spentCents) / dailyAverage)} dias. Projeção: ${formatCurrency(projectedTotal)}.`,
        actionLabel: 'Ajustar orçamento',
        actionRoute: '/orcamento',
        priority: 10,
      });
    } else if (percentage >= 80) {
      insights.push({
        id: 'budget-warning',
        status: 'warning',
        title: 'Atenção: Orçamento próximo do limite',
        message: `Você já gastou ${percentage.toFixed(0)}% do orçamento (${formatCurrency(spentCents)} de ${formatCurrency(config.monthlyLimitCents)}).`,
        actionLabel: 'Ver orçamento',
        actionRoute: '/orcamento',
        priority: 8,
      });
    } else if (projectedPercentage >= 80 && projectedPercentage < 100) {
      insights.push({
        id: 'budget-projection-warning',
        status: 'warning',
        title: 'Projeção: Orçamento pode ser estourado',
        message: `Se mantiver o ritmo atual, você vai usar ${projectedPercentage.toFixed(0)}% do orçamento este mês.`,
        actionLabel: 'Ver orçamento',
        actionRoute: '/orcamento',
        priority: 7,
      });
    }
  }

  // 2. Custo por km e tendência
  if (currentMonthRefuels.length >= 2 && previousMonthRefuels.length >= 1) {
    const currentCostPerKm = calculateCostPerKm(currentMonthRefuels);
    const previousCostPerKm = calculateCostPerKm(previousMonthRefuels);
    
    if (currentCostPerKm && previousCostPerKm) {
      const change = ((currentCostPerKm - previousCostPerKm) / previousCostPerKm) * 100;
      
      if (change > 15) {
        insights.push({
          id: 'cost-per-km-increase',
          status: 'warning',
          title: 'Custo por km aumentou significativamente',
          message: `Seu custo por km subiu ${change.toFixed(1)}% em relação ao mês anterior (R$ ${currentCostPerKm.toFixed(3)}/km vs R$ ${previousCostPerKm.toFixed(3)}/km).`,
          actionLabel: 'Ver histórico',
          actionRoute: '/historico',
          priority: 6,
        });
      } else if (change < -10) {
        insights.push({
          id: 'cost-per-km-decrease',
          status: 'info',
          title: 'Custo por km melhorou',
          message: `Ótimo! Seu custo por km diminuiu ${Math.abs(change).toFixed(1)}% em relação ao mês anterior.`,
          actionLabel: 'Ver histórico',
          actionRoute: '/historico',
          priority: 4,
        });
      }
    }
  }

  // 3. Variação de preço médio por litro
  if (currentMonthRefuels.length >= 1 && previousMonthRefuels.length >= 1) {
    const currentAvgPrice = calculateAveragePricePerLiter(currentMonthRefuels);
    const previousAvgPrice = calculateAveragePricePerLiter(previousMonthRefuels);
    
    if (currentAvgPrice && previousAvgPrice) {
      const change = ((currentAvgPrice - previousAvgPrice) / previousAvgPrice) * 100;
      
      if (change > 10) {
        insights.push({
          id: 'price-increase',
          status: 'warning',
          title: 'Preço médio do combustível subiu',
          message: `O preço médio por litro aumentou ${change.toFixed(1)}% este mês (R$ ${currentAvgPrice.toFixed(2)}/L vs R$ ${previousAvgPrice.toFixed(2)}/L).`,
          actionLabel: 'Ver histórico',
          actionRoute: '/historico',
          priority: 5,
        });
      }
    }
  }

  // 4. Consumo médio e queda relevante
  const refuelsWithConsumption = currentMonthRefuels.filter(r => r.consumption !== null);
  if (refuelsWithConsumption.length >= 3) {
    const avgConsumption = refuelsWithConsumption.reduce((sum, r) => sum + Number(r.consumption || 0), 0) / refuelsWithConsumption.length;
    const recentConsumption = refuelsWithConsumption.slice(-3).reduce((sum, r) => sum + Number(r.consumption || 0), 0) / 3;
    
    if (recentConsumption < avgConsumption * 0.93) { // Queda de mais de 7%
      insights.push({
        id: 'consumption-drop',
        status: 'info',
        title: 'Consumo melhorou recentemente',
        message: `Seu consumo médio nos últimos abastecimentos (${recentConsumption.toFixed(1)} km/L) está melhor que a média do mês (${avgConsumption.toFixed(1)} km/L).`,
        actionLabel: 'Ver histórico',
        actionRoute: '/historico',
        priority: 3,
      });
    }
  }

  // 5. Regra flex: etanol vs gasolina
  const ethanolFactor = config.ethanolFactor || 0.70;
  const recentRefuels = refuels.slice(0, 5); // Últimos 5 abastecimentos
  
  for (const refuel of recentRefuels) {
    if (refuel.fuel_type === 'gasolina' || refuel.fuel_type === 'etanol') {
      // Buscar preço do outro combustível no mesmo período
      const samePeriodRefuels = refuels.filter(r => {
        const daysDiff = Math.abs(
          (new Date(r.created_at).getTime() - new Date(refuel.created_at).getTime()) / (1000 * 60 * 60 * 24)
        );
        return daysDiff <= 7; // Dentro de 7 dias
      });

      const otherFuelType = refuel.fuel_type === 'gasolina' ? 'etanol' : 'gasolina';
      const otherFuelRefuels = samePeriodRefuels.filter(r => r.fuel_type === otherFuelType);
      
      if (otherFuelRefuels.length > 0) {
        const currentPrice = Number(refuel.price_per_liter);
        const otherPrice = otherFuelRefuels.reduce((sum, r) => sum + Number(r.price_per_liter), 0) / otherFuelRefuels.length;
        const ratio = otherPrice / currentPrice;
        
        if (refuel.fuel_type === 'gasolina' && ratio <= ethanolFactor) {
          insights.push({
            id: `ethanol-better-${refuel.id}`,
            status: 'info',
            title: 'Etanol pode compensar mais',
            message: `O preço do etanol (R$ ${otherPrice.toFixed(2)}/L) está ${((1 - ratio) * 100).toFixed(0)}% abaixo do limite recomendado (${(ethanolFactor * 100).toFixed(0)}% da gasolina).`,
            actionLabel: 'Usar calculadora',
            actionRoute: '/calculadora',
            priority: 4,
          });
          break; // Apenas um insight de flex por vez
        }
      }
    }
  }

  // 6. Anomalia: preço muito fora da curva
  if (currentMonthRefuels.length >= 3) {
    const prices = currentMonthRefuels.map(r => Number(r.price_per_liter));
    const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;
    const variance = prices.reduce((sum, p) => sum + Math.pow(p - avgPrice, 2), 0) / prices.length;
    const stdDev = Math.sqrt(variance);
    
    const lastRefuel = currentMonthRefuels[0]; // Mais recente
    const lastPrice = Number(lastRefuel.price_per_liter);
    const zScore = (lastPrice - avgPrice) / stdDev;
    
    if (Math.abs(zScore) > 2) { // Mais de 2 desvios padrão
      insights.push({
        id: 'price-anomaly',
        status: zScore > 0 ? 'warning' : 'info',
        title: zScore > 0 ? 'Preço acima da média' : 'Preço abaixo da média',
        message: `O último abastecimento teve preço ${zScore > 0 ? 'muito acima' : 'muito abaixo'} da sua média do mês (R$ ${lastPrice.toFixed(2)}/L vs média de R$ ${avgPrice.toFixed(2)}/L).`,
        actionLabel: 'Ver histórico',
        actionRoute: '/historico',
        priority: 5,
      });
    }
  }

  // Ordenar por prioridade (maior primeiro)
  return insights.sort((a, b) => b.priority - a.priority);
}

// Helper functions

function getPreviousMonthKey(currentKey: string): string {
  const [year, month] = currentKey.split('-').map(Number);
  let prevYear = year;
  let prevMonth = month - 1;
  
  if (prevMonth < 1) {
    prevMonth = 12;
    prevYear -= 1;
  }
  
  return `${prevYear}-${String(prevMonth).padStart(2, '0')}`;
}

function calculateCostPerKm(refuels: Refuel[]): number | null {
  const refuelsWithOdometer = refuels.filter(r => r.odometer !== null && r.odometer > 0);
  if (refuelsWithOdometer.length < 2) return null;
  
  // Ordenar por odômetro
  const sorted = [...refuelsWithOdometer].sort((a, b) => (a.odometer || 0) - (b.odometer || 0));
  
  // Calcular km percorridos e custo total
  const totalKm = (sorted[sorted.length - 1].odometer || 0) - (sorted[0].odometer || 0);
  const totalCost = sorted.slice(0, -1).reduce((sum, r) => sum + r.total_cost_cents, 0) / 100;
  
  if (totalKm <= 0) return null;
  
  return totalCost / totalKm;
}

function calculateAveragePricePerLiter(refuels: Refuel[]): number | null {
  if (refuels.length === 0) return null;
  
  const total = refuels.reduce((sum, r) => sum + Number(r.price_per_liter), 0);
  return total / refuels.length;
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100);
}
