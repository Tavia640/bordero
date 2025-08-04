export interface Sale {
  id: string;
  userId: string;
  propertyName: string;
  clientName: string;
  totalValue: number;
  saleDate: string;
  totalInstallments: number;
  status: "active" | "cancelled" | "completed";
  createdAt: string;
  updatedAt: string;
}

export interface Installment {
  id: string;
  saleId: string;
  installmentNumber: number;
  amount: number;
  dueDate: string;
  status: "pending" | "received" | "overdue" | "cancelled";
  receivedDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardMetrics {
  totalSales: number;
  totalToReceive: number;
  totalReceived: number;
  pendingInstallments: number;
  overdueInstallments: number;
  salesThisMonth: number;
  receivedThisMonth: number;
  toReceiveThisMonth: number;
  toReceiveNextMonth: number;
  salesByMonth: { month: string; amount: number; count: number }[];
  receivablesByMonth: { month: string; amount: number }[];
  // Advanced metrics
  cancelledSalesCount: number;
  cancelledSalesValue: number;
  cancellationRate: number;
  averageTicket: number;
  conversionRate: number;
  projectedMonthlyRevenue: number;
  projectedYearlyRevenue: number;
  monthlyTarget: number;
  monthlyGrowthRate: number;
  targetAchievement: number;
  topPerformingProperties: { name: string; sales: number; revenue: number }[];
  salesByStatus: { status: string; count: number; value: number }[];
  monthlyTrends: {
    month: string;
    sales: number;
    cancelled: number;
    revenue: number;
  }[];
}

export interface SaleFormData {
  propertyName: string;
  clientName: string;
  totalValue: number;
  saleDate: string;
  totalInstallments: number;
  installmentAmount: number;
  firstInstallmentDate: string;
}

export interface SaleFilters {
  dateFrom?: string;
  dateTo?: string;
  status?: Sale["status"];
  propertyName?: string;
  period?: "day" | "month" | "year";
}

export interface InstallmentFilters {
  status?: Installment["status"];
  dueDateFrom?: string;
  dueDateTo?: string;
  saleId?: string;
}

export interface DashboardFilters {
  period: "week" | "month" | "quarter" | "year" | "all";
  year?: number;
  month?: number;
  customDateFrom?: string;
  customDateTo?: string;
}

export interface MonthlyTarget {
  id: string;
  userId: string;
  year: number;
  month: number;
  target: number;
  createdAt: string;
  updatedAt: string;
}
