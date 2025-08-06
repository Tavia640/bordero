import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { X, Mail, Key, CheckCircle, AlertTriangle } from "lucide-react";
import LocalAuthService from "@/lib/localAuth";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { isSupabaseConfigured } from "@/lib/supabase";

interface PasswordRecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PasswordRecoveryModal({
  isOpen,
  onClose,
}: PasswordRecoveryModalProps) {
  const [step, setStep] = useState<"email" | "verify" | "reset" | "success">(
    "email",
  );
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [useSupabase, setUseSupabase] = useState(isSupabaseConfigured());

  const { sendPasswordResetEmail } = useAuth();

  // Simulação do código de verificação (para auth local)
  const [generatedCode] = useState(() =>
    Math.floor(100000 + Math.random() * 900000).toString(),
  );

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (useSupabase) {
        // Use Supabase password reset
        const { error } = await sendPasswordResetEmail(email);

        if (error) {
          setError(error);
          setLoading(false);
          return;
        }

        // Success - show success message directly
        setLoading(false);
        setStep("success");
      } else {
        // Use local auth verification flow
        const emailExists = await LocalAuthService.checkEmailExists(email);

        if (!emailExists) {
          setError("Email não encontrado no sistema");
          setLoading(false);
          return;
        }

        // Simulate email sending for local auth
        setTimeout(() => {
          setLoading(false);
          setStep("verify");
        }, 1500);
      }
    } catch (error) {
      setError("Erro ao verificar email. Tente novamente.");
      setLoading(false);
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (verificationCode !== generatedCode) {
      setError("Código de verificação inválido");
      return;
    }

    setStep("reset");
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (newPassword.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem");
      setLoading(false);
      return;
    }

    try {
      // Redefinir senha usando LocalAuthService
      const result = await LocalAuthService.resetPassword(email, newPassword);

      if (!result.success) {
        setError(result.error || "Erro ao redefinir senha");
        setLoading(false);
        return;
      }

      // Sucesso
      setTimeout(() => {
        setLoading(false);
        setStep("success");
      }, 1500);
    } catch (error) {
      setError("Erro ao redefinir senha. Tente novamente.");
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep("email");
    setEmail("");
    setVerificationCode("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <Key className="h-5 w-5 mr-2 text-green-600" />
              Recuperar Senha
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Step 1: Email */}
          {step === "email" && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="text-center mb-4">
                <Mail className="h-12 w-12 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  {useSupabase
                    ? "Digite seu email para receber o link de recuperação"
                    : "Digite seu email para receber o código de verificação"
                  }
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="recovery-email">Email</Label>
                <Input
                  id="recovery-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  disabled={loading}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={loading}
              >
                {loading ? "Enviando..." : (useSupabase ? "Enviar Link" : "Enviar Código")}
              </Button>

              {!useSupabase && (
                <p className="text-xs text-gray-500 text-center mt-2">
                  💡 Código de demonstração: {generatedCode}
                </p>
              )}
            </form>
          )}

          {/* Step 2: Verification Code */}
          {step === "verify" && (
            <form onSubmit={handleVerificationSubmit} className="space-y-4">
              <div className="text-center mb-4">
                <Key className="h-12 w-12 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  Digite o código de verificação enviado para
                </p>
                <p className="font-semibold text-green-600">{email}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="verification-code">Código de Verificação</Label>
                <Input
                  id="verification-code"
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="000000"
                  maxLength={6}
                  className="text-center text-lg font-mono"
                  required
                />
              </div>

              <Alert className="border-blue-200 bg-blue-50">
                <AlertDescription className="text-blue-800 text-xs">
                  📧 Código de verificação de 6 dígitos enviado por email
                </AlertDescription>
              </Alert>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep("email")}
                  className="flex-1"
                >
                  Voltar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Verificar
                </Button>
              </div>
            </form>
          )}

          {/* Step 3: New Password */}
          {step === "reset" && (
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div className="text-center mb-4">
                <Key className="h-12 w-12 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Defina sua nova senha</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">Nova Senha</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nova senha"
                  minLength={6}
                  required
                  disabled={loading}
                />
                <p className="text-xs text-gray-500">Mínimo 6 caracteres</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar Senha</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirme a nova senha"
                  minLength={6}
                  required
                  disabled={loading}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep("verify")}
                  className="flex-1"
                  disabled={loading}
                >
                  Voltar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={loading}
                >
                  {loading ? "Salvando..." : "Redefinir Senha"}
                </Button>
              </div>
            </form>
          )}

          {/* Step 4: Success */}
          {step === "success" && (
            <div className="text-center space-y-4">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
              <div>
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                  {useSupabase ? "Email Enviado!" : "Senha Redefinida!"}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {useSupabase
                    ? `Enviamos um link de recuperação para ${email}. Clique no link para redefinir sua senha.`
                    : "Sua senha foi alterada com sucesso. Você já pode fazer login com a nova senha."
                  }
                </p>
              </div>

              <Button
                onClick={handleClose}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {useSupabase ? "Entendi" : "Fazer Login"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
