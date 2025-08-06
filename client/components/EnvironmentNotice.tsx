import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Info, X, Wifi, AlertTriangle } from 'lucide-react';

export default function EnvironmentNotice() {
  const [showNotice, setShowNotice] = useState(false);
  const [environmentType, setEnvironmentType] = useState<'restricted' | 'normal'>('normal');

  useEffect(() => {
    // Detect if we're in a restricted environment
    const isRestricted = window.location.hostname.includes('fly.dev') || 
                        window.location.hostname.includes('preview') ||
                        window.location.hostname.includes('sandbox');
    
    if (isRestricted) {
      setEnvironmentType('restricted');
      setShowNotice(true);
    }
  }, []);

  if (!showNotice || environmentType === 'normal') {
    return null;
  }

  return (
    <Alert className="border-blue-200 bg-blue-50 mb-4">
      <Info className="h-4 w-4 text-blue-600" />
      <AlertDescription className="text-blue-800 flex items-center justify-between">
        <div className="flex-1">
          <strong>Ambiente de Desenvolvimento:</strong> Este ambiente pode ter restrições de rede. 
          A autenticação Supabase funcionará quando o sistema for implantado em produção.
          {environmentType === 'restricted' && (
            <div className="mt-2 text-xs">
              <AlertTriangle className="h-3 w-3 inline mr-1" />
              Algumas funcionalidades de rede podem falhar em ambientes sandbox/preview.
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowNotice(false)}
          className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800"
        >
          <X className="h-3 w-3" />
        </Button>
      </AlertDescription>
    </Alert>
  );
}
