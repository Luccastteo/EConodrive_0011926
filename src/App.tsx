import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Veiculos from "./pages/Veiculos";
import Abastecer from "./pages/Abastecer";
import Historico from "./pages/Historico";
import Calculadora from "./pages/Calculadora";
import Configuracoes from "./pages/Configuracoes";
import Orcamento from "./pages/Orcamento";
import Recarga from "./pages/Recarga";
import Economia from "./pages/Economia";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public route */}
          <Route path="/auth" element={<Auth />} />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            }
          />
          <Route
            path="/veiculos"
            element={
              <ProtectedRoute>
                <Veiculos />
              </ProtectedRoute>
            }
          />
          <Route
            path="/abastecer"
            element={
              <ProtectedRoute>
                <Abastecer />
              </ProtectedRoute>
            }
          />
          <Route
            path="/historico"
            element={
              <ProtectedRoute>
                <Historico />
              </ProtectedRoute>
            }
          />
          <Route
            path="/calculadora"
            element={
              <ProtectedRoute>
                <Calculadora />
              </ProtectedRoute>
            }
          />
          <Route
            path="/configuracoes"
            element={
              <ProtectedRoute>
                <Configuracoes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orcamento"
            element={
              <ProtectedRoute>
                <Orcamento />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recarga"
            element={
              <ProtectedRoute>
                <Recarga />
              </ProtectedRoute>
            }
          />
          <Route
            path="/economia"
            element={
              <ProtectedRoute>
                <Economia />
              </ProtectedRoute>
            }
          />

          {/* 404 - Public */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
