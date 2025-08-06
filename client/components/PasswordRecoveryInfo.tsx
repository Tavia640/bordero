import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, Key, Mail, Lock } from 'lucide-react';

export default function PasswordRecoveryInfo() {
  return (
    <Alert className="border-blue-200 bg-blue-50 mt-4">
      <Info className="h-4 w-4 text-blue-600" />
      <AlertDescription className="text-blue-800">
        <div className="space-y-2">
          <div className="font-semibold flex items-center">
            <Key className="h-3 w-3 mr-1" />
            Como testar a recuperação de senha:
          </div>
          <div className="text-xs space-y-1">
            <div className="flex items-center">
              <Mail className="h-3 w-3 mr-1" />
              1. Clique em "Esqueceu sua senha?"
            </div>
            <div className="flex items-center">
              <Mail className="h-3 w-3 mr-1" />
              2. Digite qualquer email de usuário demo
            </div>
            <div className="flex items-center">
              <Lock className="h-3 w-3 mr-1" />
              3. Use o código exibido na tela
            </div>
            <div className="flex items-center">
              <Key className="h-3 w-3 mr-1" />
              4. Defina uma nova senha
            </div>
          </div>
          <div className="text-xs font-medium text-blue-600 mt-2">
            ✅ Funciona com todos os usuários (demo e cadastrados)
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}
