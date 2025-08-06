import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Zap, Shield, Key } from 'lucide-react';

export default function LoginStatus() {
  return (
    <Card className="bg-green-50 border-green-200">
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-green-800 mb-1">
              ✅ Sistema Funcionando
            </h3>
            <div className="text-xs text-green-700 space-y-1">
              <div className="flex items-center">
                <Shield className="h-3 w-3 mr-1" />
                Autenticação local robusta
              </div>
              <div className="flex items-center">
                <Key className="h-3 w-3 mr-1" />
                Recuperação de senha
              </div>
              <div className="flex items-center">
                <Zap className="h-3 w-3 mr-1" />
                Carregamento instantâneo
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
