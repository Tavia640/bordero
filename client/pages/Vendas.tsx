import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { getSales, deleteSale, updateSale } from '@/lib/storage';
import { Sale } from '@shared/types';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Home,
  Calendar,
  DollarSign,
  Users,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';

export default function Vendas() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [sales, setSales] = useState<Sale[]>([]);
  const [filteredSales, setFilteredSales] = useState<Sale[]>([]);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    dateFrom: '',
    dateTo: '',
    period: 'all'
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
      .filter(s => s.userId === user.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    setSales(userSales);
  };

  const applyFilters = () => {
    let filtered = [...sales];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(sale => 
        sale.propertyName.toLowerCase().includes(searchLower) ||
        sale.clientName.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(sale => sale.status === filters.status);
    }

    // Date range filter
    if (filters.dateFrom) {
      filtered = filtered.filter(sale => sale.saleDate >= filters.dateFrom);
    }
    if (filters.dateTo) {
      filtered = filtered.filter(sale => sale.saleDate <= filters.dateTo);
    }

    // Period filter
    if (filters.period !== 'all') {
      const now = new Date();
      const periodDate = new Date();
      
      switch (filters.period) {
        case 'today':
          periodDate.setDate(now.getDate());
          filtered = filtered.filter(sale => 
            sale.saleDate === periodDate.toISOString().split('T')[0]
          );
          break;
        case 'week':
          periodDate.setDate(now.getDate() - 7);
          filtered = filtered.filter(sale => 
            new Date(sale.saleDate) >= periodDate
          );
          break;
        case 'month':
          periodDate.setMonth(now.getMonth());
          filtered = filtered.filter(sale => 
            sale.saleDate.startsWith(now.toISOString().slice(0, 7))
          );
          break;
        case 'year':
          filtered = filtered.filter(sale => 
            sale.saleDate.startsWith(now.getFullYear().toString())
          );
          break;
      }
    }

    setFilteredSales(filtered);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      dateFrom: '',
      dateTo: '',
      period: 'all'
    });
  };

  const handleDeleteSale = async (saleId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta venda? Esta ação não pode ser desfeita.')) {
      deleteSale(saleId);
      loadSales();
    }
  };

  const handleCancelSale = async (saleId: string) => {
    if (window.confirm('Tem certeza que deseja cancelar esta venda?')) {
      updateSale(saleId, { status: 'cancelled' });
      loadSales();
    }
  };

  const handleReactivateSale = async (saleId: string) => {
    if (window.confirm('Tem certeza que deseja reativar esta venda?')) {
      updateSale(saleId, { status: 'active' });
      loadSales();
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (status: Sale['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Ativa</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Concluída</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelada</Badge>;
      default:
        return <Badge variant="secondary">Desconhecido</Badge>;
    }
  };

  const getTotalValue = () => {
    return filteredSales.reduce((sum, sale) => sum + sale.totalValue, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard')}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-semibold text-green-600">Todas as Vendas</h1>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              <div className="space-y-2">
                <Label htmlFor="search">Buscar</Label>
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Nome do empreendimento ou cliente"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="active">Ativas</SelectItem>
                    <SelectItem value="completed">Concluídas</SelectItem>
                    <SelectItem value="cancelled">Canceladas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="period">Período</Label>
                <Select value={filters.period} onValueChange={(value) => handleFilterChange('period', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os períodos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="today">Hoje</SelectItem>
                    <SelectItem value="week">Última semana</SelectItem>
                    <SelectItem value="month">Este mês</SelectItem>
                    <SelectItem value="year">Este ano</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dateFrom">Data inicial</Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dateTo">Data final</Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-4">
              <Button variant="outline" onClick={clearFilters}>
                Limpar Filtros
              </Button>
              <div className="text-sm text-gray-600">
                {filteredSales.length} venda(s) encontrada(s) • Total: {formatCurrency(getTotalValue())}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sales List */}
        {filteredSales.length > 0 ? (
          <div className="space-y-4">
            {filteredSales.map((sale) => (
              <Card key={sale.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-lg flex items-center">
                            <Home className="h-4 w-4 mr-2 text-green-600" />
                            {sale.propertyName}
                          </h3>
                          <p className="text-gray-600 flex items-center mt-1">
                            <Users className="h-4 w-4 mr-2" />
                            {sale.clientName}
                          </p>
                        </div>
                        {getStatusBadge(sale.status)}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <div>
                          <p className="text-sm text-gray-500">Valor Total</p>
                          <p className="font-semibold text-green-600 flex items-center">
                            <DollarSign className="h-4 w-4 mr-1" />
                            {formatCurrency(sale.totalValue)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Data da Venda</p>
                          <p className="font-medium flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(sale.saleDate)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Parcelas</p>
                          <p className="font-medium">{sale.totalInstallments}x</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Valor/Parcela</p>
                          <p className="font-medium">
                            {formatCurrency(sale.totalValue / sale.totalInstallments)}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/venda/${sale.id}/editar`)}
                        disabled={sale.status === 'cancelled'}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      
                      {sale.status === 'active' && (
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
                      
                      {sale.status === 'cancelled' && (
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
                        <Trash2 className="h-4 w-4 mr-1" />
                        Excluir
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
              <p className="text-gray-600 mb-6">
                {sales.length === 0 
                  ? 'Você ainda não cadastrou nenhuma venda.'
                  : 'Nenhuma venda corresponde aos filtros aplicados.'
                }
              </p>
              <div className="space-x-4">
                <Button onClick={() => navigate('/nova-venda')} className="bg-green-600 hover:bg-green-700">
                  Cadastrar Nova Venda
                </Button>
                {sales.length > 0 && (
                  <Button variant="outline" onClick={clearFilters}>
                    Limpar Filtros
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
