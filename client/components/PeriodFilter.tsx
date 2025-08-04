import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, TrendingUp } from 'lucide-react';

interface PeriodFilterProps {
  selectedPeriod: string;
  selectedYear?: number;
  selectedMonth?: number;
  onPeriodChange: (period: string) => void;
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
}

export function PeriodFilter({
  selectedPeriod,
  selectedYear,
  selectedMonth,
  onPeriodChange,
  onYearChange,
  onMonthChange
}: PeriodFilterProps) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  
  const months = [
    { value: 1, label: 'Janeiro' },
    { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' },
    { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' },
    { value: 12, label: 'Dezembro' }
  ];

  const periodOptions = [
    { value: 'week', label: 'Última Semana' },
    { value: 'month', label: 'Este Mês' },
    { value: 'quarter', label: 'Trimestre' },
    { value: 'year', label: 'Este Ano' },
    { value: 'all', label: 'Todo Período' }
  ];

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <span className="font-medium text-gray-700">Período de Análise:</span>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Period buttons for quick selection */}
            <div className="flex gap-2">
              {periodOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={selectedPeriod === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPeriodChange(option.value)}
                  className={selectedPeriod === option.value ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  {option.label}
                </Button>
              ))}
            </div>
            
            {/* Year and month selectors for detailed filtering */}
            {(selectedPeriod === 'month' || selectedPeriod === 'year') && (
              <div className="flex items-center gap-2 ml-4 pl-4 border-l border-gray-200">
                <Calendar className="h-4 w-4 text-gray-500" />
                
                <Select 
                  value={selectedYear?.toString() || currentYear.toString()} 
                  onValueChange={(value) => onYearChange(parseInt(value))}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue placeholder="Ano" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map(year => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {selectedPeriod === 'month' && (
                  <Select 
                    value={selectedMonth?.toString() || new Date().getMonth().toString()} 
                    onValueChange={(value) => onMonthChange(parseInt(value))}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Mês" />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map(month => (
                        <SelectItem key={month.value} value={month.value.toString()}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-4 text-sm text-gray-600">
          {selectedPeriod === 'week' && 'Exibindo dados dos últimos 7 dias'}
          {selectedPeriod === 'month' && selectedYear && selectedMonth && 
            `Exibindo dados de ${months.find(m => m.value === selectedMonth)?.label} de ${selectedYear}`
          }
          {selectedPeriod === 'month' && (!selectedYear || !selectedMonth) && 'Exibindo dados do mês atual'}
          {selectedPeriod === 'quarter' && 'Exibindo dados do trimestre atual'}
          {selectedPeriod === 'year' && selectedYear && `Exibindo dados de ${selectedYear}`}
          {selectedPeriod === 'year' && !selectedYear && 'Exibindo dados do ano atual'}
          {selectedPeriod === 'all' && 'Exibindo todos os dados disponíveis'}
        </div>
      </CardContent>
    </Card>
  );
}
