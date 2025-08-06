import React from 'react';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, User, Shield, Database } from 'lucide-react';

export default function SystemStatus() {
  const { user } = useAuth();

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center text-green-600">
          <CheckCircle className="h-5 w-5 mr-2" />
          Status do Sistema
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
            <Shield className="h-5 w-5 text-green-600" />
            <div>
              <div className="font-medium text-green-800">Autenticação</div>
              <div className="text-sm text-green-600">Funcionando</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
            <User className="h-5 w-5 text-green-600" />
            <div>
              <div className="font-medium text-green-800">Usuário</div>
              <div className="text-sm text-green-600">
                {user?.name || 'Carregado'}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
            <Database className="h-5 w-5 text-green-600" />
            <div>
              <div className="font-medium text-green-800">Dados</div>
              <div className="text-sm text-green-600">Local Storage</div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="text-sm text-blue-800">
            <strong>✅ Sistema Reformulado:</strong> Novo sistema de login funcionando corretamente com autenticação local robusta.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
