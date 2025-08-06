import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { testSupabaseConnection, testSupabaseConfig } from "@/utils/testSupabase";

export default function AuthTest() {
  const { signUp, resetPassword, user, session } = useAuth();
  const [testResults, setTestResults] = useState({
    connection: '',
    signup: '',
    recovery: '',
    config: ''
  });

  const handleTestConfig = () => {
    setTestResults(prev => ({ ...prev, config: '⏳ Testando configuração...' }));
    const configOk = testSupabaseConfig();
    setTestResults(prev => ({ 
      ...prev, 
      config: configOk ? '✅ Configuração válida' : '❌ Configuração inválida'
    }));
  };

  const handleTestConnection = async () => {
    setTestResults(prev => ({ ...prev, connection: '⏳ Testando conexão...' }));
    const connectionOk = await testSupabaseConnection();
    setTestResults(prev => ({ 
      ...prev, 
      connection: connectionOk ? '✅ Conexão estabelecida' : '❌ Falha na conexão'
    }));
  };

  const handleTestSignup = async () => {
    setTestResults(prev => ({ ...prev, signup: '⏳ Testando cadastro...' }));
    const result = await signUp('test@example.com', 'password123', 'Test User');
    setTestResults(prev => ({ 
      ...prev, 
      signup: result.error 
        ? `❌ Erro no cadastro: ${result.error}` 
        : result.needsConfirmation 
          ? '✅ Cadastro realizado - confirmação por email necessária'
          : '✅ Cadastro realizado com sucesso'
    }));
  };

  const handleTestRecovery = async () => {
    setTestResults(prev => ({ ...prev, recovery: '⏳ Testando recuperação...' }));
    const result = await resetPassword('test@example.com');
    setTestResults(prev => ({ 
      ...prev, 
      recovery: result.error ? `❌ Erro na recuperação: ${result.error}` : '✅ Email de recuperação enviado'
    }));
  };

  const clearResults = () => {
    setTestResults({
      connection: '',
      signup: '',
      recovery: '',
      config: ''
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              🔧 Teste do Sistema Supabase
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Connection Status */}
            <div className="p-4 bg-blue-50 rounded-lg border">
              <h3 className="font-semibold mb-2">Status da Sessão</h3>
              <div className="text-sm space-y-1">
                <div><strong>Usuário:</strong> {user ? user.email : 'Não logado'}</div>
                <div><strong>Sessão:</strong> {session ? 'Ativa' : 'Inativa'}</div>
                <div><strong>URL:</strong> {import.meta.env.VITE_SUPABASE_URL ? '✅ Configurada' : '❌ Não configurada'}</div>
                <div><strong>Key:</strong> {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Configurada' : '❌ Não configurada'}</div>
              </div>
            </div>

            {/* Test Buttons */}
            <div className="space-y-4">
              <Button 
                onClick={handleTestConfig}
                className="w-full"
                variant="default"
              >
                Testar Configuração
              </Button>
              
              <Button 
                onClick={handleTestConnection}
                className="w-full"
                variant="default"
              >
                Testar Conexão Supabase
              </Button>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  onClick={handleTestSignup}
                  className="w-full"
                  variant="outline"
                >
                  Testar Cadastro
                </Button>
                
                <Button 
                  onClick={handleTestRecovery}
                  className="w-full"
                  variant="outline"
                >
                  Testar Recuperação
                </Button>
              </div>

              <Button
                onClick={clearResults}
                variant="ghost"
                size="sm"
                className="w-full"
              >
                🧹 Limpar Resultados
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>📋 Resultados dos Testes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="p-3 bg-purple-50 rounded-lg border">
                <strong>Configuração:</strong> {testResults.config || 'Não testado'}
              </div>
              <div className="p-3 bg-blue-50 rounded-lg border">
                <strong>Conexão:</strong> {testResults.connection || 'Não testado'}
              </div>
              <div className="p-3 bg-green-50 rounded-lg border">
                <strong>Cadastro:</strong> {testResults.signup || 'Não testado'}
              </div>
              <div className="p-3 bg-orange-50 rounded-lg border">
                <strong>Recuperação:</strong> {testResults.recovery || 'Não testado'}
              </div>
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
