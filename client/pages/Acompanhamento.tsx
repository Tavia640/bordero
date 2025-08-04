import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { getSales, deleteSale, updateSale, cancelSale } from "@/lib/storage";
import { Sale } from "@shared/types";
import { MobileLayout } from "@/components/MobileNavigation";
import {
  Search,
  Filter,
  Edit,
  Trash2,
  Home,
  Calendar,
  DollarSign,
  Users,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus,
  MoreVertical,
} from "lucide-react";

export default function Acompanhamento() {
  const { user } = useAuth();

  const [sales, setSales] = useState<Sale[]>([]);
  const [filteredSales, setFilteredSales] = useState<Sale[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    period: "all",
  });

  useEffect(() => {
    if (user) {
      loadSales();
    }
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [sales, filters]);

  const loadSales = () => {
    if (!user) return;

    const userSales = getSales()
      .filter((s) => s.userId === user.id)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

    setSales(userSales);
  };

  const applyFilters = () => {
    let filtered = [...sales];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (sale) =>
          sale.propertyName.toLowerCase().includes(searchLower) ||
          sale.clientName.toLowerCase().includes(searchLower),
      );
    }

    // Status filter
    if (filters.status !== "all") {
      filtered = filtered.filter((sale) => sale.status === filters.status);
    }

    // Period filter
    if (filters.period !== "all") {
      const now = new Date();
      const periodDate = new Date();

      switch (filters.period) {
        case "week":
          periodDate.setDate(now.getDate() - 7);
          filtered = filtered.filter(
            (sale) => new Date(sale.saleDate) >= periodDate,
          );
          break;
        case "month":
          filtered = filtered.filter((sale) =>
            sale.saleDate.startsWith(now.toISOString().slice(0, 7)),
          );
          break;
        case "year":
          filtered = filtered.filter((sale) =>
            sale.saleDate.startsWith(now.getFullYear().toString()),
          );
          break;
      }
    }

    setFilteredSales(filtered);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      status: "all",
      period: "all",
    });
  };

  const handleDeleteSale = async (saleId: string) => {
    if (
      window.confirm(
        "Tem certeza que deseja excluir esta venda? Esta ação não pode ser desfeita.",
      )
    ) {
      deleteSale(saleId);
      loadSales();
    }
  };

  const handleCancelSale = async (saleId: string) => {
    if (
      window.confirm(
        "Tem certeza que deseja cancelar esta venda? Isso cancelará todas as parcelas pendentes.",
      )
    ) {
      const result = cancelSale(saleId);
      if (result.success) {
        alert(
          `Venda cancelada! ${result.cancelledInstallments} parcelas canceladas (${new Intl.NumberFormat(
            "pt-BR",
            {
              style: "currency",
              currency: "BRL",
            },
          ).format(result.cancelledAmount)})`,
        );
        loadSales();
      } else {
        alert("Erro ao cancelar venda. Tente novamente.");
      }
    }
  };

  const handleReactivateSale = async (saleId: string) => {
    if (window.confirm("Tem certeza que deseja reativar esta venda?")) {
      updateSale(saleId, { status: "active" });
      loadSales();
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const getStatusBadge = (status: Sale["status"]) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
            Ativa
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
            Concluída
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="destructive" className="text-xs">
            Cancelada
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="text-xs">
            Desconhecido
          </Badge>
        );
    }
  };

  const getTotalValue = () => {
    return filteredSales.reduce((sum, sale) => sum + sale.totalValue, 0);
  };

  return (
    <MobileLayout>
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Vendas de Multipropriedade
            </h1>
            <p className="text-sm text-gray-600">
              {filteredSales.length} venda(s) •{" "}
              {formatCurrency(getTotalValue())}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4 space-y-3">
            {/* Search */}
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Buscar por empreendimento ou cliente"
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters - Collapsible */}
            {showFilters && (
              <div className="space-y-3 pt-3 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Select
                      value={filters.status}
                      onValueChange={(value) =>
                        handleFilterChange("status", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="active">Ativas</SelectItem>
                        <SelectItem value="completed">Concluídas</SelectItem>
                        <SelectItem value="cancelled">Canceladas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Select
                      value={filters.period}
                      onValueChange={(value) =>
                        handleFilterChange("period", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Período" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="week">Esta semana</SelectItem>
                        <SelectItem value="month">Este mês</SelectItem>
                        <SelectItem value="year">Este ano</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={clearFilters}
                  size="sm"
                  className="w-full"
                >
                  Limpar Filtros
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sales List */}
        {filteredSales.length > 0 ? (
          <div className="space-y-3">
            {filteredSales.map((sale) => (
              <Card key={sale.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 truncate flex items-center">
                          <Home className="h-4 w-4 mr-2 text-green-600 flex-shrink-0" />
                          {sale.propertyName}
                        </h3>
                        <p className="text-sm text-gray-600 truncate flex items-center mt-1">
                          <Users className="h-4 w-4 mr-2 flex-shrink-0" />
                          {sale.clientName}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(sale.status)}
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Valor Total</p>
                        <p className="font-semibold text-green-600 flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />
                          {formatCurrency(sale.totalValue)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Data da Venda</p>
                        <p className="font-medium flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(sale.saleDate)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Parcelas</p>
                        <p className="font-medium">{sale.totalInstallments}x</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Valor/Parcela</p>
                        <p className="font-medium">
                          {formatCurrency(
                            sale.totalValue / sale.totalInstallments,
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t border-gray-100">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        disabled={sale.status === "cancelled"}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>

                      {sale.status === "active" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelSale(sale.id)}
                          className="text-orange-600 border-orange-200 hover:bg-orange-50"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Cancelar
                        </Button>
                      )}

                      {sale.status === "cancelled" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReactivateSale(sale.id)}
                          className="text-green-600 border-green-200 hover:bg-green-50"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Reativar
                        </Button>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteSale(sale.id)}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <Home className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma venda encontrada
              </h3>
              <p className="text-gray-600 mb-6 text-sm">
                {sales.length === 0
                  ? "Você ainda não cadastrou nenhuma venda."
                  : "Nenhuma venda corresponde aos filtros aplicados."}
              </p>
              <div className="space-y-3">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Cadastrar Nova Venda
                </Button>
                {sales.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="w-full"
                  >
                    Limpar Filtros
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MobileLayout>
  );
}
