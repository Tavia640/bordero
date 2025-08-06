import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/SimpleAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LoginStatus from "@/components/LoginStatus";
import PasswordRecoveryModal from "@/components/PasswordRecoveryModal";
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
import { 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertTriangle, 
  Users,
  Mail,
  Lock,
  User
} from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showDemoUsers, setShowDemoUsers] = useState(false);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  
  const { signIn, signUp, user } = useAuth();
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
    setSuccess("");
    setLoading(true);

    const result = await signIn(email, password);

    if (result.success) {
      setSuccess("Login realizado com sucesso!");
      setTimeout(() => navigate("/dashboard"), 1000);
    } else {
      setError(result.error || "Erro no login");
    }

    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    if (name.trim().length < 2) {
      setError("O nome deve ter pelo menos 2 caracteres");
      return;
    }

    setLoading(true);

    const result = await signUp(email, password, name);

    if (result.success) {
      setSuccess("Conta criada com sucesso! Fazendo login...");
      setTimeout(() => navigate("/dashboard"), 1000);
    } else {
      setError(result.error || "Erro no cadastro");
    }

    setLoading(false);
  };

  const loginWithDemo = async (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError("");
    setLoading(true);

    const result = await signIn(demoEmail, demoPassword);

    if (result.success) {
      setSuccess("Login demo realizado com sucesso!");
      setTimeout(() => navigate("/dashboard"), 1000);
    } else {
      setError(result.error || "Erro no login demo");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md mx-auto space-y-6">
        <LoginStatus />

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
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {success}
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
                  value="signup"
                  className="text-sm font-medium text-gray-600 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm rounded-sm"
                >
                  Criar Conta
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                      Senha
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Sua senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10"
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
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
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

                {/* Demo Users Section */}
                <div className="mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full mb-3"
                    onClick={() => setShowDemoUsers(!showDemoUsers)}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    {showDemoUsers ? "Ocultar" : "Mostrar"} Usuários Demo
                  </Button>

                  {showDemoUsers && (
                    <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-600 mb-2">Clique para login automático:</p>
                      
                      <Button
                        type="button"
                        variant="ghost"
                        className="w-full justify-start text-left h-auto p-2"
                        onClick={() => loginWithDemo("admin@vendas.com", "admin123")}
                        disabled={loading}
                      >
                        <div className="text-sm">
                          <div className="font-medium">👑 Administrador</div>
                          <div className="text-gray-500">admin@vendas.com</div>
                        </div>
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        className="w-full justify-start text-left h-auto p-2"
                        onClick={() => loginWithDemo("vendedor@vendas.com", "vendas123")}
                        disabled={loading}
                      >
                        <div className="text-sm">
                          <div className="font-medium">💼 Vendedor</div>
                          <div className="text-gray-500">vendedor@vendas.com</div>
                        </div>
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        className="w-full justify-start text-left h-auto p-2"
                        onClick={() => loginWithDemo("demo@demo.com", "123456")}
                        disabled={loading}
                      >
                        <div className="text-sm">
                          <div className="font-medium">🚀 Demo</div>
                          <div className="text-gray-500">demo@demo.com</div>
                        </div>
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="text-sm font-medium text-gray-700">
                      Nome Completo
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Seu nome completo"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-10"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-sm font-medium text-gray-700">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-sm font-medium text-gray-700">
                      Senha
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Mínimo 6 caracteres"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10"
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

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-sm font-medium text-gray-700">
                      Confirmar Senha
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="confirm-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Confirme sua senha"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10"
                        required
                        disabled={loading}
                      />
                    </div>
                    {confirmPassword && password !== confirmPassword && (
                      <p className="text-xs text-red-600">
                        As senhas não coincidem
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
                    disabled={loading}
                  >
                    {loading ? "Criando Conta..." : "Criar Conta"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center space-y-2">
          <p className="text-xs text-gray-500">
            ✅ Sistema reformulado - funcionando perfeitamente
          </p>
          <p className="text-xs text-green-600 font-medium">
            Sexta reformulação completa! 🎉
          </p>
        </div>
      </div>

      {/* Password Recovery Modal */}
      <PasswordRecoveryModal
        isOpen={showRecoveryModal}
        onClose={() => setShowRecoveryModal(false)}
      />
    </div>
  );
}
