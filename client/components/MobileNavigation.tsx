import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Plus,
  Calendar,
  Home,
  User,
  LogOut,
  ShoppingCart,
} from "lucide-react";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { Button } from "@/components/ui/button";

export function MobileNavigation() {
  const location = useLocation();
  const { signOut } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    {
      path: "/dashboard",
      icon: Home,
      label: "Dashboard",
      color: "text-blue-600",
    },
    {
      path: "/cadastro",
      icon: Plus,
      label: "Cadastro",
      color: "text-green-600",
    },
    {
      path: "/diretorio",
      icon: ShoppingCart,
      label: "Vendas",
      color: "text-purple-600",
    },
    {
      path: "/relatorios",
      icon: BarChart3,
      label: "Relatórios",
      color: "text-orange-600",
    },
  ];

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <>
      {/* Top Header for Mobile */}
      <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-20">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-green-600">
            Controle de Vendas
          </h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="p-2"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Bottom Navigation for Mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30">
        <div className="grid grid-cols-4 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center justify-center py-2 px-1 text-xs transition-colors duration-200",
                  active
                    ? `${item.color} bg-gray-50`
                    : "text-gray-500 hover:text-gray-700",
                )}
              >
                <Icon
                  className={cn("h-5 w-5 mb-1", active ? "scale-110" : "")}
                />
                <span
                  className={cn(
                    "font-medium text-[10px] leading-none",
                    active ? "font-semibold" : "",
                  )}
                >
                  {item.label}
                </span>
                {active && (
                  <div
                    className={cn(
                      "absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 rounded-full",
                      item.color.replace("text-", "bg-"),
                    )}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:w-64 lg:bg-white lg:border-r lg:border-gray-200 lg:z-20">
        <div className="flex flex-col h-full">
          <div className="flex items-center px-6 py-4 border-b border-gray-200">
            <h1 className="text-xl font-semibold text-green-600">
              Controle de Vendas
            </h1>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-colors duration-200",
                    active
                      ? `${item.color} bg-gray-50 border-l-4 ${item.color.replace("text-", "border-")}`
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
                  )}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="px-4 py-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={handleLogout}
              className="w-full justify-start"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}

// Layout wrapper component
interface MobileLayoutProps {
  children: React.ReactNode;
}

export function MobileLayout({ children }: MobileLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <MobileNavigation />

      {/* Main content with proper spacing */}
      <main
        className={cn(
          "lg:ml-64", // Desktop sidebar offset
          "pb-16 lg:pb-0", // Mobile bottom nav offset
          "pt-0 lg:pt-0", // No top padding since header is sticky
        )}
      >
        {children}
      </main>
    </div>
  );
}
