import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { isSupabaseConfigured } from "@/lib/supabase";
import LocalAuthService from "@/lib/localAuth";
import { fixAuthSystem } from "@/utils/authFix";
import { testAuthSystem } from "@/utils/testAuth";
import { Info, Users, Database, Settings, Eye, EyeOff } from "lucide-react";

export function AuthDebugInfo() {
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);

  if (!import.meta.env.DEV) {
    return null; // Only show in development
  }

  const isSupabaseEnabled = isSupabaseConfigured();
  const validCredentials = LocalAuthService.getValidCredentials();

  return (
    <div className="mt-6">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowDebugInfo(!showDebugInfo)}
        className="w-full text-xs"
      >
        <Info className="h-3 w-3 mr-1" />
        {showDebugInfo ? "Ocultar" : "Mostrar"} Informações do Sistema
      </Button>

      {showDebugInfo && (
        <Card className="mt-3 border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center text-blue-800">
              <Settings className="h-4 w-4 mr-2" />
              Sistema de Autenticação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <Alert className={`border-2 ${isSupabaseEnabled ? 'border-green-300 bg-green-50' : 'border-orange-300 bg-orange-50'}`}>
              <Database className="h-4 w-4" />
              <AlertDescription className={isSupabaseEnabled ? 'text-green-800' : 'text-orange-800'}>
                <strong>Modo:</strong> {isSupabaseEnabled ? 'Supabase (Produção)' : 'Local (Demonstração)'}
                <br />
                <strong>Status:</strong> {isSupabaseEnabled ? 'Configurado' : 'Fallback ativo'}
              </AlertDescription>
            </Alert>

            {!isSupabaseEnabled && (
              <Alert className="border-blue-300 bg-blue-50">
                <Users className="h-4 w-4" />
                <AlertDescription className="text-blue-800">
                  <div className="flex items-center justify-between">
                    <strong>Credenciais de Teste:</strong>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowCredentials(!showCredentials)}
                      className="h-6 w-6 p-0"
                    >
                      {showCredentials ? (
                        <EyeOff className="h-3 w-3" />
                      ) : (
                        <Eye className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                  {showCredentials && (
                    <div className="mt-2 space-y-1 font-mono text-xs">
                      {validCredentials.map((cred, index) => (
                        <div key={index} className="p-2 bg-white rounded border">
                          <div><strong>Email:</strong> {cred.email}</div>
                          <div><strong>Senha:</strong> {cred.password}</div>
                          <div><strong>Nome:</strong> {cred.name}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <div className="text-gray-600 space-y-1">
              <div><strong>Recursos Ativos:</strong></div>
              <ul className="ml-4 space-y-1">
                <li>✅ Rate Limiting de Login</li>
                <li>✅ Validação de Senha</li>
                <li>✅ Sanitização de Inputs</li>
                <li>✅ Gerenciamento de Sessão</li>
                <li>{isSupabaseEnabled ? '✅' : '⚠️'} Confirmação de Email</li>
                <li>{isSupabaseEnabled ? '✅' : '⚠️'} Recuperação de Senha por Email</li>
                <li>✅ Logs de Debugging</li>
              </ul>
            </div>

            {isSupabaseEnabled && (
              <div className="text-green-700">
                <strong>⚡ Sistema totalmente funcional!</strong>
                <br />
                Emails de confirmação e recuperação de senha são enviados automaticamente.
              </div>
            )}

            {!isSupabaseEnabled && (
              <div className="text-orange-700">
                <strong>🚀 Configure o Supabase para produção:</strong>
                <br />
                1. Crie um projeto no Supabase
                <br />
                2. Configure as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY
                <br />
                3. Ative o sistema de emails no Supabase
              </div>
            )}

            <div className="space-y-2 pt-3 border-t border-blue-200">
              <div className="text-xs font-semibold text-blue-800">🛠️ Debug Tools:</div>
              <div className="grid grid-cols-1 gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.location.href = '/auth-test'}
                  className="text-xs bg-purple-50 border-purple-300 text-purple-800 hover:bg-purple-100"
                >
                  🔬 Página de Teste Completa
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    // Quick login test
                    LocalAuthService.forceReinitializeUsers();
                    const result = await LocalAuthService.signIn('admin@vendas.com', 'Admin123!');
                    if (result.success) {
                      alert('✅ Login demo funcionando!');
                      LocalAuthService.signOut();
                    } else {
                      alert('❌ Login falhou: ' + result.error);
                    }
                  }}
                  className="text-xs bg-blue-50 border-blue-300 text-blue-800 hover:bg-blue-100"
                >
                  🧪 Teste Login Demo
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    // Direct test without validations
                    const testEmail = 'luan.andrade@gavresorts.com.br';
                    const testPassword = 'TesteSenha';

                    console.log('🧪 Direct test without validation...');

                    // Clear first
                    LocalAuthService.clearAllAuthData();
                    LocalAuthService.initializeUsers();

                    // Create user directly
                    const users = (LocalAuthService as any).getStoredUsers();
                    const newUser = {
                      id: 'user_test_' + Date.now(),
                      email: testEmail.toLowerCase().trim(),
                      passwordHash: 'test_hash',
                      fullName: 'Luan Andrade',
                      createdAt: new Date().toISOString(),
                      isActive: true
                    };

                    users.push(newUser);
                    localStorage.setItem('local_auth_users', JSON.stringify(users));

                    // Verify save
                    const savedUsers = (LocalAuthService as any).getStoredUsers();
                    const wasSaved = savedUsers.some(u => u.email === testEmail.toLowerCase().trim());

                    console.log('Direct save test:', { wasSaved, totalUsers: savedUsers.length });

                    if (wasSaved) {
                      alert('✅ Usuário salvo diretamente! Problema é na validação.');
                    } else {
                      alert('❌ Falha mesmo no salvamento direto');
                    }
                  }}
                  className="text-xs bg-red-50 border-red-300 text-red-800 hover:bg-red-100"
                >
                  🧪 Teste Direto (Bypass)
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    // Test the problematic email
                    const testEmail = 'luan.andrade@gavresorts.com.br';
                    const testPassword = 'TesteSenha123';

                    console.log('🧪 Testing problematic email...');

                    // Clear and reinitialize first
                    LocalAuthService.clearAllAuthData();
                    LocalAuthService.initializeUsers();

                    // Test signup
                    const signupResult = await LocalAuthService.signUp(testEmail, testPassword, 'Luan Andrade');
                    console.log('Signup result:', signupResult);

                    if (signupResult.success) {
                      LocalAuthService.signOut();

                      // Test login
                      const loginResult = await LocalAuthService.signIn(testEmail, testPassword);
                      console.log('Login result:', loginResult);

                      if (loginResult.success) {
                        alert('✅ Email problemático funcionando!');
                        LocalAuthService.signOut();
                      } else {
                        alert('❌ Login falhou: ' + loginResult.error);
                      }
                    } else {
                      alert('❌ Cadastro falhou: ' + signupResult.error);
                    }
                  }}
                  className="text-xs bg-orange-50 border-orange-300 text-orange-800 hover:bg-orange-100"
                >
                  🧪 Teste Email Real
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    // Test signup and login
                    const testEmail = 'teste@exemplo.com';
                    const testPassword = 'Teste123!';

                    console.log('🧪 Testing signup and login...');

                    // First signup
                    const signupResult = await LocalAuthService.signUp(testEmail, testPassword, 'Usuário Teste');
                    console.log('Signup result:', signupResult);

                    if (signupResult.success) {
                      LocalAuthService.signOut(); // Logout first

                      // Then try to login
                      const loginResult = await LocalAuthService.signIn(testEmail, testPassword);
                      console.log('Login result:', loginResult);

                      if (loginResult.success) {
                        alert('✅ Cadastro e login funcionando!');
                        LocalAuthService.signOut();
                      } else {
                        alert('❌ Cadastro OK, mas login falhou: ' + loginResult.error);
                      }
                    } else {
                      alert('❌ Cadastro falhou: ' + signupResult.error);
                    }
                  }}
                  className="text-xs bg-green-50 border-green-300 text-green-800 hover:bg-green-100"
                >
                  🧪 Teste Cadastro+Login
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    fixAuthSystem();
                    setTimeout(() => window.location.reload(), 1000);
                  }}
                  className="text-xs bg-green-50 border-green-300 text-green-800 hover:bg-green-100"
                >
                  🔧 Corrigir Sistema de Auth
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const users = (LocalAuthService as any).getStoredUsers();
                    console.log('👥 Current users:', users);
                    alert(`Usuários salvos (${users.length}):\n${users.map(u => `- ${u.email}`).join('\n')}`);
                  }}
                  className="text-xs bg-yellow-50 border-yellow-300 text-yellow-800 hover:bg-yellow-100"
                >
                  👥 Ver Usuários Salvos
                </Button>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      LocalAuthService.forceReinitializeUsers();
                      window.location.reload();
                    }}
                    className="text-xs flex-1"
                  >
                    Reinicializar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      LocalAuthService.clearAllAuthData();
                      window.location.reload();
                    }}
                    className="text-xs flex-1"
                  >
                    Limpar Cache
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
