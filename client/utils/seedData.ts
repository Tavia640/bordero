import {
  addSale,
  addInstallments,
  generateInstallments,
  setMonthlyTarget,
} from "@/lib/storage";
import { Sale } from "@shared/types";

// ARQUIVO DESABILITADO - Sistema profissional
// Este sistema é para uso profissional de consultores de multipropriedade
// Não deve conter dados fictícios

export const seedExampleData = (userId: string) => {
  console.warn("⚠️ Sistema profissional - dados fictícios desabilitados");
  return {
    totalSales: 0,
    activeSales: 0,
    cancelledSales: 0,
    totalValue: 0,
  };

  // Definir metas mensais para os próximos 6 meses
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const targetDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const target = 50000 + Math.random() * 30000; // Meta entre 50k e 80k
    setMonthlyTarget(
      userId,
      targetDate.getFullYear(),
      targetDate.getMonth() + 1,
      target,
    );
  }

  // Criar vendas de exemplo dos últimos 6 meses
  const properties = [
    "Residencial Jardim das Flores",
    "Condomínio Vila Verde",
    "Edifício Solar do Parque",
    "Residencial Bela Vista",
    "Condomínio Alameda",
    "Vila dos Pássaros",
    "Residencial Primavera",
    "Torres do Lago",
  ];

  const clients = [
    "João Silva Santos",
    "Maria Oliveira Costa",
    "Pedro Henrique Lima",
    "Ana Paula Ferreira",
    "Carlos Eduardo Souza",
    "Fernanda Santos",
    "Roberto Almeida",
    "Juliana Pereira",
    "Lucas Martins",
    "Camila Rodriguez",
  ];

  const sales: Sale[] = [];

  // Gerar vendas dos últimos 6 meses
  for (let monthOffset = 5; monthOffset >= 0; monthOffset--) {
    const numSales = Math.floor(Math.random() * 8) + 3; // 3-10 vendas por mês

    for (let i = 0; i < numSales; i++) {
      const saleDate = new Date();
      saleDate.setMonth(saleDate.getMonth() - monthOffset);
      saleDate.setDate(Math.floor(Math.random() * 28) + 1);

      const totalValue = Math.floor(Math.random() * 400000) + 150000; // Entre 150k e 550k
      const installments = [12, 24, 36, 48, 60, 72, 84, 96, 120][
        Math.floor(Math.random() * 9)
      ];

      // Algumas vendas podem ser canceladas (10% de chance)
      const status = Math.random() < 0.1 ? "cancelled" : "active";

      const sale: Sale = {
        id: `sale_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        propertyName: properties[Math.floor(Math.random() * properties.length)],
        clientName: clients[Math.floor(Math.random() * clients.length)],
        totalValue,
        saleDate: saleDate.toISOString().split("T")[0],
        totalInstallments: installments,
        status,
        createdAt: saleDate.toISOString(),
        updatedAt: saleDate.toISOString(),
      };

      sales.push(sale);
      addSale(sale);

      // Gerar parcelas
      const installmentsList = generateInstallments(sale);

      // Simular alguns recebimentos (parcelas pagas) apenas se não for venda cancelada
      if (status !== "cancelled") {
        const now = new Date();
        installmentsList.forEach((installment) => {
          const dueDate = new Date(installment.dueDate);

          // Se a data de vencimento já passou, há 85% de chance de ter sido paga
          if (dueDate < now && Math.random() < 0.85) {
            installment.status = "received";
            installment.receivedDate = dueDate.toISOString().split("T")[0];
          }
          // Se venceu há mais de 30 dias e não foi paga, marcar como vencida
          else if (
            dueDate < new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          ) {
            installment.status = "overdue";
          }
          // Garantir que há parcelas pendentes para os próximos meses
        });
      }

      addInstallments(installmentsList);
    }
  }

  console.log(`�� Dados de exemplo criados: ${sales.length} vendas`);

  // Retornar um resumo
  return {
    totalSales: sales.length,
    activeSales: sales.filter((s) => s.status === "active").length,
    cancelledSales: sales.filter((s) => s.status === "cancelled").length,
    totalValue: sales.reduce((sum, s) => sum + s.totalValue, 0),
  };
};
