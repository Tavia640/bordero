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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import {
  getSales,
  getInstallments,
  updateSale,
  cancelSale,
  updateInstallment,
} from "@/lib/storage";
import { Sale, Installment } from "@shared/types";
import { MobileLayout } from "@/components/MobileNavigation";
import {
  ShoppingCart,
  ChevronRight,
  ChevronDown,
  Search,
  Filter,
  Archive,
  X,
  CheckCircle,
  DollarSign,
  Calendar,
  User,
  Building,
  MoreHorizontal,
  Eye,
  Edit,
  FileX,
  RotateCcw,
  Expand,
  Minimize,
} from "lucide-react";

interface DirectoryNode {
  id: string;
  name: string;
  type: "property" | "year" | "month" | "day" | "sale";
  children?: DirectoryNode[];
  sale?: Sale;
  expanded?: boolean;
  count?: number;
}

export default function DiretorioVendas() {
  const { user } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [directoryTree, setDirectoryTree] = useState<DirectoryNode[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [filters, setFilters] = useState({
    status: "all",
    property: "all",
    dateFrom: "",
    dateTo: "",
  });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  useEffect(() => {
    buildDirectoryTree();
  }, [sales, searchTerm, filters]);

  const loadData = () => {
    if (!user) return;

    const userSales = getSales()
      .filter((s) => s.userId === user.id)
      .sort(
        (a, b) =>
          new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime(),
      );

    setSales(userSales);
    setInstallments(getInstallments());
  };

  const buildDirectoryTree = () => {
    let filteredSales = sales;

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filteredSales = filteredSales.filter(
        (sale) =>
          sale.propertyName.toLowerCase().includes(searchLower) ||
          sale.clientName.toLowerCase().includes(searchLower),
      );
    }

    // Apply status filter
    if (filters.status !== "all") {
      filteredSales = filteredSales.filter(
        (sale) => sale.status === filters.status,
      );
    }

    // Apply property filter
    if (filters.property !== "all") {
      filteredSales = filteredSales.filter(
        (sale) => sale.propertyName === filters.property,
      );
    }

    // Apply date filters
    if (filters.dateFrom) {
      filteredSales = filteredSales.filter(
        (sale) => sale.saleDate >= filters.dateFrom,
      );
    }
    if (filters.dateTo) {
      filteredSales = filteredSales.filter(
        (sale) => sale.saleDate <= filters.dateTo,
      );
    }

    // Build hierarchy: Property > Year > Month > Day > Sale
    const propertyMap = new Map<
      string,
      Map<string, Map<string, Map<string, Sale[]>>>
    >();

    filteredSales.forEach((sale) => {
      const date = new Date(sale.saleDate);
      const year = date.getFullYear().toString();
      const month = date.toLocaleDateString("pt-BR", { month: "long" });
      const day = date.getDate().toString().padStart(2, "0");

      if (!propertyMap.has(sale.propertyName)) {
        propertyMap.set(sale.propertyName, new Map());
      }
      if (!propertyMap.get(sale.propertyName)!.has(year)) {
        propertyMap.get(sale.propertyName)!.set(year, new Map());
      }
      if (!propertyMap.get(sale.propertyName)!.get(year)!.has(month)) {
        propertyMap.get(sale.propertyName)!.get(year)!.set(month, new Map());
      }
      if (
        !propertyMap.get(sale.propertyName)!.get(year)!.get(month)!.has(day)
      ) {
        propertyMap.get(sale.propertyName)!.get(year)!.get(month)!.set(day, []);
      }

      propertyMap
        .get(sale.propertyName)!
        .get(year)!
        .get(month)!
        .get(day)!
        .push(sale);
    });

    // Convert to tree structure
    const tree: DirectoryNode[] = [];

    propertyMap.forEach((yearMap, propertyName) => {
      const propertyCount = Array.from(yearMap.values())
        .flatMap((monthMap) => Array.from(monthMap.values()))
        .flatMap((dayMap) => Array.from(dayMap.values()))
        .reduce((sum, sales) => sum + sales.length, 0);

      const propertyNode: DirectoryNode = {
        id: `property-${propertyName}`,
        name: propertyName,
        type: "property",
        count: propertyCount,
        expanded: true,
        children: [],
      };

      yearMap.forEach((monthMap, year) => {
        const yearCount = Array.from(monthMap.values())
          .flatMap((dayMap) => Array.from(dayMap.values()))
          .reduce((sum, sales) => sum + sales.length, 0);

        const yearNode: DirectoryNode = {
          id: `year-${propertyName}-${year}`,
          name: year,
          type: "year",
          count: yearCount,
          expanded: false,
          children: [],
        };

        monthMap.forEach((dayMap, month) => {
          const monthCount = Array.from(dayMap.values()).reduce(
            (sum, sales) => sum + sales.length,
            0,
          );

          const monthNode: DirectoryNode = {
            id: `month-${propertyName}-${year}-${month}`,
            name: month,
            type: "month",
            count: monthCount,
            expanded: false,
            children: [],
          };

          dayMap.forEach((salesList, day) => {
            const dayNode: DirectoryNode = {
              id: `day-${propertyName}-${year}-${month}-${day}`,
              name: `Dia ${day}`,
              type: "day",
              count: salesList.length,
              expanded: false,
              children: salesList.map((sale) => ({
                id: `sale-${sale.id}`,
                name: `${sale.clientName} - ${formatCurrency(sale.totalValue)}`,
                type: "sale" as const,
                sale: sale,
              })),
            };

            monthNode.children!.push(dayNode);
          });

          yearNode.children!.push(monthNode);
        });

        propertyNode.children!.push(yearNode);
      });

      tree.push(propertyNode);
    });

    setDirectoryTree(tree);
  };

  const toggleNode = (nodeId: string) => {
    const updateNodeRecursive = (nodes: DirectoryNode[]): DirectoryNode[] => {
      return nodes.map((node) => {
        if (node.id === nodeId) {
          return { ...node, expanded: !node.expanded };
        }
        if (node.children) {
          return { ...node, children: updateNodeRecursive(node.children) };
        }
        return node;
      });
    };

    setDirectoryTree(updateNodeRecursive(directoryTree));
  };

  const expandAll = () => {
    const expandNodeRecursive = (nodes: DirectoryNode[]): DirectoryNode[] => {
      return nodes.map((node) => ({
        ...node,
        expanded: true,
        children: node.children
          ? expandNodeRecursive(node.children)
          : undefined,
      }));
    };

    setDirectoryTree(expandNodeRecursive(directoryTree));
  };

  const collapseAll = () => {
    const collapseNodeRecursive = (nodes: DirectoryNode[]): DirectoryNode[] => {
      return nodes.map((node) => ({
        ...node,
        expanded: false,
        children: node.children
          ? collapseNodeRecursive(node.children)
          : undefined,
      }));
    };

    setDirectoryTree(collapseNodeRecursive(directoryTree));
  };

  const handleSaleAction = async (action: string, sale: Sale) => {
    switch (action) {
      case "details":
        setSelectedSale(sale);
        setShowDetailsDialog(true);
        break;
      case "archive":
        if (confirm(`Arquivar venda de ${sale.clientName}?`)) {
          updateSale(sale.id, { status: "completed" });
          loadData();
        }
        break;
      case "cancel":
        if (
          confirm(
            `Cancelar venda de ${sale.clientName}? Isso cancelará todas as parcelas pendentes.`,
          )
        ) {
          const result = cancelSale(sale.id);
          if (result.success) {
            alert(
              `Venda cancelada! ${result.cancelledInstallments} parcelas canceladas.`,
            );
            loadData();
          }
        }
        break;
      case "reactivate":
        if (confirm(`Reativar venda de ${sale.clientName}?`)) {
          updateSale(sale.id, { status: "active" });
          loadData();
        }
        break;
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            Ativa
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            Arquivada
          </Badge>
        );
      case "cancelled":
        return <Badge variant="destructive">Cancelada</Badge>;
      default:
        return <Badge variant="secondary">Desconhecido</Badge>;
    }
  };

  const renderDirectoryNode = (node: DirectoryNode, level: number = 0) => {
    const indentStyle = level > 0 ? { marginLeft: `${level * 16}px` } : {};

    if (node.type === "sale" && node.sale) {
      return (
        <div
          key={node.id}
          style={indentStyle}
          className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg mb-2 hover:shadow-sm transition-shadow"
        >
          <div className="flex items-center flex-1 min-w-0">
            <User className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm truncate">
                {node.sale.clientName}
              </p>
              <p className="text-xs text-gray-500">
                {formatDate(node.sale.saleDate)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-green-600 text-sm">
              {formatCurrency(node.sale.totalValue)}
            </span>
            {getStatusBadge(node.sale.status)}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ações da Venda</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => handleSaleAction("details", node.sale!)}
                    className="flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Detalhes
                  </Button>
                  {node.sale.status === "active" && (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => handleSaleAction("archive", node.sale!)}
                        className="flex items-center gap-2"
                      >
                        <Archive className="h-4 w-4" />
                        Arquivar
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleSaleAction("cancel", node.sale!)}
                        className="flex items-center gap-2"
                      >
                        <X className="h-4 w-4" />
                        Cancelar
                      </Button>
                    </>
                  )}
                  {(node.sale.status === "completed" ||
                    node.sale.status === "cancelled") && (
                    <Button
                      variant="outline"
                      onClick={() => handleSaleAction("reactivate", node.sale!)}
                      className="flex items-center gap-2"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Reativar
                    </Button>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      );
    }

    const hasChildren = node.children && node.children.length > 0;
    const iconMap = {
      property: Building,
      year: Calendar,
      month: Calendar,
      day: Calendar,
      sale: User,
    };
    const Icon = iconMap[node.type];

    return (
      <div key={node.id} style={indentStyle}>
        <div
          className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer"
          onClick={() => hasChildren && toggleNode(node.id)}
        >
          <div className="flex items-center">
            {hasChildren &&
              (node.expanded ? (
                <ChevronDown className="h-4 w-4 text-gray-400 mr-2" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-400 mr-2" />
              ))}
            <Icon className="h-4 w-4 text-gray-600 mr-2" />
            <span className="font-medium text-gray-900">{node.name}</span>
            {node.count && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {node.count}
              </Badge>
            )}
          </div>
        </div>
        {node.expanded && node.children && (
          <div className="mt-1">
            {node.children.map((child) =>
              renderDirectoryNode(child, level + 1),
            )}
          </div>
        )}
      </div>
    );
  };

  const uniqueProperties = [...new Set(sales.map((s) => s.propertyName))];

  return (
    <MobileLayout>
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="text-center lg:text-left">
          <h1 className="text-xl font-bold text-gray-900 flex items-center justify-center lg:justify-start">
            <ShoppingCart className="h-6 w-6 mr-2 text-green-600" />
            Controle de Vendas
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Organize e gerencie suas vendas por empreendimento, data e cliente
          </p>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por empreendimento ou cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Select
                value={filters.status}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="active">Ativas</SelectItem>
                  <SelectItem value="completed">Arquivadas</SelectItem>
                  <SelectItem value="cancelled">Canceladas</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.property}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, property: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Empreendimento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {uniqueProperties.map((property) => (
                    <SelectItem key={property} value={property}>
                      {property}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, dateFrom: e.target.value }))
                }
                placeholder="Data inicial"
              />

              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, dateTo: e.target.value }))
                }
                placeholder="Data final"
              />
            </div>
          </CardContent>
        </Card>

        {/* Directory Tree */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                Estrutura de Vendas ({sales.length} vendas)
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={expandAll}>
                  <Expand className="h-4 w-4 mr-1" />
                  Expandir
                </Button>
                <Button variant="outline" size="sm" onClick={collapseAll}>
                  <Minimize className="h-4 w-4 mr-1" />
                  Recolher
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {directoryTree.length > 0 ? (
              <div className="space-y-1">
                {directoryTree.map((node) => renderDirectoryNode(node))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ||
                filters.status !== "all" ||
                filters.property !== "all"
                  ? "Nenhuma venda encontrada com os filtros aplicados"
                  : "Nenhuma venda cadastrada ainda"}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sale Details Dialog */}
        {selectedSale && (
          <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Detalhes da Venda</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-600">Cliente</p>
                    <p>{selectedSale.clientName}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-600">Empreendimento</p>
                    <p>{selectedSale.propertyName}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-600">Valor</p>
                    <p className="font-semibold text-green-600">
                      {formatCurrency(selectedSale.totalValue)}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-600">Parcelas</p>
                    <p>{selectedSale.totalInstallments}x</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-600">Data da Venda</p>
                    <p>{formatDate(selectedSale.saleDate)}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-600">Status</p>
                    {getStatusBadge(selectedSale.status)}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </MobileLayout>
  );
}
