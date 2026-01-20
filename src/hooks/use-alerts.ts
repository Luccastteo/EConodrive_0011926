import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './use-auth';
import { getCurrentMonthKey } from '@/lib/budget-utils';

export function useAlerts() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const monthKey = getCurrentMonthKey();

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['alerts', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const unreadCount = alerts.filter(a => !a.read_at).length;

  const createAlert = useMutation({
    mutationFn: async (data: { type: 'budget_50' | 'budget_80' | 'budget_100' | 'projection_warning'; message: string }) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data: alert, error } = await supabase
        .from('alerts')
        .upsert({
          user_id: user.id,
          type: data.type,
          month_key: monthKey,
          message: data.message,
        }, { onConflict: 'user_id,type,month_key' })
        .select()
        .single();
      
      if (error) throw error;
      return alert;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });

  const markAsRead = useMutation({
    mutationFn: async (alertId: string) => {
      const { data, error } = await supabase
        .from('alerts')
        .update({ read_at: new Date().toISOString() })
        .eq('id', alertId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('alerts')
        .update({ read_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .is('read_at', null);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });

  return {
    alerts,
    unreadCount,
    isLoading,
    createAlert,
    markAsRead,
    markAllAsRead,
  };
}
