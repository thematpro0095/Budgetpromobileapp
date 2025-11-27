import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
// ... todos os teus imports (mantém como estão)

export default function App() {
  // ... todos os teus states (mantém como estão)

  // ====== USEEFFECTS LIMPOS (SÓ 3) ======
  useEffect(() => {
    const token = localStorage.getItem('budgetProToken');
    if (token && currentScreen === 'login') {
      setCurrentScreen('dashboard');
    }
  }, [currentScreen]);

  useEffect(() => {
    const saved = localStorage.getItem('budgetProData');
    if (!saved) return;
    try {
      const data = JSON.parse(saved);
      if (data.salary !== undefined) setSalary(data.salary);
      if (data.creditLimit !== undefined) setCreditLimit(data.creditLimit);
      if (data.expenses) setExpenses(data.expenses);
      if (data.creditBillAmount !== undefined) setCreditBillAmount(data.creditBillAmount);
      if (data.investments && Array.isArray(data.investments)) {
        setInvestments(prev => 
          prev.map(original => {
            const savedInv = data.investments.find((s: any) => s.id === original.id);
            return savedInv ? { ...original, ...savedInv } : original;
          })
        );
      }
    } catch (e) {
      console.error("Erro ao carregar dados salvos", e);
    }
  }, []);

  useEffect(() => {
    if (currentScreen === 'splash') {
      const timer = setTimeout(() => {
        setCurrentScreen('login');
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [currentScreen]);

  useEffect(() => {
    const dataToSave = {
      salary, creditLimit, expenses, creditBillAmount,
      investments: investments.map(i => ({
        id: i.id, status: i.status, purchaseAmount: i.purchaseAmount,
        currentValue: i.currentValue, profitLoss: i.profitLoss
      }))
    };
    localStorage.setItem('budgetProData', JSON.stringify(dataToSave));
  }, [salary, creditLimit, expenses, creditBillAmount, investments]);

  // ====== FUNÇÕES AUXILIARES ======
  const getRiskColor = (risk: RiskLevel) => {
    switch (risk) {
      case 'low': return '#10B981';
      case 'medium': return '#F59E0B';
      case 'high': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getRiskLabel = (risk: RiskLevel) => {
    switch (risk) {
      case 'low': return 'Baixo';
      case 'medium': return 'Médio';
      case 'high': return 'Alto';
      default: return 'Desconhecido';
    }
  };

  // ... todos os teus useMemo e cálculos (mantém como estão)

  // ====== TELAS ======
  if (currentScreen === 'splash') {
    return (
      <motion.div 
        className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <motion.div 
          initial={{ scale: 0, rotate: -180 }} 
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 1.5, type: "spring" }}
        >
          <Brain className="w-32 h-32 text-white" />
        </motion.div>
        <h1 className="text-5xl font-black text-white mt-6 bg-gradient-to-r from-blue-200 to-purple-300 bg-clip-text text-transparent">
          BudgetPro
        </h1>
        <p className="text-xl text-blue-100 mt-4">Seu dinheiro, seu controle total.</p>
      </motion.div>
    );
  }

  if (currentScreen === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-xl">
            <CardHeader className="text-center">
              <img src={logoDefinitiva} alt="BudgetPro" className="w-24 h-24 mx-auto mb-6 rounded-full shadow-lg" />
              <CardTitle className="text-3xl font-bold text-gray-800">Bem-vindo</CardTitle>
              <p className="text-gray-600">Entre na sua conta</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input 
                  type="email" 
                  placeholder="seu@email.com"
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label>Senha</Label>
                <Input 
                  type="password" 
                  placeholder="••••••••"
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                />
              </div>
              <Button 
                onClick={() => {
                  // Login simples (você pode melhorar depois)
                  if (email && password) {
                    localStorage.setItem('budgetProToken', 'valid_token_' + Date.now());
                    setCurrentScreen('dashboard');
                  } else {
                    alert('Preencha email e senha');
                  }
                }}
                className="w-full h-12 text-lg font-semibold"
                style={{ backgroundColor: '#046BF4' }}
              >
                Entrar
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // DASHBOARD (e todas as outras telas)
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white p-6 text-center shadow-xl">
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          <img src={logoDefinitiva} alt="BudgetPro" className="w-12 h-12" />
          <div className="flex-1">
            <h1 className="text-3xl font-black">BudgetPro</h1>
            <p className="opacity-90">
              Salário: <span className="font-semibold">R$ {salary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span> • 
              Cartão: <span className="font-semibold">R$ {creditLimit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </p>
          </div>
          <Button
            onClick={() => {
              localStorage.removeItem('budgetProToken');
              setCurrentScreen('login');
            }}
            variant="outline"
            className="border-white text-white hover:bg-white/20"
            size="sm"
          >
            Sair
          </Button>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-6xl mx-auto p-6">
        <h2 className="text-4xl font-bold text-center text-gray-800 mb-8">
          Dashboard Financeiro
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <DollarSign className="w-12 h-12 mx-auto text-green-600 mb-4" />
              <p className="text-3xl font-bold text-green-600">R$ {salary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              <p className="text-sm text-gray-600 mt-1">Salário Mensal</p>
            </CardContent>
          </Card>
          <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <CreditCard className="w-12 h-12 mx-auto text-blue-600 mb-4" />
              <p className="text-3xl font-bold text-blue-600">R$ {creditLimit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              <p className="text-sm text-gray-600 mt-1">Limite do Cartão</p>
            </CardContent>
          </Card>
          <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-12 h-12 mx-auto text-emerald-600 mb-4" />
              <p className="text-3xl font-bold text-emerald-600">R$ 0,00</p>
              <p className="text-sm text-gray-600 mt-1">Economia</p>
            </CardContent>
          </Card>
          <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="w-12 h-12 mx-auto text-amber-600 mb-4" />
              <p className="text-3xl font-bold text-amber-600">R$ 0,00</p>
              <p className="text-sm text-gray-600 mt-1">Dívidas</p>
            </CardContent>
          </Card>
        </div>
        
        <div className="text-center py-12">
          <p className="text-xl font-semibold text-gray-700">
            🎉 <strong>SEUS DADOS ESTÃO SALVOS PARA SEMPRE!</strong>
          </p>
          <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
            Pode fechar o navegador, desligar o celular... quando voltar, seu salário e limite vão estar aqui.
          </p>
        </div>
      </div>
    </div>
  );
}
