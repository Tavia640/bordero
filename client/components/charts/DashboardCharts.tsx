import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Chart color palette
const COLORS = {
  primary: '#10B981',    // Green
  secondary: '#3B82F6',  // Blue
  warning: '#F59E0B',    // Orange
  danger: '#EF4444',     // Red
  purple: '#8B5CF6',     // Purple
  teal: '#14B8A6',       // Teal
  pink: '#EC4899',       // Pink
  indigo: '#6366F1'      // Indigo
};

const CHART_COLORS = [
  COLORS.primary,
  COLORS.secondary,
  COLORS.warning,
  COLORS.danger,
  COLORS.purple,
  COLORS.teal
];

// Format currency for tooltips
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

// Format month names
const formatMonth = (monthStr: string) => {
  const date = new Date(monthStr + '-01');
  return date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
};

// Sales Trend Chart
interface SalesTrendChartProps {
  data: { month: string; sales: number; cancelled: number; revenue: number }[];
}

export function SalesTrendChart({ data }: SalesTrendChartProps) {
  const chartData = data.map(item => ({
    ...item,
    month: formatMonth(item.month)
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Tendência de Vendas (12 meses)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 5, bottom: 5 }}>
            <Line
              dataKey="sales"
              stroke={COLORS.primary}
              strokeWidth={3}
              name="Vendas"
              dot={false}
            />
            <Line
              dataKey="cancelled"
              stroke={COLORS.danger}
              strokeWidth={2}
              name="Canceladas"
              strokeDasharray="5 5"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// Revenue Chart
interface RevenueChartProps {
  data: { month: string; amount: number; count: number }[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  const chartData = data.slice(-12).map(item => ({
    ...item,
    month: formatMonth(item.month)
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Receita Mensal</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 5, bottom: 5 }}>
            <Area
              dataKey="amount"
              stroke={COLORS.primary}
              fill={COLORS.primary}
              fillOpacity={0.3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// Sales by Status Chart
interface SalesByStatusChartProps {
  data: { status: string; count: number; value: number }[];
}

export function SalesByStatusChart({ data }: SalesByStatusChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Vendas por Status</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              dataKey="count"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="flex justify-center mt-4 space-x-4">
          {data.map((entry, index) => (
            <div key={entry.status} className="flex items-center">
              <div
                className="w-3 h-3 rounded mr-2"
                style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
              />
              <span className="text-xs">{entry.status} ({entry.count})</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Receivables Timeline Chart
interface ReceivablesTimelineProps {
  data: { month: string; amount: number }[];
}

export function ReceivablesTimeline({ data }: ReceivablesTimelineProps) {
  const chartData = data.slice(0, 12).map(item => ({
    ...item,
    month: formatMonth(item.month)
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Cronograma de Recebimentos</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: 5, bottom: 5 }}>
            <Bar
              dataKey="amount"
              fill={COLORS.secondary}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// Top Properties Chart
interface TopPropertiesChartProps {
  data: { name: string; sales: number; revenue: number }[];
}

export function TopPropertiesChart({ data }: TopPropertiesChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Top Empreendimentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-gray-500">
            Nenhum dado disponível
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Top 5 Empreendimentos</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout="horizontal" margin={{ top: 5, right: 20, left: 80, bottom: 5 }}>
            <Bar
              dataKey="revenue"
              fill={COLORS.primary}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
