import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LocalAuthService from "@/lib/localAuth";
import Logger from "@/lib/logger";

export default function AuthTest() {
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runFullTest = async () => {
    setTestResults([]);
    addResult('🚀 Iniciando teste completo do sistema de autenticação...');

    // 1. Limpar tudo
    addResult('🧹 Limpando dados existentes...');
    localStorage.removeItem('local_auth_users');
    localStorage.removeItem('current_user_session');
    localStorage.removeItem('login_attempts');

    // 2. Inicializar usuários
    addResult('👥 Inicializando usuários demo...');
    LocalAuthService.initializeUsers();

    // 3. Verificar usuários criados
    const users = (LocalAuthService as any).getStoredUsers();
    addResult(`📊 Usuários criados: ${users.length}`);
    users.forEach((user: any) => {
      addResult(`   - ${user.email} (hash: ${user.passwordHash.substring(0, 10)}...)`);
    });

    // 4. Testar login
    const testCredentials = [
      { email: 'admin@vendas.com', password: 'Admin123!' },
      { email: 'vendedor@vendas.com', password: 'Vendas2024!' }
    ];

    for (const cred of testCredentials) {
      addResult(`🔐 Testando login: ${cred.email}`);
      
      try {
        const result = await LocalAuthService.signIn(cred.email, cred.password);
        
        if (result.success) {
          addResult(`✅ SUCESSO: ${cred.email} logado com sucesso!`);
          LocalAuthService.signOut();
          addResult(`🚪 Logout realizado para ${cred.email}`);
        } else {
          addResult(`❌ FALHA: ${cred.email} - ${result.error}`);
        }
      } catch (error) {
        addResult(`💥 ERRO: ${cred.email} - ${error}`);
      }
    }

    addResult('🏁 Teste completo finalizado!');
  };

  const testSingleCredential = async (email: string, password: string) => {
    addResult(`🧪 Teste individual: ${email}`);
    
    try {
      const result = await LocalAuthService.signIn(email, password);
      
      if (result.success) {
        addResult(`✅ Login bem-sucedido!`);
        LocalAuthService.signOut();
      } else {
        addResult(`❌ Login falhou: ${result.error}`);
      }
    } catch (error) {
      addResult(`💥 Erro durante login: ${error}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              🔧 Teste do Sistema de Autenticação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={runFullTest}
                className="bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                🚀 Executar Teste Completo
              </Button>
              
              <Button
                onClick={() => {
                  LocalAuthService.forceReinitializeUsers();
                  addResult('🔄 Usuários reinicializados');
                }}
                variant="outline"
                size="lg"
              >
                🔄 Reinicializar Usuários
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={() => testSingleCredential('admin@vendas.com', 'Admin123!')}
                variant="outline"
              >
                🧪 Testar Admin
              </Button>
              
              <Button
                onClick={() => testSingleCredential('vendedor@vendas.com', 'Vendas2024!')}
                variant="outline"
              >
                🧪 Testar Vendedor
              </Button>
            </div>

            <Button
              onClick={() => setTestResults([])}
              variant="ghost"
              size="sm"
              className="w-full"
            >
              🧹 Limpar Resultados
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>📋 Resultados dos Testes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
              {testResults.length === 0 ? (
                <div className="text-gray-500">Nenhum teste executado ainda...</div>
              ) : (
                testResults.map((result, index) => (
                  <div key={index} className="mb-1">
                    {result}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button
            onClick={() => window.location.href = '/'}
            variant="outline"
          >
            ← Voltar ao Login
          </Button>
        </div>
      </div>
    </div>
  );
}
