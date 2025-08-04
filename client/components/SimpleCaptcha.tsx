import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SimpleCaptcha } from '@/lib/security';
import { RefreshCw, Shield } from 'lucide-react';

interface SimpleCaptchaProps {
  onVerify: (success: boolean) => void;
  required: boolean;
}

export function SimpleCaptchaComponent({ onVerify, required }: SimpleCaptchaProps) {
  const [captcha, setCaptcha] = useState<{ question: string; answer: number } | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const generateNewCaptcha = () => {
    const newCaptcha = SimpleCaptcha.generate();
    setCaptcha(newCaptcha);
    setUserAnswer('');
    setIsVerified(false);
    setAttempts(0);
  };

  useEffect(() => {
    if (required) {
      generateNewCaptcha();
    }
  }, [required]);

  useEffect(() => {
    onVerify(isVerified || !required);
  }, [isVerified, required, onVerify]);

  const handleVerify = () => {
    if (!captcha) return;

    const answer = parseInt(userAnswer);
    if (answer === captcha.answer) {
      setIsVerified(true);
      onVerify(true);
    } else {
      setAttempts(prev => prev + 1);
      setUserAnswer('');
      
      // Generate new captcha after failed attempt
      setTimeout(() => {
        generateNewCaptcha();
      }, 1000);
      
      onVerify(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, ''); // Only numbers
    setUserAnswer(value);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleVerify();
    }
  };

  if (!required) return null;

  return (
    <div className="border border-orange-200 bg-orange-50 p-4 rounded-lg">
      <div className="flex items-center mb-3">
        <Shield className="h-4 w-4 text-orange-600 mr-2" />
        <span className="text-sm font-medium text-orange-800">
          Verificação de Segurança
        </span>
      </div>
      
      {attempts > 0 && (
        <div className="mb-3 text-xs text-red-600">
          Resposta incorreta. Tente novamente.
        </div>
      )}

      {isVerified ? (
        <div className="flex items-center text-green-700">
          <Shield className="h-4 w-4 mr-2" />
          <span className="text-sm font-medium">Verificação concluída!</span>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="bg-white border-2 border-gray-300 px-4 py-2 rounded-lg font-mono text-lg min-w-[80px] text-center">
              {captcha?.question} = ?
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={generateNewCaptcha}
              className="p-2"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="flex-1">
              <Label htmlFor="captcha-answer" className="text-sm">
                Qual é o resultado?
              </Label>
              <Input
                id="captcha-answer"
                type="text"
                value={userAnswer}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua resposta"
                className="mt-1"
                maxLength={3}
              />
            </div>
            <Button
              type="button"
              onClick={handleVerify}
              disabled={!userAnswer.trim()}
              size="sm"
              className="mt-6"
            >
              Verificar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
