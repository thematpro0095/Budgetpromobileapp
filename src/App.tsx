import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Input } from './components/ui/input';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Label } from './components/ui/label';
import { Alert, AlertDescription } from './components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Progress } from './components/ui/progress';
import { 
  PlusCircle, 
  Trash2, 
  DollarSign, 
  ShoppingCart, 
  Car, 
  Coffee, 
  Home, 
  Smartphone,
  Mail,
  Lock,
  User,
  Calendar,
  FileText,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Brain,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Building,
  Zap,
  Coins,
  Rocket
} from 'lucide-react';
import { PieChart as RechartsPieChart, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, Legend, Pie } from 'recharts';
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
  paymentMethod: PaymentMethod; // 'salary' para gastos do salário, 'credit' para cartão
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

// Icon mapping to prevent recreation on every render
const iconMap = {
  coffee: Coffee,
  car: Car,
  home: Home,
  shopping: ShoppingCart,
  smartphone: Smartphone,
};

// Mock investments data
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
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [salary, setSalary] = useState(0);
  const [creditLimit, setCreditLimit] = useState(0);

  // New financial control states
  const [salaryUsed, setSalaryUsed] = useState(0);
  const [creditUsed, setCreditUsed] = useState(0);
  const [bankDebt, setBankDebt] = useState(0);

  // Separate expenses for salary and credit card
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // Credit card bill payment
  const [creditBillAmount, setCreditBillAmount] = useState(0); // Total amount spent on credit card
  const [billPaymentAmount, setBillPaymentAmount] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [editingSalary, setEditingSalary] = useState(false);
  const [editingCredit, setEditingCredit] = useState(false);
  const [tempSalary, setTempSalary] = useState(salary.toString());
  const [tempCredit, setTempCredit] = useState(creditLimit.toString());

  // Investment states
  const [investments, setInvestments] = useState<Investment[]>(MOCK_INVESTMENTS);
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [purchaseConfirmed, setPurchaseConfirmed] = useState(false);
  const [showInvestmentResult, setShowInvestmentResult] = useState(false);

  // Dark mode state - detects system preference
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setDarkMode(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => setDarkMode(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // ====== SEGURANÇA + PERSISTÊNCIA (NUNCA APAGA NADA) ======
  
  // 1. Verifica se já está logado (token)
  useEffect(() => {
    const token = localStorage.getItem('budgetProToken');
    if (token && currentScreen === 'login') {
      setCurrentScreen('dashboard');
    }
  }, [currentScreen]);

  // 2. Carrega os dados financeiros salvos (salário, despesas, investimentos, etc) - Versão consolidada sem duplicatas
  useEffect(() => {
    const saved = localStorage.getItem('budgetProData');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setSalary(data.salary !== undefined ? data.salary : 5000);
        setCreditLimit(data.creditLimit !== undefined ? data.creditLimit : 3000);
        setExpenses(data.expenses || []);
        setCreditBillAmount(data.creditBillAmount || 0);
        setInvestments(data.investments || MOCK_INVESTMENTS);
        console.log('Dados carregados do localStorage!');
      } catch (e) {
        console.error('Erro ao carregar dados salvos', e);
        setSalary(5000);
        setCreditLimit(3000);
      }
    } else {
      setSalary(5000);
      setCreditLimit(3000);
    }
  }, []);

  // 3. Salva tudo automaticamente quando mudar - Versão consolidada sem duplicatas
  useEffect(() => {
    const dataToSave = {
      salary,
      creditLimit,
      expenses,
      creditBillAmount,
      investments,
      version: '1.0' // pra futuras migrações
    };
    localStorage.setItem('budgetProData', JSON.stringify(dataToSave));
  }, [salary, creditLimit, expenses, creditBillAmount, investments]);

  // New state for interactive charts
  const [selectedPieSlice, setSelectedPieSlice] = useState<string | null>(null);

  // Auto-navigate from splash to login after 10 seconds
  useEffect(() => {
    if (currentScreen === 'splash') {
      const timer = setTimeout(() => {
        setCurrentScreen('login');
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [currentScreen]);

  // New financial calculations - Separated by payment method
  const salaryExpenses = React.useMemo(() => 
    expenses.filter(e => e.paymentMethod === 'salary').reduce((sum, expense) => sum + expense.amount, 0), 
    [expenses]
  );

  const creditExpenses = React.useMemo(() => 
    expenses.filter(e => e.paymentMethod === 'credit').reduce((sum, expense) => sum + expense.amount, 0), 
    [expenses]
  );

  const totalExpenses = React.useMemo(() => salaryExpenses + creditExpenses, [salaryExpenses, creditExpenses]);

  // Calculate financial distribution
  const { remainingSalary, availableCredit, totalDebt, creditBill } = React.useMemo(() => {
    const currentSalaryUsed = salaryExpenses + creditBillAmount; // Salary used includes bill payments
    const currentCreditBill = creditExpenses; // Bill amount is credit expenses minus payments
    const currentCreditUsed = currentCreditBill; // Credit used is the bill amount
    const currentDebt = Math.max(0, currentCreditUsed - creditLimit); // Debt if exceeds credit limit

    return {
      remainingSalary: salary - currentSalaryUsed,
      availableCredit: creditLimit - currentCreditUsed,
      totalDebt: currentDebt,
      creditBill: currentCreditBill
    };
  }, [salaryExpenses, creditExpenses, salary, creditLimit, creditBillAmount]);

  const isLowMoney = React.useMemo(() => 
    remainingSalary < salary * 0.2 || (creditBill > creditLimit * 0.8), 
    [remainingSalary, salary, creditBill, creditLimit]
  );

  // Chart data calculations with new financial structure
  const expensePercentage = React.useMemo(() => 
    Math.min(((salaryExpenses / salary) * 100), 100), [salaryExpenses, salary]
  );

  const creditPercentage = React.useMemo(() => 
    Math.min(((creditExpenses / creditLimit) * 100), 100), [creditExpenses, creditLimit]
  );

  // New financial breakdown for charts
  const financialBreakdown = React.useMemo(() => {
    const salaryUsedAmount = salaryExpenses + creditBillAmount;
    const creditUsedAmount = creditExpenses;
    const debtAmount = Math.max(0, creditExpenses - creditLimit);

    return {
      salaryUsed: salaryUsedAmount,
      creditUsed: creditUsedAmount,
      debt: debtAmount,
      total: totalExpenses
    };
  }, [salaryExpenses, creditExpenses, creditBillAmount, salary, creditLimit, totalExpenses]);

  // Financial notification effects
  useEffect(() => {
    if (remainingSalary <= 0) {
      // Notification removed - user controls payment method manually now
    }

    if (financialBreakdown.debt > 0) {
      alert(`🚨 Você ultrapassou o limite do cartão. Agora está devendo ao banco R$ ${financialBreakdown.debt.toFixed(2)}!`);
    }

    if (creditBill > creditLimit * 0.9) {
      // High credit usage warning
    }
  }, [financialBreakdown, salary, remainingSalary, creditBill, creditLimit]);

  // Progress ring component mobile-first
  const ProgressRing = ({ 
    percentage, 
    size = 100, 
    strokeWidth = 6, 
    color = '#046BF4' 
  }: { 
    percentage: number; 
    size?: number; 
    strokeWidth?: number; 
    color?: string;
  }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = `${circumference} ${circumference}`;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative inline-flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-semibold" style={{ color }}>
            {Math.round(percentage)}%
          </span>
        </div>
      </div>
    );
  };

  // Simple "server" simulation using localStorage
  const handleLogin = React.useCallback(() => {
    if (!email || !password) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    const users = JSON.parse(localStorage.getItem('budgetProUsers') || '[]');
    const user = users.find((u: any) => u.email === email && u.password === password);

    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      setCurrentScreen('dashboard');
    } else {
      alert('Email ou senha incorretos. Verifique seus dados ou crie uma conta.');
    }
  }, [email, password]);

  const handleSignup = React.useCallback(() => {
    if (!name || !email || !password) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (password !== confirmPassword) {
      alert('As senhas não coincidem.');
      return;
    }

    if (password.length < 6) {
      alert('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    const users = JSON.parse(localStorage.getItem('budgetProUsers') || '[]');

    // Check if email already exists
    if (users.some((u: any) => u.email === email)) {
      alert('Este email já está cadastrado. Tente fazer login.');
      return;
    }

    // Save new user
    const newUser = { id: Date.now(), name, email, password, cpf };
    users.push(newUser);
    localStorage.setItem('budgetProUsers', JSON.stringify(users));

    // Clear form and go back to login
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setCpf('');

    alert('Conta criada com sucesso! Faça login para continuar.');
    setCurrentScreen('login');
  }, [name, email, password, confirmPassword, cpf]);

  const handleForgotPassword = React.useCallback(() => {
    if (!resetEmail) {
      alert('Por favor, digite seu email.');
      return;
    }

    const users = JSON.parse(localStorage.getItem('budgetProUsers') || '[]');
    const user = users.find((u: any) => u.email === resetEmail);

    if (user) {
      // Store email for password reset
      localStorage.setItem('resetEmail', resetEmail);
      alert('Link de redefinição enviado para seu email! (Simulação)');
      setCurrentScreen('reset-password');
    } else {
      alert('Email não encontrado em nossa base de dados.');
    }
  }, [resetEmail]);

  const handleResetPassword = React.useCallback(() => {
    if (!newPassword || !confirmNewPassword) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      alert('As senhas não coincidem.');
      return;
    }

    if (newPassword.length < 6) {
      alert('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    const email = localStorage.getItem('resetEmail');
    if (!email) {
      alert('Erro: sessão expirada.');
      setCurrentScreen('login');
      return;
    }

    const users = JSON.parse(localStorage.getItem('budgetProUsers') || '[]');
    const userIndex = users.findIndex((u: any) => u.email === email);

    if (userIndex !== -1) {
      users[userIndex].password = newPassword;
      localStorage.setItem('budgetProUsers', JSON.stringify(users));
      localStorage.removeItem('resetEmail');

      setNewPassword('');
      setConfirmNewPassword('');
      setResetEmail('');

      alert('Senha alterada com sucesso! Faça login com sua nova senha.');
      setCurrentScreen('login');
    } else {
      alert('Erro: usuário não encontrado.');
      setCurrentScreen('login');
    }
  }, [newPassword, confirmNewPassword]);

  const addExpense = React.useCallback((paymentMethod: PaymentMethod) => {
    if (newCategory && newAmount) {
      const iconTypes: IconType[] = ['shopping', 'smartphone', 'coffee'];
      const randomIconType = iconTypes[Math.floor(Math.random() * iconTypes.length)];

      setExpenses(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          category: newCategory,
          amount: parseFloat(newAmount),
          iconType: randomIconType,
          paymentMethod: paymentMethod
        }
      ]);
      setNewCategory('');
      setNewAmount('');
    }
  }, [newCategory, newAmount]);

  // Function to pay credit card bill
  const payCreditBill = React.useCallback(() => {
    const paymentAmount = parseFloat(billPaymentAmount);

    if (!billPaymentAmount || paymentAmount <= 0) {
      alert('Digite um valor válido para o pagamento.');
      return;
    }

    if (paymentAmount > creditBill) {
      alert(`O valor do pagamento não pode ser maior que a fatura (R$ ${creditBill.toFixed(2)}).`);
      return;
    }

    if (paymentAmount > remainingSalary) {
      alert(`Você não tem saldo suficiente no salário (R$ ${remainingSalary.toFixed(2)}).`);
      return;
    }

    // Update credit bill amount paid
    setCreditBillAmount(prev => prev + paymentAmount);
    setBillPaymentAmount('');

    alert(`✅ Pagamento de R$ ${paymentAmount.toFixed(2)} realizado com sucesso!`);
  }, [billPaymentAmount, creditBill, remainingSalary]);

  const removeExpense = React.useCallback((id: string) => {
    setExpenses(prev => prev.filter(expense => expense.id !== id));
  }, []);

  const updateSalary = React.useCallback(() => {
    setSalary(parseFloat(tempSalary) || 0);
    setEditingSalary(false);
  }, [tempSalary]);

  const updateCredit = React.useCallback(() => {
    setCreditLimit(parseFloat(tempCredit) || 0);
    setEditingCredit(false);
  }, [tempCredit]);

  // Investment functions
  const selectInvestment = React.useCallback((investment: Investment) => {
    setSelectedInvestment(investment);
    setCurrentScreen('investment-details');
  }, []);

  const confirmInvestmentPurchase = React.useCallback(() => {
    if (!selectedInvestment || !investmentAmount) {
      alert('Dados incompletos para o investimento.');
      return;
    }

    const amount = parseFloat(investmentAmount);
    if (amount < selectedInvestment.minInvestment || amount > selectedInvestment.maxInvestment) {
      alert(`Valor deve estar entre R$ ${selectedInvestment.minInvestment} e R$ ${selectedInvestment.maxInvestment}.`);
      return;
    }

    if (amount > remainingSalary + availableCredit) {
      alert('Saldo insuficiente para este investimento.');
      return;
    }

    // Simulate investment result (random gain/loss within expected range)
    const variationFactor = (Math.random() * 2 - 1); // -1 to 1
    const returnPercentage = (selectedInvestment.expectedReturn / 100) * variationFactor * 0.5; // Half the expected range for realism
    const finalValue = amount * (1 + returnPercentage);
    const profitLoss = finalValue - amount;

    // Add investment as expense
    const investmentExpense: Expense = {
      id: Date.now().toString(),
      category: `Investimento: ${selectedInvestment.name}`,
      amount: amount,
      iconType: 'shopping'
    };

    setExpenses(prev => [...prev, investmentExpense]);

    // Update investment status
    setInvestments(prev => prev.map(inv => 
      inv.id === selectedInvestment.id 
        ? {
            ...inv,
            status: 'purchased' as InvestmentStatus,
            purchaseAmount: amount,
            purchaseDate: new Date(),
            currentValue: finalValue,
            profitLoss: profitLoss
          }
        : inv
    ));

    setInvestmentAmount('');
    setPurchaseConfirmed(false);
    setCurrentScreen('investment-result');

    // Show result after brief delay
    setTimeout(() => setShowInvestmentResult(true), 1000);
  }, [selectedInvestment, investmentAmount, remainingSalary, availableCredit]);

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
      default: return 'Indefinido';
    }
  };

  // Pie chart data with colors - SALARY expenses
  const salaryPieChartData = React.useMemo(() => {
    const colors = ['#046BF4', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
    const salaryExpensesList = expenses.filter(e => e.paymentMethod === 'salary');
    return salaryExpensesList.map((expense, index) => ({
      name: expense.category,
      value: expense.amount,
      color: colors[index % colors.length]
    }));
  }, [expenses]);

  // Pie chart data with colors - CREDIT expenses
  const creditPieChartData = React.useMemo(() => {
    const colors = ['#8B5CF6', '#EC4899', '#F59E0B', '#EF4444', '#06B6D4', '#10B981'];
    const creditExpensesList = expenses.filter(e => e.paymentMethod === 'credit');
    return creditExpensesList.map((expense, index) => ({
      name: expense.category,
      value: expense.amount,
      color: colors[index % colors.length]
    }));
  }, [expenses]);

// Enhanced monthly data with real-time saving
const [monthlyData, setMonthlyData] = useState(() => {
  const saved = localStorage.getItem("monthlyData");
  return saved ? JSON.parse(saved) : [];
});


// Atualiza o gráfico sempre que mudar o salário ou gastos
useEffect(() => {
  const currentMonth = new Date().toLocaleString("pt-BR", { month: "short" });
  const existingMonth = monthlyData.find((m) => m.month === currentMonth);

  // Se ninguém investiu, usa 0
  const investimentosCliente = 0;

  let updated;
  if (existingMonth) {
    updated = monthlyData.map((m) =>
      m.month === currentMonth
        ? { ...m, receitas: salary, gastos: totalExpenses, investimentos: investimentosCliente }
        : m
    );
  } else {
    updated = [
      ...monthlyData,
      { month: currentMonth, receitas: salary, gastos: totalExpenses, investimentos: investimentosCliente },
    ];
  }

  setMonthlyData(updated);
  localStorage.setItem("monthlyData", JSON.stringify(updated));
}, [salary, totalExpenses]);



  // 🔵 1. Gráfico de Pizza (Distribuição de Recursos) - DATA
  const financialDistributionPieData = React.useMemo(() => {
    const data = [];

// Salário disponível (azul ou vermelho se negativo)
const availableSalary = salary - salaryUsed;

data.push({
  name: availableSalary >= 0 ? 'Salário Disponível' : 'Saldo Negativo',
  value: Math.abs(availableSalary),
  color: availableSalary >= 0 ? '#046BF4' : '#FF4C4C', // Azul se positivo, vermelho se negativo
  percentage: ((Math.abs(availableSalary) / (salary + creditLimit)) * 100).toFixed(1)
});


    // Dívida bancária (vermelho)
    if (totalDebt > 0) {
      data.push({
        name: 'Dívida Bancária',
        value: totalDebt,
        color: '#EF4444', // Vermelho
        percentage: ((totalDebt / (salary + creditLimit)) * 100).toFixed(1)
      });
    }

    // Cartão usado (roxo)
    if (financialBreakdown.creditUsed > 0) {
      data.push({
        name: 'Cartão Usado',
        value: financialBreakdown.creditUsed,
        color: '#8B5CF6', // Roxo
        percentage: ((financialBreakdown.creditUsed / (salary + creditLimit)) * 100).toFixed(1)
      });
    }

    // Salário usado (verde)
    if (financialBreakdown.salaryUsed > 0) {
      data.push({
        name: 'Salário Usado',
        value: financialBreakdown.salaryUsed,
        color: '#10B981', // Verde
        percentage: ((financialBreakdown.salaryUsed / (salary + creditLimit)) * 100).toFixed(1)
      });
    }

    // Cartão disponível (azul claro)
    if (availableCredit > 0) {
      data.push({
        name: 'Cartão Disponível',
        value: availableCredit,
        color: '#06B6D4', // Azul claro
        percentage: ((availableCredit / (salary + creditLimit)) * 100).toFixed(1)
      });
    }

    return data;
  }, [remainingSalary, totalDebt, financialBreakdown, availableCredit, salary, creditLimit]);

  // Função para lidar com clique no gráfico de pizza
  const handlePieSliceClick = React.useCallback((data: any, index: number) => {
    setSelectedPieSlice(selectedPieSlice === data.name ? null : data.name);
  }, [selectedPieSlice]);

  // 🟦 SPLASH SCREEN - Mobile First
  if (currentScreen === 'splash') {
    return (
      <motion.div 
        className="min-h-screen flex flex-col items-center justify-center px-4" 
        style={{ backgroundColor: '#046BF4' }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Logo - Mobile First */}
        <div className="mb-8">
          <img 
            src={logoDefinitiva} 
            alt="BudgetPro Logo" 
            className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 object-contain"
          />
        </div>

        {/* Loading animation - Mobile First */}
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 flex items-center justify-center">
          {Array.from({ length: 12 }).map((_, index) => {
            const angle = (index * 360) / 12;
            const radian = (angle * Math.PI) / 180;
            const radius = 28; // Fixed radius for consistency
            const x = Math.cos(radian) * radius;
            const y = Math.sin(radian) * radius;

            return (
              <motion.div
                key={index}
                className="absolute w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-white"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: `translate(${x - 6}px, ${y - 6}px)`,
                }}
                animate={{
                  opacity: [0.3, 1, 0.3]
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: index * 0.1,
                  ease: "easeInOut"
                }}
              />
            );
          })}
        </div>

        {/* Texto de carregamento - Desktop only */}
        <motion.div 
          className="mt-8 text-center hidden md:block"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <p className="text-white/80 text-lg">Carregando seu app financeiro...</p>
        </motion.div>
      </motion.div>
    );
  }

  // 🟦 LOGIN SCREEN - Mobile First
  if (currentScreen === 'login') {
    return (
      <motion.div 
        className="min-h-screen"
        style={{ background: `linear-gradient(to bottom, #046BF4, ${darkMode ? '#1a1a1a' : 'white'})` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header - Mobile First */}
        <div className="px-4 py-8 text-center">
          <h1 className={`text-white text-3xl md:text-4xl lg:text-5xl mb-2 font-bold ${darkMode ? 'text-gray-200' : 'text-white'}`}>BudgetPro</h1>
          <p className={`text-white/80 text-sm md:text-base hidden sm:block ${darkMode ? 'text-gray-300' : 'text-white/80'}`}>
            Seu assistente financeiro pessoal
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="px-4 py-4"
        >
          {/* Container - Mobile First (375px optimized) */}
          <div className="max-w-sm mx-auto md:max-w-md lg:max-w-lg">
            <div className="text-center mb-6">
              <h2 className="text-xl md:text-2xl lg:text-3xl mb-2 text...(truncated 49634 characters)...{creditPercentage > 80 ? '#EF4444' : creditPercentage > 60 ? '#F59E0B' : '#8B5CF6'}
                        />
                        <p className="text-xs text-gray-500 mt-2 text-center">
                          {creditPercentage > 80 ? 'Quase cheio!' : 
                           creditPercentage > 60 ? 'Cuidado' : 'Controlado'}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="shadow-md border-0 rounded-xl">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xs">Por Categoria</CardTitle>
                      </CardHeader>
                      <CardContent className="py-2">
                        {creditPieChartData.length > 0 ? (
                          <div className="h-24">
                            <ResponsiveContainer width="100%" height="100%">
                              <RechartsPieChart>
                                <Pie
                                  data={creditPieChartData}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={15}
                                  outerRadius={35}
                                  paddingAngle={2}
                                  dataKey="value"
                                >
                                  {creditPieChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                                </Pie>
                                <Tooltip 
                                  formatter={(value: any) => [`R$ ${value.toFixed(2)}`, 'Valor']}
                                />
                              </RechartsPieChart>
                            </ResponsiveContainer>
                          </div>
                        ) : (
                          <div className="h-24 flex items-center justify-center text-gray-400 text-xs">
                            Sem dados
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Expense Management - Credit */}
                  <Card className="shadow-md border-0 rounded-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <div className="p-2 rounded-lg bg-purple-500">
                          <CreditCard className="w-4 h-4 text-white" />
                        </div>
                        💳 Prancheta de Gastos do Cartão
                      </CardTitle>
                      <div className="text-xs text-gray-600">
                        Gastos feitos no cartão de crédito
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* Add new expense - Credit */}
                      <div className="space-y-3 mb-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <p className="text-xs text-gray-700 font-medium">Adicionar novo gasto</p>
                        <Input
                          placeholder="Nome da categoria"
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          className="h-10 rounded-lg bg-white"
                        />
                        <div className="flex gap-2">
                          <Input
                            placeholder="Valor (R$)"
                            type="number"
                            value={newAmount}
                            onChange={(e) => setNewAmount(e.target.value)}
                            className="flex-1 h-10 rounded-lg bg-white"
                          />
                          <Button 
                            onClick={() => addExpense('credit')} 
                            className="rounded-lg px-4 h-10 hover:brightness-110 transition-all bg-purple-600 hover:bg-purple-700"
                          >
                            <PlusCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Expenses list - Credit */}
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {expenses.filter(e => e.paymentMethod === 'credit').map((expense) => {
                          const IconComponent = iconMap[expense.iconType];
                          return (
                            <motion.div
                              key={expense.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="flex items-center justify-between p-3 rounded-lg border bg-white shadow-sm"
                            >
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-purple-100">
                                  <IconComponent className="w-4 h-4 text-purple-600" />
                                </div>
                                <div>
                                  <span className="font-medium text-sm">{expense.category}</span>
                                  <p className="text-xs text-gray-500">
                                    {creditExpenses > 0 ? ((expense.amount / creditExpenses) * 100).toFixed(1) : '0'}% da fatura
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="text-right">
                                  <span className="font-semibold text-sm">R$ {expense.amount.toFixed(2)}</span>
                                </div>
                                <Button
                                  onClick={() => removeExpense(expense.id)}
                                  variant="outline"
                                  size="sm"
                                  className="rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 p-2"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </motion.div>
                          );
                        })}

                        {/* Empty state - Credit */}
                        {expenses.filter(e => e.paymentMethod === 'credit').length === 0 && (
                          <div className="text-center py-8 text-gray-500">
                            <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm mb-1">Nenhum gasto no cartão</p>
                            <p className="text-xs">Adicione seus gastos acima</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

              </div>
            </TabsContent>

            {/* 🔵 PAYMENT TAB - Mobile First */}
            <TabsContent value="payment" className="space-y-4">
              {/* Bill Summary Card */}
              <Card className="shadow-md border-0 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: '#046BF4' }}>
                      <FileText className="w-4 h-4 text-white" />
                    </div>
                    🧾 Fatura do Cartão de Crédito
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 p-4 bg-white rounded-lg border-2 border-purple-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">💳 Valor da Fatura Atual</span>
                      <span className="font-bold text-lg text-purple-600">R$ {creditBill.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">✅ Já Pago</span>
                      <span className="font-semibold text-green-600">R$ {creditBillAmount.toFixed(2)}</span>
                    </div>
                    <div className="h-px bg-gray-300"></div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-800">📋 Saldo Devedor</span>
                      <span className="font-bold text-xl text-red-600">
                        R$ {(creditBill - creditBillAmount).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {creditBill > creditBillAmount && (
                    <>
                      <Alert className="border-blue-200 bg-blue-50 rounded-xl">
                        <AlertDescription className="text-blue-800 text-xs">
                          💰 Saldo disponível no salário: <strong>R$ {remainingSalary.toFixed(2)}</strong>
                        </AlertDescription>
                      </Alert>

                      <div className="space-y-3 p-4 bg-white rounded-lg border border-gray-200">
                        <Label className="text-sm font-medium">Valor do Pagamento</Label>
                        <Input
                          type="number"
                          placeholder="Digite o valor a pagar"
                          value={billPaymentAmount}
                          onChange={(e) => setBillPaymentAmount(e.target.value)}
                          className="h-12 rounded-lg text-lg"
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={() => setBillPaymentAmount((creditBill - creditBillAmount).toFixed(2))}
                            variant="outline"
                            className="flex-1 rounded-lg text-xs"
                          >
                            Pagar Total
                          </Button>
                          <Button
                            onClick={() => setBillPaymentAmount(((creditBill - creditBillAmount) / 2).toFixed(2))}
                            variant="outline"
                            className="flex-1 rounded-lg text-xs"
                          >
                            Pagar 50%
                          </Button>
                        </div>
                        <Button
                          onClick={payCreditBill}
                          className="w-full h-12 rounded-lg text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                          style={{ backgroundColor: '#046BF4' }}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Confirmar Pagamento
                        </Button>
                      </div>
                    </>
                  )}

                  {creditBill <= creditBillAmount && (
                    <div className="text-center py-8">
                      <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                      <p className="text-green-700 font-medium">✅ Fatura Paga!</p>
                      <p className="text-sm text-gray-600 mt-1">Você não tem saldo devedor no momento.</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Payment Info Card */}
              <Card className="shadow-md border-0 rounded-xl">
                <CardHeader>
                  <CardTitle className="text-sm">ℹ️ Como Funciona</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs text-gray-600">
                  <p>• O pagamento da fatura sai do <strong>saldo do seu salário</strong></p>
                  <p>• Após o pagamento, o <strong>limite do cartão é liberado</strong></p>
                  <p>• Você pode pagar o valor total ou parcial da fatura</p>
                  <p>• Os gastos do cartão não afetam diretamente seu salário</p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 🔵 AI TAB - Mobile First */}
            <TabsContent value="ai" className="space-y-4">
              <Card className="shadow-md border-0 rounded-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: '#046BF4' }}>
                      <Brain className="w-4 h-4 text-white" />
                    </div>
                    Assistente IA
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
                    <div className="flex items-start gap-3 mb-3">
                      <TrendingUp className="w-4 h-4 text-blue-600 mt-1" />
                      <div>
                        <h4 className="font-medium text-blue-900 text-sm">Sugestões Personalizadas</h4>
                        <p className="text-xs text-blue-700 mt-1">
                          Com saldo de R$ {remainingSalary.toFixed(2)}, recomendamos diversificar seus investimentos.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span>Reserva de emergência: 30%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span>Renda fixa: 50%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                        <span>Renda variável: 20%</span>
                      </div>
                    </div>
                  </div>

                  <Alert className="border-orange-200 bg-orange-50 rounded-xl">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-800 text-xs">
                      <strong>Aviso:</strong> Investimentos envolvem riscos. Pode haver perda total. 
                      Consulte sempre um especialista.
                    </AlertDescription>
                  </Alert>

                  {/* Investment Options - Mobile */}
                  <Card className="shadow-md border-0 rounded-xl">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Opções de Investimento</CardTitle>
                      <p className="text-xs text-gray-600">
                        Disponível: R$ {remainingSalary > 0 ? remainingSalary.toFixed(2) : '0.00'}
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {investments.map((investment) => {
                        const IconComponent = investment.icon;
                        const isAffordable = remainingSalary >= investment.minInvestment;

                        return (
                          <motion.div
                            key={investment.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-3 rounded-lg border bg-white shadow-sm transition-all cursor-pointer ${
                              isAffordable ? 'hover:border-blue-300' : 'opacity-60'
                            }`}
                            onClick={() => isAffordable && selectInvestment(investment)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div 
                                  className="p-2 rounded-lg"
                                  style={{ backgroundColor: `${investment.color}20` }}
                                >
                                  <IconComponent 
                                    className="w-4 h-4" 
                                    style={{ color: investment.color }} 
                                  />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-medium text-sm">{investment.name}</h4>
                                    <span 
                                      className="text-xs px-2 py-1 rounded-full"
                                      style={{ 
                                        backgroundColor: `${getRiskColor(investment.riskLevel)}20`,
                                        color: getRiskColor(investment.riskLevel)
                                      }}
                                    >
                                      {getRiskLabel(investment.riskLevel)}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-600">{investment.type}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-xs font-medium text-green-600">
                                  ±{investment.expectedReturn}%
                                </p>
                                <p className="text-xs text-gray-500">
                                  Min: R$ {investment.minInvestment}
                                </p>
                                {!isAffordable && (
                                  <p className="text-xs text-red-500">
                                    Saldo baixo
                                  </p>
                                )}
                              </div>
                            </div>

                                                   {investment.status === 'purchased' && investment.profitLoss !== undefined && (
                              <div className="mt-3 pt-3 border-t border-gray-100">
                                <div className="flex items-center justify-between text-xs">
                                  <span>Investido: R$ {investment.purchaseAmount?.toFixed(2)}</span>
                                  <div className="flex items-center gap-1">
                                    {investment.profitLoss >= 0 ? (
                                      <TrendingUp className="w-3 h-3 text-green-600" />
                                    ) : (
                                      <TrendingDown className="w-3 h-3 text-red-600" />
                                    )}
                                    <span className={investment.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}>
                                      {investment.profitLoss >= 0 ? '+' : ''}R$ {investment.profitLoss.toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }
  // Continue with other screens (investment details, etc.) - keeping them as they were for now
  // Investment Details Screen
  if (currentScreen === 'investment-details') {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        {/* Header */}
        <div className="px-6 py-4 text-center shadow-sm" style={{ backgroundColor: '#046BF4' }}>
          <img 
            src={logoDefinitiva} 
            alt="BudgetPro" 
            className="w-20 h-20 mx-auto object-contain"
          />
          <h1 className="text-white text-lg">BudgetPro</h1>
        </div>

        <div className="px-4 py-6">
          {/* Back Button */}
          <Button
            onClick={() => setCurrentScreen('dashboard')}
            variant="outline"
            className="mb-4 rounded-xl"
            style={{ borderColor: '#046BF4', color: '#046BF4' }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>

          {selectedInvestment && (
            <div className="space-y-4">
              {/* Investment Header */}
              <Card className="shadow-lg border-0 rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div 
                      className="p-3 rounded-xl"
                      style={{ backgroundColor: `${selectedInvestment.color}20` }}
                    >
                      <selectedInvestment.icon 
                        className="w-8 h-8" 
                        style={{ color: selectedInvestment.color }} 
                      />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">{selectedInvestment.name}</h2>
                      <p className="text-gray-600">{selectedInvestment.type}</p>
                      <span 
                        className="inline-block text-xs px-2 py-1 rounded-full mt-1"
                        style={{ 
                          backgroundColor: `${getRiskColor(selectedInvestment.riskLevel)}20`,
                          color: getRiskColor(selectedInvestment.riskLevel)
                        }}
                      >
                        {getRiskLabel(selectedInvestment.riskLevel)} Risco
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-700">{selectedInvestment.description}</p>
                </CardContent>
              </Card>

              {/* Investment Details */}
              <Card className="shadow-lg border-0 rounded-2xl">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 rounded-xl" style={{ backgroundColor: '#046BF4' }}>
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    Detalhes do Investimento
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Retorno Esperado:</span>
                      <span className="font-medium text-green-600">±{selectedInvestment.expectedReturn}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nível de Risco:</span>
                      <span className="font-medium">{getRiskLabel(selectedInvestment.riskLevel)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mín. Investimento:</span>
                      <span className="font-medium">R$ {selectedInvestment.minInvestment.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Máx. Investimento:</span>
                      <span className="font-medium">R$ {selectedInvestment.maxInvestment.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Historical Performance Chart */}
              <Card className="shadow-lg border-0 rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 rounded-xl" style={{ backgroundColor: '#046BF4' }}>
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    Desempenho Histórico
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={selectedInvestment.historicalData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="month" 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: '#666' }}
                        />
                        <YAxis 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: '#666' }}
                          tickFormatter={(value) => `${value}%`}
                        />
                        <Tooltip 
                          formatter={(value: any) => [`${value}%`, 'Performance']}
                          labelFormatter={(label) => `Mês: ${label}`}
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #e0e0e0',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke={selectedInvestment.color} 
                          strokeWidth={3}
                          dot={{ fill: selectedInvestment.color, strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, fill: selectedInvestment.color }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Risk Warning */}
              <Alert className="border-orange-200 bg-orange-50 rounded-2xl">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  <strong>Aviso de risco:</strong> Esse investimento pode gerar perda total. Invista com cautela.
                  Os valores apresentados são simulações e não garantem rendimentos futuros.
                </AlertDescription>
              </Alert>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={() => setCurrentScreen('investment-purchase')}
                  className="flex-1 h-12 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 hover:brightness-110"
                  style={{ backgroundColor: '#046BF4' }}
                >
                  Investir Agora
                </Button>
                <Button
                  onClick={() => setCurrentScreen('dashboard')}
                  variant="outline"
                  className="flex-1 h-12 rounded-2xl border-2 hover:bg-sky-50 transition-all"
                  style={{ borderColor: '#046BF4', color: '#046BF4' }}
                >
                  Voltar ao Dashboard
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Continue with other screens...
  return null;
}
