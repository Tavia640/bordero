import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PasswordStrengthIndicator } from "@/components/PasswordStrengthIndicator";
import { Key, CheckCircle, AlertTriangle, Eye, EyeOff } from "lucide-react";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordStrength, setShowPasswordStrength] = useState(false);
  const [validSession, setValidSession] = useState(false);
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const checkSession = async () => {
      if (!isSupabaseConfigured()) {
        setError("Sistema de autenticação não configurado");
        return;
      }

      // Check if there's a valid session for password reset
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setValidSession(true);
      } else {
        // Try to recover session from URL parameters
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        
        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          
          if (!error) {
            setValidSession(true);
          } else {
            setError("Link de recuperação inválido ou expirado");
          }
        } else {
          setError("Link de recuperação inválido ou expirado");
        }
      }
    };

    checkSession();
  }, [searchParams]);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate("/");
        }, 3000);
      }
    } catch (error) {
      setError("Erro ao redefinir senha. Tente novamente.");
    }

    setLoading(false);
  };

  if (!isSupabaseConfigured()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center pt-6">
            <AlertTriangle className="h-16 w-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-red-800 mb-2">
              Sistema não configurado
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              O sistema de autenticação não está configurado corretamente.
            </p>
            <Button onClick={() => navigate("/")} variant="outline">
              Voltar ao Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!validSession) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center pt-6">
            <AlertTriangle className="h-16 w-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-red-800 mb-2">
              Link inválido
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              {error || "O link de recuperação é inválido ou expirou."}
            </p>
            <Button onClick={() => navigate("/")} variant="outline">
              Voltar ao Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center pt-6">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-green-800 mb-2">
              Senha Redefinida!
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Sua senha foi alterada com sucesso. Você será redirecionado para o login.
            </p>
            <Button onClick={() => navigate("/")} className="bg-green-600 hover:bg-green-700">
              Ir para Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Key className="h-12 w-12 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-semibold text-green-600">
            Redefinir Senha
          </CardTitle>
          <CardDescription>
            Digite sua nova senha abaixo
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert className="border-red-200 bg-red-50 mb-4">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-sm font-medium text-gray-700">
                Nova Senha
              </Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Nova senha (mínimo 6 caracteres)"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setShowPasswordStrength(e.target.value.length > 0);
                  }}
                  onFocus={() => setShowPasswordStrength(true)}
                  className="pr-10"
                  required
                  disabled={loading}
                  minLength={6}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
              <PasswordStrengthIndicator
                password={password}
                show={showPasswordStrength}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-sm font-medium text-gray-700">
                Confirmar Nova Senha
              </Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirme sua nova senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pr-10"
                  required
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-600">
                  As senhas não coincidem
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 mt-6"
              disabled={loading || password !== confirmPassword || password.length < 6}
            >
              {loading ? "Redefinindo..." : "Redefinir Senha"}
            </Button>
          </form>

          <div className="text-center mt-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Voltar ao Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
