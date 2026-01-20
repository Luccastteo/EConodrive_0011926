import { CreditCard, Plus, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/budget-utils";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface WalletCardProps {
  balanceCents: number;
  isLoading?: boolean;
}

export function WalletCard({ balanceCents, isLoading }: WalletCardProps) {
  const navigate = useNavigate();

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-gradient-to-br from-accent/20 via-accent/10 to-transparent",
        "border border-accent/30 rounded-2xl p-6",
        "transition-all duration-200 ease-out animate-fade-in",
        "hover:border-accent/50"
      )}
    >
      {/* Background decoration */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-accent/10 rounded-full blur-2xl" />
      
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
            <CreditCard size={20} className="text-accent" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-foreground">Carteira</h3>
            <p className="text-xs text-foreground-tertiary">Saldo disponível</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-accent hover:bg-accent/20"
          onClick={() => navigate('/recarga')}
        >
          <ArrowUpRight size={18} />
        </Button>
      </div>

      {/* Balance */}
      <div className="mb-4">
        {isLoading ? (
          <div className="h-9 w-32 bg-muted/50 rounded animate-pulse" />
        ) : (
          <p className="text-3xl font-bold text-foreground">
            {formatCurrency(balanceCents)}
          </p>
        )}
      </div>

      {/* Actions */}
      <Button 
        variant="accent" 
        size="sm" 
        className="w-full gap-2"
        onClick={() => navigate('/recarga')}
      >
        <Plus size={16} />
        Adicionar saldo via PIX
      </Button>
    </div>
  );
}
