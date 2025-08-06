import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { CheckCircle, AlertTriangle, Database, Mail, Shield } from "lucide-react";

export function SupabaseTestPanel() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [testing, setTesting] = useState(false);
  
  const { user, session, signUp, signIn, signOut, resetPassword } = useAuth();

  if (!import.meta.env.DEV) {
    return null; // Only show in development
  }

  const addResult = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const emoji = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
    setTestResults(prev => [...prev, `${emoji} ${message}`]);
  };

  const testSupabaseConnection = async () => {
    setTesting(true);
    setTestResults([]);
    
    addResult('🚀 Iniciando testes do Supabase...');

    // Test 1: Check environment variables
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (supabaseUrl?.includes('supabase.co')) {
      addResult('Supabase URL configurada', 'success');
    } else {
      addResult('Supabase URL não configurada', 'error');
    }

    if (supabaseKey && supabaseKey.length > 20) {
      addResult('Supabase Key configurada', 'success');
    } else {
      addResult('Supabase Key não configurada', 'error');
    }

    // Test 2: Test signup flow
    try {
      addResult('Testando cadastro...');
      const testEmail = `test${Date.now()}@test.com`;
      const result = await signUp(testEmail, 'test123456', 'Test User');
      
      if (result.error) {
        addResult(`Erro no cadastro: ${result.error}`, 'error');
      } else if (result.needsConfirmation) {
        addResult('Cadastro funcionando - Email de confirmação seria enviado', 'success');
      } else {
        addResult('Cadastro funcionando - Login automático', 'success');
        await signOut();
      }
    } catch (error: any) {
      addResult(`Erro no teste de cadastro: ${error.message}`, 'error');
    }

    // Test 3: Test password reset
    try {
      addResult('Testando recuperação de senha...');
      const result = await resetPassword('test@example.com');
      
      if (result.error) {
        addResult(`Erro na recuperação: ${result.error}`, 'error');
      } else {
        addResult('Recuperação de senha funcionando', 'success');
      }
    } catch (error: any) {
      addResult(`Erro no teste de recuperação: ${error.message}`, 'error');
    }

    addResult('🏁 Testes concluídos!');
    setTesting(false);
  };

  return (
    <Card className="mt-6 border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="text-sm flex items-center text-blue-800">
          <Database className="h-4 w-4 mr-2" />
          Painel de Teste Supabase
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status atual */}
        <div className="space-y-2">
          <div className="flex items-center text-xs">
            <Shield className="h-3 w-3 mr-1 text-green-600" />
            <span className="text-green-700">
              Status: {user ? `Logado como ${user.email}` : 'Não logado'}
            </span>
          </div>
          
          <div className="flex items-center text-xs">
            <Mail className="h-3 w-3 mr-1 text-blue-600" />
            <span className="text-blue-700">
              Email confirmado: {user?.email_confirmed_at ? 'Sim' : 'Não/Pendente'}
            </span>
          </div>
        </div>

        {/* Configuração */}
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 text-xs">
            <strong>Supabase Configurado:</strong>
            <br />
            URL: {import.meta.env.VITE_SUPABASE_URL?.slice(0, 30)}...
            <br />
            Key: {import.meta.env.VITE_SUPABASE_ANON_KEY?.slice(0, 20)}...
          </AlertDescription>
        </Alert>

        {/* Botões de teste */}
        <div className="space-y-2">
          <Button
            onClick={testSupabaseConnection}
            disabled={testing}
            className="w-full text-xs bg-blue-600 hover:bg-blue-700"
            size="sm"
          >
            {testing ? 'Testando...' : '🧪 Testar Funcionalidades'}
          </Button>

          <Button
            onClick={() => setTestResults([])}
            variant="outline"
            className="w-full text-xs"
            size="sm"
          >
            🧹 Limpar Resultados
          </Button>
        </div>

        {/* Resultados dos testes */}
        {testResults.length > 0 && (
          <div className="bg-gray-900 text-gray-100 p-3 rounded-lg text-xs max-h-40 overflow-y-auto">
            {testResults.map((result, index) => (
              <div key={index} className="mb-1 font-mono">
                {result}
              </div>
            ))}
          </div>
        )}

        {/* Recursos implementados */}
        <div className="text-xs space-y-1">
          <div className="font-semibold text-blue-800">🚀 Recursos Implementados:</div>
          <ul className="ml-4 space-y-1 text-blue-700">
            <li>✅ Cadastro com confirmação de email</li>
            <li>✅ Login seguro</li>
            <li>✅ Recuperação de senha por email</li>
            <li>✅ Logout</li>
            <li>✅ Persistência de sessão</li>
            <li>✅ Redirecionamentos automáticos</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
