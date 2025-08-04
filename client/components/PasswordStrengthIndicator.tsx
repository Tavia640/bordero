import React from 'react';
import { validatePasswordStrength, getPasswordStrengthText, getPasswordStrengthColor } from '@/lib/security';
import { Check, X, AlertTriangle } from 'lucide-react';

interface PasswordStrengthIndicatorProps {
  password: string;
  show: boolean;
}

export function PasswordStrengthIndicator({ password, show }: PasswordStrengthIndicatorProps) {
  if (!show || !password) return null;

  const strength = validatePasswordStrength(password);
  const strengthText = getPasswordStrengthText(strength.score);
  const strengthColor = getPasswordStrengthColor(strength.score);

  return (
    <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">Força da senha:</span>
        <span className={`text-sm font-semibold ${strengthColor}`}>
          {strengthText}
        </span>
      </div>
      
      {/* Strength bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${
            strength.score === 0 ? 'bg-gray-300' :
            strength.score === 1 ? 'bg-red-500' :
            strength.score === 2 ? 'bg-orange-500' :
            strength.score === 3 ? 'bg-yellow-500' :
            'bg-green-500'
          }`}
          style={{ width: `${(strength.score / 4) * 100}%` }}
        />
      </div>

      {/* Requirements checklist */}
      <div className="space-y-1">
        <div className="text-xs font-medium text-gray-600 mb-2">Requisitos:</div>
        
        <RequirementItem
          met={password.length >= 8}
          text="Pelo menos 8 caracteres"
        />
        <RequirementItem
          met={/[A-Z]/.test(password)}
          text="Uma letra maiúscula"
        />
        <RequirementItem
          met={/[a-z]/.test(password)}
          text="Uma letra minúscula"
        />
        <RequirementItem
          met={/\d/.test(password)}
          text="Um número"
        />
        <RequirementItem
          met={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\?]/.test(password)}
          text="Um caractere especial (!@#$%...)"
        />
      </div>

      {/* Feedback messages */}
      {strength.feedback.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-start">
            <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 mr-2 flex-shrink-0" />
            <div className="text-xs text-gray-600">
              <ul className="space-y-1">
                {strength.feedback.map((feedback, index) => (
                  <li key={index}>• {feedback}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface RequirementItemProps {
  met: boolean;
  text: string;
}

function RequirementItem({ met, text }: RequirementItemProps) {
  return (
    <div className="flex items-center space-x-2">
      {met ? (
        <Check className="h-3 w-3 text-green-500" />
      ) : (
        <X className="h-3 w-3 text-gray-400" />
      )}
      <span className={`text-xs ${met ? 'text-green-700' : 'text-gray-500'}`}>
        {text}
      </span>
    </div>
  );
}
