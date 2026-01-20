export interface SubscriptionPlan {
    id: string;
    name: string;
    price: number;
    billingCycle: 'monthly' | 'yearly';
    features: string[];
    limits: {
        vehicles: number;
        refuels: number;
        ocrScans: number;
        stationRanking: boolean;
        insights: boolean;
        ads: boolean;
    };
    popular?: boolean;
}

export interface UserSubscription {
    planId: string | null;
    status: 'free' | 'active' | 'cancelled' | 'expired';
    startDate?: string;
    endDate?: string;
    autoRenew: boolean;
    usage: {
        vehicles: number;
        refuels: number;
        ocrScans: number;
        lastReset: string;
    };
}

export class SubscriptionService {
    private static instance: SubscriptionService;
    private readonly STORAGE_KEY = 'econodrive_subscription';

    static getInstance(): SubscriptionService {
        if (!SubscriptionService.instance) {
            SubscriptionService.instance = new SubscriptionService();
        }
        return SubscriptionService.instance;
    }

    private readonly plans: SubscriptionPlan[] = [
        {
            id: 'free',
            name: 'Gratuito',
            price: 0,
            billingCycle: 'monthly',
            features: [
                'Até 3 veículos',
                'Histórico limitado (últimos 5 abastecimentos)',
                'Cálculos básicos de consumo',
                'Dashboard com métricas',
                'Anúncios discretos'
            ],
            limits: {
                vehicles: 3,
                refuels: 5,
                ocrScans: 0,
                stationRanking: false,
                insights: false,
                ads: true
            }
        },
        {
            id: 'premium-monthly',
            name: 'Premium Mensal',
            price: 9.90,
            billingCycle: 'monthly',
            features: [
                'Veículos ilimitados',
                'Histórico completo',
                'OCR ilimitado',
                'Ranking de postos',
                'Insights avançados',
                'Sem anúncios',
                'Suporte prioritário',
                'Exportação de dados'
            ],
            limits: {
                vehicles: 999,
                refuels: 999,
                ocrScans: 999,
                stationRanking: true,
                insights: true,
                ads: false
            },
            popular: false
        },
        {
            id: 'premium-yearly',
            name: 'Premium Anual',
            price: 79.90,
            billingCycle: 'yearly',
            features: [
                'Veículos ilimitados',
                'Histórico completo',
                'OCR ilimitado',
                'Ranking de postos',
                'Insights avançados',
                'Sem anúncios',
                'Suporte prioritário',
                'Exportação de dados',
                'Economia de 33% (2 meses grátis)'
            ],
            limits: {
                vehicles: 999,
                refuels: 999,
                ocrScans: 999,
                stationRanking: true,
                insights: true,
                ads: false
            },
            popular: true
        }
    ];

    getPlans(): SubscriptionPlan[] {
        return this.plans;
    }

    getPlan(planId: string): SubscriptionPlan | null {
        return this.plans.find(plan => plan.id === planId) || null;
    }

    getCurrentSubscription(): UserSubscription {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (error) {
                console.error('Erro ao ler assinatura:', error);
            }
        }

        // Assinatura gratuita padrão
        return this.getDefaultSubscription();
    }

    private getDefaultSubscription(): UserSubscription {
        return {
            planId: 'free',
            status: 'free',
            autoRenew: false,
            usage: {
                vehicles: 0,
                refuels: 0,
                ocrScans: 0,
                lastReset: new Date().toISOString()
            }
        };
    }

    updateSubscription(subscription: UserSubscription): void {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(subscription));
    }

    upgradePlan(planId: string): boolean {
        const plan = this.getPlan(planId);
        if (!plan) return false;

        const currentSubscription = this.getCurrentSubscription();

        const newSubscription: UserSubscription = {
            ...currentSubscription,
            planId,
            status: 'active',
            startDate: new Date().toISOString(),
            endDate: plan.billingCycle === 'yearly'
                ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
                : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            autoRenew: true
        };

        this.updateSubscription(newSubscription);
        return true;
    }

    cancelSubscription(): boolean {
        const currentSubscription = this.getCurrentSubscription();

        if (currentSubscription.planId === 'free') return false;

        const cancelledSubscription: UserSubscription = {
            ...currentSubscription,
            status: 'cancelled',
            autoRenew: false
        };

        this.updateSubscription(cancelledSubscription);
        return true;
    }

    checkLimit(feature: keyof SubscriptionPlan['limits']): boolean {
        const subscription = this.getCurrentSubscription();
        const plan = this.getPlan(subscription.planId || 'free');

        if (!plan) return false;

        const limit = plan.limits[feature];
        const usage = subscription.usage;

        switch (feature) {
            case 'vehicles':
                return typeof limit === 'number' ? usage.vehicles < limit : false;
            case 'refuels':
                return typeof limit === 'number' ? usage.refuels < limit : false;
            case 'ocrScans':
                return typeof limit === 'number' ? usage.ocrScans < limit : false;
            case 'stationRanking':
            case 'insights':
            case 'ads':
                return typeof limit === 'boolean' ? limit : false;
            default:
                return false;
        }
    }

    canUseFeature(feature: keyof SubscriptionPlan['limits']): boolean {
        const subscription = this.getCurrentSubscription();
        const plan = this.getPlan(subscription.planId || 'free');

        if (!plan) return false;

        // Se o plano não tem limite (999), pode usar
        const limit = plan.limits[feature];
        if (typeof limit === 'number' && limit >= 999) return true;

        // Se é um recurso booleano, verificar se está disponível
        if (typeof limit === 'boolean') return limit;

        // Se é um recurso com limite numérico, verificar o uso
        return this.checkLimit(feature);
    }

    incrementUsage(feature: 'vehicles' | 'refuels' | 'ocrScans'): void {
        const subscription = this.getCurrentSubscription();

        // Resetar uso mensal se passou do mês
        const lastReset = new Date(subscription.usage.lastReset);
        const now = new Date();

        if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
            subscription.usage = {
                vehicles: 0,
                refuels: 0,
                ocrScans: 0,
                lastReset: now.toISOString()
            };
        }

        subscription.usage[feature]++;
        this.updateSubscription(subscription);
    }

    getUsageStatus(feature: 'vehicles' | 'refuels' | 'ocrScans'): {
        used: number;
        limit: number;
        percentage: number;
        canUse: boolean;
    } {
        const subscription = this.getCurrentSubscription();
        const plan = this.getPlan(subscription.planId || 'free');

        if (!plan) {
            return { used: 0, limit: 0, percentage: 0, canUse: false };
        }

        const used = subscription.usage[feature];
        const limit = plan.limits[feature];
        const percentage = limit > 0 ? (used / limit) * 100 : 0;
        const canUse = used < limit;

        return { used, limit, percentage, canUse };
    }

    isSubscriptionActive(): boolean {
        const subscription = this.getCurrentSubscription();

        if (subscription.status !== 'active') return false;

        if (!subscription.endDate) return true;

        return new Date(subscription.endDate) > new Date();
    }

    getDaysUntilExpiry(): number {
        const subscription = this.getCurrentSubscription();

        if (!subscription.endDate) return 0;

        const expiryDate = new Date(subscription.endDate);
        const now = new Date();
        const diffTime = expiryDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return Math.max(0, diffDays);
    }

    getUpgradeSuggestion(): {
        message: string;
        plan: SubscriptionPlan;
        reason: string;
    } | null {
        const subscription = this.getCurrentSubscription();

        if (subscription.planId !== 'free') return null;

        const usage = subscription.usage;

        // Verificar se está próximo dos limites
        if (usage.vehicles >= 2) {
            const premiumPlan = this.getPlan('premium-monthly')!;
            return {
                message: 'Você está quase no limite de veículos!',
                plan: premiumPlan,
                reason: 'Atualize para ter veículos ilimitados'
            };
        }

        if (usage.refuels >= 3) {
            const premiumPlan = this.getPlan('premium-monthly')!;
            return {
                message: 'Seu histórico está quase no limite!',
                plan: premiumPlan,
                reason: 'Tenha histórico completo e insights avançados'
            };
        }

        return null;
    }

    // Métodos para integração com pagamento (mock)
    async createPaymentSession(planId: string): Promise<string> {
        // Em produção, integrar com Stripe/PagSeguro
        const plan = this.getPlan(planId);
        if (!plan) throw new Error('Plano não encontrado');

        // Simular criação de sessão de pagamento
        return `https://checkout.example.com/session/${Date.now()}`;
    }

    async verifyPayment(sessionId: string): Promise<boolean> {
        // Em produção, verificar webhook do pagamento
        // Por ora, simular pagamento bem-sucedido
        return true;
    }
}
