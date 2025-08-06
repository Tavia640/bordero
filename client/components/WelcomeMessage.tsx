import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PartyPopper, CheckCircle } from 'lucide-react';

export default function WelcomeMessage() {
  return (
    <Alert className="border-green-200 bg-green-50 mb-6">
      <PartyPopper className="h-4 w-4 text-green-600" />
      <AlertDescription className="text-green-800">
        <strong>🎉 Sistema Completamente Reformulado!</strong>
        <br />
        <div className="mt-2 space-y-1 text-sm">
          <div className="flex items-center">
            <CheckCircle className="h-3 w-3 mr-2" />
            Login funcionando perfeitamente
          </div>
          <div className="flex items-center">
            <CheckCircle className="h-3 w-3 mr-2" />
            Sistema robusto e confiável
          </div>
          <div className="flex items-center">
            <CheckCircle className="h-3 w-3 mr-2" />
            Interface moderna e responsiva
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}
