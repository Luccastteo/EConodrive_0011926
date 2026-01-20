import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Calculator, TrendingUp, DollarSign, Gauge, Info, ChevronRight, Target, Zap, Car, Fuel, History, Settings, Wallet, BarChart3, Crown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Car, label: "Veículos", path: "/veiculos" },
  { icon: Fuel, label: "Abastecer", path: "/abastecer" },
  { icon: History, label: "Histórico", path: "/historico" },
  { icon: Calculator, label: "Calculadora", path: "/calculadora" },
  { icon: TrendingUp, label: "Economia", path: "/economia" },
  { icon: Wallet, label: "Orçamento", path: "/orcamento" },
  { icon: BarChart3, label: "Recarga", path: "/recarga" },
  { icon: Crown, label: "Planos", path: "/planos" },
  { icon: Settings, label: "Configurações", path: "/configuracoes" },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
      navigate('/auth');
    } catch (error: any) {
      toast({
        title: "Erro ao fazer logout",
        description: error.message || "Não foi possível desconectar.",
        variant: "destructive",
      });
    }
  };

  // Get user initials and name
  const getUserInitials = () => {
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  const getUserName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'Usuário';
  };

  return (
    <>
      {/* Mobile Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
      </Button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50",
          "flex flex-col h-screen",
          "bg-background-secondary border-r border-sidebar-border",
          "transition-all duration-300 ease-out",
          isCollapsed ? "w-[72px]" : "w-[260px]",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          className
        )}
      >
        {/* Logo */}
        <div className={cn(
          "flex items-center gap-3 px-6 py-6",
          isCollapsed && "justify-center px-4"
        )}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent-light flex items-center justify-center flex-shrink-0">
            <Fuel size={20} className="text-white" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-lg font-bold text-foreground">EconoDrive</span>
              <span className="text-2xs text-foreground-tertiary">Controle de combustível</span>
            </div>
          )}
        </div>

        {/* Collapse Toggle - Desktop */}
        <Button
          variant="ghost"
          size="icon"
          className="hidden lg:flex absolute -right-3 top-8 w-6 h-6 rounded-full bg-background-tertiary border border-border hover:bg-muted"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <ChevronRight
            size={14}
            className={cn(
              "transition-transform duration-200",
              isCollapsed && "rotate-180"
            )}
          />
        </Button>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-uber">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  "relative flex items-center gap-3 px-4 py-3 rounded-lg",
                  "text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-sidebar-accent text-foreground"
                    : "text-foreground-secondary hover:bg-muted hover:text-foreground",
                  isCollapsed && "justify-center px-3"
                )}
              >
                {isActive && <div className="sidebar-active-indicator" />}
                <Icon size={20} className={cn(
                  "flex-shrink-0 transition-opacity",
                  isActive ? "opacity-100" : "opacity-70"
                )} />
                {!isCollapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className={cn(
          "border-t border-sidebar-border p-4",
          isCollapsed && "flex justify-center"
        )}>
          <div className={cn(
            "flex items-center gap-3",
            isCollapsed && "flex-col gap-2"
          )}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-info to-info/80 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-semibold text-white">{getUserInitials()}</span>
            </div>
            {!isCollapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{getUserName()}</p>
                  <p className="text-xs text-foreground-tertiary truncate">{user?.email || 'Carregando...'}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="flex-shrink-0"
                  onClick={handleLogout}
                  title="Sair"
                >
                  <LogOut size={18} className="text-foreground-tertiary hover:text-foreground" />
                </Button>
              </>
            )}
            {isCollapsed && (
              <Button
                variant="ghost"
                size="icon"
                className="mt-2"
                onClick={handleLogout}
                title="Sair"
              >
                <LogOut size={18} className="text-foreground-tertiary hover:text-foreground" />
              </Button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
