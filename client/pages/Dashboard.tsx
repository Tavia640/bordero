import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/SimpleAuthContext";
import {
  getDashboardMetrics,
  getSales,
  getInstallments,
  getMonthlyTarget,
} from "@/lib/storage";
import { DashboardMetrics, Sale, Installment } from "@shared/types";
import { MobileLayout } from "@/components/MobileNavigation";
import MonthlyTargetModal from "@/components/MonthlyTargetModal";
import SystemStatus from "@/components/SystemStatus";
import WelcomeMessage from "@/components/WelcomeMessage";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  AlertTriangle,
  Home,
  Plus,
  Eye,
  ArrowUp,
  ArrowDown,
  Target,
  Percent,
  Users,
  Activity,
  Settings,
} from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [upcomingInstallments, setUpcomingInstallments] = useState<
    Installment[]
  >([]);
  const [showTargetModal, setShowTargetModal] = useState(false);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = () => {
    if (!user) return;

    // Sistema profissional - sempre zerado
    const dashboardMetrics = getDashboardMetrics(user.id);
    setMetrics(dashboardMetrics);

    // Get recent sales (last 3 for mobile)
    const allSales = getSales()
      .filter((s) => s.userId === user.id)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 3);
    setRecentSales(allSales);

    // Get upcoming installments (next 3 for mobile)
    const nextMonth = new Date();
    nextMonth.setDate(nextMonth.getDate() + 30);

    const upcoming = getInstallments()
      .filter((i) => {
        const sale = getSales().find(
          (s) => s.id === i.saleId && s.userId === user.id,
        );
        return (
          sale && i.status === "pending" && new Date(i.dueDate) <= nextMonth
        );
      })
      .sort(
        (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
      )
      .slice(0, 3);
    setUpcomingInstallments(upcoming);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  if (!metrics) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando dashboard...</p>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="p-4 space-y-6">
        {/* Welcome Header - Mobile Optimized */}
        <div className="text-center lg:text-left">
          <h2 className="text-xl font-bold text-gray-900">
            Olá, {user?.name?.split(" ")[0] || "Consultor"}!
            👋
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Acompanhe suas vendas e recebimentos de multipropriedade
          </p>
        </div>

        <SystemStatus />

        <WelcomeMessage />

        {/* Key Metrics - Mobile Grid */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <DollarSign className="h-6 w-6 text-green-600" />
                <div className="text-right">
                  <p className="text-xs text-gray-600">Vendas Total</p>
                  <p className="text-lg font-bold text-green-600">
                    {formatCurrency(metrics.totalSales)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Calendar className="h-6 w-6 text-blue-600" />
                <div className="text-right">
                  <p className="text-xs text-gray-600">Este Mês</p>
                  <p className="text-lg font-bold text-blue-600">
                    {formatCurrency(metrics.toReceiveThisMonth)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <TrendingUp className="h-6 w-6 text-orange-600" />
                <div className="text-right">
                  <p className="text-xs text-gray-600">A Receber</p>
                  <p className="text-lg font-bold text-orange-600">
                    {formatCurrency(metrics.totalToReceive)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <AlertTriangle className="h-6 w-6 text-red-600" />
                <div className="text-right">
                  <p className="text-xs text-gray-600">Cancelamentos</p>
                  <p className="text-lg font-bold text-red-600">
                    {formatPercent(metrics.cancellationRate)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Destaque: Valor a Receber Este Mês */}
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-300 shadow-lg">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-3">
                <Calendar className="h-8 w-8 text-blue-600 mr-3" />
                <h3 className="text-xl font-bold text-blue-800">
                  A Receber Este Mês
                </h3>
              </div>
              <p className="text-4xl font-bold text-blue-700 mb-2">
                {formatCurrency(metrics.toReceiveThisMonth)}
              </p>
              <div className="text-sm text-blue-600 space-y-1">
                {metrics.monthlyTarget > 0 ? (
                  <p>
                    {metrics.targetAchievement.toFixed(0)}% da meta mensal (
                    {formatCurrency(metrics.monthlyTarget)})
                  </p>
                ) : (
                  <p>Baseado nas parcelas com vencimento este mês</p>
                )}
                <p className="text-xs">
                  {new Date().toLocaleDateString("pt-BR", {
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cards de Recebimentos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-300">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Calendar className="h-6 w-6 text-orange-600 mr-2" />
                  <h3 className="text-base font-semibold text-orange-800">
                    Próximo Mês
                  </h3>
                </div>
                <p className="text-2xl font-bold text-orange-700 mb-1">
                  {formatCurrency(metrics.toReceiveNextMonth)}
                </p>
                <p className="text-xs text-orange-600">
                  {new Date(
                    new Date().getFullYear(),
                    new Date().getMonth() + 1,
                    1,
                  ).toLocaleDateString("pt-BR", {
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card
            className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setShowTargetModal(true)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-800 flex items-center gap-1">
                    Meta Mensal
                    <Settings className="h-3 w-3" />
                  </p>
                  <p className="text-xl font-bold text-blue-700">
                    {formatCurrency(
                      metrics.monthlyTarget || metrics.projectedMonthlyRevenue,
                    )}
                  </p>
                  {metrics.monthlyTarget > 0 && (
                    <p className="text-xs text-blue-600">
                      {metrics.targetAchievement.toFixed(0)}% atingido
                    </p>
                  )}
                </div>
                <Target className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-800">
                    Taxa Conversão
                  </p>
                  <p className="text-xl font-bold text-green-700">
                    {formatPercent(metrics.conversionRate)}
                  </p>
                </div>
                <Percent className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions - Mobile Optimized */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Ações Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Button
                asChild
                className="h-16 flex-col gap-1 bg-green-600 hover:bg-green-700"
              >
                <Link to="/cadastro">
                  <Plus className="h-5 w-5" />
                  <span className="text-xs">Nova Venda</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-16 flex-col gap-1">
                <Link to="/diretorio">
                  <Eye className="h-5 w-5" />
                  <span className="text-xs">Ver Vendas</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-16 flex-col gap-1">
                <Link to="/recebimentos">
                  <Calendar className="h-5 w-5" />
                  <span className="text-xs">Recebimentos</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-16 flex-col gap-1">
                <Link to="/relatorios">
                  <TrendingUp className="h-5 w-5" />
                  <span className="text-xs">Relatórios</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity - Mobile Optimized */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center">
                  <Home className="h-5 w-5 mr-2" />
                  Vendas Recentes
                </CardTitle>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/acompanhamento" className="text-xs">
                    Ver todas
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recentSales.length > 0 ? (
                <div className="space-y-3">
                  {recentSales.map((sale) => (
                    <div
                      key={sale.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">
                          {sale.propertyName}
                        </p>
                        <p className="text-xs text-gray-600 truncate">
                          {sale.clientName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(sale.saleDate)}
                        </p>
                      </div>
                      <div className="text-right ml-2">
                        <p className="font-semibold text-green-600 text-sm">
                          {formatCurrency(sale.totalValue)}
                        </p>
                        <Badge
                          variant={
                            sale.status === "active"
                              ? "default"
                              : sale.status === "completed"
                                ? "secondary"
                                : "destructive"
                          }
                          className="text-xs"
                        >
                          {sale.status === "active"
                            ? "Ativa"
                            : sale.status === "completed"
                              ? "Concluída"
                              : "Cancelada"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Home className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 text-sm">
                    Nenhuma venda registrada ainda
                  </p>
                  <Button asChild className="mt-3" size="sm">
                    <Link to="/cadastro">Cadastrar primeira venda</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Próximos Recebimentos
                </CardTitle>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/recebimentos" className="text-xs">
                    Ver todos
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {upcomingInstallments.length > 0 ? (
                <div className="space-y-3">
                  {upcomingInstallments.map((installment) => {
                    const sale = getSales().find(
                      (s) => s.id === installment.saleId,
                    );
                    const isOverdue =
                      new Date(installment.dueDate) < new Date();

                    return (
                      <div
                        key={installment.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm truncate">
                            {sale?.propertyName}
                          </p>
                          <p className="text-xs text-gray-600">
                            Parcela {installment.installmentNumber}
                          </p>
                          <p
                            className={`text-xs ${isOverdue ? "text-red-600 font-medium" : "text-gray-500"}`}
                          >
                            {formatDate(installment.dueDate)}
                            {isOverdue && " (Vencida)"}
                          </p>
                        </div>
                        <div className="text-right ml-2">
                          <p className="font-semibold text-blue-600 text-sm">
                            {formatCurrency(installment.amount)}
                          </p>
                          <Badge
                            variant={isOverdue ? "destructive" : "default"}
                            className="text-xs"
                          >
                            {isOverdue ? "Vencida" : "Pendente"}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Calendar className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 text-sm">
                    Nenhum recebimento próximo
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Modal de Meta Mensal */}
        <MonthlyTargetModal
          isOpen={showTargetModal}
          onClose={() => setShowTargetModal(false)}
          onSave={loadDashboardData}
        />
      </div>
    </MobileLayout>
  );
}
