import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { getDashboardMetrics } from "@/lib/storage";
import { DashboardMetrics } from "@shared/types";
import { MobileLayout } from "@/components/MobileNavigation";
import { PeriodFilter } from "@/components/PeriodFilter";
import {
  SalesTrendChart,
  RevenueChart,
  SalesByStatusChart,
  ReceivablesTimeline,
  TopPropertiesChart,
} from "@/components/charts/DashboardCharts";
import {
  MobileSalesOverview,
  MobileTopProperties,
  MobileTrendChart,
  MobileReceivablesChart,
} from "@/components/charts/SimpleMobileCharts";
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Target,
  Download,
  Share,
  Plus,
} from "lucide-react";

export default function Relatorios() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear(),
  );
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth() + 1,
  );

  useEffect(() => {
    if (user) {
      loadMetrics();
    }
  }, [user, selectedPeriod, selectedYear, selectedMonth]);

  const loadMetrics = () => {
    if (!user) return;

    const filters = {
      period: selectedPeriod,
      year: selectedYear,
      month: selectedMonth,
    };

    const dashboardMetrics = getDashboardMetrics(user.id, filters);
    setMetrics(dashboardMetrics);
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

  if (!metrics) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando relatórios...</p>
          </div>
        </div>
      </MobileLayout>
    );
  }

  // Se não há vendas, mostrar orientações
  if (metrics.totalSales === 0) {
    return (
      <MobileLayout>
        <div className="p-4 space-y-6">
          <div className="text-center lg:text-left">
            <h1 className="text-xl font-bold text-gray-900 flex items-center justify-center lg:justify-start">
              <BarChart3 className="h-6 w-6 mr-2 text-green-600" />
              Relatórios e Gráficos
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Análise detalhada do seu desempenho
            </p>
          </div>

          <Card className="text-center p-8">
            <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Nenhuma venda registrada
            </h3>
            <p className="text-gray-600 mb-6">
              Cadastre suas primeiras vendas de multipropriedade para visualizar
              relatórios e análises detalhadas
            </p>
            <div className="flex gap-3 justify-center">
              <Button asChild className="bg-green-600 hover:bg-green-700">
                <Link to="/cadastro">
                  <Plus className="h-4 w-4 mr-2" />
                  Cadastrar Venda
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/dashboard">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Ir para Dashboard
                </Link>
              </Button>
            </div>
          </Card>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="text-center lg:text-left">
          <h1 className="text-xl font-bold text-gray-900 flex items-center justify-center lg:justify-start">
            <BarChart3 className="h-6 w-6 mr-2 text-green-600" />
            Relatórios e Gráficos
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Análise detalhada do seu desempenho
          </p>
        </div>

        {/* Period Filter */}
        <PeriodFilter
          selectedPeriod={selectedPeriod}
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          onPeriodChange={setSelectedPeriod}
          onYearChange={setSelectedYear}
          onMonthChange={setSelectedMonth}
        />

        {/* Key Metrics Summary - Mobile Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="text-center">
            <CardContent className="p-4">
              <Calendar className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <p className="text-xs text-gray-600">Este Mês</p>
              <p className="text-sm font-bold text-blue-600">
                {formatCurrency(metrics.toReceiveThisMonth)}
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-4">
              <Calendar className="h-6 w-6 text-orange-600 mx-auto mb-2" />
              <p className="text-xs text-gray-600">Próximo Mês</p>
              <p className="text-sm font-bold text-orange-600">
                {formatCurrency(metrics.toReceiveNextMonth)}
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-4">
              <Target className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <p className="text-xs text-gray-600">Meta Mensal</p>
              <p className="text-sm font-bold text-green-600">
                {formatCurrency(
                  metrics.monthlyTarget || metrics.projectedMonthlyRevenue,
                )}
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-4">
              <TrendingUp className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <p className="text-xs text-gray-600">Crescimento</p>
              <p
                className={`text-sm font-bold ${metrics.monthlyGrowthRate >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                {metrics.monthlyGrowthRate >= 0 ? "+" : ""}
                {formatPercent(metrics.monthlyGrowthRate)}
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-4">
              <Calendar className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <p className="text-xs text-gray-600">Conversão</p>
              <p className="text-sm font-bold text-purple-600">
                {formatPercent(metrics.conversionRate)}
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-4">
              <BarChart3 className="h-6 w-6 text-orange-600 mx-auto mb-2" />
              <p className="text-xs text-gray-600">Ticket Médio</p>
              <p className="text-sm font-bold text-orange-600">
                {formatCurrency(metrics.averageTicket)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section - Mobile Optimized */}
        <div className="space-y-6">
          {/* Mobile: Use simplified charts to avoid recharts warnings */}
          <div className="lg:hidden space-y-6">
            <MobileSalesOverview
              totalSales={metrics.totalSales}
              totalReceived={metrics.totalReceived}
              totalToReceive={metrics.totalToReceive}
              cancellationRate={metrics.cancellationRate}
            />

            <MobileReceivablesChart
              data={metrics.receivablesByMonth}
              targetAchievement={metrics.targetAchievement}
              currentTarget={metrics.monthlyTarget}
            />

            <MobileTrendChart data={metrics.monthlyTrends} />

            <MobileTopProperties data={metrics.topPerformingProperties} />
          </div>

          {/* Desktop: Use recharts for better experience */}
          <div className="hidden lg:block space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <SalesTrendChart data={metrics.monthlyTrends} />
              <RevenueChart data={metrics.salesByMonth} />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <SalesByStatusChart data={metrics.salesByStatus} />
              <ReceivablesTimeline data={metrics.receivablesByMonth} />
            </div>

            <TopPropertiesChart data={metrics.topPerformingProperties} />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-4">
          <Button
            variant="outline"
            className="flex items-center justify-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
          <Button
            variant="outline"
            className="flex items-center justify-center"
          >
            <Share className="h-4 w-4 mr-2" />
            Compartilhar
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resumo do Período</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total em Vendas:</span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(metrics.totalSales)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Valores Recebidos:</span>
                <span className="font-semibold text-blue-600">
                  {formatCurrency(metrics.totalReceived)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">A Receber:</span>
                <span className="font-semibold text-orange-600">
                  {formatCurrency(metrics.totalToReceive)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Vendas Canceladas:</span>
                <span className="font-semibold text-red-600">
                  {metrics.cancelledSalesCount} (
                  {formatPercent(metrics.cancellationRate)})
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Fluxo de Caixa */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Fluxo de Caixa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-gray-600">Este Mês:</span>
                <span className="font-semibold text-blue-600">
                  {formatCurrency(metrics.toReceiveThisMonth)}
                </span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-gray-600">Próximo Mês:</span>
                <span className="font-semibold text-orange-600">
                  {formatCurrency(metrics.toReceiveNextMonth)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">
                  Pendentes ({metrics.pendingInstallments} parcelas):
                </span>
                <span className="font-semibold text-gray-600">
                  {formatCurrency(metrics.totalToReceive)}
                </span>
              </div>
              {metrics.overdueInstallments > 0 && (
                <div className="flex justify-between items-center bg-red-50 p-2 rounded">
                  <span className="text-red-700">Parcelas Vencidas:</span>
                  <span className="font-semibold text-red-600">
                    {metrics.overdueInstallments} parcela(s)
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MobileLayout>
  );
}
