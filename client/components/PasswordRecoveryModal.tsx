import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  X, 
  Mail, 
  Key, 
  CheckCircle, 
  AlertTriangle,
  Lock,
  User
} from "lucide-react";
import { useAuth } from "@/contexts/SimpleAuthContext";

interface PasswordRecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PasswordRecoveryModal({
  isOpen,
  onClose,
}: PasswordRecoveryModalProps) {
  const [step, setStep] = useState<"email" | "code" | "newPassword" | "success">("email");
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [generatedCode] = useState(() => Math.floor(100000 + Math.random() * 900000).toString());

  const { resetPassword, updatePassword } = useAuth();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await resetPassword(email);
      
      if (result.success) {
        setStep("code");
      } else {
        setError(result.error || "Email não encontrado");
      }
    } catch (error) {
      setError("Erro interno. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (verificationCode !== generatedCode) {
      setError("Código de verificação inválido");
      return;
    }

    setStep("newPassword");
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    setLoading(true);

    try {
      const result = await updatePassword(email, newPassword);

      if (result.success) {
        setTimeout(() => {
          setLoading(false);
          setStep("success");
        }, 1000);
      } else {
        setError(result.error || "Erro ao redefinir senha");
        setLoading(false);
      }
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
                  Digite seu email para recuperar a senha
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="recovery-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="recovery-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="pl-10"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={loading}
              >
                {loading ? "Verificando..." : "Enviar Código"}
              </Button>

              <div className="text-xs text-center text-gray-500 space-y-2">
                <div className="p-3 bg-blue-50 rounded-lg">
                  💡 Código de demonstração: <strong>{generatedCode}</strong>
                </div>
                <div className="p-3 bg-green-50 rounded-lg text-green-700">
                  ✅ Funciona com usuários demo e cadastrados
                </div>
              </div>
            </form>
          )}

          {/* Step 2: Verification Code */}
          {step === "code" && (
            <form onSubmit={handleCodeSubmit} className="space-y-4">
              <div className="text-center mb-4">
                <Key className="h-12 w-12 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  Digite o código enviado para
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
                  📧 Em um sistema real, este código seria enviado por email
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
          {step === "newPassword" && (
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div className="text-center mb-4">
                <Lock className="h-12 w-12 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Defina sua nova senha</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">Nova Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nova senha"
                    className="pl-10"
                    minLength={6}
                    required
                    disabled={loading}
                  />
                </div>
                <p className="text-xs text-gray-500">Mínimo 6 caracteres</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirme a nova senha"
                    className="pl-10"
                    minLength={6}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep("code")}
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
                  ✅ Senha Alterada!
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Sua senha foi alterada com sucesso para:
                  <br />
                  <span className="font-semibold text-green-600">{email}</span>
                  <br />
                  <br />
                  Você já pode fazer login com a nova senha.
                </p>
              </div>

              <Button
                onClick={handleClose}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Fazer Login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
