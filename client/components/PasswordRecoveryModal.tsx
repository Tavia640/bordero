import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { X, Mail, CheckCircle, AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/SupabaseAuthContext";

interface PasswordRecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PasswordRecoveryModal({
  isOpen,
  onClose,
}: PasswordRecoveryModalProps) {
  const [step, setStep] = useState<"email" | "success">("email");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { resetPassword } = useAuth();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error } = await resetPassword(email);

      if (error) {
        setError(error);
        setLoading(false);
        return;
      }

      setLoading(false);
      setStep("success");
    } catch (error: any) {
      setError("Erro ao enviar email de recuperação. Tente novamente.");
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep("email");
    setEmail("");
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
              <Mail className="h-5 w-5 mr-2 text-green-600" />
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
                  Digite seu email para receber o link de recuperação
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
                {loading ? "Enviando..." : "Enviar Link de Recuperação"}
              </Button>
            </form>
          )}

          {/* Step 2: Success */}
          {step === "success" && (
            <div className="text-center space-y-4">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
              <div>
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                  Email Enviado!
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Enviamos um link de recuperação para{" "}
                  <span className="font-semibold text-green-600">{email}</span>.
                  <br />
                  Clique no link para redefinir sua senha.
                </p>
              </div>

              <Button
                onClick={handleClose}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Entendi
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
