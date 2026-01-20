import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  CreditCard, 
  QrCode, 
  Copy, 
  Check, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  Loader2,
  Plus,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTopups } from "@/hooks/use-topups";
import { useWallet } from "@/hooks/use-wallet";
import { formatCurrency, parseCurrency } from "@/lib/budget-utils";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Recarga() {
  const { topups, createTopup, reportPaid, isLoading } = useTopups();
  const { balanceCents, updateBalance } = useWallet();
  const { toast } = useToast();
  
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedTopup, setSelectedTopup] = useState<string | null>(null);

  const handleCreateTopup = async () => {
    const amountCents = parseCurrency(amount);
    if (amountCents < 500) {
      toast({
        title: "Valor mínimo",
        description: "O valor mínimo para recarga é R$ 5,00",
        variant: "destructive",
      });
      return;
    }
    if (amountCents > 200000) {
      toast({
        title: "Valor máximo",
        description: "O valor máximo para recarga é R$ 2.000,00",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const result = await createTopup.mutateAsync({
        amountCents,
        description: description || `Recarga EconoDrive`,
      });
      setSelectedTopup(result.id);
      setAmount("");
      setDescription("");
      toast({
        title: "PIX gerado!",
        description: "Copie o código ou escaneie o QR Code para pagar.",
      });
    } catch (error) {
      toast({
        title: "Erro ao gerar PIX",
        description: "Não foi possível gerar o código PIX. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast({
      title: "Copiado!",
      description: "Código PIX copiado para a área de transferência.",
    });
    setTimeout(() => setCopiedId(null), 3000);
  };

  const handleReportPaid = async (topupId: string) => {
    try {
      await reportPaid.mutateAsync(topupId);
      toast({
        title: "Pagamento reportado",
        description: "Aguardando confirmação do pagamento.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível reportar o pagamento.",
        variant: "destructive",
      });
    }
  };

  // For demo: simulate confirmation
  const handleSimulateConfirm = async (topupId: string, amountCents: number) => {
    try {
      await updateBalance.mutateAsync(amountCents);
      toast({
        title: "Pagamento confirmado!",
        description: `${formatCurrency(amountCents)} adicionados à sua carteira.`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível confirmar o pagamento.",
        variant: "destructive",
      });
    }
  };

  const statusConfig = {
    pending: {
      icon: Clock,
      label: "Aguardando pagamento",
      color: "text-warning",
      bgColor: "bg-warning/15",
    },
    reported_paid: {
      icon: AlertCircle,
      label: "Aguardando confirmação",
      color: "text-info",
      bgColor: "bg-info/15",
    },
    confirmed: {
      icon: CheckCircle2,
      label: "Confirmado",
      color: "text-accent",
      bgColor: "bg-accent/15",
    },
    canceled: {
      icon: AlertCircle,
      label: "Cancelado",
      color: "text-destructive",
      bgColor: "bg-destructive/15",
    },
  };

  const activeTopup = selectedTopup ? topups.find(t => t.id === selectedTopup) : null;

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight">
            Recarga
          </h1>
          <p className="text-foreground-tertiary mt-1">
            Adicione saldo à sua carteira via PIX
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-card border border-border rounded-xl px-4 py-2">
            <p className="text-xs text-foreground-tertiary">Saldo atual</p>
            <p className="text-xl font-bold text-accent">{formatCurrency(balanceCents)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Topup Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* New Topup Card */}
          <div className="bg-card border border-border rounded-2xl p-6 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center">
                <Plus size={20} className="text-accent" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Nova recarga</h2>
                <p className="text-sm text-foreground-tertiary">Gere um código PIX para adicionar saldo</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <Label htmlFor="amount" className="text-foreground mb-2 block">
                  Valor da recarga (R$)
                </Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-tertiary">
                    R$
                  </span>
                  <Input
                    id="amount"
                    type="text"
                    placeholder="50,00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-12 text-lg font-medium"
                  />
                </div>
                <p className="text-xs text-foreground-tertiary mt-1">Mín: R$ 5,00 | Máx: R$ 2.000,00</p>
              </div>

              <div>
                <Label htmlFor="description" className="text-foreground mb-2 block">
                  Descrição (opcional)
                </Label>
                <Input
                  id="description"
                  type="text"
                  placeholder="Recarga EconoDrive Janeiro"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            <Button 
              variant="accent" 
              className="w-full gap-2"
              onClick={handleCreateTopup}
              disabled={isCreating || !amount}
            >
              {isCreating ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <QrCode size={18} />
              )}
              Gerar PIX
            </Button>
          </div>

          {/* Active Topup Display */}
          {activeTopup && activeTopup.status === 'pending' && (
            <div className="bg-card border border-accent/30 rounded-2xl p-6 animate-fade-in">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center">
                  <QrCode size={20} className="text-accent" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Pagar PIX</h2>
                  <p className="text-sm text-foreground-tertiary">
                    {formatCurrency(activeTopup.amount_cents)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* QR Code */}
                <div className="flex flex-col items-center justify-center bg-white rounded-xl p-6">
                  <QRCodeSVG 
                    value={activeTopup.pix_copy_paste || ''} 
                    size={180}
                    level="M"
                  />
                  <p className="text-xs text-gray-500 mt-3">
                    Escaneie com seu app de banco
                  </p>
                </div>

                {/* Copy Paste */}
                <div className="flex flex-col justify-center">
                  <Label className="text-foreground mb-2">Código PIX "copia e cola"</Label>
                  <div className="bg-muted rounded-xl p-3 mb-4">
                    <p className="text-xs text-foreground-tertiary font-mono break-all line-clamp-3">
                      {activeTopup.pix_copy_paste}
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    className="gap-2 mb-4"
                    onClick={() => handleCopy(activeTopup.pix_copy_paste || '', activeTopup.id)}
                  >
                    {copiedId === activeTopup.id ? (
                      <>
                        <Check size={16} className="text-accent" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy size={16} />
                        Copiar código
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    variant="accent"
                    className="gap-2"
                    onClick={() => handleReportPaid(activeTopup.id)}
                  >
                    <CheckCircle2 size={16} />
                    Já paguei
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Demo: Simulate confirmation for reported_paid */}
          {activeTopup && activeTopup.status === 'reported_paid' && (
            <div className="bg-card border border-info/30 rounded-2xl p-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-info/15 flex items-center justify-center">
                    <Clock size={20} className="text-info" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">Aguardando confirmação</h2>
                    <p className="text-sm text-foreground-tertiary">
                      {formatCurrency(activeTopup.amount_cents)} - Pagamento reportado
                    </p>
                  </div>
                </div>
                {/* Demo button */}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleSimulateConfirm(activeTopup.id, activeTopup.amount_cents)}
                >
                  <ArrowRight size={14} className="mr-2" />
                  Simular confirmação
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* History Column */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <CreditCard size={20} className="text-foreground-secondary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Histórico</h2>
                <p className="text-sm text-foreground-tertiary">Suas recargas recentes</p>
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <Loader2 size={24} className="animate-spin mx-auto text-foreground-tertiary" />
              </div>
            ) : topups.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard size={32} className="mx-auto mb-2 text-foreground-tertiary" />
                <p className="text-sm text-foreground-tertiary">
                  Nenhuma recarga realizada
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-uber">
                {topups.map((topup) => {
                  const config = statusConfig[topup.status as keyof typeof statusConfig];
                  const StatusIcon = config.icon;
                  
                  return (
                    <button
                      key={topup.id}
                      onClick={() => setSelectedTopup(topup.id)}
                      className={cn(
                        "w-full text-left p-4 rounded-xl border transition-all",
                        selectedTopup === topup.id 
                          ? "border-accent bg-accent/5" 
                          : "border-border hover:border-border-secondary hover:bg-muted/50"
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-lg font-bold text-foreground">
                          {formatCurrency(topup.amount_cents)}
                        </span>
                        <div className={cn(
                          "flex items-center gap-1.5 px-2 py-1 rounded-full",
                          config.bgColor
                        )}>
                          <StatusIcon size={12} className={config.color} />
                          <span className={cn("text-2xs font-medium", config.color)}>
                            {config.label}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-foreground-tertiary">
                        {formatDistanceToNow(new Date(topup.created_at), { 
                          addSuffix: true,
                          locale: ptBR 
                        })}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
