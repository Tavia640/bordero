import React from "react";
import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Cadastro from "./pages/Cadastro";
import Acompanhamento from "./pages/Acompanhamento";
import Relatorios from "./pages/Relatorios";
import NovaVenda from "./pages/NovaVenda";
import Vendas from "./pages/Vendas";
import Recebimentos from "./pages/Recebimentos";
import DiretorioVendas from "./pages/DiretorioVendas";
import NotFound from "./pages/NotFound";
import { SessionTimeoutWarning } from "./components/SessionTimeoutWarning";
import { initializeProfessionalSystem } from "./utils/clearSystem";

// Inicializar sistema profissional
initializeProfessionalSystem();

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cadastro"
              element={
                <ProtectedRoute>
                  <Cadastro />
                </ProtectedRoute>
              }
            />
            <Route
              path="/acompanhamento"
              element={
                <ProtectedRoute>
                  <Acompanhamento />
                </ProtectedRoute>
              }
            />
            <Route
              path="/relatorios"
              element={
                <ProtectedRoute>
                  <Relatorios />
                </ProtectedRoute>
              }
            />
            <Route
              path="/diretorio"
              element={
                <ProtectedRoute>
                  <DiretorioVendas />
                </ProtectedRoute>
              }
            />
            {/* Legacy routes for backward compatibility */}
            <Route
              path="/nova-venda"
              element={
                <ProtectedRoute>
                  <NovaVenda />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vendas"
              element={
                <ProtectedRoute>
                  <Vendas />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recebimentos"
              element={
                <ProtectedRoute>
                  <Recebimentos />
                </ProtectedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <SessionTimeoutWarning />
          <Toaster />
          <Sonner />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
