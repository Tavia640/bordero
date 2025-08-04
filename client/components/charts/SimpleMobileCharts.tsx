import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Target } from 'lucide-react';

// Format currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

// Simple Bar Chart using CSS
interface SimpleBarsProps {
  data: { label: string; value: number; color?: string }[];
  maxValue?: number;
}

export function SimpleBars({ data, maxValue }: SimpleBarsProps) {
  const max = maxValue || Math.max(...data.map(d => d.value));
  
  return (
    <div className="space-y-3">
      {data.map((item, index) => (
        <div key={index} className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="font-medium">{item.label}</span>
            <span className="text-gray-600">{formatCurrency(item.value)}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-500"
              style={{
                width: `${(item.value / max) * 100}%`,
                backgroundColor: item.color || '#10B981'
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// Simple Progress Ring
interface ProgressRingProps {
  percentage: number;
  color?: string;
  size?: number;
  strokeWidth?: number;
  label?: string;
}

export function ProgressRing({ 
  percentage, 
  color = '#10B981', 
  size = 100, 
  strokeWidth = 8,
  label 
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg
          height={size}
          width={size}
          className="transform -rotate-90"
        >
          <circle
            stroke="#e5e7eb"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          <circle
            stroke={color}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            r={radius}
            cx={size / 2}
            cy={size / 2}
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold" style={{ color }}>
            {Math.round(percentage)}%
          </span>
        </div>
      </div>
      {label && (
        <span className="text-sm text-gray-600 mt-2 text-center">{label}</span>
      )}
    </div>
  );
}

// Simple Trend Line using CSS
interface SimpleTrendProps {
  data: { label: string; value: number }[];
  color?: string;
}

export function SimpleTrend({ data, color = '#10B981' }: SimpleTrendProps) {
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-xs text-gray-500">
        <span>Máx: {formatCurrency(maxValue)}</span>
        <span>Mín: {formatCurrency(minValue)}</span>
      </div>
      
      <div className="relative h-24 flex items-end space-x-1">
        {data.map((item, index) => {
          const height = ((item.value - minValue) / range) * 100;
          return (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div
                className="w-full rounded-t-sm transition-all duration-500"
                style={{
                  height: `${Math.max(height, 5)}%`,
                  backgroundColor: color,
                  opacity: 0.8
                }}
              />
              <span className="text-xs text-gray-500 mt-1 text-center">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Mobile-optimized charts
interface MobileSalesOverviewProps {
  totalSales: number;
  totalReceived: number;
  totalToReceive: number;
  cancellationRate: number;
}

export function MobileSalesOverview({
  totalSales,
  totalReceived,
  totalToReceive,
  cancellationRate
}: MobileSalesOverviewProps) {
  const receivedPercentage = totalSales > 0 ? (totalReceived / totalSales) * 100 : 0;

  if (totalSales === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Visão Geral</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            Nenhuma venda registrada
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Visão Geral</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <ProgressRing
            percentage={receivedPercentage}
            color="#10B981"
            label="Recebido"
            size={80}
          />
          <ProgressRing
            percentage={100 - cancellationRate}
            color="#3B82F6"
            label="Taxa Sucesso"
            size={80}
          />
        </div>
        
        <SimpleBars
          data={[
            { label: 'Total Vendas', value: totalSales, color: '#10B981' },
            { label: 'Já Recebido', value: totalReceived, color: '#3B82F6' },
            { label: 'A Receber', value: totalToReceive, color: '#F59E0B' }
          ]}
        />
      </CardContent>
    </Card>
  );
}

interface MobileTopPropertiesProps {
  data: { name: string; sales: number; revenue: number }[];
}

export function MobileTopProperties({ data }: MobileTopPropertiesProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Top Empreendimentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            Nenhum dado disponível
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Top Empreendimentos</CardTitle>
      </CardHeader>
      <CardContent>
        <SimpleBars
          data={data.slice(0, 5).map(item => ({
            label: item.name,
            value: item.revenue,
            color: '#10B981'
          }))}
        />
      </CardContent>
    </Card>
  );
}

interface MobileTrendChartProps {
  data: { month: string; sales: number; revenue: number }[];
}

export function MobileTrendChart({ data }: MobileTrendChartProps) {
  const formatMonth = (monthStr: string) => {
    const date = new Date(monthStr + '-01');
    return date.toLocaleDateString('pt-BR', { month: 'short' });
  };

  const trendData = data.slice(-6).map(item => ({
    label: formatMonth(item.month),
    value: item.revenue || 0
  }));

  if (trendData.every(item => item.value === 0)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tendência de Receita</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            Nenhuma receita registrada
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Tendência de Receita</CardTitle>
      </CardHeader>
      <CardContent>
        <SimpleTrend data={trendData} color="#10B981" />
      </CardContent>
    </Card>
  );
}

interface MobileReceivablesChartProps {
  data: { month: string; amount: number }[];
  targetAchievement?: number;
  currentTarget?: number;
}

export function MobileReceivablesChart({ data, targetAchievement = 0, currentTarget = 0 }: MobileReceivablesChartProps) {
  const maxAmount = data.length > 0 ? Math.max(...data.map(d => d.amount)) : 0;
  const currentMonth = new Date().toISOString().slice(0, 7);

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            Recebimentos por Mês
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            Nenhum recebimento previsto
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center">
          <Calendar className="h-4 w-4 mr-2" />
          Recebimentos por Mês
        </CardTitle>
        {currentTarget > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <Target className="h-3 w-3 text-green-600" />
            <span className="text-gray-600">Meta:</span>
            <span className="font-semibold text-green-600">
              {formatCurrency(currentTarget)}
            </span>
            <span className={`text-xs px-2 py-1 rounded-full ${
              targetAchievement >= 100
                ? 'bg-green-100 text-green-700'
                : targetAchievement >= 70
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-red-100 text-red-700'
            }`}>
              {targetAchievement.toFixed(0)}%
            </span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.slice(-6).map((item, index) => {
            const month = new Date(item.month + '-01').toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
            const amountPercent = maxAmount > 0 ? (item.amount / maxAmount) * 100 : 0;
            const isCurrentMonth = item.month === currentMonth;

            // Só mostrar meses que têm valor ou é o mês atual
            if (item.amount === 0 && !isCurrentMonth) return null;

            return (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${isCurrentMonth ? 'text-blue-600' : ''}`}>
                      {month}
                    </span>
                    {isCurrentMonth && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        Atual
                      </span>
                    )}
                  </div>
                  <span className={`font-semibold text-base ${
                    isCurrentMonth ? 'text-blue-600' : item.amount > 0 ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    {formatCurrency(item.amount)}
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      isCurrentMonth ? 'bg-blue-500' : 'bg-green-500'
                    }`}></div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          isCurrentMonth ? 'bg-blue-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${amountPercent}%` }}
                      ></div>
                    </div>
                  </div>
                  {isCurrentMonth && currentTarget > 0 && (
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <div className="flex-1 bg-gray-200 rounded-full h-1">
                        <div
                          className="bg-gray-400 h-1 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(targetAchievement, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-600">
                        {targetAchievement.toFixed(0)}% da meta
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
