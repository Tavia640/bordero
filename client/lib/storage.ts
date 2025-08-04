import {
  Sale,
  Installment,
  DashboardMetrics,
  MonthlyTarget,
} from "@shared/types";

const SALES_KEY = "property_sales";
const INSTALLMENTS_KEY = "property_installments";
const TARGETS_KEY = "monthly_targets";

// Sales operations
export const saveSales = (sales: Sale[]): void => {
  localStorage.setItem(SALES_KEY, JSON.stringify(sales));
};

export const getSales = (): Sale[] => {
  const sales = localStorage.getItem(SALES_KEY);
  return sales ? JSON.parse(sales) : [];
};

export const addSale = (sale: Sale): void => {
  console.log("💾 Salvando venda:", sale);
  const sales = getSales();
  console.log("📋 Vendas existentes:", sales.length);
  sales.push(sale);
  saveSales(sales);
  console.log("✅ Venda salva! Total de vendas:", sales.length);
};

export const updateSale = (saleId: string, updates: Partial<Sale>): void => {
  const sales = getSales();
  const index = sales.findIndex((s) => s.id === saleId);
  if (index !== -1) {
    sales[index] = {
      ...sales[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    saveSales(sales);

    // Se a venda foi cancelada, cancelar todas as parcelas pendentes
    if (updates.status === "cancelled") {
      const installments = getInstallments();
      const updatedInstallments = installments.map((installment) => {
        if (installment.saleId === saleId && installment.status === "pending") {
          return {
            ...installment,
            status: "cancelled" as const,
            updatedAt: new Date().toISOString(),
          };
        }
        return installment;
      });
      saveInstallments(updatedInstallments);
      console.log(
        `🚫 Venda ${saleId} cancelada - ${updatedInstallments.filter((i) => i.saleId === saleId && i.status === "cancelled").length} parcelas canceladas`,
      );
    }
  }
};

export const deleteSale = (saleId: string): void => {
  const sales = getSales().filter((s) => s.id !== saleId);
  saveSales(sales);
  // Also delete related installments
  const installments = getInstallments().filter((i) => i.saleId !== saleId);
  saveInstallments(installments);
};

export const archiveSale = (saleId: string): { success: boolean } => {
  try {
    updateSale(saleId, { status: "completed" });
    console.log(`📂 Venda ${saleId} arquivada`);
    return { success: true };
  } catch (error) {
    console.error("❌ Erro ao arquivar venda:", error);
    return { success: false };
  }
};

export const cancelSale = (
  saleId: string,
): {
  success: boolean;
  cancelledInstallments: number;
  cancelledAmount: number;
} => {
  try {
    const sales = getSales();
    const saleIndex = sales.findIndex((s) => s.id === saleId);

    if (saleIndex === -1) {
      return { success: false, cancelledInstallments: 0, cancelledAmount: 0 };
    }

    // Cancelar a venda
    sales[saleIndex] = {
      ...sales[saleIndex],
      status: "cancelled",
      updatedAt: new Date().toISOString(),
    };
    saveSales(sales);

    // Cancelar todas as parcelas pendentes relacionadas
    const installments = getInstallments();
    let cancelledCount = 0;
    let cancelledAmount = 0;

    const updatedInstallments = installments.map((installment) => {
      if (installment.saleId === saleId && installment.status === "pending") {
        cancelledCount++;
        cancelledAmount += installment.amount;
        return {
          ...installment,
          status: "cancelled" as const,
          updatedAt: new Date().toISOString(),
        };
      }
      return installment;
    });

    saveInstallments(updatedInstallments);

    console.log(`✅ Venda ${saleId} cancelada:`, {
      cancelledInstallments: cancelledCount,
      cancelledAmount: cancelledAmount,
      totalValue: sales[saleIndex].totalValue,
    });

    return {
      success: true,
      cancelledInstallments: cancelledCount,
      cancelledAmount: cancelledAmount,
    };
  } catch (error) {
    console.error("❌ Erro ao cancelar venda:", error);
    return { success: false, cancelledInstallments: 0, cancelledAmount: 0 };
  }
};

// Targets operations
export const saveTargets = (targets: MonthlyTarget[]): void => {
  localStorage.setItem(TARGETS_KEY, JSON.stringify(targets));
};

export const getTargets = (): MonthlyTarget[] => {
  const targets = localStorage.getItem(TARGETS_KEY);
  return targets ? JSON.parse(targets) : [];
};

export const setMonthlyTarget = (
  userId: string,
  year: number,
  month: number,
  target: number,
): void => {
  const targets = getTargets();
  const existingIndex = targets.findIndex(
    (t) => t.userId === userId && t.year === year && t.month === month,
  );

  const targetData: MonthlyTarget = {
    id: existingIndex >= 0 ? targets[existingIndex].id : `target_${Date.now()}`,
    userId,
    year,
    month,
    target,
    createdAt:
      existingIndex >= 0
        ? targets[existingIndex].createdAt
        : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    targets[existingIndex] = targetData;
  } else {
    targets.push(targetData);
  }

  saveTargets(targets);
};

export const getMonthlyTarget = (
  userId: string,
  year: number,
  month: number,
): number => {
  const targets = getTargets();
  const target = targets.find(
    (t) => t.userId === userId && t.year === year && t.month === month,
  );
  return target ? target.target : 0;
};

// Installments operations
export const saveInstallments = (installments: Installment[]): void => {
  localStorage.setItem(INSTALLMENTS_KEY, JSON.stringify(installments));
};

export const getInstallments = (): Installment[] => {
  const installments = localStorage.getItem(INSTALLMENTS_KEY);
  return installments ? JSON.parse(installments) : [];
};

export const addInstallments = (installments: Installment[]): void => {
  console.log("💾 Salvando parcelas:", installments.length);
  const existing = getInstallments();
  console.log("📋 Parcelas existentes:", existing.length);
  const updated = [...existing, ...installments];
  saveInstallments(updated);
  console.log("✅ Parcelas salvas! Total:", updated.length);
};

export const updateInstallment = (
  installmentId: string,
  updates: Partial<Installment>,
): void => {
  const installments = getInstallments();
  const index = installments.findIndex((i) => i.id === installmentId);
  if (index !== -1) {
    installments[index] = {
      ...installments[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    saveInstallments(installments);
  }
};

// Clear all fictitious data for professional use
export const clearAllData = (): void => {
  localStorage.removeItem(SALES_KEY);
  localStorage.removeItem(INSTALLMENTS_KEY);
  localStorage.removeItem(TARGETS_KEY);
};

// Analytics and metrics
export const getDashboardMetrics = (
  userId: string,
  filters?: { period?: string; year?: number; month?: number },
): DashboardMetrics => {
  const allSales = getSales().filter((s) => s.userId === userId);
  const allInstallments = getInstallments();

  // Apply filters if provided
  let sales = allSales;
  if (filters?.period && filters.period !== "all") {
    const now = new Date();
    let startDate: Date;

    switch (filters.period) {
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        if (filters.year && filters.month) {
          startDate = new Date(filters.year, filters.month - 1, 1);
          const endDate = new Date(filters.year, filters.month, 0);
          sales = sales.filter((s) => {
            const saleDate = new Date(s.saleDate);
            return saleDate >= startDate && saleDate <= endDate;
          });
        } else {
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          sales = sales.filter((s) =>
            s.saleDate.startsWith(now.toISOString().slice(0, 7)),
          );
        }
        break;
      case "quarter":
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        break;
      case "year":
        const year = filters.year || now.getFullYear();
        sales = sales.filter((s) => s.saleDate.startsWith(year.toString()));
        break;
    }
  }

  const installments = allInstallments.filter((installment) => {
    const sale = allSales.find((s) => s.id === installment.saleId);
    return sale && sales.some((s) => s.id === sale.id);
  });

  // Basic metrics (excluir vendas canceladas)
  const activeSalesForTotal = sales.filter(
    (sale) => sale.status !== "cancelled",
  );
  const totalSales = activeSalesForTotal.reduce(
    (sum, sale) => sum + sale.totalValue,
    0,
  );

  console.log("📊 Cálculo de vendas:", {
    totalVendas: sales.length,
    vendasCanceladas: sales.filter((s) => s.status === "cancelled").length,
    vendasAtivas: activeSalesForTotal.length,
    valorTotalAtivo: totalSales,
  });
  const totalReceived = installments
    .filter((i) => i.status === "received")
    .reduce((sum, i) => sum + i.amount, 0);

  const totalToReceive = installments
    .filter((i) => i.status === "pending")
    .reduce((sum, i) => sum + i.amount, 0);

  const pendingInstallments = installments.filter(
    (i) => i.status === "pending",
  ).length;
  const overdueInstallments = installments.filter(
    (i) => i.status === "pending" && new Date(i.dueDate) < new Date(),
  ).length;

  const now = new Date();
  const thisMonth = now.toISOString().slice(0, 7);
  const salesThisMonth = allSales
    .filter((s) => s.saleDate.startsWith(thisMonth) && s.status !== "cancelled")
    .reduce((sum, s) => sum + s.totalValue, 0);

  const receivedThisMonth = allInstallments
    .filter(
      (i) => i.status === "received" && i.receivedDate?.startsWith(thisMonth),
    )
    .reduce((sum, i) => sum + i.amount, 0);

  // Calcular o que vai receber este mês (vendas do mês anterior que viram recebimento)
  const toReceiveThisMonth = allInstallments
    .filter((i) => {
      const installmentMonth = i.dueDate.slice(0, 7);
      return i.status === "pending" && installmentMonth === thisMonth;
    })
    .reduce((sum, i) => sum + i.amount, 0);

  // Calcular o que vai receber no próximo mês
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    .toISOString()
    .slice(0, 7);
  const toReceiveNextMonth = allInstallments
    .filter((i) => {
      const installmentMonth = i.dueDate.slice(0, 7);
      return i.status === "pending" && installmentMonth === nextMonth;
    })
    .reduce((sum, i) => sum + i.amount, 0);

  // Buscar meta mensal
  const monthlyTarget = getMonthlyTarget(
    userId,
    now.getFullYear(),
    now.getMonth() + 1,
  );
  const targetAchievement =
    monthlyTarget > 0 ? (receivedThisMonth / monthlyTarget) * 100 : 0;

  // Advanced metrics
  const cancelledSales = allSales.filter((s) => s.status === "cancelled");
  const cancelledSalesCount = cancelledSales.length;
  const cancelledSalesValue = cancelledSales.reduce(
    (sum, s) => sum + s.totalValue,
    0,
  );
  const cancellationRate =
    allSales.length > 0 ? (cancelledSalesCount / allSales.length) * 100 : 0;

  const activeSales = allSales.filter((s) => s.status === "active");
  const averageTicket =
    activeSales.length > 0
      ? activeSales.reduce((sum, s) => sum + s.totalValue, 0) /
        activeSales.length
      : 0;

  // Calculate projections based on recent trends
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return date.toISOString().slice(0, 7);
  });

  const recentMonthlyRevenue = last6Months.map((month) => {
    return allInstallments
      .filter((i) => {
        const installmentMonth = i.dueDate.slice(0, 7);
        const sale = allSales.find((s) => s.id === i.saleId);
        return (
          installmentMonth === month &&
          sale &&
          sale.status !== "cancelled" &&
          i.status === "received"
        );
      })
      .reduce((sum, i) => sum + i.amount, 0);
  });

  const avgMonthlyRevenue = recentMonthlyRevenue.reduce((a, b) => a + b, 0) / 6;
  const projectedMonthlyRevenue =
    monthlyTarget > 0 ? monthlyTarget : avgMonthlyRevenue;
  const projectedYearlyRevenue = projectedMonthlyRevenue * 12;

  // Growth rate calculation
  const thisMonthRevenue = recentMonthlyRevenue[0] || 0;
  const lastMonthRevenue = recentMonthlyRevenue[1] || 0;
  const monthlyGrowthRate =
    lastMonthRevenue > 0
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
      : 0;

  // Top performing properties
  const propertyStats: { [key: string]: { sales: number; revenue: number } } =
    {};
  allSales
    .filter((s) => s.status !== "cancelled")
    .forEach((sale) => {
      if (!propertyStats[sale.propertyName]) {
        propertyStats[sale.propertyName] = { sales: 0, revenue: 0 };
      }
      propertyStats[sale.propertyName].sales += 1;
      propertyStats[sale.propertyName].revenue += sale.totalValue;
    });

  const topPerformingProperties = Object.entries(propertyStats)
    .map(([name, stats]) => ({
      name,
      sales: stats.sales,
      revenue: stats.revenue,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Sales by status
  const statusStats = {
    active: allSales.filter((s) => s.status === "active"),
    completed: allSales.filter((s) => s.status === "completed"),
    cancelled: allSales.filter((s) => s.status === "cancelled"),
  };

  const salesByStatus = Object.entries(statusStats).map(([status, sales]) => ({
    status:
      status === "active"
        ? "Ativas"
        : status === "completed"
          ? "Concluídas"
          : "Canceladas",
    count: sales.length,
    value: sales.reduce((sum, s) => sum + s.totalValue, 0),
  }));

  // Monthly trends (last 12 months)
  const last12Months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return date.toISOString().slice(0, 7);
  }).reverse();

  const monthlyTrends = last12Months.map((month) => {
    const monthSales = allSales.filter((s) => s.saleDate.startsWith(month));
    return {
      month,
      sales: monthSales.filter((s) => s.status !== "cancelled").length,
      cancelled: monthSales.filter((s) => s.status === "cancelled").length,
      revenue: monthSales
        .filter((s) => s.status !== "cancelled")
        .reduce((sum, s) => sum + s.totalValue, 0),
    };
  });

  // Sales by month for chart
  const salesByMonth = monthlyTrends.map((trend) => ({
    month: trend.month,
    amount: trend.revenue,
    count: trend.sales,
  }));

  // Receivables by month for chart
  const receivablesByMonth: { [key: string]: number } = {};
  allInstallments
    .filter((i) => i.status === "pending")
    .forEach((installment) => {
      const month = installment.dueDate.slice(0, 7);
      if (!receivablesByMonth[month]) {
        receivablesByMonth[month] = 0;
      }
      receivablesByMonth[month] += installment.amount;
    });

  return {
    totalSales,
    totalToReceive,
    totalReceived,
    pendingInstallments,
    overdueInstallments,
    salesThisMonth,
    receivedThisMonth,
    toReceiveThisMonth,
    toReceiveNextMonth,
    salesByMonth,
    receivablesByMonth: Object.entries(receivablesByMonth)
      .map(([month, amount]) => ({
        month,
        amount,
      }))
      .sort((a, b) => a.month.localeCompare(b.month)),
    // Advanced metrics
    cancelledSalesCount,
    cancelledSalesValue,
    cancellationRate,
    averageTicket,
    conversionRate: 100 - cancellationRate, // Simple conversion rate
    projectedMonthlyRevenue,
    projectedYearlyRevenue,
    monthlyTarget,
    targetAchievement,
    monthlyGrowthRate,
    topPerformingProperties,
    salesByStatus,
    monthlyTrends,
  };
};

// Generate installments for a sale (recebimento começa no mês seguinte)
export const generateInstallments = (
  sale: Sale,
  firstInstallmentDate?: string,
): Installment[] => {
  const installments: Installment[] = [];
  const installmentAmount = sale.totalValue / sale.totalInstallments;

  // Se não especificado, primeira parcela é no mês seguinte à venda
  const saleDate = new Date(sale.saleDate);
  const startDate = firstInstallmentDate
    ? new Date(firstInstallmentDate)
    : new Date(saleDate.getFullYear(), saleDate.getMonth() + 1, 15); // dia 15 do mês seguinte

  for (let i = 1; i <= sale.totalInstallments; i++) {
    const dueDate = new Date(startDate);
    dueDate.setMonth(dueDate.getMonth() + (i - 1));

    installments.push({
      id: `inst_${sale.id}_${i}`,
      saleId: sale.id,
      installmentNumber: i,
      amount: installmentAmount,
      dueDate: dueDate.toISOString().split("T")[0],
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  return installments;
};
