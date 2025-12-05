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
  Rocket,
  Moon,
  Sun,
  Edit2,
  ChevronDown,
  LogOut,
  X,
  TrendingUpDown
} from 'lucide-react';
import { PieChart as RechartsPieChart, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, Legend, Pie } from 'recharts';
import logoDefinitiva from './assets/logo.png';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { auth } from "./firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";

type Screen = 'splash' | 'login' | 'signup' | 'forgot-password' | 'reset-password' | 'dashboard';
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
  installments?: number;
  totalInstallments?: number;
  dueDate?: string;
  dateAdded: string;
}

interface DailyData {
  day: number;
  salario: number;
  cartao: number;
  investimentos: number;
}

interface MonthlyRecord {
  [key: string]: DailyData[];
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

interface UserInvestment {
  id: string;
  investmentId: string;
  amount: number;
  date: string;
}

// Icon mapping
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

// Utility functions
const generateToken = () => {
  return `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const getCurrentMonthKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

const getMonthKeyFromName = (monthName: string) => {
  const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const monthIndex = months.indexOf(monthName);
  const now = new Date();
  return `${now.getFullYear()}-${String(monthIndex + 1).padStart(2, '0')}`;
};

const getCurrentMonthName = () => {
  const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  return months[new Date().getMonth()];
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  
  // Financial states with localStorage persistence
  const [salary, setSalary] = useState(() => {
    const saved = localStorage.getItem('budgetProSalary');
    return saved ? parseFloat(saved) : 0;
  });
  
  const [creditLimit, setCreditLimit] = useState(() => {
    const saved = localStorage.getItem('budgetProCreditLimit');
    return saved ? parseFloat(saved) : 0;
  });
  
  // Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('budgetProDarkMode');
    if (savedMode !== null) {
      return savedMode === 'true';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  
  // Expenses state
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('budgetProExpenses');
    return saved ? JSON.parse(saved) : [];
  });
  
  // Monthly data for charts
  const [monthlyData, setMonthlyData] = useState<MonthlyRecord>(() => {
    const saved = localStorage.getItem('budgetProMonthlyData');
    return saved ? JSON.parse(saved) : {};
  });
  
  // User investments
  const [userInvestments, setUserInvestments] = useState<UserInvestment[]>(() => {
    const saved = localStorage.getItem('budgetProUserInvestments');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [creditBillAmount, setCreditBillAmount] = useState(0);
  const [billPaymentAmount, setBillPaymentAmount] = useState('');
  
  // CORRIGIDO BUG 2: Inputs separados para cada prancheta
  const [newCategorySalary, setNewCategorySalary] = useState('');
  const [newAmountSalary, setNewAmountSalary] = useState('');
  const [newCategoryCredit, setNewCategoryCredit] = useState('');
  const [newAmountCredit, setNewAmountCredit] = useState('');
  const [newInstallmentsCredit, setNewInstallmentsCredit] = useState('');
  
  const [editingSalary, setEditingSalary] = useState(false);
  const [editingCredit, setEditingCredit] = useState(false);
  const [tempSalary, setTempSalary] = useState(salary.toString());
  const [tempCredit, setTempCredit] = useState(creditLimit.toString());
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthName());
  const [showInvestmentWarning, setShowInvestmentWarning] = useState(true);
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState('');

  // Investment states
  const [investments, setInvestments] = useState<Investment[]>(MOCK_INVESTMENTS);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('budgetProSalary', salary.toString());
  }, [salary]);

  useEffect(() => {
    localStorage.setItem('budgetProCreditLimit', creditLimit.toString());
  }, [creditLimit]);

  useEffect(() => {
    localStorage.setItem('budgetProExpenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('budgetProMonthlyData', JSON.stringify(monthlyData));
  }, [monthlyData]);

  useEffect(() => {
    localStorage.setItem('budgetProUserInvestments', JSON.stringify(userInvestments));
  }, [userInvestments]);

  // Auto-navigate from splash to login
  useEffect(() => {
    if (currentScreen === 'splash') {
      const timer = setTimeout(() => {
        const token = localStorage.getItem('budgetProToken');
        if (token) {
          setCurrentScreen('dashboard');
        } else {
          setCurrentScreen('login');
        }
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [currentScreen]);

  // Dark Mode Effect
  useEffect(() => {
    localStorage.setItem('budgetProDarkMode', isDarkMode.toString());
  }, [isDarkMode]);

  // Dark Mode Toggle Component
  const DarkModeToggle = () => (
    <button
      onClick={() => setIsDarkMode(!isDarkMode)}
      className={`fixed top-4 right-4 z-50 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 ${
        isDarkMode ? 'bg-gray-700 text-yellow-300' : 'bg-white text-gray-700'
      }`}
      aria-label="Toggle dark mode"
    >
      {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );

  // Financial calculations
  const salaryExpenses = React.useMemo(() => 
    expenses.filter(e => e.paymentMethod === 'salary').reduce((sum, expense) => sum + expense.amount, 0), 
    [expenses]
  );
  
  const creditExpenses = React.useMemo(() => 
    expenses.filter(e => e.paymentMethod === 'credit').reduce((sum, expense) => sum + expense.amount, 0), 
    [expenses]
  );
  
  const totalExpenses = React.useMemo(() => salaryExpenses + creditExpenses, [salaryExpenses, creditExpenses]);

  const currentCreditBill = React.useMemo(() => {
    return Math.max(0, creditExpenses - creditBillAmount);
  }, [creditExpenses, creditBillAmount]);

  const { remainingSalary, availableCredit, totalDebt } = React.useMemo(() => {
    const currentSalaryUsed = salaryExpenses + creditBillAmount;
    const currentCreditUsed = creditExpenses;
    const currentDebt = Math.max(0, currentCreditUsed - creditLimit);
    
    return {
      remainingSalary: salary - currentSalaryUsed,
      availableCredit: creditLimit - currentCreditUsed,
      totalDebt: currentDebt
    };
  }, [salaryExpenses, creditExpenses, salary, creditLimit, creditBillAmount]);

  // CORRIGIDO BUG 3: Resumo do mês inclui gastos de salário + cartão
  const expensePercentage = React.useMemo(() => {
    if (salary <= 0) return 0;
    const totalUsed = salaryExpenses + creditExpenses;
    return Math.min(((totalUsed / salary) * 100), 100);
  }, [salaryExpenses, creditExpenses, salary]);
  
  const creditPercentage = React.useMemo(() => 
    creditLimit > 0 ? Math.min(((creditExpenses / creditLimit) * 100), 100) : 0, 
    [creditExpenses, creditLimit]
  );

  // Total investments
  const totalInvestments = React.useMemo(() => 
    userInvestments.reduce((sum, inv) => sum + inv.amount, 0), 
    [userInvestments]
  );

  // Initialize monthly data for a specific month
  const initializeMonthData = (monthKey: string) => {
    if (monthlyData[monthKey]) return monthlyData[monthKey];
    
    const [year, month] = monthKey.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    
    const data: DailyData[] = [];
    for (let day = 1; day <= daysInMonth; day++) {
      data.push({
        day,
        salario: salary,
        cartao: creditLimit,
        investimentos: 0
      });
    }
    
    return data;
  };

  // CORRIGIDO BUG 1: Get chart data with proper calculations for 3 separate lines
  const getChartData = () => {
    const monthKey = getMonthKeyFromName(selectedMonth);
    let data = monthlyData[monthKey];
    
    if (!data) {
      data = initializeMonthData(monthKey);
    }
    
    const isCurrentMonth = monthKey === getCurrentMonthKey();
    const today = new Date().getDate();
    
    // Calculate cumulative values for each day
    const processedData = data.map(dayData => {
      // Salário: começa com valor total e diminui com gastos
      const dayExpensesSalary = expenses
        .filter(e => e.paymentMethod === 'salary')
        .filter(e => {
          const expenseDate = new Date(e.dateAdded);
          const expenseMonth = `${expenseDate.getFullYear()}-${String(expenseDate.getMonth() + 1).padStart(2, '0')}`;
          return expenseMonth === monthKey && expenseDate.getDate() <= dayData.day;
        })
        .reduce((sum, e) => sum + e.amount, 0);
      
      // Cartão: começa com limite total e diminui com gastos
      const dayExpensesCredit = expenses
        .filter(e => e.paymentMethod === 'credit')
        .filter(e => {
          const expenseDate = new Date(e.dateAdded);
          const expenseMonth = `${expenseDate.getFullYear()}-${String(expenseDate.getMonth() + 1).padStart(2, '0')}`;
          return expenseMonth === monthKey && expenseDate.getDate() <= dayData.day;
        })
        .reduce((sum, e) => sum + e.amount, 0);
      
      // Investimentos: começa em 0 e aumenta com investimentos
      const dayInvestments = userInvestments
        .filter(inv => {
          const invDate = new Date(inv.date);
          const invMonth = `${invDate.getFullYear()}-${String(invDate.getMonth() + 1).padStart(2, '0')}`;
          return invMonth === monthKey && invDate.getDate() <= dayData.day;
        })
        .reduce((sum, inv) => sum + inv.amount, 0);
      
      return {
        day: dayData.day,
        salario: Math.max(0, salary - dayExpensesSalary),
        cartao: Math.max(0, creditLimit - dayExpensesCredit),
        investimentos: dayInvestments
      };
    });
    
    // If current month, show only up to today
    if (isCurrentMonth) {
      return processedData.filter(d => d.day <= today);
    }
    
    return processedData;
  };

  // Progress ring component
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

 // Authentication handlers - AGORA COM FIREBASE
const handleLogin = React.useCallback(async () => {
  if (!email || !password) {
    alert('Por favor, preencha todos os campos.');
    return;
  }
  try {
    await signInWithEmailAndPassword(auth, email, password);
    setCurrentScreen('dashboard');
  } catch (error: any) {
    if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
      alert('Email ou senha incorretos.');
    } else if (error.code === 'auth/too-many-requests') {
      alert('Muitas tentativas. Tente novamente mais tarde.');
    } else {
      alert('Erro ao fazer login. Tente novamente.');
    }
  }
}, [email, password]);

const handleSignup = React.useCallback(async () => {
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
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    // Salva o nome do usuário no localStorage pra mostrar "Olá, Renan"
    localStorage.setItem('budgetProUser', JSON.stringify({ name, email }));
    setCurrentScreen('dashboard');
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      alert('Este email já está cadastrado. Tente fazer login.');
    } else if (error.code === 'auth/weak-password') {
      alert('Senha muito fraca.');
    } else {
      alert('Erro ao criar conta. Tente novamente.');
    }
  }
}, [name, email, password, confirmPassword]);

const handleForgotPassword = React.useCallback(() => {
  if (!resetEmail) {
    alert('Por favor, digite seu email.');
    return;
  }
  alert('Funcionalidade de recuperação de senha ainda não implementada no Firebase (em breve!)');
  // Futuro: sendPasswordResetEmail(auth, resetEmail)
}, [resetEmail]);

const handleResetPassword = React.useCallback(() => {
  alert('Funcionalidade de reset de senha ainda não implementada (em breve!)');
  setCurrentScreen('login');
}, []);

const handleLogout = React.useCallback(async () => {
  await auth.signOut();
  localStorage.removeItem('budgetProUser');
  setCurrentScreen('login');
}, []);

  // CORRIGIDO BUG 2: Função addExpense usa inputs separados
  const addExpenseSalary = React.useCallback(() => {
    if (newCategorySalary && newAmountSalary) {
      const iconTypes: IconType[] = ['shopping', 'smartphone', 'coffee'];
      const randomIconType = iconTypes[Math.floor(Math.random() * iconTypes.length)];
      
      const amount = parseFloat(newAmountSalary);
      const now = new Date();
      const dateAdded = now.toISOString().split('T')[0];
      
      const newExpense: Expense = {
        id: Date.now().toString(),
        category: newCategorySalary,
        amount: amount,
        iconType: randomIconType,
        paymentMethod: 'salary',
        dateAdded
      };
      
      setExpenses(prev => [...prev, newExpense]);
      setNewCategorySalary('');
      setNewAmountSalary('');
    }
  }, [newCategorySalary, newAmountSalary]);

  const addExpenseCredit = React.useCallback(() => {
    if (newCategoryCredit && newAmountCredit) {
      const iconTypes: IconType[] = ['shopping', 'smartphone', 'coffee'];
      const randomIconType = iconTypes[Math.floor(Math.random() * iconTypes.length)];
      
      const amount = parseFloat(newAmountCredit);
      const installments = newInstallmentsCredit ? parseInt(newInstallmentsCredit) : undefined;
      const now = new Date();
      const dateAdded = now.toISOString().split('T')[0];
      
      const newExpense: Expense = {
        id: Date.now().toString(),
        category: newCategoryCredit,
        amount: installments ? amount / installments : amount,
        iconType: randomIconType,
        paymentMethod: 'credit',
        installments: installments ? 1 : undefined,
        totalInstallments: installments,
        dueDate: installments ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR') : undefined,
        dateAdded
      };
      
      setExpenses(prev => [...prev, newExpense]);
      setNewCategoryCredit('');
      setNewAmountCredit('');
      setNewInstallmentsCredit('');
    }
  }, [newCategoryCredit, newAmountCredit, newInstallmentsCredit]);
  
  const payCreditBill = React.useCallback(() => {
    const paymentAmount = parseFloat(billPaymentAmount);
    
    if (!billPaymentAmount || paymentAmount <= 0) {
      alert('Digite um valor válido para o pagamento.');
      return;
    }
    
    if (paymentAmount > currentCreditBill) {
      alert(`O valor do pagamento não pode ser maior que a fatura (R$ ${currentCreditBill.toFixed(2)}).`);
      return;
    }
    
    if (paymentAmount > remainingSalary) {
      alert(`Você não tem saldo suficiente no salário (R$ ${remainingSalary.toFixed(2)}).`);
      return;
    }
    
    setCreditBillAmount(prev => prev + paymentAmount);
    setBillPaymentAmount('');
    
    const newBillTotal = currentCreditBill - paymentAmount;
    if (newBillTotal <= 0) {
      setExpenses(prev => prev.map(expense => {
        if (expense.paymentMethod === 'credit' && expense.installments && expense.totalInstallments) {
          if (expense.installments < expense.totalInstallments) {
            return {
              ...expense,
              installments: expense.installments + 1,
              dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')
            };
          }
        }
        return expense;
      }));
      alert('✅ Fatura paga completamente! Próximas parcelas agendadas.');
    } else {
      alert(`✅ Pagamento de R$ ${paymentAmount.toFixed(2)} realizado com sucesso!`);
    }
  }, [billPaymentAmount, currentCreditBill, remainingSalary]);

  const payInstallment = React.useCallback((expenseId: string) => {
    setExpenses(prev => prev.map(expense => {
      if (expense.id === expenseId && expense.installments && expense.totalInstallments) {
        if (expense.installments < expense.totalInstallments) {
          return {
            ...expense,
            installments: expense.installments + 1
          };
        }
      }
      return expense;
    }));
    alert('Parcela paga com sucesso!');
  }, []);

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

  const handleInvest = React.useCallback((investment: Investment) => {
    setSelectedInvestment(investment);
  }, []);

  const confirmInvestment = React.useCallback(() => {
    if (!selectedInvestment || !investmentAmount) {
      alert('Digite um valor para investir.');
      return;
    }

    const amount = parseFloat(investmentAmount);
    
    if (amount < selectedInvestment.minInvestment || amount > selectedInvestment.maxInvestment) {
      alert(`Valor deve estar entre R$ ${selectedInvestment.minInvestment} e R$ ${selectedInvestment.maxInvestment}.`);
      return;
    }

    if (amount > remainingSalary) {
      alert('Saldo insuficiente para este investimento.');
      return;
    }

    const newInvestment: UserInvestment = {
      id: Date.now().toString(),
      investmentId: selectedInvestment.id,
      amount,
      date: new Date().toISOString().split('T')[0]
    };

    setUserInvestments(prev => [...prev, newInvestment]);
    
    const investmentExpense: Expense = {
      id: Date.now().toString(),
      category: `Investimento: ${selectedInvestment.name}`,
      amount,
      iconType: 'shopping',
      paymentMethod: 'salary',
      dateAdded: new Date().toISOString().split('T')[0]
    };
    
    setExpenses(prev => [...prev, investmentExpense]);
    
    setSelectedInvestment(null);
    setInvestmentAmount('');
    alert(`✅ Investimento de R$ ${amount.toFixed(2)} em ${selectedInvestment.name} realizado com sucesso!`);
  }, [selectedInvestment, investmentAmount, remainingSalary]);

  // Initialize current month data
  useEffect(() => {
    const currentMonthKey = getCurrentMonthKey();
    if (!monthlyData[currentMonthKey]) {
      const initialData = initializeMonthData(currentMonthKey);
      setMonthlyData(prev => ({
        ...prev,
        [currentMonthKey]: initialData
      }));
    }
  }, []);

  // 🟦 SPLASH SCREEN
  if (currentScreen === 'splash') {
    return (
      <motion.div 
        className="min-h-screen flex flex-col items-center justify-center px-4" 
        style={{ backgroundColor: '#046BF4' }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6 }}
      >
        <DarkModeToggle />
        <div className="mb-8">
          <img 
            src={logoDefinitiva} 
            alt="BudgetPro Logo" 
            className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 object-contain"
          />
        </div>

        <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 flex items-center justify-center">
          {Array.from({ length: 12 }).map((_, index) => {
            const angle = (index * 360) / 12;
            const radian = (angle * Math.PI) / 180;
            const radius = 28;
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

  // 🟦 LOGIN SCREEN
  if (currentScreen === 'login') {
    return (
      <motion.div 
        className={`min-h-screen ${isDarkMode ? '' : ''}`}
        style={isDarkMode ? { background: 'linear-gradient(to bottom, #0f172a, #1e3a8a, #000000)' } : { background: 'linear-gradient(to bottom, #046BF4, white)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <DarkModeToggle />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="px-4 py-8 pt-20"
        >
          <div className="max-w-sm mx-auto md:max-w-md lg:max-w-lg">
            <div className="text-center mb-6">
              <h2 className={`text-2xl md:text-3xl lg:text-4xl mb-2 font-bold ${isDarkMode ? 'text-white' : 'text-white'}`}>
                Bem-vindo de volta!
              </h2>
              <p className={`text-sm md:text-base px-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-200'}`}>
                Entre na sua conta para acessar suas finanças
              </p>
            </div>

            <Card className={`shadow-xl border-0 rounded-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-white/95 backdrop-blur-sm'}`}>
              <CardContent className="p-5 md:p-6 space-y-4">
                <div className="space-y-4">
                  <div className="relative">
                    <Mail className={`absolute left-3 top-3 h-5 w-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                    <Input
                      type="email"
                      placeholder="Digite seu email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`pl-11 h-12 rounded-xl focus:border-sky-400 focus:ring-2 focus:ring-sky-200 transition-all ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400' : 'border-gray-200'}`}
                    />
                  </div>
                  <div className="relative">
                    <Lock className={`absolute left-3 top-3 h-5 w-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                    <Input
                      type="password"
                      placeholder="Digite sua senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`pl-11 h-12 rounded-xl focus:border-sky-400 focus:ring-2 focus:ring-sky-200 transition-all ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400' : 'border-gray-200'}`}
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
                      className={`text-sm transition-colors hover:brightness-110 ${isDarkMode ? 'text-sky-400' : ''}`}
                      style={!isDarkMode ? { color: '#046BF4' } : {}}
                    >
                      <span className="underline">Esqueceu sua senha?</span>
                    </button>
                  </div>
                  <div>
                    <button
                      onClick={() => setCurrentScreen('signup')}
                      className={`text-sm transition-colors hover:brightness-110 ${isDarkMode ? 'text-sky-400' : ''}`}
                      style={!isDarkMode ? { color: '#046BF4' } : {}}
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

  // 🟦 SIGNUP SCREEN
  if (currentScreen === 'signup') {
    return (
      <motion.div 
        className={`min-h-screen ${isDarkMode ? '' : ''}`}
        style={isDarkMode ? { background: 'linear-gradient(to bottom, #0f172a, #1e3a8a, #000000)' } : { background: 'linear-gradient(135deg, #046BF4 0%, #2A9DF4 50%, white 100%)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <DarkModeToggle />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="px-4 py-8 pt-20"
        >
          <div className="max-w-sm mx-auto md:max-w-md lg:max-w-lg">
            <div className="text-center mb-6">
              <h2 className={`text-2xl md:text-3xl lg:text-4xl mb-2 font-bold text-white`}>
                Criar Nova Conta
              </h2>
            </div>
            <Card className={`shadow-xl border-0 rounded-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-white/95 backdrop-blur-sm'}`}>
              <CardContent className="p-5 md:p-6 space-y-4">
                <div className="space-y-4">
                  <div className="relative">
                    <User className={`absolute left-3 top-3 h-5 w-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                    <Input
                      type="text"
                      placeholder="Digite seu nome completo *"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={`pl-11 h-12 rounded-xl focus:border-sky-400 focus:ring-2 focus:ring-sky-200 transition-all ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400' : 'border-gray-200'}`}
                    />
                  </div>
                  <div className="relative">
                    <Mail className={`absolute left-3 top-3 h-5 w-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                    <Input
                      type="email"
                      placeholder="Digite seu email *"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`pl-11 h-12 rounded-xl focus:border-sky-400 focus:ring-2 focus:ring-sky-200 transition-all ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400' : 'border-gray-200'}`}
                    />
                  </div>
                  <div className="relative">
                    <Lock className={`absolute left-3 top-3 h-5 w-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                    <Input
                      type="password"
                      placeholder="Digite sua senha *"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`pl-11 h-12 rounded-xl focus:border-sky-400 focus:ring-2 focus:ring-sky-200 transition-all ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400' : 'border-gray-200'}`}
                    />
                  </div>
                  <div className="relative">
                    <Lock className={`absolute left-3 top-3 h-5 w-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                    <Input
                      type="password"
                      placeholder="Confirme sua senha *"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`pl-11 h-12 rounded-xl focus:border-sky-400 focus:ring-2 focus:ring-sky-200 transition-all ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400' : 'border-gray-200'}`}
                    />
                  </div>
                </div>

                <div className={`text-xs text-center p-3 rounded-xl ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-50 text-gray-500'}`}>
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
                    className={`text-sm transition-colors hover:brightness-110 ${isDarkMode ? 'text-sky-400' : ''}`}
                    style={!isDarkMode ? { color: '#046BF4' } : {}}
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

  // 🟦 FORGOT PASSWORD SCREEN
  if (currentScreen === 'forgot-password') {
    return (
      <motion.div 
        className={`min-h-screen ${isDarkMode ? '' : ''}`}
        style={isDarkMode ? { background: 'linear-gradient(to bottom, #0f172a, #1e3a8a, #000000)' } : { background: 'linear-gradient(to bottom, #046BF4, white)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <DarkModeToggle />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="px-4 py-8 pt-20"
        >
          <div className="max-w-sm mx-auto">
            <div className="text-center mb-6">
              <h2 className={`text-2xl md:text-3xl lg:text-4xl mb-2 font-bold ${isDarkMode ? 'text-white' : 'text-white'}`}>
                Esqueceu sua senha?
              </h2>
              <p className={`text-sm md:text-base px-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-200'}`}>
                Digite seu email para receber um link de recuperação
              </p>
            </div>

            <Card className={`shadow-xl border-0 rounded-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <CardContent className="p-5 space-y-4">
                <div className="relative">
                  <Mail className={`absolute left-3 top-3 h-5 w-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                  <Input
                    type="email"
                    placeholder="Digite seu email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className={`pl-11 h-12 rounded-xl focus:border-sky-400 focus:ring-2 focus:ring-sky-200 transition-all ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400' : 'border-gray-200'}`}
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
                    className={`text-sm transition-colors hover:brightness-110 ${isDarkMode ? 'text-sky-400' : ''}`}
                    style={!isDarkMode ? { color: '#046BF4' } : {}}
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

  // 🟦 RESET PASSWORD SCREEN
  if (currentScreen === 'reset-password') {
    return (
      <motion.div 
        className={`min-h-screen ${isDarkMode ? '' : ''}`}
        style={isDarkMode ? { background: 'linear-gradient(to bottom, #0f172a, #1e3a8a, #000000)' } : { background: 'linear-gradient(to bottom, #046BF4, white)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <DarkModeToggle />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="px-4 py-8 pt-20"
        >
          <div className="max-w-sm mx-auto">
            <div className="text-center mb-6">
              <h2 className={`text-2xl md:text-3xl lg:text-4xl mb-2 font-bold ${isDarkMode ? 'text-white' : 'text-white'}`}>
                Redefinir Senha
              </h2>
              <p className={`text-sm md:text-base px-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-200'}`}>
                Digite sua nova senha
              </p>
            </div>

            <Card className={`shadow-xl border-0 rounded-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <CardContent className="p-5 space-y-4">
                <div className="space-y-4">
                  <div className="relative">
                    <Lock className={`absolute left-3 top-3 h-5 w-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                    <Input
                      type="password"
                      placeholder="Nova senha"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={`pl-11 h-12 rounded-xl focus:border-sky-400 focus:ring-2 focus:ring-sky-200 transition-all ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400' : 'border-gray-200'}`}
                    />
                  </div>
                  <div className="relative">
                    <Lock className={`absolute left-3 top-3 h-5 w-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                    <Input
                      type="password"
                      placeholder="Confirmar nova senha"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      className={`pl-11 h-12 rounded-xl focus:border-sky-400 focus:ring-2 focus:ring-sky-200 transition-all ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400' : 'border-gray-200'}`}
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
                    className={`text-sm transition-colors hover:brightness-110 ${isDarkMode ? 'text-sky-400' : ''}`}
                    style={!isDarkMode ? { color: '#046BF4' } : {}}
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

  // 🟦 DASHBOARD SCREEN
  if (currentScreen === 'dashboard') {
    const currentUser = JSON.parse(localStorage.getItem('budgetProUser') || '{}');
    const userName = currentUser.name ? currentUser.name.split(' ')[0] : 'Usuário';
    
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
       <DarkModeToggle />
        <div className="px-4 pt-20 pb-4 shadow-sm" style={{ backgroundColor: '#046BF4' }}>
          <div className="flex items-center justify-between">
            {/* LOGO MUITO MAIOR E LINDA */}
            <div className="flex items-center gap-5">
              <img
                src={logoDefinitiva}
                alt="BudgetPro"
                className="w-24 h-24 md:w-32 md:h-32 lg:w-36 lg:h-36 object-contain drop-shadow-2xl"
              />
              <div>
                <h1 className="text-white text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight">
                  Olá, {userName}
                </h1>
                <p className="text-white/80 text-sm md:text-base lg:text-lg">
                  Seja bem-vindo de volta!
                </p>
              </div>
            </div>

            <Button
              onClick={handleLogout}
              className="flex items-center gap-2 text-white hover:bg-white/20 px-6 py-3 rounded-2xl transition-all font-semibold shadow-xl"
            >
              <LogOut className="w-5 h-5" />
              Sair
            </Button>
          </div>
        </div>
        
        <div className="px-4 py-4">
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className={`grid w-full grid-cols-2 md:grid-cols-4 rounded-xl p-1 h-auto md:h-11 ${isDarkMode ? 'bg-[#1e293b]' : 'bg-[#f8fafc]'}`}>
              <TabsTrigger 
                value="overview" 
                className={`rounded-lg transition-all text-xs font-medium py-2 ${
                  isDarkMode 
                    ? 'data-[state=active]:bg-[#60a5fa] data-[state=active]:text-white data-[state=inactive]:bg-[#172554] data-[state=inactive]:text-[#94a3b8]' 
                    : 'data-[state=active]:bg-[#046BF4] data-[state=active]:text-white data-[state=inactive]:text-[#64748b] hover:bg-sky-100'
                }`}
              >
                📊 Visão Geral
              </TabsTrigger>
              <TabsTrigger 
                value="boards"
                className={`rounded-lg transition-all text-xs font-medium py-2 ${
                  isDarkMode 
                    ? 'data-[state=active]:bg-[#60a5fa] data-[state=active]:text-white data-[state=inactive]:bg-[#172554] data-[state=inactive]:text-[#94a3b8]' 
                    : 'data-[state=active]:bg-[#046BF4] data-[state=active]:text-white data-[state=inactive]:text-[#64748b] hover:bg-sky-100'
                }`}
              >
                📋 Gastos
              </TabsTrigger>
              <TabsTrigger 
                value="payment"
                className={`rounded-lg transition-all text-xs font-medium py-2 ${
                  isDarkMode 
                    ? 'data-[state=active]:bg-[#60a5fa] data-[state=active]:text-white data-[state=inactive]:bg-[#172554] data-[state=inactive]:text-[#94a3b8]' 
                    : 'data-[state=active]:bg-[#046BF4] data-[state=active]:text-white data-[state=inactive]:text-[#64748b] hover:bg-sky-100'
                }`}
              >
                🧾 Pagar Fatura
              </TabsTrigger>
              <TabsTrigger 
                value="investments"
                className={`rounded-lg transition-all text-xs font-medium py-2 ${
                  isDarkMode 
                    ? 'data-[state=active]:bg-[#60a5fa] data-[state=active]:text-white data-[state=inactive]:bg-[#172554] data-[state=inactive]:text-[#94a3b8]' 
                    : 'data-[state=active]:bg-[#046BF4] data-[state=active]:text-white data-[state=inactive]:text-[#64748b] hover:bg-sky-100'
                }`}
              >
                💰 Investimentos
              </TabsTrigger>
            </TabsList>

            {/* 🔵 OVERVIEW TAB */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-2 gap-3 mb-4">
                <Card className={`shadow-md border-0 rounded-xl ${isDarkMode ? 'bg-[#1e293b]' : ''}`}>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <p className={`text-xs uppercase ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>SALÁRIO MENSAL</p>
                      <p className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        R$ {salary.toFixed(2)}
                      </p>
                      {editingSalary ? (
                        <div className="space-y-2">
                          <Input
                            type="number"
                            value={tempSalary}
                            onChange={(e) => setTempSalary(e.target.value)}
                            className={`h-9 text-sm ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : ''}`}
                          />
                          <div className="flex gap-1">
                            <Button 
                              onClick={updateSalary} 
                              size="sm" 
                              className="flex-1 h-8 text-xs"
                              style={{ backgroundColor: '#046BF4' }}
                            >
                              Salvar
                            </Button>
                            <Button 
                              onClick={() => setEditingSalary(false)} 
                              variant="outline"
                              size="sm" 
                              className="flex-1 h-8 text-xs"
                            >
                              ✕
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          onClick={() => {
                            setEditingSalary(true);
                            setTempSalary(salary.toString());
                          }}
                          size="sm"
                          className="w-full h-8 text-xs"
                          style={{ backgroundColor: '#046BF4' }}
                        >
                          Modificar
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className={`shadow-md border-0 rounded-xl ${isDarkMode ? 'bg-[#1e293b]' : ''}`}>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <p className={`text-xs uppercase ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>LIMITE DO CARTÃO</p>
                      <p className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        R$ {creditLimit.toFixed(2)}
                      </p>
                      {editingCredit ? (
                        <div className="space-y-2">
                          <Input
                            type="number"
                            value={tempCredit}
                            onChange={(e) => setTempCredit(e.target.value)}
                            className={`h-9 text-sm ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : ''}`}
                          />
                          <div className="flex gap-1">
                            <Button 
                              onClick={updateCredit} 
                              size="sm" 
                              className="flex-1 h-8 text-xs"
                              style={{ backgroundColor: '#046BF4' }}
                            >
                              Salvar
                            </Button>
                            <Button 
                              onClick={() => setEditingCredit(false)} 
                              variant="outline"
                              size="sm" 
                              className="flex-1 h-8 text-xs"
                            >
                              ✕
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          onClick={() => {
                            setEditingCredit(true);
                            setTempCredit(creditLimit.toString());
                          }}
                          size="sm"
                          className="w-full h-8 text-xs"
                          style={{ backgroundColor: '#046BF4' }}
                        >
                          Modificar
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className={`shadow-md border-0 rounded-xl ${isDarkMode ? 'bg-[#1e293b]' : ''}`}>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <p className={`text-xs uppercase ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>SALÁRIO DISPONÍVEL</p>
                      <p className="text-xl font-semibold text-green-600">
                        R$ {remainingSalary.toFixed(2)}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className={`shadow-md border-0 rounded-xl ${isDarkMode ? 'bg-[#1e293b]' : ''}`}>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <p className={`text-xs uppercase ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>LIMITE DISPONÍVEL</p>
                      <p className="text-xl font-semibold text-purple-600">
                        R$ {availableCredit.toFixed(2)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* CORRIGIDO BUG 3: Resumo do Mês agora inclui salário + cartão */}
              <Card className={`shadow-md border-0 rounded-xl ${isDarkMode ? 'bg-[#1e293b]' : ''}`}>
                <CardHeader className="pb-3">
                  <CardTitle className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-white' : ''}`}>
                    <div className="p-2 rounded-lg" style={{ backgroundColor: '#046BF4' }}>
                      <BarChart3 className="w-4 h-4 text-white" />
                    </div>
                    Resumo do Mês
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className={`text-sm ${isDarkMode ? 'text-white' : ''}`}>
                        Você gastou {Math.round(expensePercentage)}% da sua renda
                      </span>
                      <span className={`text-sm font-semibold ${isDarkMode ? 'text-white' : ''}`}>
                        {Math.round(expensePercentage)}%
                      </span>
                    </div>
                    <div className="relative h-3 rounded-full overflow-hidden" style={{ backgroundColor: isDarkMode ? '#3b82f6' : '#e5e7eb' }}>
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${expensePercentage}%`,
                          backgroundColor: expensePercentage > 80 ? '#EF4444' : expensePercentage > 60 ? '#F59E0B' : '#046BF4'
                        }}
                      />
                    </div>
                    <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {expensePercentage > 90 ? '🚨 Gastos muito altos!' :
                       expensePercentage > 70 ? '⚠️ Cuidado com os gastos' :
                       '✅ Gastos controlados'}
                    </p>
                  </div>
                  
                  <div className="flex justify-center mt-4">
                    <ProgressRing 
                      percentage={expensePercentage} 
                      size={100}
                      color={expensePercentage > 80 ? '#EF4444' : expensePercentage > 60 ? '#F59E0B' : '#046BF4'}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* CORRIGIDO BUG 1: Gráfico com 3 linhas distintas */}
              <Card className={`shadow-md border-0 rounded-xl ${isDarkMode ? 'bg-[#1e293b]' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-white' : ''}`}>
                      <div className="p-2 rounded-lg" style={{ backgroundColor: '#046BF4' }}>
                        <TrendingUp className="w-4 h-4 text-white" />
                      </div>
                      Evolução dos Últimos Meses
                    </CardTitle>
                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                      <SelectTrigger className={`w-32 h-8 text-xs ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'].map(month => (
                          <SelectItem key={month} value={month}>{month}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={getChartData()}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="day" 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 10, fill: isDarkMode ? '#9ca3af' : '#666' }}
                        />
                        <YAxis 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 10, fill: isDarkMode ? '#9ca3af' : '#666' }}
                          tickFormatter={(value) => `R$ ${value.toFixed(0)}`}
                        />
                        <Tooltip 
                          formatter={(value: any, name: string) => [
                            `R$ ${Number(value).toFixed(2)}`,
                            name === 'salario' ? 'Salário' :
                            name === 'cartao' ? 'Cartão' : 'Investimentos'
                          ]}
                          labelFormatter={(label) => `Dia: ${label}`}
                          contentStyle={{ 
                            backgroundColor: isDarkMode ? '#1e293b' : 'white', 
                            border: '1px solid #e0e0e0',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                            fontSize: '12px',
                            color: isDarkMode ? 'white' : 'black'
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="salario" 
                          stroke="#10B981" 
                          strokeWidth={2}
                          dot={{ fill: '#10B981', strokeWidth: 2, r: 2 }}
                          activeDot={{ r: 4, fill: '#10B981' }}
                          name="Salário"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="cartao" 
                          stroke="#046BF4" 
                          strokeWidth={2}
                          dot={{ fill: '#046BF4', strokeWidth: 2, r: 2 }}
                          activeDot={{ r: 4, fill: '#046BF4' }}
                          name="Cartão"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="investimentos" 
                          stroke="#8B5CF6" 
                          strokeWidth={2}
                          dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 2 }}
                          activeDot={{ r: 4, fill: '#8B5CF6' }}
                          name="Investimentos"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 🔵 GASTOS TAB - CORRIGIDO BUG 2: Inputs separados */}
            <TabsContent value="boards" className="space-y-4">
              <div className="mb-4">
                <h2 className={`text-lg font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  📋 Pranchetas de Gastos
                </h2>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Gerencie seus gastos de salário e cartão de crédito
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* LEFT BOARD: SALARY EXPENSES */}
                <div className="space-y-4">
                  <Card className={`shadow-md border-0 rounded-xl ${isDarkMode ? 'bg-[#1e293b]' : ''}`}>
                    <CardHeader>
                      <CardTitle className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-white' : ''}`}>
                        💵 Gastos do Salário
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <Input
                          placeholder="Nome do gasto"
                          value={newCategorySalary}
                          onChange={(e) => setNewCategorySalary(e.target.value)}
                          className={`h-10 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                        />
                        <Input
                          type="number"
                          placeholder="Valor"
                          value={newAmountSalary}
                          onChange={(e) => setNewAmountSalary(e.target.value)}
                          className={`h-10 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                        />
                        <Button
                          onClick={addExpenseSalary}
                          className="w-full h-10"
                          style={{ backgroundColor: '#046BF4' }}
                        >
                          <PlusCircle className="w-4 h-4 mr-2" />
                          Adicionar Gasto
                        </Button>
                      </div>

                      <div className="space-y-2">
                        {expenses.filter(e => e.paymentMethod === 'salary').length === 0 ? (
                          <p className={`text-sm text-center py-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Nenhum gasto adicionado
                          </p>
                        ) : (
                          expenses.filter(e => e.paymentMethod === 'salary').map(expense => {
                            const Icon = iconMap[expense.iconType];
                            return (
                              <div key={expense.id} className={`flex items-center justify-between p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                <div className="flex items-center gap-3">
                                  <Icon className="w-5 h-5 text-blue-500" />
                                  <div>
                                    <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : ''}`}>
                                      {expense.category}
                                    </p>
                                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                      R$ {expense.amount.toFixed(2)}
                                    </p>
                                  </div>
                                </div>
                                <Button
                                  onClick={() => removeExpense(expense.id)}
                                  variant="ghost"
                                  size="sm"
                                  className="hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                              </div>
                            );
                          })
                        )}
                      </div>

                      <div className={`pt-3 border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                        <div className="flex justify-between items-center">
                          <span className={`font-semibold ${isDarkMode ? 'text-white' : ''}`}>Total:</span>
                          <span className="font-bold text-red-600">R$ {salaryExpenses.toFixed(2)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* RIGHT BOARD: CREDIT CARD EXPENSES */}
                <div className="space-y-4">
                  <Card className={`shadow-md border-0 rounded-xl ${isDarkMode ? 'bg-[#1e293b]' : ''}`}>
                    <CardHeader>
                      <CardTitle className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-white' : ''}`}>
                        💳 Gastos do Cartão
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <Input
                          placeholder="Nome da compra"
                          value={newCategoryCredit}
                          onChange={(e) => setNewCategoryCredit(e.target.value)}
                          className={`h-10 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                        />
                        <Input
                          type="number"
                          placeholder="Valor total"
                          value={newAmountCredit}
                          onChange={(e) => setNewAmountCredit(e.target.value)}
                          className={`h-10 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                        />
                        <Input
                          type="number"
                          placeholder="Número de parcelas (opcional)"
                          value={newInstallmentsCredit}
                          onChange={(e) => setNewInstallmentsCredit(e.target.value)}
                          className={`h-10 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                        />
                        <Button
                          onClick={addExpenseCredit}
                          className="w-full h-10"
                          style={{ backgroundColor: '#046BF4' }}
                        >
                          <PlusCircle className="w-4 h-4 mr-2" />
                          Adicionar Compra
                        </Button>
                      </div>

                      <div className="space-y-2">
                        {expenses.filter(e => e.paymentMethod === 'credit').length === 0 ? (
                          <p className={`text-sm text-center py-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Nenhuma compra adicionada
                          </p>
                        ) : (
                          expenses.filter(e => e.paymentMethod === 'credit').map(expense => {
                            const Icon = iconMap[expense.iconType];
                            const showInstallments = expense.installments && expense.totalInstallments;
                            return (
                              <div key={expense.id} className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-3">
                                    <Icon className="w-5 h-5 text-purple-500" />
                                    <div>
                                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : ''}`}>
                                        {expense.category}
                                      </p>
                                      {showInstallments ? (
                                        <>
                                          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                            Parcela {expense.installments}/{expense.totalInstallments} - R$ {expense.amount.toFixed(2)}
                                          </p>
                                          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                            Total: R$ {(expense.amount * expense.totalInstallments).toFixed(2)}
                                          </p>
                                          {expense.dueDate && (
                                            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                              Venc: {expense.dueDate}
                                            </p>
                                          )}
                                        </>
                                      ) : (
                                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                          R$ {expense.amount.toFixed(2)}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  <Button
                                    onClick={() => removeExpense(expense.id)}
                                    variant="ghost"
                                    size="sm"
                                    className="hover:bg-red-50"
                                  >
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                  </Button>
                                </div>
                                {showInstallments && expense.installments! < expense.totalInstallments! && (
                                  <Button
                                    onClick={() => payInstallment(expense.id)}
                                    size="sm"
                                    className="w-full h-8 text-xs mt-2"
                                    style={{ backgroundColor: '#10B981' }}
                                  >
                                    Pagar Próxima Parcela
                                  </Button>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>

                      <div className={`pt-3 border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                        <div className="flex justify-between items-center">
                          <span className={`font-semibold ${isDarkMode ? 'text-white' : ''}`}>Total devido este mês:</span>
                          <span className="font-bold text-purple-600">R$ {currentCreditBill.toFixed(2)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* 🔵 PAYMENT TAB */}
            <TabsContent value="payment" className="space-y-4">
              <Card className={`shadow-md border-0 rounded-xl ${isDarkMode ? 'bg-[#1e293b]' : ''}`}>
                <CardHeader>
                  <CardTitle className={`flex items-center gap-2 ${isDarkMode ? 'text-white' : ''}`}>
                    <CreditCard className="w-5 h-5" />
                    Pagar Fatura do Cartão
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-purple-50'}`}>
                    <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Fatura atual do cartão:
                    </p>
                    <p className="text-2xl font-bold text-purple-600">
                      R$ {currentCreditBill.toFixed(2)}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Label className={isDarkMode ? 'text-white' : ''}>Valor do Pagamento</Label>
                    <Input
                      type="number"
                      placeholder="Digite o valor a pagar"
                      value={billPaymentAmount}
                      onChange={(e) => setBillPaymentAmount(e.target.value)}
                      className={`h-12 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                    />
                    <Button
                      onClick={payCreditBill}
                      className="w-full h-12"
                      style={{ backgroundColor: '#046BF4' }}
                    >
                      Confirmar Pagamento
                    </Button>
                  </div>

                  <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                    <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Saldo disponível no salário:
                    </p>
                    <p className="text-xl font-bold text-blue-600">
                      R$ {remainingSalary.toFixed(2)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 🔵 INVESTMENTS TAB */}
            <TabsContent value="investments" className="space-y-4">
              {showInvestmentWarning && (
                <Card className={`shadow-md border-0 rounded-xl ${isDarkMode ? 'bg-[#1e293b]' : 'bg-yellow-50'} border-2 border-yellow-400`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <p className={`text-sm ${isDarkMode ? 'text-yellow-300' : 'text-yellow-900'}`}>
                          <strong>Atenção:</strong> Esses investimentos são fictícios. Nada aqui usará seu dinheiro real. É apenas uma simulação para aprendizado.
                        </p>
                      </div>
                      <Button
                        onClick={() => setShowInvestmentWarning(false)}
                        variant="ghost"
                        size="sm"
                        className="flex-shrink-0"
                      >
                        <X className="w-5 h-5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className={`shadow-md border-0 rounded-xl ${isDarkMode ? 'bg-[#1e293b]' : ''}`}>
                <CardHeader>
                  <CardTitle className={`flex items-center gap-2 ${isDarkMode ? 'text-white' : ''}`}>
                    <TrendingUpDown className="w-5 h-5" />
                    Oportunidades de Investimento
                  </CardTitle>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Explore oportunidades de investimento personalizadas (simulação)
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {investments.map(investment => {
                      const Icon = investment.icon;
                      return (
                        <Card key={investment.id} className={`border-0 shadow-md hover:shadow-lg transition-shadow ${isDarkMode ? 'bg-[#27272a]' : ''}`}>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3 mb-3">
                              <div className="p-3 rounded-lg" style={{ backgroundColor: `${investment.color}20` }}>
                                <Icon className="w-6 h-6" style={{ color: investment.color }} />
                              </div>
                              <div className="flex-1">
                                <h3 className={`font-semibold mb-1 ${isDarkMode ? 'text-white' : ''}`}>
                                  {investment.name}
                                </h3>
                                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                  {investment.type}
                                </p>
                              </div>
                            </div>
                            <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              {investment.description}
                            </p>
                            
                            <div className="h-24 mb-3">
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={investment.historicalData}>
                                  <Line 
                                    type="monotone" 
                                    dataKey="value" 
                                    stroke={investment.color} 
                                    strokeWidth={2}
                                    dot={false}
                                  />
                                  <Tooltip 
                                    formatter={(value: any) => [`R$ ${value}`, 'Valor']}
                                    contentStyle={{
                                      backgroundColor: isDarkMode ? '#1e293b' : 'white',
                                      border: '1px solid #e0e0e0',
                                      borderRadius: '8px',
                                      fontSize: '12px'
                                    }}
                                  />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>

                            <div className="space-y-2 mb-3">
                              <div className="flex justify-between text-sm">
                                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Retorno esperado:</span>
                                <span className="font-semibold text-green-600">
                                  {investment.expectedReturn}%
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Investimento mín:</span>
                                <span className={isDarkMode ? 'text-white' : ''}>
                                  R$ {investment.minInvestment}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Risco:</span>
                                <span className="font-medium" style={{ color: investment.color }}>
                                  {investment.riskLevel === 'low' ? 'Baixo' : 
                                   investment.riskLevel === 'medium' ? 'Médio' : 'Alto'}
                                </span>
                              </div>
                            </div>

                            <Button
                              onClick={() => handleInvest(investment)}
                              className="w-full h-10"
                              style={{ backgroundColor: investment.color }}
                            >
                              Investir Agora
                            </Button>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {selectedInvestment && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                  <Card className={`w-full max-w-md ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <CardHeader>
                      <CardTitle className={`flex items-center justify-between ${isDarkMode ? 'text-white' : ''}`}>
                        <span>Investir em {selectedInvestment.name}</span>
                        <Button
                          onClick={() => {
                            setSelectedInvestment(null);
                            setInvestmentAmount('');
                          }}
                          variant="ghost"
                          size="sm"
                        >
                          <X className="w-5 h-5" />
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className={isDarkMode ? 'text-white' : ''}>Valor do Investimento</Label>
                        <Input
                          type="number"
                          placeholder={`Mín: R$ ${selectedInvestment.minInvestment}`}
                          value={investmentAmount}
                          onChange={(e) => setInvestmentAmount(e.target.value)}
                          className={`h-12 mt-2 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                        />
                        <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Máximo: R$ {selectedInvestment.maxInvestment}
                        </p>
                      </div>

                      <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          Saldo disponível: <span className="font-semibold text-green-600">R$ {remainingSalary.toFixed(2)}</span>
                        </p>
                      </div>

                      <Button
                        onClick={confirmInvestment}
                        className="w-full h-12"
                        style={{ backgroundColor: selectedInvestment.color }}
                      >
                        Confirmar Investimento
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }

  return null;
}
