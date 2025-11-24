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
        style={{ background: 'linear-gradient(to bottom, #046BF4, white)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header - Mobile First */}
        <div className="px-4 py-8 text-center">
          <h1 className="text-white text-3xl md:text-4xl lg:text-5xl mb-2 font-bold">BudgetPro</h1>
          <p className="text-white/80 text-sm md:text-base hidden sm:block">
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
              <h2 className="text-xl md:text-2xl lg:text-3xl mb-2 text-white font-semibold">
                Bem-vindo de volta!
              </h2>
              <p className="text-gray-200 text-sm md:text-base px-2">
                Entre na sua conta para acessar suas finanças
              </p>
            </div>

            <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm rounded-2xl">
              <CardContent className="p-5 md:p-6 space-y-4">
                <div className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      type="email"
                      placeholder="Digite seu email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-11 h-12 rounded-xl border-gray-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-200 transition-all"
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      type="password"
                      placeholder="Digite sua senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-11 h-12 rounded-xl border-gray-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-200 transition-all"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleLogin}
                  className="w-full h-12 rounded-xl text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 hover:brightness-110"
                  style={{ backgroundColor: '#046BF4' }}
                >
                  Entrar
                </Button>

                <div className="text-center pt-4 space-y-3">
                  <div>
                    <button
                      onClick={() => setCurrentScreen('forgot-password')}
                      className="text-sm transition-colors hover:brightness-110"
                      style={{ color: '#046BF4' }}
                    >
                      <span className="underline">Esqueceu sua senha?</span>
                    </button>
                  </div>
                  <div>
                    <button
                      onClick={() => setCurrentScreen('signup')}
                      className="text-sm transition-colors hover:brightness-110"
                      style={{ color: '#046BF4' }}
                    >
                      Ainda não tem conta? <span className="underline">Criar conta</span>
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  // 🟦 SIGNUP SCREEN - Mobile First
  if (currentScreen === 'signup') {
    return (
      <motion.div 
        className="min-h-screen"
        style={{ background: 'linear-gradient(135deg, #046BF4 0%, #2A9DF4 50%, white 100%)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header - Mobile First */}
        <div className="px-4 py-8 text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl mb-2 font-bold" style={{ color: '#046BF4' }}>BudgetPro</h1>
          <h2 className="text-lg md:text-2xl lg:text-3xl text-gray-700 md:text-white/90 font-semibold">Criar Nova Conta</h2>
          <p className="text-sm text-gray-600 md:text-white/80 mt-2 hidden sm:block">
            Transforme sua relação com o dinheiro
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
            <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm rounded-2xl">
              <CardContent className="p-5 md:p-6 space-y-4">
                <div className="space-y-4">
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Digite seu nome completo *"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-11 h-12 rounded-xl border-gray-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-200 transition-all"
                    />
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      type="email"
                      placeholder="Digite seu email *"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-11 h-12 rounded-xl border-gray-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-200 transition-all"
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      type="password"
                      placeholder="Digite sua senha *"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-11 h-12 rounded-xl border-gray-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-200 transition-all"
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      type="password"
                      placeholder="Confirme sua senha *"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-11 h-12 rounded-xl border-gray-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-200 transition-all"
                    />
                  </div>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Digite seu CPF (opcional)"
                      value={cpf}
                      onChange={(e) => setCpf(e.target.value)}
                      className="pl-11 h-12 rounded-xl border-gray-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-200 transition-all"
                    />
                  </div>
                </div>

                <div className="text-xs text-gray-500 text-center bg-gray-50 p-3 rounded-xl">
                  <span className="font-medium">* Campos obrigatórios</span>
                </div>

                <Button
                  onClick={handleSignup}
                  className="w-full h-12 rounded-xl text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 hover:brightness-110"
                  style={{ backgroundColor: '#046BF4' }}
                >
                  Criar Minha Conta
                </Button>

                <div className="text-center pt-4">
                  <button
                    onClick={() => setCurrentScreen('login')}
                    className="text-sm transition-colors hover:brightness-110"
                    style={{ color: '#046BF4' }}
                  >
                    Já tem conta? <span className="underline">Voltar ao login</span>
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  // 🟦 FORGOT PASSWORD SCREEN - Mobile First
  if (currentScreen === 'forgot-password') {
    return (
      <motion.div 
        className="min-h-screen bg-gray-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header - Mobile First */}
        <div className="px-4 py-8 text-center">
          <h1 className="text-3xl mb-2 font-bold" style={{ color: '#046BF4' }}>BudgetPro</h1>
          <h2 className="text-xl text-gray-700">Esqueceu sua senha?</h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="px-4 py-4"
        >
          <div className="max-w-sm mx-auto">
            <div className="text-center mb-6">
              <p className="text-gray-600">
                Digite seu email para receber um link de recuperação
              </p>
            </div>

            <Card className="shadow-xl border-0 bg-white rounded-2xl">
              <CardContent className="p-5 space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="Digite seu email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="pl-11 h-12 rounded-xl border-gray-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-200 transition-all"
                  />
                </div>

                <Button
                  onClick={handleForgotPassword}
                  className="w-full h-12 rounded-xl text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 hover:brightness-110"
                  style={{ backgroundColor: '#046BF4' }}
                >
                  Enviar Link
                </Button>

                <div className="text-center pt-4">
                  <button
                    onClick={() => setCurrentScreen('login')}
                    className="text-sm transition-colors hover:brightness-110"
                    style={{ color: '#046BF4' }}
                  >
                    <span className="underline">Voltar ao login</span>
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  // 🟦 RESET PASSWORD SCREEN - Mobile First
  if (currentScreen === 'reset-password') {
    return (
      <motion.div 
        className="min-h-screen bg-gray-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header - Mobile First */}
        <div className="px-4 py-8 text-center">
          <h1 className="text-3xl mb-2 font-bold" style={{ color: '#046BF4' }}>BudgetPro</h1>
          <h2 className="text-xl text-gray-700">Redefinir Senha</h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="px-4 py-4"
        >
          <div className="max-w-sm mx-auto">
            <div className="text-center mb-6">
              <p className="text-gray-600">
                Digite sua nova senha
              </p>
            </div>

            <Card className="shadow-xl border-0 bg-white rounded-2xl">
              <CardContent className="p-5 space-y-4">
                <div className="space-y-4">
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      type="password"
                      placeholder="Nova senha"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pl-11 h-12 rounded-xl border-gray-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-200 transition-all"
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      type="password"
                      placeholder="Confirmar nova senha"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      className="pl-11 h-12 rounded-xl border-gray-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-200 transition-all"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleResetPassword}
                  className="w-full h-12 rounded-xl text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 hover:brightness-110"
                  style={{ backgroundColor: '#046BF4' }}
                >
                  Salvar Nova Senha
                </Button>

                <div className="text-center pt-4">
                  <button
                    onClick={() => setCurrentScreen('login')}
                    className="text-sm transition-colors hover:brightness-110"
                    style={{ color: '#046BF4' }}
                  >
                    <span className="underline">Voltar ao login</span>
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  // 🟦 DASHBOARD SCREEN - Mobile First (375px optimized)
  if (currentScreen === 'dashboard') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header - Mobile First */}
        <div className="px-4 py-4 shadow-sm" style={{ backgroundColor: '#046BF4' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img 
                src={logoDefinitiva} 
                alt="BudgetPro" 
                className="w-12 h-12 md:w-16 md:h-16 object-contain"
              />
              <div className="ml-3 md:ml-4">
                <h1 className="text-white text-lg md:text-xl font-semibold">BudgetPro</h1>
                <p className="text-white/80 text-xs md:text-sm hidden sm:block">Suas finanças</p>
              </div>
            </div>
            
            {/* Quick info - Mobile */}
            <div className="text-right text-white">
              <p className="text-xs text-white/80">Disponível</p>
              <p className="text-sm font-semibold">R$ {(remainingSalary + availableCredit).toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="px-4 py-4">
          {/* Low Money Alert - Mobile First */}
          {isLowMoney && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4"
            >
              <Alert className="border-red-200 bg-red-50 rounded-xl shadow-sm">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700 text-sm">
                  ⚠️ Saldo baixo! Restam R$ {remainingSalary.toFixed(2)}
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          <Tabs defaultValue="overview" className="space-y-4">
            {/* Tabs - Mobile Optimized (4 tabs now) */}
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 rounded-xl p-1 h-auto md:h-11" style={{ backgroundColor: '#f8fafc' }}>
              <TabsTrigger 
                value="overview" 
                className="rounded-lg data-[state=active]:bg-[#046BF4] data-[state=active]:shadow-sm data-[state=active]:text-white hover:bg-sky-100 transition-all text-xs font-medium py-2"
              >
                📊 Visão Geral
              </TabsTrigger>
              <TabsTrigger 
                value="boards"
                className="rounded-lg data-[state=active]:bg-[#046BF4] data-[state=active]:shadow-sm data-[state=active]:text-white hover:bg-sky-100 transition-all text-xs font-medium py-2"
              >
                📋 Prancheta
              </TabsTrigger>
              <TabsTrigger 
                value="payment"
                className="rounded-lg data-[state=active]:bg-[#046BF4] data-[state=active]:shadow-sm data-[state=active]:text-white hover:bg-sky-100 transition-all text-xs font-medium py-2"
              >
                🧾 Pagar Fatura
              </TabsTrigger>
              <TabsTrigger 
                value="ai"
                className="rounded-lg data-[state=active]:bg-[#046BF4] data-[state=active]:shadow-sm data-[state=active]:text-white hover:bg-sky-100 transition-all text-xs font-medium py-2"
              >
                🤖 IA
              </TabsTrigger>
            </TabsList>

            {/* 🔵 OVERVIEW TAB - Mobile First */}
            <TabsContent value="overview" className="space-y-4">
              {/* Financial Cards - Mobile Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {/* Income Card - Mobile */}
                <Card className="shadow-md border-0 rounded-xl hover:shadow-lg transition-shadow">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-2 rounded-lg bg-green-100">
                        <ArrowUpRight className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="text-xs text-gray-500 uppercase">Receitas</span>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-green-600">R$ {salary.toFixed(2)}</p>
                      <p className="text-xs text-gray-600">Salário mensal</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Expenses Card - Mobile */}
                <Card className="shadow-md border-0 rounded-xl hover:shadow-lg transition-shadow">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-2 rounded-lg bg-red-100">
                        <ArrowDownRight className="w-4 h-4 text-red-600" />
                      </div>
                      <span className="text-xs text-gray-500 uppercase">Gastos Salário</span>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-red-600">R$ {salaryExpenses.toFixed(2)}</p>
                      <p className="text-xs text-gray-600">Pagos com salário</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Available Card - Mobile */}
                <Card className="shadow-md border-0 rounded-xl hover:shadow-lg transition-shadow">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-2 rounded-lg" style={{ backgroundColor: '#e0f2fe' }}>
                        <DollarSign className="w-4 h-4" style={{ color: '#046BF4' }} />
                      </div>
                      <span className="text-xs text-gray-500 uppercase">Disponível</span>
                    </div>
                    <div>
                      <p className="text-lg font-semibold" style={{ color: '#046BF4' }}>
                        R$ {remainingSalary.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-600">Salário restante</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Credit Card - Mobile */}
                <Card className="shadow-md border-0 rounded-xl hover:shadow-lg transition-shadow">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-2 rounded-lg bg-purple-100">
                        <CreditCard className="w-4 h-4 text-purple-600" />
                      </div>
                      <span className="text-xs text-gray-500 uppercase">Cartão</span>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-purple-600">R$ {availableCredit.toFixed(2)}</p>
                      <p className="text-xs text-gray-600">Limite livre</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Progress Summary - Mobile */}
              <Card className="shadow-md border-0 rounded-xl mb-4">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: '#046BF4' }}>
                      <BarChart3 className="w-4 h-4 text-white" />
                    </div>
                    Resumo do Mês
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm">Você gastou {Math.round(expensePercentage)}% da sua renda</span>
                      <span className="text-sm font-semibold">{Math.round(expensePercentage)}%</span>
                    </div>
                    <Progress 
                      value={expensePercentage} 
                      className="h-3 rounded-full"
                      style={{
                        '--progress-background': expensePercentage > 80 ? '#EF4444' : expensePercentage > 60 ? '#F59E0B' : '#046BF4'
                      } as React.CSSProperties}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      {expensePercentage > 90 ? '🚨 Gastos muito altos!' :
                       expensePercentage > 70 ? '⚠️ Cuidado com os gastos' :
                       '✅ Gastos controlados'}
                    </p>
                  </div>
                  
                  {/* Progress Ring - Mobile Center */}
                  <div className="flex justify-center mt-4">
                    <ProgressRing 
                      percentage={expensePercentage} 
                      size={100}
                      color={expensePercentage > 80 ? '#EF4444' : expensePercentage > 60 ? '#F59E0B' : '#046BF4'}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Line Chart - Mobile */}
              <Card className="shadow-md border-0 rounded-xl mb-4">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: '#046BF4' }}>
                      <TrendingUp className="w-4 h-4 text-white" />
                    </div>
                    Evolução dos Últimos Meses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="month" 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 10, fill: '#666' }}
                        />
                        <YAxis 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 10, fill: '#666' }}
                          tickFormatter={(value) => `R$ ${value}`}
                        />
                        <Tooltip 
                          formatter={(value: any, name: string) => [
                            `R$ ${value.toFixed(2)}`,
                            name === 'receitas' ? 'Receitas' :
                            name === 'gastos' ? 'Gastos' : 'Investimentos'
                          ]}
                          labelFormatter={(label) => `Mês: ${label}`}
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #e0e0e0',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                            fontSize: '12px'
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="receitas" 
                          stroke="#10B981" 
                          strokeWidth={2}
                          dot={{ fill: '#10B981', strokeWidth: 2, r: 3 }}
                          activeDot={{ r: 5, fill: '#10B981' }}
                          name="Receitas"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="gastos" 
                          stroke="#EF4444" 
                          strokeWidth={2}
                          dot={{ fill: '#EF4444', strokeWidth: 2, r: 3 }}
                          activeDot={{ r: 5, fill: '#EF4444' }}
                          name="Gastos"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="investimentos" 
                          stroke="#046BF4" 
                          strokeWidth={2}
                          dot={{ fill: '#046BF4', strokeWidth: 2, r: 3 }}
                          activeDot={{ r: 5, fill: '#046BF4' }}
                          name="Investimentos"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Pie Chart - Mobile */}
              <Card className="shadow-md border-0 rounded-xl mb-4">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: '#046BF4' }}>
                      <PieChart className="w-4 h-4 text-white" />
                    </div>
                    Distribuição de Recursos
                  </CardTitle>
                  <p className="text-xs text-gray-600">
                    Toque nas fatias para detalhes
                  </p>
                </CardHeader>
                <CardContent>
                  {financialDistributionPieData.length > 0 ? (
                    <div className="space-y-4">
                      {/* Gráfico de Pizza - Mobile */}
                      <div className="h-40">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <Pie
                              data={financialDistributionPieData}
                              cx="50%"
                              cy="50%"
                              innerRadius={25}
                              outerRadius={60}
                              paddingAngle={2}
                              dataKey="value"
                              onClick={handlePieSliceClick}
                            >
                              {financialDistributionPieData.map((entry, index) => (
                                <Cell 
                                  key={`cell-${index}`} 
                                  fill={entry.color} 
                                  stroke={selectedPieSlice === entry.name ? '#000' : 'none'}
                                  strokeWidth={selectedPieSlice === entry.name ? 2 : 0}
                                  style={{ cursor: 'pointer' }}
                                />
                              ))}
                            </Pie>
                            <Tooltip 
                              formatter={(value: any, name: string) => [
                                `R$ ${value.toFixed(2)}`,
                                name
                              ]}
                              contentStyle={{ 
                                backgroundColor: 'white', 
                                border: '1px solid #e0e0e0',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                fontSize: '12px'
                              }}
                            />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      </div>
                      
                      {/* Legend Mobile */}
                      <div className="space-y-2">
                        {financialDistributionPieData.map((item, index) => (
                          <motion.div 
                            key={item.name} 
                            className={`p-3 rounded-lg border transition-all cursor-pointer ${
                              selectedPieSlice === item.name 
                                ? 'border-gray-400 bg-gray-50' 
                                : 'border-transparent bg-gray-100'
                            }`}
                            onClick={() => handlePieSliceClick(item, index)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-4 h-4 rounded-full flex-shrink-0" 
                                style={{ backgroundColor: item.color }}
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{item.name}</p>
                                <p className="text-xs text-gray-600">{item.percentage}% do total</p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-sm" style={{ color: item.color }}>
                                  R$ {item.value.toFixed(2)}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="h-40 flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <PieChart className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Sem dados</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Edit Cards - Mobile */}
              <div className="space-y-4">
                {/* Salary Card - Mobile */}
                <Card className="shadow-md border-0 rounded-xl">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <div className="p-2 rounded-lg" style={{ backgroundColor: '#046BF4' }}>
                        <DollarSign className="w-4 h-4 text-white" />
                      </div>
                      Salário Mensal
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {editingSalary ? (
                      <div className="space-y-3">
                        <Input
                          type="number"
                          value={tempSalary}
                          onChange={(e) => setTempSalary(e.target.value)}
                          className="h-10 rounded-lg"
                          placeholder="Digite o novo salário"
                        />
                        <div className="flex gap-2">
                          <Button 
                            onClick={updateSalary} 
                            size="sm" 
                            className="flex-1 rounded-lg hover:brightness-110 transition-all"
                            style={{ backgroundColor: '#046BF4' }}
                          >
                            Salvar
                          </Button>
                          <Button 
                            onClick={() => setEditingSalary(false)} 
                            variant="outline"
                            size="sm" 
                            className="flex-1 rounded-lg"
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="mb-3">
                          <p className="text-xl font-semibold text-green-600">R$ {salary.toFixed(2)}</p>
                          <p className="text-sm text-gray-500">Valor atual</p>
                        </div>
                        <Button
                          onClick={() => {
                            setEditingSalary(true);
                            setTempSalary(salary.toString());
                          }}
                          variant="outline"
                          className="w-full rounded-lg border-2 hover:bg-sky-50 transition-all text-sm"
                          style={{ borderColor: '#046BF4', color: '#046BF4' }}
                        >
                          <DollarSign className="w-4 h-4 mr-2" />
                          Modificar Salário
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Credit Card - Mobile */}
                <Card className="shadow-md border-0 rounded-xl">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <div className="p-2 rounded-lg" style={{ backgroundColor: '#046BF4' }}>
                        <CreditCard className="w-4 h-4 text-white" />
                      </div>
                      Limite do Cartão
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {editingCredit ? (
                      <div className="space-y-3">
                        <Input
                          type="number"
                          value={tempCredit}
                          onChange={(e) => setTempCredit(e.target.value)}
                          className="h-10 rounded-lg"
                          placeholder="Digite o novo limite"
                        />
                        <div className="flex gap-2">
                          <Button 
                            onClick={updateCredit} 
                            size="sm" 
                            className="flex-1 rounded-lg hover:brightness-110 transition-all"
                            style={{ backgroundColor: '#046BF4' }}
                          >
                            Salvar
                          </Button>
                          <Button 
                            onClick={() => setEditingCredit(false)} 
                            variant="outline"
                            size="sm" 
                            className="flex-1 rounded-lg"
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="mb-3">
                          <p className="text-xl font-semibold text-purple-600">R$ {creditLimit.toFixed(2)}</p>
                          <p className="text-sm text-gray-500">Limite atual</p>
                        </div>
                        <Button
                          onClick={() => {
                            setEditingCredit(true);
                            setTempCredit(creditLimit.toString());
                          }}
                          variant="outline"
                          className="w-full rounded-lg border-2 hover:bg-sky-50 transition-all text-sm"
                          style={{ borderColor: '#046BF4', color: '#046BF4' }}
                        >
                          <CreditCard className="w-4 h-4 mr-2" />
                          Modificar Limite
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* 🔵 BOARDS TAB - Pranchetas lado a lado */}
            <TabsContent value="boards" className="space-y-4">
              {/* Header - Desktop e Mobile */}
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-1">📋 Pranchetas de Gastos</h2>
                <p className="text-sm text-gray-600">Gerencie seus gastos de salário e cartão de crédito</p>
              </div>

              {/* Side by Side Boards - Responsive */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* LEFT BOARD: SALARY EXPENSES */}
                <div className="space-y-4">
                  {/* Summary Card - Salary */}
                  <Card className="shadow-md border-0 rounded-xl bg-gradient-to-br from-green-50 to-blue-50">
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">💰 Salário Total</span>
                          <span className="font-semibold text-green-600">R$ {salary.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">💸 Total Gasto</span>
                          <span className="font-semibold text-red-600">R$ {salaryExpenses.toFixed(2)}</span>
                        </div>
                        <div className="h-px bg-gray-300 my-2"></div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-800">✅ Saldo Restante</span>
                          <span className="font-bold text-lg" style={{ color: '#046BF4' }}>R$ {remainingSalary.toFixed(2)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Progress and Charts - Salary */}
                  <div className="grid grid-cols-2 gap-3">
                    <Card className="shadow-md border-0 rounded-xl">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xs">Uso do Orçamento</CardTitle>
                      </CardHeader>
                      <CardContent className="flex flex-col items-center py-2">
                        <ProgressRing 
                          percentage={expensePercentage} 
                          size={80}
                          color={expensePercentage > 80 ? '#EF4444' : expensePercentage > 60 ? '#F59E0B' : '#046BF4'}
                        />
                        <p className="text-xs text-gray-500 mt-2 text-center">
                          {expensePercentage > 80 ? 'Apertado!' : 
                           expensePercentage > 60 ? 'Atenção' : 'Controlado'}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="shadow-md border-0 rounded-xl">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xs">Por Categoria</CardTitle>
                      </CardHeader>
                      <CardContent className="py-2">
                        {salaryPieChartData.length > 0 ? (
                          <div className="h-24">
                            <ResponsiveContainer width="100%" height="100%">
                              <RechartsPieChart>
                                <Pie
                                  data={salaryPieChartData}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={15}
                                  outerRadius={35}
                                  paddingAngle={2}
                                  dataKey="value"
                                >
                                  {salaryPieChartData.map((entry, index) => (
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

                  {/* Expense Management - Salary */}
                  <Card className="shadow-md border-0 rounded-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <div className="p-2 rounded-lg" style={{ backgroundColor: '#046BF4' }}>
                          <ShoppingCart className="w-4 h-4 text-white" />
                        </div>
                        💵 Prancheta de Gastos do Salário
                      </CardTitle>
                      <div className="text-xs text-gray-600">
                        Gastos pagos com dinheiro do salário
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* Add new expense - Salary */}
                      <div className="space-y-3 mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
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
                            onClick={() => addExpense('salary')} 
                            className="rounded-lg px-4 h-10 hover:brightness-110 transition-all"
                            style={{ backgroundColor: '#046BF4' }}
                          >
                            <PlusCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Expenses list - Salary */}
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {expenses.filter(e => e.paymentMethod === 'salary').map((expense) => {
                          const IconComponent = iconMap[expense.iconType];
                          return (
                            <motion.div
                              key={expense.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="flex items-center justify-between p-3 rounded-lg border bg-white shadow-sm"
                            >
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg" style={{ backgroundColor: '#f1f5f9' }}>
                                  <IconComponent className="w-4 h-4" style={{ color: '#046BF4' }} />
                                </div>
                                <div>
                                  <span className="font-medium text-sm">{expense.category}</span>
                                  <p className="text-xs text-gray-500">
                                    {salaryExpenses > 0 ? ((expense.amount / salaryExpenses) * 100).toFixed(1) : '0'}% dos gastos
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
                        
                        {/* Empty state - Salary */}
                        {expenses.filter(e => e.paymentMethod === 'salary').length === 0 && (
                          <div className="text-center py-8 text-gray-500">
                            <DollarSign className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm mb-1">Nenhum gasto com salário</p>
                            <p className="text-xs">Adicione seus gastos acima</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* RIGHT BOARD: CREDIT CARD EXPENSES */}
                <div className="space-y-4">
                  {/* Summary Card - Credit */}
                  <Card className="shadow-md border-0 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50">
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">💳 Limite Total</span>
                          <span className="font-semibold text-purple-600">R$ {creditLimit.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">💸 Valor Gasto</span>
                          <span className="font-semibold text-red-600">R$ {creditExpenses.toFixed(2)}</span>
                        </div>
                        <div className="h-px bg-gray-300 my-2"></div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-800">✅ Limite Restante</span>
                          <span className="font-bold text-lg text-purple-600">R$ {availableCredit.toFixed(2)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Progress and Charts - Credit */}
                  <div className="grid grid-cols-2 gap-3">
                    <Card className="shadow-md border-0 rounded-xl">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xs">Uso do Cartão</CardTitle>
                      </CardHeader>
                      <CardContent className="flex flex-col items-center py-2">
                        <ProgressRing 
                          percentage={creditPercentage} 
                          size={80}
                          color={creditPercentage > 80 ? '#EF4444' : creditPercentage > 60 ? '#F59E0B' : '#8B5CF6'}
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
      <div className="min-h-screen bg-gray-50">
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
