import { User, Bell, Shield, Palette, HelpCircle, LogOut, ChevronRight } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useState } from "react";

const settingsGroups = [
  {
    title: "Conta",
    items: [
      { icon: User, label: "Perfil", description: "Editar informações pessoais" },
      { icon: Bell, label: "Notificações", description: "Configurar alertas e lembretes" },
      { icon: Shield, label: "Privacidade", description: "Gerenciar dados e segurança" },
    ],
  },
  {
    title: "Preferências",
    items: [
      { icon: Palette, label: "Aparência", description: "Tema e personalização" },
    ],
  },
  {
    title: "Suporte",
    items: [
      { icon: HelpCircle, label: "Ajuda", description: "Central de ajuda e FAQ" },
    ],
  },
];

export default function Configuracoes() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [openDialog, setOpenDialog] = useState<string | null>(null);

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Sessão encerrada",
        description: "Você saiu da sua conta com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível sair da conta. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleSettingClick = (setting: string) => {
    switch (setting) {
      case "Perfil":
        setOpenDialog("Perfil");
        break;
      case "Notificações":
        setOpenDialog("Notificações");
        break;
      case "Privacidade":
        toast({
          title: "Privacidade",
          description: "Configurações de privacidade serão implementadas em breve.",
        });
        break;
      case "Aparência":
        toast({
          title: "Aparência",
          description: "Configurações de tema serão implementadas em breve.",
        });
        break;
      case "Ajuda":
        toast({
          title: "Ajuda",
          description: "Central de ajuda será implementada em breve.",
        });
        break;
      default:
        setOpenDialog(setting);
    }
  };
  return (
    <AppLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight">
          Configurações
        </h1>
        <p className="text-foreground-tertiary mt-1">
          Gerencie suas preferências e conta
        </p>
      </div>

      <div className="max-w-2xl space-y-8">
        {settingsGroups.map((group) => (
          <div key={group.title}>
            <h2 className="text-sm font-medium text-foreground-secondary uppercase tracking-wide mb-3">
              {group.title}
            </h2>
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              {group.items.map((item, index) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    onClick={() => handleSettingClick(item.label)}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 text-left transition-colors hover:bg-card-hover",
                      index !== group.items.length - 1 && "border-b border-border"
                    )}
                  >
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                      <Icon size={20} className="text-foreground-secondary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-medium text-foreground">
                        {item.label}
                      </p>
                      <p className="text-sm text-foreground-tertiary">
                        {item.description}
                      </p>
                    </div>
                    <ChevronRight size={18} className="text-foreground-tertiary flex-shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 p-4 bg-destructive/10 border border-destructive/20 rounded-2xl text-left transition-colors hover:bg-destructive/15"
        >
          <div className="w-10 h-10 rounded-xl bg-destructive/20 flex items-center justify-center flex-shrink-0">
            <LogOut size={20} className="text-destructive" />
          </div>
          <div className="flex-1">
            <p className="text-[15px] font-medium text-destructive">
              Sair da conta
            </p>
            <p className="text-sm text-destructive/70">
              Encerrar sessão atual
            </p>
          </div>
        </button>

        {/* Version */}
        <div className="text-center pt-4">
          <p className="text-xs text-foreground-disabled">
            EconoDrive v1.0.0
          </p>
        </div>
      </div>

      {/* Dialogs */}
      <Dialog open={openDialog === "Perfil"} onOpenChange={() => setOpenDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Perfil do Usuário</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Email</label>
              <p className="text-sm text-muted-foreground">{user?.email || 'demo@econodrive.com'}</p>
            </div>
            <div>
              <label className="text-sm font-medium">ID do Usuário</label>
              <p className="text-sm text-muted-foreground font-mono">{user?.id || 'demo-user-id'}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <p className="text-sm text-green-600">✓ Autenticado</p>
            </div>
            <Button onClick={() => setOpenDialog(null)} className="w-full">
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={openDialog === "Notificações"} onOpenChange={() => setOpenDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurações de Notificações</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Configure como você deseja receber alertas e lembretes sobre seus abastecimentos.
            </p>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-sm">Alertas de orçamento</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-sm">Lembretes de abastecimento</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">Notificações de preço</span>
              </label>
            </div>
            <Button onClick={() => setOpenDialog(null)} className="w-full">
              Salvar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
