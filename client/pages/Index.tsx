import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PasswordStrengthIndicator } from "@/components/PasswordStrengthIndicator";
import PasswordRecoveryModal from "@/components/PasswordRecoveryModal";
import LocalAuthService from "@/lib/localAuth";
import { LoginRateLimit, validateEmail } from "@/lib/security";
import { Info, Shield, Eye, EyeOff, Mail, CheckCircle } from "lucide-react";

export default function Index() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordStrength, setShowPasswordStrength] = useState(false);
  const [rateLimitInfo, setRateLimitInfo] = useState<any>(null);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [showConfirmationMessage, setShowConfirmationMessage] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { signIn, signUp, user, resendConfirmation } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate email format first
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setError(emailValidation.error || "Email inválido");
      return;
    }

    // Check rate limiting
    const rateLimitCheck = LoginRateLimit.checkRateLimit(email);
    setRateLimitInfo(rateLimitCheck);

    if (!rateLimitCheck.allowed) {
      if (rateLimitCheck.lockoutUntil) {
        const remainingTime = Math.ceil(
          (rateLimitCheck.lockoutUntil - Date.now()) / 60000,
        );
        setError(
          `Muitas tentativas de login. Tente novamente em ${remainingTime} minutos.`,
        );
      } else {
        setError(
          `Limite de tentativas excedido. ${rateLimitCheck.attemptsLeft} tentativas restantes.`,
        );
      }
      return;
    }

    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      const errorMessage =
        typeof error === "string"
          ? error
          : error.message === "Invalid login credentials"
            ? "Email ou senha incorretos"
            : "Erro ao fazer login. Tente novamente.";
      setError(errorMessage);

      // Update rate limit info after failed attempt
      setTimeout(() => {
        const updatedRateLimit = LoginRateLimit.checkRateLimit(email);
        setRateLimitInfo(updatedRateLimit);
      }, 100);
    } else {
      navigate("/dashboard");
    }

    setLoading(false);
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate email format
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setError(emailValidation.error || "Email inválido");
      return;
    }

    // Validate full name
    if (!fullName.trim() || fullName.trim().length < 2) {
      setError("Nome deve ter pelo menos 2 caracteres");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    setLoading(true);

    const { error, needsConfirmation } = await signUp(email, password, fullName);

    if (error) {
      const errorMessage = typeof error === "string" ? error : "Erro ao criar conta. Tente novamente.";
      setError(errorMessage);
    } else if (needsConfirmation) {
      setConfirmationEmail(email);
      setShowConfirmationMessage(true);
      setError("");
    } else {
      setError("");
      navigate("/dashboard");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md mx-auto space-y-6">
        <Card className="bg-white shadow-sm border border-gray-200 rounded-lg">
          <CardHeader className="text-center space-y-4 pb-6">
            <div className="flex justify-center">
              <img src="/logo.webp" alt="Borderor" className="w-16 h-16" />
            </div>
            <CardTitle className="text-2xl font-semibold text-green-600">
              Borderor
            </CardTitle>
            <CardDescription className="text-gray-600 text-sm leading-relaxed">
              Sistema completo de gestão financeira
              <br />
              para seu negócio
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100 p-1 rounded-md h-11">
                <TabsTrigger
                  value="login"
                  className="text-sm font-medium text-gray-600 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm rounded-sm"
                >
                  Entrar
                </TabsTrigger>
                <TabsTrigger
                  value="create"
                  className="text-sm font-medium text-gray-600 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm rounded-sm"
                >
                  Criar Conta
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4">
                {error && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertDescription className="text-red-800">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-sm font-medium text-gray-700"
                    >
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder:text-gray-400"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="password"
                      className="text-sm font-medium text-gray-700"
                    >
                      Senha
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Sua senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder:text-gray-400"
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
                  </div>

                  {/* Rate Limiting Info */}
                  {rateLimitInfo && rateLimitInfo.attemptsLeft < 5 && (
                    <Alert className="border-orange-200 bg-orange-50">
                      <Shield className="h-4 w-4 text-orange-600" />
                      <AlertDescription className="text-orange-800">
                        {rateLimitInfo.attemptsLeft > 0
                          ? `${rateLimitInfo.attemptsLeft} tentativa(s) restante(s)`
                          : "Limite de tentativas excedido"}
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 mt-6"
                    disabled={
                      loading || (rateLimitInfo && !rateLimitInfo.allowed)
                    }
                  >
                    {loading ? "Entrando..." : "Entrar"}
                  </Button>

                  <div className="text-center mt-4">
                    <Button
                      type="button"
                      variant="ghost"
                      className="text-sm text-green-600 hover:text-green-700 hover:underline p-0 h-auto"
                      onClick={() => setShowRecoveryModal(true)}
                    >
                      Esqueceu sua senha?
                    </Button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="create" className="space-y-4">
                {error && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertDescription className="text-red-800">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}
                {showConfirmationMessage ? (
                  <div className="text-center space-y-4">
                    <Mail className="h-16 w-16 text-green-600 mx-auto" />
                    <div>
                      <h3 className="text-lg font-semibold text-green-800 mb-2">
                        Confirme seu Email
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Enviamos um link de confirmação para
                        <br />
                        <span className="font-semibold text-green-600">{confirmationEmail}</span>
                        <br />
                        Clique no link para ativar sua conta.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <Button
                        onClick={async () => {
                          const { error } = await resendConfirmation(confirmationEmail);
                          if (error) {
                            setError(error);
                          } else {
                            setError('');
                            alert('Email de confirmação reenviado!');
                          }
                        }}
                        variant="outline"
                        className="w-full"
                      >
                        Reenviar Email
                      </Button>

                      <Button
                        onClick={() => {
                          setShowConfirmationMessage(false);
                          setConfirmationEmail('');
                        }}
                        variant="ghost"
                        className="w-full"
                      >
                        Voltar ao Login
                      </Button>
                    </div>
                  </div>
                ) : (
                <form onSubmit={handleCreateAccount} className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="full-name"
                      className="text-sm font-medium text-gray-700"
                    >
                      Nome Completo
                    </Label>
                    <Input
                      id="full-name"
                      type="text"
                      placeholder="Seu nome completo"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder:text-gray-400"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="new-email"
                      className="text-sm font-medium text-gray-700"
                    >
                      Email
                    </Label>
                    <Input
                      id="new-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder:text-gray-400"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="new-password"
                      className="text-sm font-medium text-gray-700"
                    >
                      Senha
                    </Label>
                    <div className="relative">
                      <Input
                        id="new-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Senha forte (8+ caracteres)"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setShowPasswordStrength(e.target.value.length > 0);
                        }}
                        onFocus={() => setShowPasswordStrength(true)}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder:text-gray-400"
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
                    <PasswordStrengthIndicator
                      password={password}
                      show={showPasswordStrength}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="confirm-password"
                      className="text-sm font-medium text-gray-700"
                    >
                      Confirmar Senha
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Confirme sua senha"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder:text-gray-400"
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
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 mt-6"
                    disabled={loading}
                  >
                    {loading ? "Criando Conta..." : "Criar Conta"}
                  </Button>
                </form>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Recuperação de Senha */}
      <PasswordRecoveryModal
        isOpen={showRecoveryModal}
        onClose={() => setShowRecoveryModal(false)}
      />
    </div>
  );
}
