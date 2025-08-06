import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { testSupabaseConnection, testSupabaseConfig } from "@/utils/testSupabase";
import { testBasicConnectivity, testSupabaseDirectly } from "@/utils/minimalNetworkTest";
import { validateSupabaseConfig, diagnoseConnectionIssue } from "@/utils/supabaseValidator";
import SupabaseDiagnostics from "@/components/SupabaseDiagnostics";

export default function AuthTest() {
  const { signUp, resetPassword, user, session } = useAuth();
  const [testResults, setTestResults] = useState({
    network: '',
    connection: '',
    signup: '',
    recovery: '',
    config: ''
  });

  const handleTestNetworkBasic = async () => {
    setTestResults(prev => ({ ...prev, network: '⏳ Testando conectividade básica...' }));

    const basicResults = await testBasicConnectivity();
    const supabaseReach = await testSupabaseDirectly();

    let message = '';
    if (basicResults.basicFetch) {
      message += '✅ Internet: OK ';
    } else {
      message += '❌ Internet: FALHA ';
    }

    if (supabaseReach) {
      message += '✅ Supabase: ALCANÇÁVEL';
    } else {
      message += '❌ Supabase: INACESSÍVEL';
    }

    if (basicResults.error) {
      message += ` (${basicResults.error})`;
    }

    setTestResults(prev => ({ ...prev, network: message }));
  };

  const handleTestConfig = () => {
    setTestResults(prev => ({ ...prev, config: '⏳ Testando configuração...' }));

    const validation = validateSupabaseConfig();

    let message = '';
    if (validation.valid) {
      message = `✅ Configuração válida (Projeto: ${validation.config.projectId})`;
    } else {
      message = `❌ Problemas: ${validation.issues.join(', ')}`;
    }

    if (validation.warnings.length > 0) {
      message += ` ⚠️ Avisos: ${validation.warnings.join(', ')}`;
    }

    setTestResults(prev => ({ ...prev, config: message }));
  };

  const handleTestConnection = async () => {
    setTestResults(prev => ({ ...prev, connection: '⏳ Testando conexão...' }));

    try {
      const connectionOk = await testSupabaseConnection();

      if (connectionOk) {
        setTestResults(prev => ({
          ...prev,
          connection: '✅ Conexão estabelecida'
        }));
      } else {
        // Run diagnosis to understand why it failed
        const diagnosis = await diagnoseConnectionIssue();
        let message = `❌ Falha na conexão (${diagnosis.type})`;

        if (diagnosis.type === 'configuration') {
          message += ` - Verifique variáveis de ambiente`;
        } else if (diagnosis.type === 'network') {
          message += ` - Problemas de rede/conectividade`;
        } else if (diagnosis.type === 'environment') {
          message += ` - Ambiente restrito`;
        }

        setTestResults(prev => ({ ...prev, connection: message }));
      }
    } catch (error: any) {
      setTestResults(prev => ({
        ...prev,
        connection: `❌ Erro no teste: ${error.message}`
      }));
    }
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
      network: '',
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
                onClick={handleTestNetworkBasic}
                className="w-full"
                variant="secondary"
              >
                🌐 Testar Rede Básica
              </Button>

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
              <div className="p-3 bg-gray-50 rounded-lg border">
                <strong>Rede Básica:</strong> {testResults.network || 'Não testado'}
              </div>
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

        <SupabaseDiagnostics />

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
