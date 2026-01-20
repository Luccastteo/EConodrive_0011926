import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './use-auth';
import { generatePixCode } from '@/lib/budget-utils';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

const MOCK_PIX_RECIPIENT = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

export type Topup = Tables<'topups'>;
export type TopupInsert = TablesInsert<'topups'>;

// Mock topups for demo mode
let mockTopups: Topup[] = [
  {
    id: 'demo-topup-1',
    user_id: 'demo-user-id',
    amount_cents: 50000,
    description: 'Recarga inicial',
    status: 'confirmed',
    provider: 'manual_pix',
    pix_copy_paste: generatePixCode(50000, 'Recarga inicial', MOCK_PIX_RECIPIENT),
    pix_qr_code_data_url: 'data:image/png;base64,demo-qr-code',
    created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

export function useTopups() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: topups = [], isLoading } = useQuery({
    queryKey: ['topups', user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Check if demo mode
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
      const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

      const isDemoMode = !supabaseUrl || !supabaseKey ||
        supabaseKey.includes('your_') ||
        supabaseKey === '' ||
        supabaseUrl === '';

      if (isDemoMode) {
        return mockTopups;
      }

      const { data, error } = await supabase
        .from('topups')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const createTopup = useMutation({
    mutationFn: async (data: { amountCents: number; description: string }) => {
      if (!user) throw new Error('Not authenticated');

      // Check if demo mode
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
      const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

      const isDemoMode = !supabaseUrl || !supabaseKey ||
        supabaseKey.includes('your_') ||
        supabaseKey === '' ||
        supabaseUrl === '';

      if (isDemoMode) {
        // Mock create topup
        const pixCode = generatePixCode(data.amountCents, data.description, MOCK_PIX_RECIPIENT);
        const newTopup: Topup = {
          id: Date.now().toString(),
          user_id: user.id,
          amount_cents: data.amountCents,
          description: data.description,
          status: 'pending',
          provider: 'manual_pix',
          pix_copy_paste: pixCode,
          pix_qr_code_data_url: 'data:image/png;base64,demo-qr-code',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        mockTopups.unshift(newTopup);
        queryClient.setQueryData(['topups', user.id], mockTopups);
        return newTopup;
      }

      const pixCode = generatePixCode(data.amountCents, data.description, MOCK_PIX_RECIPIENT);

      const { data: topup, error } = await supabase
        .from('topups')
        .insert({
          user_id: user.id,
          amount_cents: data.amountCents,
          description: data.description,
          status: 'pending',
          provider: 'manual_pix',
          pix_copy_paste: pixCode,
        })
        .select()
        .single();

      if (error) throw error;
      return topup;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topups'] });
    },
  });

  const reportPaid = useMutation({
    mutationFn: async (topupId: string) => {
      // Check if demo mode
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
      const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

      const isDemoMode = !supabaseUrl || !supabaseKey ||
        supabaseKey.includes('your_') ||
        supabaseKey === '' ||
        supabaseUrl === '';

      if (isDemoMode) {
        // Mock report paid
        const index = mockTopups.findIndex(t => t.id === topupId);
        if (index === -1) throw new Error('Topup not found');

        mockTopups[index] = { ...mockTopups[index], status: 'reported_paid', updated_at: new Date().toISOString() };
        queryClient.setQueryData(['topups', user?.id], mockTopups);
        return mockTopups[index];
      }

      const { data, error } = await supabase
        .from('topups')
        .update({ status: 'reported_paid' })
        .eq('id', topupId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topups'] });
    },
  });

  const confirmTopup = useMutation({
    mutationFn: async (topupId: string) => {
      // Check if demo mode
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
      const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

      const isDemoMode = !supabaseUrl || !supabaseKey ||
        supabaseKey.includes('your_') ||
        supabaseKey === '' ||
        supabaseUrl === '';

      if (isDemoMode) {
        // Mock confirm topup
        const index = mockTopups.findIndex(t => t.id === topupId);
        if (index === -1) throw new Error('Topup not found');

        mockTopups[index] = { ...mockTopups[index], status: 'confirmed', updated_at: new Date().toISOString() };
        queryClient.setQueryData(['topups', user?.id], mockTopups);
        return mockTopups[index];
      }

      const { data, error } = await supabase
        .from('topups')
        .update({ status: 'confirmed' })
        .eq('id', topupId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topups'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
    },
  });

  return {
    topups,
    isLoading,
    createTopup,
    reportPaid,
    confirmTopup,
  };
}
