import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getCurrentMonthKey, calculateBudgetStats } from '@/lib/budget-utils';
import { useAuth } from './use-auth';
import type { TablesInsert, Tables } from '@/integrations/supabase/types';

export type Budget = Tables<'budgets'>;
export type BudgetInsert = TablesInsert<'budgets'>;

// Mock budget for demo mode
const mockBudget: Budget = {
  id: 'demo-budget-id',
  user_id: 'demo-user-id',
  month_key: getCurrentMonthKey(),
  monthly_limit_cents: 50000, // R$ 500,00
  auto_reset: true,
  alert_50_enabled: true,
  alert_80_enabled: true,
  alert_100_enabled: true,
  target_consumption: 12,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export function useBudget() {
  const { user } = useAuth();
  const monthKey = getCurrentMonthKey();
  const queryClient = useQueryClient();

  const { data: budget, isLoading: budgetLoading } = useQuery({
    queryKey: ['budget', user?.id, monthKey],
    queryFn: async () => {
      if (!user) return null;

      // Check if demo mode
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
      const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

      const isDemoMode = !supabaseUrl || !supabaseKey ||
        supabaseKey.includes('your_') ||
        supabaseKey === '' ||
        supabaseUrl === '';

      if (isDemoMode) {
        return mockBudget;
      }

      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .eq('month_key', monthKey)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: monthlySpent = 0 } = useQuery({
    queryKey: ['monthly-spent', user?.id, monthKey],
    queryFn: async () => {
      if (!user) return 0;

      // Check if demo mode
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
      const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

      const isDemoMode = !supabaseUrl || !supabaseKey ||
        supabaseKey.includes('your_') ||
        supabaseKey === '' ||
        supabaseUrl === '';

      if (isDemoMode) {
        // Mock monthly spent based on mock refuels
        return 86550; // R$ 865,50 from mock refuels
      }

      const startOfMonth = `${monthKey}-01`;
      const endOfMonth = new Date(parseInt(monthKey.split('-')[0]), parseInt(monthKey.split('-')[1]), 0);
      const endDate = `${monthKey}-${endOfMonth.getDate().toString().padStart(2, '0')}`;

      const { data, error } = await supabase
        .from('refuels')
        .select('total_cost_cents')
        .eq('user_id', user.id)
        .gte('created_at', startOfMonth)
        .lte('created_at', `${endDate}T23:59:59`);

      if (error) throw error;
      return data?.reduce((sum, r) => sum + (r.total_cost_cents || 0), 0) || 0;
    },
    enabled: !!user,
  });

  const stats = budget
    ? calculateBudgetStats(monthlySpent, budget.monthly_limit_cents)
    : null;

  const saveBudget = useMutation({
    mutationFn: async (data: {
      monthlyLimitCents: number;
      autoReset: boolean;
      alert50Enabled: boolean;
      alert80Enabled: boolean;
      alert100Enabled: boolean;
      targetConsumption?: number;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const budgetData = {
        user_id: user.id,
        month_key: monthKey,
        monthly_limit_cents: data.monthlyLimitCents,
        auto_reset: data.autoReset,
        alert_50_enabled: data.alert50Enabled,
        alert_80_enabled: data.alert80Enabled,
        alert_100_enabled: data.alert100Enabled,
        target_consumption: data.targetConsumption,
      };

      const { data: result, error } = await supabase
        .from('budgets')
        .upsert(budgetData, { onConflict: 'user_id,month_key' })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget'] });
    },
  });

  return {
    budget,
    budgetLoading,
    monthlySpent,
    stats,
    saveBudget,
  };
}
