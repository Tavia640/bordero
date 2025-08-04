import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { getInstallments, getSales, updateInstallment } from '@/lib/storage';
import { Installment, Sale } from '@shared/types';
import { 
  ArrowLeft, 
  Calendar, 
  DollarSign,
  CheckCircle,
  AlertTriangle,
  Clock,
  Eye,
  Home,
  Filter
} from 'lucide-react';

export default function Recebimentos() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [filteredInstallments, setFilteredInstallments] = useState<Installment[]>([]);
  const [selectedInstallment, setSelectedInstallment] = useState<Installment | null>(null);
  const [showReceiveDialog, setShowReceiveDialog] = useState(false);
  const [receiveNotes, setReceiveNotes] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    dueDateFrom: '',
    dueDateTo: '',
    propertyName: '',
    period: 'all'
  });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [installments, filters]);

  const loadData = () => {
    if (!user) return;
    
    const userSales = getSales().filter(s => s.userId === user.id);
    setSales(userSales);
    
    const userInstallments = getInstallments()
      .filter(installment => {
        const sale = userSales.find(s => s.id === installment.saleId);
        return sale && sale.status !== 'cancelled';
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    
    setInstallments(userInstallments);
  };

  const applyFilters = () => {
    let filtered = [...installments];

    // Status filter
    if (filters.status !== 'all') {
      if (filters.status === 'overdue') {
        filtered = filtered.filter(inst => 
          inst.status === 'pending' && new Date(inst.dueDate) < new Date()
        );
      } else {
        filtered = filtered.filter(inst => inst.status === filters.status);
      }
    }

    // Date range filter
    if (filters.dueDateFrom) {
      filtered = filtered.filter(inst => inst.dueDate >= filters.dueDateFrom);
    }
    if (filters.dueDateTo) {
      filtered = filtered.filter(inst => inst.dueDate <= filters.dueDateTo);
    }

    // Property name filter
    if (filters.propertyName) {
      const searchLower = filters.propertyName.toLowerCase();
      filtered = filtered.filter(inst => {
        const sale = sales.find(s => s.id === inst.saleId);
        return sale?.propertyName.toLowerCase().includes(searchLower);
      });
    }

    // Period filter
    if (filters.period !== 'all') {
      const now = new Date();
      const periodDate = new Date();
      
      switch (filters.period) {
        case 'overdue':
          filtered = filtered.filter(inst => 
            inst.status === 'pending' && new Date(inst.dueDate) < now
          );
          break;
        case 'thisWeek':
          periodDate.setDate(now.getDate() + 7);
          filtered = filtered.filter(inst => 
            inst.status === 'pending' && 
            new Date(inst.dueDate) >= now && 
            new Date(inst.dueDate) <= periodDate
          );
          break;
        case 'thisMonth':
          filtered = filtered.filter(inst => 
            inst.dueDate.startsWith(now.toISOString().slice(0, 7))
          );
          break;
        case 'nextMonth':
          const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1);
          filtered = filtered.filter(inst => 
            inst.dueDate.startsWith(nextMonth.toISOString().slice(0, 7))
          );
          break;
      }
    }

    setFilteredInstallments(filtered);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      status: 'all',
      dueDateFrom: '',
      dueDateTo: '',
      propertyName: '',
      period: 'all'
    });
  };

  const handleMarkAsReceived = (installment: Installment) => {
    setSelectedInstallment(installment);
    setReceiveNotes('');
    setShowReceiveDialog(true);
  };

  const confirmReceive = () => {
    if (!selectedInstallment) return;
    
    updateInstallment(selectedInstallment.id, {
      status: 'received',
      receivedDate: new Date().toISOString().split('T')[0],
      notes: receiveNotes
    });
    
    setShowReceiveDialog(false);
    setSelectedInstallment(null);
    setReceiveNotes('');
    loadData();
  };

  const handleMarkAsPending = (installmentId: string) => {
    updateInstallment(installmentId, {
      status: 'pending',
      receivedDate: undefined,
      notes: undefined
    });
    loadData();
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

  const getStatusBadge = (installment: Installment) => {
    const isOverdue = installment.status === 'pending' && new Date(installment.dueDate) < new Date();
    
    if (installment.status === 'received') {
      return <Badge className="bg-green-100 text-green-800 border-green-200">Recebido</Badge>;
    }
    
    if (isOverdue) {
      return <Badge variant="destructive">Vencido</Badge>;
    }
    
    return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Pendente</Badge>;
  };

  const getSaleInfo = (saleId: string) => {
    return sales.find(s => s.id === saleId);
  };

  const getTotalValue = () => {
    return filteredInstallments.reduce((sum, inst) => sum + inst.amount, 0);
  };

  const getPendingValue = () => {
    return filteredInstallments
      .filter(inst => inst.status === 'pending')
      .reduce((sum, inst) => sum + inst.amount, 0);
  };

  const getReceivedValue = () => {
    return filteredInstallments
      .filter(inst => inst.status === 'received')
      .reduce((sum, inst) => sum + inst.amount, 0);
  };

  const getOverdueCount = () => {
    return filteredInstallments.filter(inst => 
      inst.status === 'pending' && new Date(inst.dueDate) < new Date()
    ).length;
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
          <h1 className="text-xl font-semibold text-green-600">Controle de Recebimentos</h1>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">A Receber</p>
                  <p className="text-lg font-bold text-blue-600">
                    {formatCurrency(getPendingValue())}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Recebido</p>
                  <p className="text-lg font-bold text-green-600">
                    {formatCurrency(getReceivedValue())}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Vencidas</p>
                  <p className="text-lg font-bold text-red-600">
                    {getOverdueCount()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-gray-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-lg font-bold">
                    {filteredInstallments.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="pending">Pendentes</SelectItem>
                    <SelectItem value="received">Recebidos</SelectItem>
                    <SelectItem value="overdue">Vencidos</SelectItem>
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
                    <SelectItem value="overdue">Vencidos</SelectItem>
                    <SelectItem value="thisWeek">Esta semana</SelectItem>
                    <SelectItem value="thisMonth">Este mês</SelectItem>
                    <SelectItem value="nextMonth">Próximo mês</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="propertyName">Empreendimento</Label>
                <Input
                  id="propertyName"
                  placeholder="Nome do empreendimento"
                  value={filters.propertyName}
                  onChange={(e) => handleFilterChange('propertyName', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dueDateFrom">Vencimento de</Label>
                <Input
                  id="dueDateFrom"
                  type="date"
                  value={filters.dueDateFrom}
                  onChange={(e) => handleFilterChange('dueDateFrom', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dueDateTo">Vencimento até</Label>
                <Input
                  id="dueDateTo"
                  type="date"
                  value={filters.dueDateTo}
                  onChange={(e) => handleFilterChange('dueDateTo', e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-4">
              <Button variant="outline" onClick={clearFilters}>
                Limpar Filtros
              </Button>
              <div className="text-sm text-gray-600">
                {filteredInstallments.length} parcela(s) • Total: {formatCurrency(getTotalValue())}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Installments List */}
        {filteredInstallments.length > 0 ? (
          <div className="space-y-4">
            {filteredInstallments.map((installment) => {
              const sale = getSaleInfo(installment.saleId);
              const isOverdue = installment.status === 'pending' && new Date(installment.dueDate) < new Date();
              
              return (
                <Card key={installment.id} className={`hover:shadow-md transition-shadow ${isOverdue ? 'border-red-200' : ''}`}>
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-lg flex items-center">
                              <Home className="h-4 w-4 mr-2 text-green-600" />
                              {sale?.propertyName}
                            </h3>
                            <p className="text-gray-600 mt-1">
                              Cliente: {sale?.clientName}
                            </p>
                          </div>
                          {getStatusBadge(installment)}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                          <div>
                            <p className="text-sm text-gray-500">Parcela</p>
                            <p className="font-semibold">
                              {installment.installmentNumber}/{sale?.totalInstallments}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Valor</p>
                            <p className="font-semibold text-green-600">
                              {formatCurrency(installment.amount)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Vencimento</p>
                            <p className={`font-medium ${isOverdue ? 'text-red-600' : ''}`}>
                              {formatDate(installment.dueDate)}
                              {isOverdue && ' (Vencida)'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">
                              {installment.status === 'received' ? 'Recebido em' : 'Status'}
                            </p>
                            <p className="font-medium">
                              {installment.status === 'received' && installment.receivedDate
                                ? formatDate(installment.receivedDate)
                                : installment.status === 'pending' ? 'Aguardando' : 'N/A'
                              }
                            </p>
                          </div>
                        </div>
                        
                        {installment.notes && (
                          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">
                              <strong>Observações:</strong> {installment.notes}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-2">
                        {installment.status === 'pending' && (
                          <Button
                            onClick={() => handleMarkAsReceived(installment)}
                            className="bg-green-600 hover:bg-green-700"
                            size="sm"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Marcar como Recebido
                          </Button>
                        )}
                        
                        {installment.status === 'received' && (
                          <Button
                            variant="outline"
                            onClick={() => handleMarkAsPending(installment.id)}
                            size="sm"
                            className="text-blue-600 border-blue-200 hover:bg-blue-50"
                          >
                            <Clock className="h-4 w-4 mr-1" />
                            Marcar como Pendente
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma parcela encontrada
              </h3>
              <p className="text-gray-600 mb-6">
                {installments.length === 0 
                  ? 'Você ainda não possui parcelas cadastradas.'
                  : 'Nenhuma parcela corresponde aos filtros aplicados.'
                }
              </p>
              <div className="space-x-4">
                <Button onClick={() => navigate('/nova-venda')} className="bg-green-600 hover:bg-green-700">
                  Cadastrar Nova Venda
                </Button>
                {installments.length > 0 && (
                  <Button variant="outline" onClick={clearFilters}>
                    Limpar Filtros
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Receive Payment Dialog */}
      <Dialog open={showReceiveDialog} onOpenChange={setShowReceiveDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Recebimento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedInstallment && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium">
                  {getSaleInfo(selectedInstallment.saleId)?.propertyName}
                </p>
                <p className="text-sm text-gray-600">
                  Parcela {selectedInstallment.installmentNumber} - {formatCurrency(selectedInstallment.amount)}
                </p>
                <p className="text-sm text-gray-600">
                  Vencimento: {formatDate(selectedInstallment.dueDate)}
                </p>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="receiveNotes">Observações (opcional)</Label>
              <Textarea
                id="receiveNotes"
                placeholder="Adicione observações sobre este recebimento..."
                value={receiveNotes}
                onChange={(e) => setReceiveNotes(e.target.value)}
                rows={3}
              />
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowReceiveDialog(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={confirmReceive}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Confirmar Recebimento
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
