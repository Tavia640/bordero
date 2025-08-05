import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { isSupabaseConfigured } from "@/lib/supabase";
import LocalAuthService from "@/lib/localAuth";
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}
