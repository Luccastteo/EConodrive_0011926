import { useState, useEffect, useCallback } from 'react';
import { SubscriptionService, SubscriptionPlan, UserSubscription } from '@/services/subscriptionService';
import { useToast } from '@/hooks/use-toast';

export function useSubscription() {
    const [subscription, setSubscription] = useState<UserSubscription | null>(null);
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const { toast } = useToast();
    const subscriptionService = SubscriptionService.getInstance();

    useEffect(() => {
        loadSubscriptionData();
    }, []);

    const loadSubscriptionData = useCallback(() => {
        setIsLoading(true);
        try {
            const currentSubscription = subscriptionService.getCurrentSubscription();
            const availablePlans = subscriptionService.getPlans();

            setSubscription(currentSubscription);
            setPlans(availablePlans);
        } catch (error) {
            console.error('Erro ao carregar dados da assinatura:', error);
            toast({
                title: "Erro",
                description: "Não foi possível carregar informações da assinatura",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    }, [subscriptionService, toast]);

    const upgradePlan = useCallback(async (planId: string) => {
        try {
            // Criar sessão de pagamento
            const paymentSession = await subscriptionService.createPaymentSession(planId);

            // Em produção, redirecionar para página de pagamento
            // Por ora, simular pagamento bem-sucedido
            const success = await subscriptionService.verifyPayment(paymentSession);

            if (success) {
                const upgraded = subscriptionService.upgradePlan(planId);

                if (upgraded) {
                    loadSubscriptionData();
                    toast({
                        title: "Upgrade Realizado!",
                        description: "Sua assinatura foi atualizada com sucesso",
                        variant: "default"
                    });
                    return true;
                }
            }

            return false;
        } catch (error) {
            console.error('Erro no upgrade:', error);
            toast({
                title: "Erro no Upgrade",
                description: "Não foi possível processar seu upgrade",
                variant: "destructive"
            });
            return false;
        }
    }, [subscriptionService, toast, loadSubscriptionData]);

    const cancelSubscription = useCallback(() => {
        try {
            const cancelled = subscriptionService.cancelSubscription();

            if (cancelled) {
                loadSubscriptionData();
                toast({
                    title: "Assinatura Cancelada",
                    description: "Sua assinatura foi cancelada com sucesso",
                    variant: "default"
                });
                return true;
            }

            return false;
        } catch (error) {
            console.error('Erro ao cancelar:', error);
            toast({
                title: "Erro ao Cancelar",
                description: "Não foi possível cancelar sua assinatura",
                variant: "destructive"
            });
            return false;
        }
    }, [subscriptionService, toast, loadSubscriptionData]);

    const canUseFeature = useCallback((feature: keyof SubscriptionPlan['limits']) => {
        return subscriptionService.canUseFeature(feature);
    }, [subscriptionService]);

    const getUsageStatus = useCallback((feature: 'vehicles' | 'refuels' | 'ocrScans') => {
        return subscriptionService.getUsageStatus(feature);
    }, [subscriptionService]);

    const incrementUsage = useCallback((feature: 'vehicles' | 'refuels' | 'ocrScans') => {
        subscriptionService.incrementUsage(feature);
        loadSubscriptionData(); // Atualizar estado local
    }, [subscriptionService, loadSubscriptionData]);

    const isSubscriptionActive = useCallback(() => {
        return subscriptionService.isSubscriptionActive();
    }, [subscriptionService]);

    const getDaysUntilExpiry = useCallback(() => {
        return subscriptionService.getDaysUntilExpiry();
    }, [subscriptionService]);

    const getUpgradeSuggestion = useCallback(() => {
        return subscriptionService.getUpgradeSuggestion();
    }, [subscriptionService]);

    const getCurrentPlan = useCallback(() => {
        if (!subscription) return null;
        return subscriptionService.getPlan(subscription.planId || 'free');
    }, [subscription, subscriptionService]);

    const isPremium = useCallback(() => {
        const currentPlan = getCurrentPlan();
        return currentPlan?.id !== 'free';
    }, [getCurrentPlan]);

    const showUpgradePrompt = useCallback((feature: keyof SubscriptionPlan['limits']) => {
        if (!canUseFeature(feature)) {
            const suggestion = getUpgradeSuggestion();

            toast({
                title: "Recurso Premium",
                description: suggestion?.reason || "Este recurso está disponível apenas para assinantes Premium",
                variant: "default"
            });

            return true;
        }

        return false;
    }, [canUseFeature, getUpgradeSuggestion, toast]);

    return {
        // State
        subscription,
        plans,
        isLoading,

        // Computed
        currentPlan: getCurrentPlan(),
        isPremium: isPremium(),
        isActive: isSubscriptionActive(),
        daysUntilExpiry: getDaysUntilExpiry(),
        upgradeSuggestion: getUpgradeSuggestion(),

        // Methods
        upgradePlan,
        cancelSubscription,
        canUseFeature,
        getUsageStatus,
        incrementUsage,
        showUpgradePrompt,
        refreshData: loadSubscriptionData
    };
}
