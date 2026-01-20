import { useMemo } from 'react';
import { useRefuels } from './use-refuels';
import { useBudget } from './use-budget';
import { generateInsights, type Insight, type InsightsConfig } from '@/services/insightsEngine';

export function useInsights() {
  const { refuels } = useRefuels();
  const { budget } = useBudget();

  const config: InsightsConfig = {
    monthlyLimitCents: budget?.monthly_limit_cents || undefined,
    ethanolFactor: 0.70, // TODO: Pegar de configurações do usuário
    alertsEnabled: true, // TODO: Pegar de configurações do usuário
  };

  const insights: Insight[] = useMemo(() => {
    return generateInsights(refuels, config);
  }, [refuels, budget]);

  const criticalInsights = insights.filter(i => i.status === 'critical');
  const warningInsights = insights.filter(i => i.status === 'warning');
  const infoInsights = insights.filter(i => i.status === 'info');

  return {
    insights,
    criticalInsights,
    warningInsights,
    infoInsights,
    hasInsights: insights.length > 0,
  };
}
