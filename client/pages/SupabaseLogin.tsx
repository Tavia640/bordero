import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import EnvironmentNotice from "@/components/EnvironmentNotice";
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
import SupabasePasswordRecovery from "@/components/SupabasePasswordRecovery";
import { SupabaseTestPanel } from "@/components/SupabaseTestPanel";
import { Mail, CheckCircle, AlertTriangle, Eye, EyeOff } from "lucide-react";

export default function SupabaseLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [showConfirmationMessage, setShowConfirmationMessage] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  
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
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      setError(error);
    } else {
      navigate("/dashboard");
    }

    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate inputs
    if (!fullName.trim() || fullName.trim().length < 2) {
      setError("Nome deve ter pelo menos 2 caracteres");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    if (password.length < 6) {
      setError("Senha deve ter pelo menos 6 caracteres");
      return;
    }

    setLoading(true);

    const { error, needsConfirmation } = await signUp(email, password, fullName);

    if (error) {
      setError(error);
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

  const handleResendConfirmation = async () => {
    setLoading(true);
    const { error } = await resendConfirmation(confirmationEmail);
    
    if (error) {
      setError(error);
    } else {
      setSuccessMessage('Email de confirmação reenviado com sucesso!');
      setTimeout(() => setSuccessMessage(''), 5000);
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
            {successMessage && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {successMessage}
                </AlertDescription>
              </Alert>
            )}

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
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}
                
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                      Senha
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Sua senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pr-10"
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

                  <Button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 mt-6"
                    disabled={loading}
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
                    <AlertTriangle className="h-4 w-4 text-red-600" />
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
                        onClick={handleResendConfirmation}
                        variant="outline"
                        className="w-full"
                        disabled={loading}
                      >
                        {loading ? 'Enviando...' : 'Reenviar Email'}
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
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="full-name" className="text-sm font-medium text-gray-700">
                        Nome Completo
                      </Label>
                      <Input
                        id="full-name"
                        type="text"
                        placeholder="Seu nome completo"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full"
                        required
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="new-email" className="text-sm font-medium text-gray-700">
                        Email
                      </Label>
                      <Input
                        id="new-email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full"
                        required
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="new-password" className="text-sm font-medium text-gray-700">
                        Senha
                      </Label>
                      <div className="relative">
                        <Input
                          id="new-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Senha (mínimo 6 caracteres)"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pr-10"
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
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-password" className="text-sm font-medium text-gray-700">
                        Confirmar Senha
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirm-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Confirme sua senha"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full pr-10"
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
                      disabled={loading || password !== confirmPassword}
                    >
                      {loading ? "Criando Conta..." : "Criar Conta"}
                    </Button>
                  </form>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Informações do sistema */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            🚀 Sistema Supabase Ativo - Emails funcionais
          </p>
        </div>

        {/* Painel de teste (apenas em desenvolvimento) */}
        <SupabaseTestPanel />
      </div>

      {/* Modal de Recuperação de Senha */}
      <SupabasePasswordRecovery
        isOpen={showRecoveryModal}
        onClose={() => setShowRecoveryModal(false)}
      />
    </div>
  );
}
