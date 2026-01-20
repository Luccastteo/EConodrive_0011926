import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './use-auth';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

export type Wallet = Tables<'wallets'>;
export type WalletInsert = TablesInsert<'wallets'>;

// Mock wallet for demo mode
let mockWallet: Wallet = {
  id: 'demo-wallet-id',
  user_id: 'demo-user-id',
  balance_cents: 50000, // R$ 500,00
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export function useWallet() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: wallet, isLoading } = useQuery({
    queryKey: ['wallet', user?.id],
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
        return mockWallet;
      }

      // Try to get existing wallet
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      // Create wallet if doesn't exist
      if (!data) {
        const { data: newWallet, error: createError } = await supabase
          .from('wallets')
          .insert({ user_id: user.id, balance_cents: 0 })
          .select()
          .single();

        if (createError) throw createError;
        return newWallet;
      }

      return data;
    },
    enabled: !!user,
  });

  const updateBalance = useMutation({
    mutationFn: async (amountCents: number) => {
      if (!user || !wallet) throw new Error('Not authenticated or no wallet');

      // Check if demo mode
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
      const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

      const isDemoMode = !supabaseUrl || !supabaseKey ||
        supabaseKey.includes('your_') ||
        supabaseKey === '' ||
        supabaseUrl === '';

      if (isDemoMode) {
        // Mock update balance
        mockWallet = { ...mockWallet, balance_cents: mockWallet.balance_cents + amountCents, updated_at: new Date().toISOString() };
        queryClient.setQueryData(['wallet', user.id], mockWallet);
        return mockWallet;
      }

      const { data, error } = await supabase
        .from('wallets')
        .update({ balance_cents: wallet.balance_cents + amountCents })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
    },
  });

  return {
    wallet,
    isLoading,
    balanceCents: wallet?.balance_cents ?? 0,
    updateBalance,
  };
}
