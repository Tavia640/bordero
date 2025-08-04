import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { setMonthlyTarget, getMonthlyTarget } from '@/lib/storage';
import { Target, X, Check } from 'lucide-react';

interface MonthlyTargetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  currentMonth?: number;
  currentYear?: number;
}

export default function MonthlyTargetModal({
  isOpen,
  onClose,
  onSave,
  currentMonth = new Date().getMonth() + 1,
  currentYear = new Date().getFullYear()
}: MonthlyTargetModalProps) {
  const { user } = useAuth();
  const [target, setTarget] = useState<string>('');
  const [loading, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      const currentTarget = getMonthlyTarget(user.id, currentYear, currentMonth);
      setTarget(currentTarget > 0 ? currentTarget.toString() : '');
    }
  }, [isOpen, user, currentYear, currentMonth]);

  const handleSave = async () => {
    if (!user || !target) return;
    
    setSaving(true);
    try {
      const targetValue = parseFloat(target.replace(/[^\d,.-]/g, '').replace(',', '.'));
      if (targetValue > 0) {
        setMonthlyTarget(user.id, currentYear, currentMonth, targetValue);
        onSave();
        onClose();
      }
    } catch (error) {
      console.error('Erro ao salvar meta:', error);
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (value: string) => {
    const numericValue = value.replace(/[^\d]/g, '');
    const formatted = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0
    }).format(Number(numericValue) / 100);
    return formatted;
  };

  const handleTargetChange = (value: string) => {
    const numericValue = value.replace(/[^\d]/g, '');
    setTarget(numericValue);
  };

  const getMonthName = (month: number) => {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return months[month - 1];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <Target className="h-5 w-5 mr-2 text-green-600" />
              Definir Meta Mensal
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-gray-600">
            {getMonthName(currentMonth)} de {currentYear}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="target">Meta de Recebimento</Label>
            <div className="relative">
              <Input
                id="target"
                type="text"
                value={target ? formatCurrency(target) : ''}
                onChange={(e) => handleTargetChange(e.target.value)}
                placeholder="R$ 0,00"
                className="text-lg font-semibold"
              />
            </div>
            <p className="text-xs text-gray-500">
              Defina quanto você espera receber neste mês
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={!target || loading}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              Salvar Meta
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
