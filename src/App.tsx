import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  PlusCircle, Trash2, DollarSign, ShoppingCart, Car, Coffee, Home, Smartphone,
  Mail, Lock, User, Calendar, FileText, CreditCard, TrendingUp, TrendingDown,
  Brain, AlertTriangle, ArrowUpRight, ArrowDownRight, BarChart3, 
  ArrowLeft, CheckCircle, Building, Zap, Coins, Rocket
} from 'lucide-react';
import { 
  PieChart as RechartsPieChart, Cell, ResponsiveContainer, 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip 
} from 'recharts';

const logoDefinitiva = "/logo.png";

type Screen = 'splash' | 'login' | 'signup' | 'forgot-password' | 'reset-password' | 'dashboard' | 'investment-details' | 'investment-purchase' | 'investment-result';
type IconType = 'coffee' | 'car' | 'home' | 'shopping' | 'smartphone';
type RiskLevel = 'low' | 'medium' | 'high';
type InvestmentStatus = 'available' | 'purchased' | 'completed';
type PaymentMethod = 'salary' | 'credit';

interface Expense {
  id: string;
  category: string;
  amount: number;
  iconType: IconType;
  paymentMethod: PaymentMethod;
}

interface Investment {
  id: string;
  name: string;
  type: string;
  description: string;
  riskLevel: RiskLevel;
  expectedReturn: number;
  minInvestment: number;
  maxInvestment: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  historicalData: { month: string; value: number }[];
  status: InvestmentStatus;
  purchaseAmount?: number;
  purchaseDate?: Date;
  currentValue?: number;
  profitLoss?: number;
}

// Icon mapping
const iconMap = {
  coffee: Coffee,
  car: Car,
  home: Home,
  shopping: ShoppingCart,
  smartphone: Smartphone,
};

// Mock investments (exato do PDF)
const MOCK_INVESTMENTS: Investment[] = [
  {
    id: 'tech-nova',
    name: 'TechNova',
    type: 'Ações',
    description: 'Empresa de tecnologia em crescimento',
    riskLevel: 'medium',
    expectedReturn: 10,
    minInvestment: 100,
    maxInvestment: 5000,
    icon: Zap,
    color: '#3B82F6',
    historicalData: [
      { month: 'Jan', value: 100 },
      { month: 'Fev', value: 105 },
      { month: 'Mar', value: 108 },
      { month: 'Abr', value: 112 },
      { month: 'Mai', value: 110 },
      { month: 'Jun', value: 115 }
    ],
    status: 'available'
  },
  {
    id: 'coin-x',
    name: 'CoinX',
    type: 'Criptomoeda',
    description: 'Moeda digital emergente',
    riskLevel: 'high',
    expectedReturn: 30,
    minInvestment: 50,
    maxInvestment: 3000,
    icon: Coins,
    color: '#F59E0B',
    historicalData: [
      { month: 'Jan', value: 100 },
      { month: 'Fev', value: 120 },
      { month: 'Mar', value: 95 },
      { month: 'Abr', value: 140 },
      { month: 'Mai', value: 125 },
      { month: 'Jun', value: 135 }
    ],
    status: 'available'
  },
  {
    id: 'fii-alpha',
    name: 'FII Alpha',
    type: 'Fundo Imobiliário',
    description: 'Fundo de investimento imobiliário',
    riskLevel: 'low',
    expectedReturn: 5,
    minInvestment: 200,
    maxInvestment: 10000,
    icon: Building,
    color: '#10B981',
    historicalData: [
      { month: 'Jan', value: 100 },
      { month: 'Fev', value: 101 },
      { month: 'Mar', value: 103 },
      { month: 'Abr', value: 104 },
      { month: 'Mai', value: 105 },
      { month: 'Jun', value: 106 }
    ],
    status: 'available'
  },
  {
    id: 'neo-future',
    name: 'NeoFuture',
    type: 'Startup',
    description: 'Startup de energia renovável',
    riskLevel: 'high',
    expectedReturn: 50,
    minInvestment: 500,
    maxInvestment: 15000,
    icon: Rocket,
    color: '#8B5CF6',
    historicalData: [
      { month: 'Jan', value: 100 },
      { month: 'Fev', value: 90 },
      { month: 'Mar', value: 130 },
      { month: 'Abr', value: 110 },
      { month: 'Mai', value: 160 },
      { month: 'Jun', value: 145 }
    ],
    status: 'available'
  }
];
export default function App() {
  // === TODOS OS STATES DO PDF (exatos) ===
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [resetEmail, setResetEmailReset] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Estados financeiros principais (exatos do PDF)
  const [salary, setSalary] = useState(8000);           // salário inicial
  const [creditLimit, setCreditLimit] = useState(12000); // limite cartão
  const [expenses, setExpenses] = useState<Expense[]>([]); // todas as despesas
  const [creditBillAmount, setCreditBillAmount] = useState(0); // valor pago da fatura com salário

  // Formulários
  const [newCategory, setNewCategory] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [billPaymentAmount, setBillPaymentAmount] = useState('');

  // Edição salário / limite
  const [editingSalary, setEditingSalary] = useState(false);
  const [editingCredit, setEditingCredit] = useState(false);
  const [tempSalary, setTempSalary] = useState(salary.toString());
  const [tempCredit, setTempCredit] = useState(creditLimit.toString());

  // Investimentos
  const [investments] = useState<Investment[]>(MOCK_INVESTMENTS);
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [purchaseResult, setPurchaseResult] = useState<{ profit: number; final: number } | null>(null);

  // Splash → Login automático após 10 segundos
  useEffect(() => {
    if (currentScreen === 'splash') {
      const timer = setTimeout(() => setCurrentScreen('login'), 10000);
      return () => clearTimeout(timer);
    }
  }, [currentScreen]);

  // === CÁLCULOS EXATOS DO PDF (useMemo pra performance) ===
  const salaryExpenses = useMemo(() =>
    expenses.filter(e => e.paymentMethod === 'salary').reduce((s, e) => s + e.amount, 0),
    [expenses]
  );

  const creditExpenses = useMemo(() =>
    expenses.filter(e => e.paymentMethod === 'credit').reduce((s, e) => s + e.amount, 0),
    [expenses]
  );

  // currentSalaryUsed = gastos do salário + valor pago da fatura com salário
  const currentSalaryUsed = salaryExpenses + creditBillAmount;

  const remainingSalary = salary - currentSalaryUsed;
  const availableCredit = Math.max(0, creditLimit - creditExpenses);
  const debtToBank = Math.max(0, creditExpenses - creditLimit);

  const isCriticalSalary = remainingSalary < salary * 0.2;
  const isCreditAlmostFull = creditExpenses > creditLimit * 0.8;

  // Dados pros gráficos de pizza
  const salaryPieData = [
    { name: 'Usado', value: currentSalaryUsed, color: '#EF4444' },
    { name: 'Livre', value: Math.max(0, remainingSalary), color: '#10B981' }
  ];

  const creditPieData = [
    { name: 'Usado', value: creditExpenses, color: '#F59E0B' },
    { name: 'Livre', value: availableCredit, color: '#3B82F6' }
  ];

  // Alerta de dívida (exato do PDF)
  useEffect(() => {
    if (debtToBank > 0) {
      alert(`VOCE ESTÁ DEVENDO R$ ${debtToBank.toFixed(2)} AO BANCO!`);
    }
  }, [debtToBank]);
    // === FUNÇÕES DE DESPESA ===
  const addExpense = (method: PaymentMethod) => {
    if (!newCategory.trim() || !newAmount.trim()) return;
    const amount = parseFloat(newAmount);
    if (isNaN(amount) || amount <= 0) return;

    const icons: IconType[] = ['coffee', 'car', 'home', 'shopping', 'smartphone'];
    const randomIcon = icons[Math.floor(Math.random() * icons.length)];

    setExpenses(prev => [...prev, {
      id: Date.now().toString(),
      category: newCategory,
      amount,
      iconType: randomIcon,
      paymentMethod: method
    }]);

    setNewCategory('');
    setNewAmount('');
  };

  const removeExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  // === PAGAR FATURA COM SALÁRIO (exato do PDF) ===
  const payBillWithSalary = () => {
    const pay = parseFloat(billPaymentAmount);
    if (isNaN(pay) || pay <= 0) return alert('Digite um valor válido');
    if (pay > creditExpenses) return alert('Valor maior que a fatura atual');
    if (pay > remainingSalary) return alert('Saldo insuficiente no salário');

    setCreditBillAmount(prev => prev + pay);
    setBillPaymentAmount('');
    alert(`Pago R$ ${pay.toFixed(2)} da fatura com salário!`);
  };

  // === EDITAR SALÁRIO E LIMITE ===
  const startEditSalary = () => {
    setTempSalary(salary.toString());
    setEditingSalary(true);
  };
  const saveSalary = () => {
    const val = parseFloat(tempSalary);
    if (!isNaN(val) && val > 0) setSalary(val);
    setEditingSalary(false);
  };

  const startEditCredit = () => {
    setTempCredit(creditLimit.toString());
    setEditingCredit(true);
  };
  const saveCredit = () => {
    const val = parseFloat(tempCredit);
    if (!isNaN(val) && val >= 0) setCreditLimit(val);
    setEditingCredit(false);
  };

  // === INVESTIMENTOS ===
  const selectInvestment = (inv: Investment) => {
    setSelectedInvestment(inv);
    setCurrentScreen('investment-details');
  };

  const confirmPurchase = () => {
    if (!selectedInvestment || !investmentAmount) return;
    const amount = parseFloat(investmentAmount);
    if (isNaN(amount)) return alert('Valor inválido');

    const inv = selectedInvestment;
    if (amount < inv.minInvestment || amount > inv.maxInvestment)
      return alert(`Valor deve estar entre R$${inv.minInvestment} e R$${inv.maxInvestment}`);

    if (amount > remainingSalary)
      return alert('Saldo insuficiente no salário');

    // Simula resultado do investimento
    const randomReturn = inv.expectedReturn * (0.5 + Math.random());
    const profit = amount * (randomReturn / 100);
    const finalValue = amount + profit;

    setPurchaseResult({ profit, final: finalValue });

    // Registra como despesa
    addExpense('salary'); // reutiliza a função (categoria já está no input)

    setCurrentScreen('investment-result');
  };

  // === LOGIN / CADASTRO (simulação localStorage) ===
  const handleLogin = () => {
    if (email && password) {
      // Simulação simples
      localStorage.setItem('isLogged', 'true');
      setCurrentScreen('dashboard');
    } else {
      alert('Preencha email e senha');
    }
  };

  const handleSignup = () => {
    if (name && email && password && password === confirmPassword) {
      alert('Cadastro realizado! (simulado)');
      setCurrentScreen('login');
    } else {
      alert('Preencha todos os campos corretamente');
    }
  };
    // ==================== TELAS ====================

  // TELA SPLASH (10 segundos, exato do PDF)
  if (currentScreen === 'splash') {
    return (
      <div className="h-screen bg-gradient-to-br from-purple-900 via-purple-700 to-pink-600 flex flex-col items-center justify-center text-white">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 1.5, type: "spring" }}
          className="mb-12"
        >
          <div className="w-32 h-32 bg-white/20 rounded-3xl backdrop-blur-md border-4 border-white/30 flex items-center justify-center">
            <Brain className="w-20 h-20" />
          </div>
        </motion.div>

        <motion.h1
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="text-6xl font-bold tracking-tight"
        >
          BudgetPro
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-4 text-xl opacity-90"
        >
          Seu assistente financeiro com IA
        </motion.p>

        <div className="mt-16 flex space-x-2">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -15, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.1 }}
              className="w-3 h-3 bg-white/40 rounded-full"
            />
          ))}
        </div>
      </div>
    );
  }

  // TELA LOGIN
  if (currentScreen === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 to-purple-600 flex items-center justify-center p-6">
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-10">
            <h1 className="text-5xl font-bold text-white mb-2">BudgetPro</h1>
            <p className="text-white/80">Entre na sua conta</p>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl">
            <div className="space-y-6">
              <div className="relative">
                <Mail className="absolute left-4 top-4 w-6 h-6 text-white/70" />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 bg-white/20 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-4 focus:ring-pink-500/50"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-4 w-6 h-6 text-white/70" />
                <input
                  type="password"
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 bg-white/20 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-4 focus:ring-pink-500/50"
                />
              </div>

              <button
                onClick={handleLogin}
                className="w-full py-5 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl font-bold text-lg shadow-lg hover:shadow-pink-500/50 transform hover:scale-105 transition-all"
              >
                Entrar
              </button>

              <div className="text-center space-y-3 text-white/80">
                <button onClick={() => setCurrentScreen('signup')} className="underline">
                  Criar nova conta
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // TELA CADASTRO
  if (currentScreen === 'signup') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 to-purple-600 flex items-center justify-center p-6">
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-10">
            <h1 className="text-5xl font-bold text-white mb-2">Criar Conta</h1>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl space-y-5">
            <input placeholder="Nome completo" value={name} onChange={e => setName(e.target.value)} className="w-full px-6 py-4 bg-white/20 rounded-2xl text-white placeholder-white/60" />
            <input placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-6 py-4 bg-white/20 rounded-2xl text-white placeholder-white/60" />
            <input placeholder="Senha" type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-6 py-4 bg-white/20 rounded-2xl text-white placeholder-white/60" />
            <input placeholder="Confirmar senha" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full px-6 py-4 bg-white/20 rounded-2xl text-white placeholder-white/60" />

            <button
              onClick={handleSignup}
              className="w-full py-5 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl font-bold text-lg shadow-lg hover:shadow-pink-500/50 transform hover:scale-105 transition-all"
            >
              Criar Conta
            </button>

            <button onClick={() => setCurrentScreen('login')} className="w-full text-white/80 underline">
              Já tem conta? Entrar
            </button>
          </div>
        </motion.div>
      </div>
    );
  }
    // ==================== DASHBOARD PRINCIPAL ====================
  if (currentScreen === 'dashboard') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-700 text-white">
        {/* Header */}
        <header className="p-6 backdrop-blur-xl bg-black/30">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                <Brain className="w-9 h-9" />
              </div>
              <h1 className="text-3xl font-bold">BudgetPro</h1>
            </div>
            <div className="text-2xl">Olá, usuário</div>
          </div>
        </header>

        {/* Alertas críticos */}
        {(isCriticalSalary || debtToBank > 0) && (
          <div className="mx-6 mt-6 space-y-4">
            {isCriticalSalary && (
              <div className="bg-orange-600/90 p-6 rounded-3xl text-center">
                <AlertTriangle className="w-12 h-12 mx-auto mb-3" />
                <p className="text-2xl font-bold">SALDO CRÍTICO!</p>
                <p>R$ {remainingSalary.toFixed(2)} restante no salário</p>
              </div>
            )}
            {debtToBank > 0 && (
              <div className="bg-red-600/90 p-6 rounded-3xl text-center">
                <AlertTriangle className="w-12 h-12 mx-auto mb-3" />
                <p className="text-2xl font-bold">DÍVIDA COM O BANCO</p>
                <p className="text-3xl font-black">R$ {debtToBank.toFixed(2)}</p>
              </div>
            )}
          </div>
        )}

        <div className="max-w-7xl mx-auto p-6 space-y-8">
          {/* Cards principais */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 text-center">
              <DollarSign className="w-10 h-10 mx-auto mb-2" />
              <p className="text-3xl font-bold">R$ {salary.toFixed(2)}</p>
              <p className="opacity-80">Salário</p>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 text-center">
              <CreditCard className="w-10 h-10 mx-auto mb-2" />
              <p className="text-3xl font-bold">R$ {creditExpenses.toFixed(2)}</p>
              <p className="opacity-80">Fatura Cartão</p>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 text-center">
              <TrendingUp className="w-10 h-10 mx-auto mb-2 text-green-400" />
              <p className="text-3xl font-bold">R$ {remainingSalary.toFixed(2)}</p>
              <p className="opacity-80">Disponível</p>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 text-center">
              <Zap className="w-10 h-10 mx-auto mb-2 text-yellow-400" />
              <p className="text-3xl font-bold">{investments.length}</p>
              <p className="opacity-80">Investimentos</p>
            </div>
          </div>

          {/* Gráficos de pizza */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8">
              <h3 className="text-2xl font-bold mb-6 text-center">Uso do Salário</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie data={salaryPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                    {salaryPieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => `R$ ${v.toFixed(2)}`} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8">
              <h3 className="text-2xl font-bold mb-6 text-center">Cartão de Crédito</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie data={creditPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                    {creditPieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => `R$ ${v.toFixed(2)}`} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Adicionar despesa rápida */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8">
            <h3 className="text-2xl font-bold mb-6">Nova Despesa</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                placeholder="Categoria"
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
                className="px-6 py-4 bg-white/20 rounded-2xl placeholder-white/60"
              />
              <input
                type="number"
                placeholder="Valor"
                value={newAmount}
                onChange={e => setNewAmount(e.target.value)}
                className="px-6 py-4 bg-white/20 rounded-2xl"
              />
              <button onClick={() => addExpense('salary')} className="bg-green-500 py-4 rounded-2xl font-bold hover:bg-green-600">
                Salário
              </button>
              <button onClick={() => addExpense('credit')} className="bg-purple-500 py-4 rounded-2xl font-bold hover:bg-purple-600">
                Cartão
              </button>
            </div>
          </div>

          {/* Lista de investimentos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {investments.map(inv => (
              <div
                key={inv.id}
                onClick={() => selectInvestment(inv)}
                className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 text-center cursor-pointer hover:scale-105 transition-transform"
              >
                <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: inv.color + '30' }}>
                  <inv.icon className="w-12 h-12" style={{ color: inv.color }} />
                </div>
                <h4 className="text-xl font-bold">{inv.name}</h4>
                <p className="opacity-80">{inv.type}</p>
                <p className="text-3xl font-bold text-green-400 mt-4">{inv.expectedReturn}%</p>
                <p className="text-sm opacity-70">retorno esperado</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ==================== TELA DETALHES INVESTIMENTO ====================
  if (currentScreen === 'investment-details' && selectedInvestment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-pink-700 p-6">
        <button onClick={() => setCurrentScreen('dashboard')} className="mb-6 text-white flex items-center gap-2">
          <ArrowLeft className="w-6 h-6" /> Voltar
        </button>
        <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-xl rounded-3xl p-10">
          <div className="text-center mb-8">
            <div className="w-32 h-32 mx-auto rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: selectedInvestment.color + '30' }}>
              <selectedInvestment.icon className="w-20 h-20" style={{ color: selectedInvestment.color }} />
            </div>
            <h1 className="text-5xl font-bold">{selectedInvestment.name}</h1>
            <p className="text-2xl opacity-80">{selectedInvestment.type}</p>
          </div>
          <p className="text-xl text-center mb-10">{selectedInvestment.description}</p>
          <div className="bg-white/10 rounded-3xl p-8 mb-8">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={selectedInvestment.historicalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff30" />
                <XAxis dataKey="month" stroke="#fff" />
                <YAxis stroke="#fff" />
                <Tooltip contentStyle={{ backgroundColor: '#00000090', border: 'none' }} />
                <Line type="monotone" dataKey="value" stroke={selectedInvestment.color} strokeWidth={4} dot={{ fill: selectedInvestment.color }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center">
            <p className="text-6xl font-bold text-green-400">{selectedInvestment.expectedReturn}%</p>
            <p className="text-2xl">Retorno esperado anual</p>
            <button
              onClick={() => setCurrentScreen('investment-purchase')}
              className="mt-8 px-12 py-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full text-2xl font-bold hover:scale-110 transition-transform"
            >
              Investir Agora
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==================== TELA COMPRA INVESTIMENTO ====================
  if (currentScreen === 'investment-purchase' && selectedInvestment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-pink-700 flex items-center justify-center p-6">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-10 max-w-lg w-full">
          <h2 className="text-4xl font-bold text-center mb-8">Quanto deseja investir?</h2>
          <input
            type="number"
            placeholder="R$ 0,00"
            value={investmentAmount}
            onChange={e => setInvestmentAmount(e.target.value)}
            className="w-full text-center text-6xl font-bold bg-transparent border-b-4 border-white/50 focus:border-white outline-none pb-4 mb-10"
          />
          <div className="text-center space-y-4 mb-10">
            <p>Mínimo: R$ {selectedInvestment.minInvestment}</p>
            <p>Máximo: R$ {selectedInvestment.maxInvestment}</p>
          </div>
          <button
            onClick={confirmPurchase}
            className="w-full py-6 bg-gradient-to-r from-pink-500 to-purple-600 rounded-3xl text-2xl font-bold hover:scale-105 transition-transform"
          >
            Confirmar Investimento
          </button>
        </div>
      </div>
    );
  }

  // ==================== RESULTADO DO INVESTIMENTO ====================
  if (currentScreen === 'investment-result' && purchaseResult && selectedInvestment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-pink-700 flex items-center justify-center p-6">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-12 text-center max-w-2xl">
          <CheckCircle className="w-32 h-32 mx-auto mb-8 text-green-400" />
          <h1 className="text-5xl font-bold mb-6">Investimento Realizado!</h1>
          <p className="text-3xl mb-8">Você investiu em {selectedInvestment.name}</p>
          <div className="bg-white/10 rounded-3xl p-8 mb-10">
            <p className="text-6xl font-bold text-green-400">+R$ {purchaseResult.profit.toFixed(2)}</p>
            <p className="text-2xl mt-4">Valor final estimado: R$ {purchaseResult.final.toFixed(2)}</p>
          </div>
          <button
            onClick={() => setCurrentScreen('dashboard')}
            className="px-12 py-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full text-2xl font-bold"
          >
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Caso nenhuma tela corresponda
  return <div className="min-h-screen bg-purple-900 text-white flex items-center justify-center text-4xl">Carregando...</div>;
}
