import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './use-auth';
import type { TablesInsert, Tables } from '@/integrations/supabase/types';

export type Refuel = Tables<'refuels'>;
export type RefuelInsert = TablesInsert<'refuels'>;

// Mock data for demo mode
const mockRefuels: Refuel[] = [
    {
        id: '1',
        user_id: 'demo-user-id',
        odometer: 45000,
        liters: 45.5,
        total_cost_cents: 28950,
        fuel_type: 'gasoline',
        consumption: 12.5,
        price_per_liter: 636,
        station: 'Posto Ipiranga',
        created_at: '2024-01-15T10:30:00Z',
        updated_at: '2024-01-15T10:30:00Z',
    },
    {
        id: '2',
        user_id: 'demo-user-id',
        odometer: 45600,
        liters: 42.0,
        total_cost_cents: 26880,
        fuel_type: 'gasoline',
        consumption: 12.8,
        price_per_liter: 640,
        station: 'Shell',
        created_at: '2024-01-20T14:15:00Z',
        updated_at: '2024-01-20T14:15:00Z',
    },
    {
        id: '3',
        user_id: 'demo-user-id',
        odometer: 46200,
        liters: 48.0,
        total_cost_cents: 30720,
        fuel_type: 'ethanol',
        consumption: 10.5,
        price_per_liter: 640,
        station: 'Petrobras',
        created_at: '2024-01-25T09:45:00Z',
        updated_at: '2024-01-25T09:45:00Z',
    },
];

export function useRefuels() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const { data: refuels = [], isLoading } = useQuery({
        queryKey: ['refuels', user?.id],
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
                return mockRefuels;
            }

            const { data, error } = await supabase
                .from('refuels')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(100);

            if (error) throw error;
            return data;
        },
        enabled: !!user,
    });

    const createRefuel = useMutation({
        mutationFn: async (data: Omit<RefuelInsert, 'user_id' | 'created_at' | 'updated_at'>) => {
            if (!user) throw new Error('Not authenticated');

            // Check if demo mode
            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
            const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

            const isDemoMode = !supabaseUrl || !supabaseKey ||
                supabaseKey.includes('your_') ||
                supabaseKey === '' ||
                supabaseUrl === '';

            if (isDemoMode) {
                // Mock create refuel
                const newRefuel: Refuel = {
                    id: Date.now().toString(),
                    user_id: user.id,
                    consumption: data.consumption || 0,
                    fuel_type: data.fuel_type || 'gasoline',
                    odometer: data.odometer || 0,
                    ...data,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                };
                mockRefuels.unshift(newRefuel);
                queryClient.setQueryData(['refuels', user.id], mockRefuels);
                return newRefuel;
            }

            const { data: refuel, error } = await supabase
                .from('refuels')
                .insert({
                    ...data,
                    user_id: user.id,
                })
                .select()
                .single();

            if (error) throw error;
            return refuel;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['refuels'] });
            queryClient.invalidateQueries({ queryKey: ['wallet'] });
            queryClient.invalidateQueries({ queryKey: ['budget'] });
        },
    });

    const updateRefuel = useMutation({
        mutationFn: async ({ id, ...data }: { id: string } & Partial<RefuelInsert>) => {
            // Check if demo mode
            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
            const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

            const isDemoMode = !supabaseUrl || !supabaseKey ||
                supabaseKey.includes('your_') ||
                supabaseKey === '' ||
                supabaseUrl === '';

            if (isDemoMode) {
                // Mock update refuel
                const index = mockRefuels.findIndex(r => r.id === id);
                if (index === -1) throw new Error('Refuel not found');

                mockRefuels[index] = { ...mockRefuels[index], ...data, updated_at: new Date().toISOString() };
                queryClient.setQueryData(['refuels', user?.id], mockRefuels);
                return mockRefuels[index];
            }

            const { data: refuel, error } = await supabase
                .from('refuels')
                .update(data)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return refuel;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['refuels'] });
            queryClient.invalidateQueries({ queryKey: ['wallet'] });
            queryClient.invalidateQueries({ queryKey: ['budget'] });
        },
    });

    const deleteRefuel = useMutation({
        mutationFn: async (id: string) => {
            // Check if demo mode
            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
            const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

            const isDemoMode = !supabaseUrl || !supabaseKey ||
                supabaseKey.includes('your_') ||
                supabaseKey === '' ||
                supabaseUrl === '';

            if (isDemoMode) {
                // Mock delete refuel
                const index = mockRefuels.findIndex(r => r.id === id);
                if (index === -1) throw new Error('Refuel not found');

                mockRefuels.splice(index, 1);
                queryClient.setQueryData(['refuels', user?.id], mockRefuels);
                return;
            }

            const { error } = await supabase
                .from('refuels')
                .delete()
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['refuels'] });
            queryClient.invalidateQueries({ queryKey: ['wallet'] });
            queryClient.invalidateQueries({ queryKey: ['budget'] });
        },
    });

    return {
        refuels,
        isLoading,
        createRefuel,
        updateRefuel,
        deleteRefuel,
    };
}
