// Script para limpar dados fictícios do sistema profissional
export const clearAllSystemData = () => {
  // Remover dados fictícios de vendas
  localStorage.removeItem("property_sales");
  localStorage.removeItem("property_installments");
  localStorage.removeItem("monthly_targets");

  // Limpar tentativas de login fictícias
  localStorage.removeItem("login_attempts");

  // Remover dados de recuperação de senha de demonstração
  localStorage.removeItem("password_reset_success");

  // Remover flag de limpeza para permitir nova limpeza se necessário
  localStorage.removeItem("professional_system_cleaned");

  // Limpar cache do navegador de dados antigos
  const keysToRemove = Object.keys(localStorage).filter(
    (key) =>
      key.includes("sales") ||
      key.includes("installment") ||
      key.includes("target") ||
      key.includes("demo") ||
      key.includes("seed") ||
      key.includes("example"),
  );

  keysToRemove.forEach((key) => localStorage.removeItem(key));

  console.log("✅ Sistema completamente limpo para uso profissional");
};

// Executar limpeza apenas uma vez, depois permitir dados reais
export const initializeProfessionalSystem = () => {
  const hasBeenCleaned = localStorage.getItem("professional_system_cleaned");

  if (!hasBeenCleaned) {
    clearAllSystemData();
    localStorage.setItem("professional_system_cleaned", "true");
    console.log("✅ Sistema profissional inicializado e limpo (primeira vez)");
  } else {
    console.log(
      "🔄 Sistema profissional já inicializado - permitindo dados reais",
    );
  }
};
