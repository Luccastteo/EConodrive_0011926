import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Fuel, Mail, Lock, Loader2, ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasConfigError, setHasConfigError] = useState(false);

  const { signIn, signUp, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  useEffect(() => {
    // Check if Supabase is configured
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
    const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

    if (!supabaseUrl || !supabaseKey ||
      supabaseKey.includes('your_') ||
      supabaseKey === '' ||
      supabaseUrl === '') {
      setHasConfigError(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha email e senha para continuar.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      if (isLogin) {
        await signIn(email, password);
        toast({
          title: "Bem-vindo de volta!",
          description: "Login realizado com sucesso.",
        });
      } else {
        await signUp(email, password);
        toast({
          title: "Conta criada!",
          description: "Sua conta foi criada com sucesso.",
        });
      }

      // Redirect to intended destination or home
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (error: any) {
      let errorMessage = error.message || "Ocorreu um erro. Tente novamente.";

      // Check for API key errors
      if (error.message?.includes('Invalid API key') || error.message?.includes('invalid api key')) {
        errorMessage = "Chave da API do Supabase não configurada. Verifique o arquivo .env e configure VITE_SUPABASE_PUBLISHABLE_KEY.";
      } else if (error.message?.includes('Invalid login credentials')) {
        errorMessage = "Email ou senha incorretos. Verifique suas credenciais.";
      } else if (error.message?.includes('User already registered')) {
        errorMessage = "Este email já está cadastrado. Faça login ou use outro email.";
      }

      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-info/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-accent-light flex items-center justify-center mb-4">
            <Fuel size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">EconoDrive</h1>
          <p className="text-foreground-tertiary">Controle de combustível</p>
        </div>

        {/* Form Card */}
        <div className="bg-card border border-border rounded-2xl p-8 animate-fade-in">
          {hasConfigError && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Configuração Necessária</AlertTitle>
              <AlertDescription className="mt-2">
                A chave do Supabase não está configurada.
                <br />
                <span className="text-xs mt-1 block">
                  Configure o arquivo <code className="bg-destructive/20 px-1 rounded">.env</code> com sua chave do Supabase.
                  <br />
                  Veja o arquivo <code className="bg-destructive/20 px-1 rounded">CONFIGURACAO_SUPABASE.md</code> para instruções.
                </span>
              </AlertDescription>
            </Alert>
          )}

          <h2 className="text-xl font-semibold text-foreground mb-2">
            {isLogin ? "Entrar na sua conta" : "Criar nova conta"}
          </h2>
          <p className="text-sm text-foreground-tertiary mb-6">
            {isLogin
              ? "Bem-vindo de volta! Entre com seus dados."
              : "Preencha os dados para criar sua conta."
            }
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-foreground mb-2 block">
                Email
              </Label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-tertiary" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="text-foreground mb-2 block">
                Senha
              </Label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-tertiary" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12"
                  autoComplete={isLogin ? "current-password" : "new-password"}
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="accent"
              className="w-full gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  {isLogin ? "Entrar" : "Criar conta"}
                  <ArrowRight size={18} />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-foreground-secondary hover:text-foreground transition-colors"
            >
              {isLogin
                ? "Não tem uma conta? Criar conta"
                : "Já tem uma conta? Entrar"
              }
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-xs text-foreground-tertiary text-center mt-6">
          Ao continuar, você concorda com nossos termos de uso.
        </p>
      </div>
    </div>
  );
}
