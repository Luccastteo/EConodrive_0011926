import { useState } from "react";
import { Check, X, Star, Zap, Crown, ArrowRight } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSubscription } from "@/hooks/use-subscription";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/budget-utils";

export default function Planos() {
    const { plans, currentPlan, upgradePlan, isLoading, isPremium, daysUntilExpiry } = useSubscription();
    const { toast } = useToast();
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const [isUpgrading, setIsUpgrading] = useState(false);

    const handleUpgrade = async (planId: string) => {
        setIsUpgrading(true);
        setSelectedPlan(planId);

        try {
            const success = await upgradePlan(planId);
            if (success) {
                toast({
                    title: "Upgrade Realizado!",
                    description: "Parabéns! Você agora é um assinante Premium",
                    variant: "default"
                });
            }
        } catch (error) {
            console.error('Erro no upgrade:', error);
        } finally {
            setIsUpgrading(false);
            setSelectedPlan(null);
        }
    };

    const getPlanIcon = (planId: string) => {
        switch (planId) {
            case 'free': return <X className="h-6 w-6" />;
            case 'premium-monthly': return <Star className="h-6 w-6" />;
            case 'premium-yearly': return <Crown className="h-6 w-6" />;
            default: return <Zap className="h-6 w-6" />;
        }
    };

    const getPlanColor = (planId: string) => {
        switch (planId) {
            case 'free':
                return 'border-border bg-card';
            case 'premium-monthly':
                return 'border-info/30 bg-card';
            case 'premium-yearly':
                return 'border-accent/40 bg-card';
            default:
                return 'border-border bg-card';
        }
    };

    const getButtonVariant = (planId: string) => {
        if (currentPlan?.id === planId) return 'outline';
        if (planId === 'premium-yearly') return 'default';
        return 'outline';
    };

    return (
        <AppLayout>
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center">
                    <h1 className="text-3xl lg:text-4xl font-bold text-foreground tracking-tight mb-4">
                        Planos de Assinatura
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Escolha o plano ideal para controlar seus gastos de combustível com inteligência
                    </p>
                </div>

                {/* Current Status */}
                {isPremium && (
                    <Card className="border-accent/30 bg-accent/10">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="bg-accent/15 p-2 rounded-full">
                                        <Crown className="h-5 w-5 text-accent" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-foreground">Assinatura Premium Ativa</h3>
                                        <p className="text-sm text-foreground-secondary">
                                            {currentPlan?.name} • {daysUntilExpiry > 0 ? `${daysUntilExpiry} dias restantes` : 'Renovação automática'}
                                        </p>
                                    </div>
                                </div>
                                <Badge className="bg-accent/15 text-accent border-accent/30">
                                    Ativo
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Plans Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {plans.map((plan) => (
                        <Card
                            key={plan.id}
                            className={`relative ${getPlanColor(plan.id)} ${plan.popular ? 'ring-2 ring-purple-500 shadow-lg' : ''
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                    <Badge className="bg-purple-500 text-white border-purple-600">
                                        <Star className="w-3 h-3 mr-1" />
                                        Mais Popular
                                    </Badge>
                                </div>
                            )}

                            <CardHeader className="text-center pb-4">
                                <div className="flex justify-center mb-2">
                                    <div className={`p-3 rounded-full ${plan.id === 'free' ? 'bg-muted text-foreground-secondary' :
                                        plan.id === 'premium-monthly' ? 'bg-info/15 text-info' :
                                            'bg-accent/15 text-accent'
                                        }`}>
                                        {getPlanIcon(plan.id)}
                                    </div>
                                </div>
                                <CardTitle className="text-xl font-bold text-foreground">{plan.name}</CardTitle>
                                <div className="mt-2">
                                    <span className="text-3xl font-bold text-foreground">{formatCurrency(plan.price)}</span>
                                    <span className="text-foreground-secondary">/{plan.billingCycle === 'monthly' ? 'mês' : 'ano'}</span>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                {/* Features */}
                                <div className="space-y-3">
                                    {plan.features.map((feature, index) => (
                                        <div key={index} className="flex items-start gap-2">
                                            <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                            <span className="text-sm text-foreground">{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* CTA Button */}
                                <Button
                                    className="w-full"
                                    variant={getButtonVariant(plan.id)}
                                    onClick={() => handleUpgrade(plan.id)}
                                    disabled={
                                        isLoading ||
                                        isUpgrading ||
                                        selectedPlan === plan.id ||
                                        currentPlan?.id === plan.id
                                    }
                                >
                                    {currentPlan?.id === plan.id ? (
                                        <>
                                            <Check className="mr-2 h-4 w-4" />
                                            Plano Atual
                                        </>
                                    ) : isUpgrading && selectedPlan === plan.id ? (
                                        <>
                                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                            Processando...
                                        </>
                                    ) : (
                                        <>
                                            {plan.id === 'free' ? 'Continuar Gratuito' : 'Fazer Upgrade'}
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </>
                                    )}
                                </Button>

                                {/* Savings Badge */}
                                {plan.id === 'premium-yearly' && (
                                    <div className="text-center">
                                        <Badge className="bg-accent/15 text-accent border-accent/30">
                                            Economia de 33% (2 meses grátis)
                                        </Badge>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Comparison Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-foreground">Comparativo de Recursos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="text-left p-3 text-foreground">Recurso</th>
                                        {plans.map((plan) => (
                                            <th key={plan.id} className="text-center p-3 text-foreground">
                                                {plan.name}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-border">
                                        <td className="p-3 font-medium text-foreground">Veículos</td>
                                        {plans.map((plan) => (
                                            <td key={plan.id} className="text-center p-3 text-foreground">
                                                {plan.limits.vehicles === 999 ? 'Ilimitados' : plan.limits.vehicles}
                                            </td>
                                        ))}
                                    </tr>
                                    <tr className="border-b border-border">
                                        <td className="p-3 font-medium text-foreground">Histórico de abastecimentos</td>
                                        {plans.map((plan) => (
                                            <td key={plan.id} className="text-center p-3 text-foreground">
                                                {plan.limits.refuels === 999 ? 'Completo' : `${plan.limits.refuels} últimos`}
                                            </td>
                                        ))}
                                    </tr>
                                    <tr className="border-b border-border">
                                        <td className="p-3 font-medium text-foreground">OCR com câmera</td>
                                        {plans.map((plan) => (
                                            <td key={plan.id} className="text-center p-3">
                                                {plan.limits.ocrScans > 0 ? (
                                                    <Check className="h-4 w-4 text-green-500 mx-auto" />
                                                ) : (
                                                    <X className="h-4 w-4 text-red-500 mx-auto" />
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                    <tr className="border-b border-border">
                                        <td className="p-3 font-medium text-foreground">Ranking de postos</td>
                                        {plans.map((plan) => (
                                            <td key={plan.id} className="text-center p-3">
                                                {plan.limits.stationRanking ? (
                                                    <Check className="h-4 w-4 text-green-500 mx-auto" />
                                                ) : (
                                                    <X className="h-4 w-4 text-red-500 mx-auto" />
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                    <tr className="border-b border-border">
                                        <td className="p-3 font-medium text-foreground">Insights avançados</td>
                                        {plans.map((plan) => (
                                            <td key={plan.id} className="text-center p-3">
                                                {plan.limits.insights ? (
                                                    <Check className="h-4 w-4 text-green-500 mx-auto" />
                                                ) : (
                                                    <X className="h-4 w-4 text-red-500 mx-auto" />
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                    <tr>
                                        <td className="p-3 font-medium">Anúncios</td>
                                        {plans.map((plan) => (
                                            <td key={plan.id} className="text-center p-3">
                                                {plan.limits.ads ? 'Sim' : 'Sem anúncios'}
                                            </td>
                                        ))}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* FAQ Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Dúvidas Frequentes</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h4 className="font-semibold mb-2">Posso cancelar a qualquer momento?</h4>
                            <p className="text-sm text-muted-foreground">
                                Sim! Você pode cancelar sua assinatura a qualquer momento. O acesso premium continua até o final do período pago.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2">O que acontece com meus dados se eu cancelar?</h4>
                            <p className="text-sm text-muted-foreground">
                                Seus dados permanecem salvos. Se decidir voltar, você pode retomar de onde parou.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2">Como funciona o OCR?</h4>
                            <p className="text-sm text-muted-foreground">
                                O OCR (Reconhecimento Óptico de Caracteres) extrai automaticamente dados de fotos de odômetro, bomba e recibos.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2">O ranking de postos é da minha região?</h4>
                            <p className="text-sm text-muted-foreground">
                                Sim! O sistema usa sua localização para mostrar os postos mais próximos e com melhores preços.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
