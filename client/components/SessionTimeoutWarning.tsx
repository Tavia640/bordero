import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Clock, AlertTriangle } from 'lucide-react';

export function SessionTimeoutWarning() {
  const { showSessionWarning, extendSession, signOut } = useAuth();
  const [countdown, setCountdown] = useState(300); // 5 minutes in seconds

  useEffect(() => {
    if (!showSessionWarning) {
      setCountdown(300);
      return;
    }

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          signOut(); // Auto logout when countdown reaches 0
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showSessionWarning, signOut]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleExtendSession = () => {
    extendSession();
    setCountdown(300);
  };

  if (!showSessionWarning) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md border-orange-200">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-3">
            <AlertTriangle className="h-6 w-6 text-orange-600" />
          </div>
          <CardTitle className="text-lg text-orange-800">
            Sessão Expirando
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            Sua sessão expirará em breve devido à inatividade.
          </p>
          
          <div className="flex items-center justify-center space-x-2 text-2xl font-mono">
            <Clock className="h-6 w-6 text-orange-600" />
            <span className={`font-bold ${countdown <= 60 ? 'text-red-600' : 'text-orange-600'}`}>
              {formatTime(countdown)}
            </span>
          </div>
          
          <p className="text-sm text-gray-500">
            Clique em "Continuar" para estender sua sessão ou "Sair" para fazer logout.
          </p>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={signOut}
              className="flex-1"
            >
              Sair
            </Button>
            <Button
              onClick={handleExtendSession}
              className="flex-1 bg-orange-600 hover:bg-orange-700"
            >
              Continuar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
