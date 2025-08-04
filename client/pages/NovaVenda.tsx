import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { addSale, addInstallments, generateInstallments } from '@/lib/storage';
import { Sale } from '@shared/types';
import { ArrowLeft, Home, DollarSign, Calendar, Users } from 'lucide-react';

export default function NovaVenda() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    propertyName: '',
    clientName: '',
    totalValue: '',
    saleDate: '',
    totalInstallments: '',
    firstInstallmentDate: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.propertyName.trim()) {
      setError('Nome do empreendimento é obrigatório');
      return false;
    }
    
    if (!formData.clientName.trim()) {
      setError('Nome do cliente é obrigatório');
      return false;
    }
    
    const totalValue = parseFloat(formData.totalValue);
    if (!totalValue || totalValue <= 0) {
      setError('Valor total deve ser maior que zero');
      return false;
    }
    
    if (!formData.saleDate) {
      setError('Data da venda é obrigatória');
      return false;
    }
    
    const installments = parseInt(formData.totalInstallments);
    if (!installments || installments < 1 || installments > 240) {
      setError('Número de parcelas deve ser entre 1 e 240');
      return false;
    }
    
    if (!formData.firstInstallmentDate) {
      setError('Data da primeira parcela é obrigatória');
      return false;
    }
    
    // Validate that first installment date is not before sale date
    if (new Date(formData.firstInstallmentDate) < new Date(formData.saleDate)) {
      setError('Data da primeira parcela não pode ser anterior à data da venda');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('Usuário não autenticado');
      return;
    }
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const saleId = `sale_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const sale: Sale = {
        id: saleId,
        userId: user.id,
        propertyName: formData.propertyName.trim(),
        clientName: formData.clientName.trim(),
        totalValue: parseFloat(formData.totalValue),
        saleDate: formData.saleDate,
        totalInstallments: parseInt(formData.totalInstallments),
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Save sale
      addSale(sale);
      
      // Generate and save installments
      const installments = generateInstallments(sale, formData.firstInstallmentDate);
      addInstallments(installments);
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error) {
      setError('Erro ao cadastrar venda. Tente novamente.');
      console.error('Error creating sale:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateInstallmentValue = () => {
    const total = parseFloat(formData.totalValue);
    const installments = parseInt(formData.totalInstallments);
    
    if (total && installments) {
      return (total / installments).toFixed(2);
    }
    return '0.00';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard')}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-semibold text-green-600">Nova Venda</h1>
        </div>
      </header>
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <Home className="h-5 w-5 mr-2" />
              Cadastrar Nova Venda
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            {error && (
              <Alert className="mb-6 border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="propertyName" className="text-sm font-medium flex items-center">
                    <Home className="h-4 w-4 mr-1" />
                    Nome do Empreendimento
                  </Label>
                  <Input
                    id="propertyName"
                    type="text"
                    placeholder="Ex: Residencial Jardim das Flores"
                    value={formData.propertyName}
                    onChange={(e) => handleInputChange('propertyName', e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="clientName" className="text-sm font-medium flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    Nome do Cliente
                  </Label>
                  <Input
                    id="clientName"
                    type="text"
                    placeholder="Nome completo do cliente"
                    value={formData.clientName}
                    onChange={(e) => handleInputChange('clientName', e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="totalValue" className="text-sm font-medium flex items-center">
                    <DollarSign className="h-4 w-4 mr-1" />
                    Valor Total da Venda (R$)
                  </Label>
                  <Input
                    id="totalValue"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.totalValue}
                    onChange={(e) => handleInputChange('totalValue', e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="saleDate" className="text-sm font-medium flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Data da Venda
                  </Label>
                  <Input
                    id="saleDate"
                    type="date"
                    value={formData.saleDate}
                    onChange={(e) => handleInputChange('saleDate', e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="totalInstallments" className="text-sm font-medium">
                    Número de Parcelas
                  </Label>
                  <Input
                    id="totalInstallments"
                    type="number"
                    min="1"
                    max="240"
                    placeholder="12"
                    value={formData.totalInstallments}
                    onChange={(e) => handleInputChange('totalInstallments', e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="firstInstallmentDate" className="text-sm font-medium">
                    Data da Primeira Parcela
                  </Label>
                  <Input
                    id="firstInstallmentDate"
                    type="date"
                    value={formData.firstInstallmentDate}
                    onChange={(e) => handleInputChange('firstInstallmentDate', e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
              </div>
              
              {/* Preview section */}
              {formData.totalValue && formData.totalInstallments && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-6">
                    <h3 className="font-medium text-blue-900 mb-3">Resumo da Venda</h3>
                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-blue-700">Valor total:</span>
                        <span className="font-medium">
                          {new Intl.NumberFormat('pt-BR', { 
                            style: 'currency', 
                            currency: 'BRL' 
                          }).format(parseFloat(formData.totalValue) || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Parcelas:</span>
                        <span className="font-medium">{formData.totalInstallments}x</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Valor por parcela:</span>
                        <span className="font-medium">
                          {new Intl.NumberFormat('pt-BR', { 
                            style: 'currency', 
                            currency: 'BRL' 
                          }).format(parseFloat(calculateInstallmentValue()))}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              <div className="flex gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                  disabled={loading}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {loading ? 'Cadastrando...' : 'Cadastrar Venda'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
