import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { addSale, addInstallments, generateInstallments } from "@/lib/storage";
import { Sale } from "@shared/types";
import { MobileLayout } from "@/components/MobileNavigation";
import {
  Home,
  DollarSign,
  Calendar,
  Users,
  Plus,
  ArrowLeft,
  CheckCircle,
  Info,
} from "lucide-react";

export default function Cadastro() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    propertyName: "",
    clientName: "",
    totalValue: "",
    saleDate: "",
    totalInstallments: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const validateStep1 = () => {
    if (!formData.propertyName.trim()) {
      setError("Nome do empreendimento é obrigatório");
      return false;
    }

    if (!formData.clientName.trim()) {
      setError("Nome do cliente é obrigatório");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    const totalValue = parseFloat(formData.totalValue);
    if (!totalValue || totalValue <= 0) {
      setError("Valor total deve ser maior que zero");
      return false;
    }

    if (!formData.saleDate) {
      setError("Data da venda é obrigatória");
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    const installments = parseInt(formData.totalInstallments);
    if (!installments || installments < 1 || installments > 240) {
      setError("Número de parcelas deve ser entre 1 e 240");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    } else if (step === 3 && validateStep3()) {
      setStep(4); // Review step
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      setError("Usuário não autenticado");
      return;
    }

    console.log("🚀 Iniciando cadastro de venda. Usuário:", user);

    if (!validateStep1() || !validateStep2() || !validateStep3()) {
      return;
    }

    setLoading(true);

    try {
      const saleId = `sale_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const sale: Sale = {
        id: saleId,
        userId: user.id,
        propertyName: formData.propertyName.trim(),
        clientName: formData.clientName.trim(),
        totalValue: parseFloat(formData.totalValue),
        saleDate: formData.saleDate,
        totalInstallments: parseInt(formData.totalInstallments),
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      console.log("📝 Dados da venda a ser salva:", sale);

      // Save sale
      addSale(sale);

      // Generate and save installments (recebimento começa no mês seguinte)
      const installments = generateInstallments(sale);
      addInstallments(installments);

      // Show success and redirect
      setStep(5);
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error) {
      setError("Erro ao cadastrar venda. Tente novamente.");
      console.error("Error creating sale:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateInstallmentValue = () => {
    const total = parseFloat(formData.totalValue);
    const installments = parseInt(formData.totalInstallments);

    if (total && installments) {
      return (total / installments).toFixed(2);
    }
    return "0.00";
  };

  const formatCurrency = (value: string) => {
    const num = parseFloat(value);
    return isNaN(num)
      ? "R$ 0,00"
      : new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(num);
  };

  if (step === 5) {
    return (
      <MobileLayout>
        <div className="p-4 flex items-center justify-center min-h-[50vh]">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 text-center">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-green-600 mb-2">
                Venda Cadastrada!
              </h2>
              <p className="text-gray-600 mb-4">
                Sua venda foi registrada com sucesso e as parcelas foram geradas
                automaticamente.
              </p>
              <Button onClick={() => navigate("/dashboard")} className="w-full">
                Voltar ao Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="p-4">
        {/* Progress Indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-bold text-gray-900">Nova Venda</h1>
            <span className="text-sm text-gray-500">Passo {step} de 4</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {error && (
          <Alert className="mb-4 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Step 1: Property and Client */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Home className="h-5 w-5 mr-2 text-green-600" />
                Informações Básicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="propertyName">
                  Nome do Resort/Empreendimento
                </Label>
                <Input
                  id="propertyName"
                  type="text"
                  placeholder="Ex: Resort Costão do Santinho"
                  value={formData.propertyName}
                  onChange={(e) =>
                    handleInputChange("propertyName", e.target.value)
                  }
                  className="text-base" // Better for mobile
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientName">Nome do Cliente</Label>
                <Input
                  id="clientName"
                  type="text"
                  placeholder="Nome completo do cliente"
                  value={formData.clientName}
                  onChange={(e) =>
                    handleInputChange("clientName", e.target.value)
                  }
                  className="text-base"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Value and Date */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                Valor e Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="totalValue">
                  Valor da Multipropriedade (R$)
                </Label>
                <Input
                  id="totalValue"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.totalValue}
                  onChange={(e) =>
                    handleInputChange("totalValue", e.target.value)
                  }
                  className="text-base text-right"
                />
                {formData.totalValue && (
                  <p className="text-sm text-green-600 font-medium">
                    {formatCurrency(formData.totalValue)}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="saleDate">Data da Venda</Label>
                <Input
                  id="saleDate"
                  type="date"
                  value={formData.saleDate}
                  onChange={(e) =>
                    handleInputChange("saleDate", e.target.value)
                  }
                  className="text-base"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Installments */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-green-600" />
                Parcelamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="totalInstallments">Número de Parcelas</Label>
                <Input
                  id="totalInstallments"
                  type="number"
                  min="1"
                  max="240"
                  placeholder="12"
                  value={formData.totalInstallments}
                  onChange={(e) =>
                    handleInputChange("totalInstallments", e.target.value)
                  }
                  className="text-base"
                />
              </div>

              <Alert className="border-blue-200 bg-blue-50">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>Sistema de Comissões:</strong> Os recebimentos começam
                  no mês seguinte à venda (dia 15 de cada mês)
                </AlertDescription>
              </Alert>

              {formData.totalValue && formData.totalInstallments && (
                <Alert className="border-blue-200 bg-blue-50">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <strong>Valor por parcela:</strong>{" "}
                    {formatCurrency(calculateInstallmentValue())}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                Confirmar Dados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Empreendimento:</span>
                  <span className="font-medium">{formData.propertyName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cliente:</span>
                  <span className="font-medium">{formData.clientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Valor total:</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(formData.totalValue)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Data da venda:</span>
                  <span className="font-medium">
                    {new Date(formData.saleDate).toLocaleDateString("pt-BR")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Parcelas:</span>
                  <span className="font-medium">
                    {formData.totalInstallments}x
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Valor por parcela:</span>
                  <span className="font-medium">
                    {formatCurrency(calculateInstallmentValue())}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Primeira parcela:</span>
                  <span className="font-medium">
                    {(() => {
                      const saleDate = new Date(formData.saleDate);
                      const firstInstallment = new Date(
                        saleDate.getFullYear(),
                        saleDate.getMonth() + 1,
                        15,
                      );
                      return firstInstallment.toLocaleDateString("pt-BR");
                    })()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-3 mt-6">
          {step > 1 && (
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              disabled={loading}
              className="flex-1"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          )}

          {step < 4 ? (
            <Button
              onClick={handleNext}
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              Próximo
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {loading ? "Cadastrando..." : "Finalizar Cadastro"}
            </Button>
          )}
        </div>
      </div>
    </MobileLayout>
  );
}
