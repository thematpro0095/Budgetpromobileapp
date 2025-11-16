import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  Input,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Label,
  Alert,
  AlertDescription,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Progress
} from './components/ui'; // assume you have an index that exports these; otherwise import individually
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
  FileText,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Brain,
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  PieChart as LucidePie
} from 'lucide-react';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis
} from 'recharts';

import logoDefinitiva from './assets/logo.png'; // ajuste se for outro nome
import { themes } from './theme'; // your theme.ts (you already have)

// --- Types
type Screen =
  | 'splash'
  | 'login'
  | 'signup'
  | 'forgot-password'
  | 'dashboard'
  | 'investment-details'
  | 'investment-purchase'
  | 'investment-result';

type IconType = 'coffee' | 'car' | 'home' | 'shopping' | 'smartphone';

interface Expense {
  id: string;
  category: string;
  amount: number;
  iconType: IconType;
  paymentMethod: 'salary' | 'credit';
}

interface Investment {
  id: string;
  name: string;
  type: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high';
  expectedReturn: number;
  minInvestment: number;
  maxInvestment: number;
  icon?: any;
  color?: string;
  historicalData?: { month: string; value: number }[];
  status?: 'available' | 'purchased' | 'completed';
  purchaseAmount?: number;
  profitLoss?: number;
}

// --- Mock data
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
    icon: TrendingUp,
    color: '#3B82F6',
    historicalData: [
      { month: 'Jan', value: 100 },
      { month: 'Fev', value: 105 },
      { month: 'Mar', value: 108 }
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
    icon: LucidePie,
    color: '#10B981',
    historicalData: [
      { month: 'Jan', value: 100 },
      { month: 'Fev', value: 101 },
      { month: 'Mar', value: 103 }
    ],
    status: 'available'
  }
];

// Simple icon map for expense items
const iconMap: Record<IconType, any> = {
  coffee: Coffee,
  car: Car,
  home: Home,
  shopping: ShoppingCart,
  smartphone: Smartphone
};

// small utility for id
const makeId = () => Math.random().toString(36).slice(2, 9);

// --- Small components
const ProgressRing: React.FC<{ percentage: number; size?: number }> = ({ percentage, size = 80 }) => {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <svg width={size} height={size} className="inline-block">
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
        stroke="#046BF4"
        strokeWidth={strokeWidth}
        fill="transparent"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
      />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize={14} fill="#111">
        {Math.round(percentage)}%
      </text>
    </svg>
  );
};

// --- App
export default function App(): JSX.Element {
  // screens & auth-ish
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');

  // finances
  const [salary, setSalary] = useState<number>(0);
  const [creditLimit, setCreditLimit] = useState<number>(0);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [newAmount, setNewAmount] = useState<number | ''>('');
  const [newIcon, setNewIcon] = useState<IconType>('coffee');

  // credit/fatura
  const [creditBill, setCreditBill] = useState(0);
  const [creditBillAmount, setCreditBillAmount] = useState(0);
  const [billPaymentAmount, setBillPaymentAmount] = useState('');

  // investments
  const [investments, setInvestments] = useState<Investment[]>(MOCK_INVESTMENTS);
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);

  // UI
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // derived
  const salaryExpenses = expenses
    .filter((e) => e.paymentMethod === 'salary')
    .reduce((s, e) => s + e.amount, 0);

  const creditExpenses = expenses
    .filter((e) => e.paymentMethod === 'credit')
    .reduce((s, e) => s + e.amount, 0);

  const remainingSalary = Math.max(0, salary - salaryExpenses - bankDebtCalculator());
  function bankDebtCalculator() {
    // simple placeholder, if needed change logic
    return 0;
  }

  const availableCredit = Math.max(0, creditLimit - creditExpenses);

  // percentages
  const expensePercentage = salary > 0 ? Math.min(100, (salaryExpenses / salary) * 100) : 0;
  const creditPercentage = creditLimit > 0 ? Math.min(100, (creditExpenses / creditLimit) * 100) : 0;

  // monthly data (just sample dynamic)
  const totalExpenses = salaryExpenses + creditExpenses;
  const monthlyData = useMemo(
    () => [
      { month: 'Set', receitas: salary, gastos: totalExpenses, investimentos: 0 },
      { month: 'Out', receitas: salary, gastos: totalExpenses, investimentos: 0 },
      { month: 'Nov', receitas: salary, gastos: totalExpenses, investimentos: 0 }
    ],
    [salary, totalExpenses]
  );

  // invest distribution for pie
  const investmentData = investments.map((inv, idx) => ({
    name: inv.name,
    value: Math.round((inv.minInvestment ?? 100) / (idx + 1))
  }));

  // effects
  useEffect(() => {
    if (currentScreen === 'splash') {
      const t = setTimeout(() => setCurrentScreen('login'), 3500);
      return () => clearTimeout(t);
    }
  }, [currentScreen]);

  // --- handlers
  const addExpense = (method: 'salary' | 'credit') => {
    if (!newCategory || !newAmount) return;
    const e: Expense = {
      id: makeId(),
      category: newCategory,
      amount: Number(newAmount),
      iconType: newIcon,
      paymentMethod: method
    };
    setExpenses((prev) => [e, ...prev]);
    setNewCategory('');
    setNewAmount('');
    // if credit, add to credit bill as well
    if (method === 'credit') {
      setCreditBill((b) => b + e.amount);
    }
  };

  const removeExpense = (id: string) => {
    const toRemove = expenses.find((x) => x.id === id);
    if (!toRemove) return;
    setExpenses((prev) => prev.filter((p) => p.id !== id));
    if (toRemove.paymentMethod === 'credit') {
      setCreditBill((b) => Math.max(0, b - toRemove.amount));
    }
  };

  const selectInvestment = (inv: Investment) => {
    setSelectedInvestment(inv);
    setCurrentScreen('investment-details');
  };

  const payCreditBill = () => {
    const toPay = parseFloat(billPaymentAmount || '0');
    if (isNaN(toPay) || toPay <= 0) return;
    setCreditBillAmount((p) => p + toPay);
    setBillPaymentAmount('');
    // pay from salary: subtract from salary (simulate)
    setSalary((s) => Math.max(0, s - toPay));
  };

  // --- Small helpers for risk label
  const getRiskLabel = (r: Investment['riskLevel']) =>
    r === 'low' ? 'Baixo' : r === 'medium' ? 'Médio' : 'Alto';

  const getRiskColor = (r: Investment['riskLevel']) =>
    r === 'low' ? '#10B981' : r === 'medium' ? '#F59E0B' : '#EF4444';

  // ---------- Renders for screens ----------
  // 1) Splash
  if (currentScreen === 'splash') {
    return (
      <motion.div
        className={`min-h-screen flex flex-col items-center justify-center px-4 ${themes[theme].background}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="mb-6">
          <img src={logoDefinitiva} alt="BudgetPro" className="w-28 h-28 object-contain" />
        </div>
        <div className="mb-6">
          <p className="text-white/90 text-lg">Carregando seu app financeiro...</p>
        </div>
        <div>
          <ProgressRing percentage={25} />
        </div>
      </motion.div>
    );
  }

  // 2) Login screen
  if (currentScreen === 'login') {
    return (
      <div className={`min-h-screen flex items-center justify-center px-4 py-8 ${themes[theme].background}`}>
        <div className="max-w-sm w-full">
          <Card className="rounded-2xl shadow-lg">
            <CardContent className="p-6">
              <div className="text-center mb-4">
                <img src={logoDefinitiva} alt="BudgetPro" className="w-20 h-20 mx-auto" />
                <h2 className="mt-2 font-semibold">BudgetPro</h2>
              </div>
              <div className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="Digite seu email"
                    value={email}
                    onChange={(e: any) => setEmail(e.target.value)}
                    className="pl-11 h-12 rounded-xl"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    type="password"
                    placeholder="Senha"
                    value={password}
                    onChange={(e: any) => setPassword(e.target.value)}
                    className="pl-11 h-12 rounded-xl"
                  />
                </div>
                <Button
                  onClick={() => setCurrentScreen('dashboard')}
                  className="w-full h-12 rounded-xl text-white"
                  style={{ backgroundColor: '#046BF4' }}
                >
                  Entrar
                </Button>
                <div className="flex justify-between text-sm mt-3">
                  <button onClick={() => setCurrentScreen('forgot-password')} className="underline">
                    Esqueceu a senha?
                  </button>
                  <button onClick={() => setCurrentScreen('signup')} className="underline">
                    Criar conta
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // 3) Signup screen (simple)
  if (currentScreen === 'signup') {
    return (
      <div className={`min-h-screen flex items-center justify-center px-4 py-8 ${themes[theme].background}`}>
        <div className="max-w-sm w-full">
          <Card className="rounded-2xl shadow-lg">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-3">Criar Conta</h2>
              <div className="space-y-3">
                <Input placeholder="Nome completo" value={name} onChange={(e: any) => setName(e.target.value)} />
                <Input placeholder="Email" value={email} onChange={(e: any) => setEmail(e.target.value)} />
                <Input placeholder="Senha" value={password} onChange={(e: any) => setPassword(e.target.value)} />
                <Button onClick={() => setCurrentScreen('login')} className="w-full" style={{ backgroundColor: '#046BF4', color: 'white' }}>
                  Criar conta
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // 4) Dashboard (main)
  if (currentScreen === 'dashboard') {
    return (
      <div className={`min-h-screen ${themes[theme].background}`}>
        {/* Header */}
        <div className="px-4 py-4 shadow-sm" style={{ backgroundColor: '#046BF4' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img src={logoDefinitiva} alt="BudgetPro" className="w-12 h-12 object-contain" />
              <div className="ml-3">
                <h1 className="text-white text-lg font-semibold">BudgetPro</h1>
                <p className="text-white/80 text-xs hidden sm:block">Suas finanças</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-white text-sm mr-2">{theme === 'light' ? 'Claro' : 'Escuro'}</div>
              <button
                onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
                className="bg-white/20 px-3 py-2 rounded-xl text-white text-sm"
              >
                {theme === 'light' ? '🌙' : '☀️'}
              </button>
            </div>
          </div>
        </div>

        <div className="px-4 py-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="rounded-xl">
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-500">Salário Total</div>
                      <div className="font-bold text-lg">R$ {salary.toFixed(2)}</div>
                    </div>
                    <div>
                      <Button onClick={() => { setSalary(0); setTempStatesToZero(); }} variant="outline">Zerar</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-xl">
                <CardContent>
                  <div>
                    <div className="text-sm text-gray-500">Total Gasto</div>
                    <div className="font-bold text-lg">R$ {totalExpenses.toFixed(2)}</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-xl">
                <CardContent>
                  <div>
                    <div className="text-sm text-gray-500">Disponível (salário)</div>
                    <div className="font-bold text-lg text-blue-600">R$ {remainingSalary.toFixed(2)}</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Boards (salary & credit) */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Pranchetas</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Salary Board */}
                <div>
                  <Card className="rounded-xl">
                    <CardHeader>
                      <CardTitle>Prancheta - Salário</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 mb-4">
                        <Input placeholder="Categoria" value={newCategory} onChange={(e: any) => setNewCategory(e.target.value)} />
                        <Input placeholder="Valor (R$)" type="number" value={newAmount as any} onChange={(e: any) => setNewAmount(e.target.value)} />
                        <div className="flex gap-2">
                          <select value={newIcon} onChange={(e: any) => setNewIcon(e.target.value)} className="rounded-lg h-10 px-2">
                            <option value="coffee">Café</option>
                            <option value="car">Transporte</option>
                            <option value="home">Moradia</option>
                            <option value="shopping">Compras</option>
                            <option value="smartphone">Celular</option>
                          </select>
                          <Button onClick={() => addExpense('salary')} style={{ backgroundColor: '#046BF4', color: 'white' }}>
                            <PlusCircle className="w-4 h-4" /> Adicionar
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {expenses.filter((e) => e.paymentMethod === 'salary').map((expense) => {
                          const Icon = iconMap[expense.iconType];
                          return (
                            <div key={expense.id} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-md bg-gray-50">
                                  <Icon className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                  <div className="font-medium">{expense.category}</div>
                                  <div className="text-xs text-gray-500">{((expense.amount / Math.max(1, salaryExpenses)) * 100).toFixed(1)}% dos gastos</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div>R$ {expense.amount.toFixed(2)}</div>
                                <Button variant="outline" onClick={() => removeExpense(expense.id)}><Trash2 /></Button>
                              </div>
                            </div>
                          );
                        })}
                        {expenses.filter((e) => e.paymentMethod === 'salary').length === 0 && (
                          <div className="text-center py-6 text-gray-500">Nenhum gasto</div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Credit Board */}
                <div>
                  <Card className="rounded-xl">
                    <CardHeader>
                      <CardTitle>Prancheta - Cartão</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 mb-4">
                        <Input placeholder="Categoria" value={newCategory} onChange={(e: any) => setNewCategory(e.target.value)} />
                        <Input placeholder="Valor (R$)" type="number" value={newAmount as any} onChange={(e: any) => setNewAmount(e.target.value)} />
                        <div className="flex gap-2">
                          <select value={newIcon} onChange={(e: any) => setNewIcon(e.target.value)} className="rounded-lg h-10 px-2">
                            <option value="coffee">Café</option>
                            <option value="car">Transporte</option>
                            <option value="home">Moradia</option>
                            <option value="shopping">Compras</option>
                            <option value="smartphone">Celular</option>
                          </select>
                          <Button onClick={() => addExpense('credit')} style={{ backgroundColor: '#8B5CF6', color: 'white' }}>
                            <PlusCircle className="w-4 h-4" /> Adicionar
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {expenses.filter((e) => e.paymentMethod === 'credit').map((expense) => {
                          const Icon = iconMap[expense.iconType];
                          return (
                            <div key={expense.id} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-md bg-gray-50">
                                  <Icon className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                  <div className="font-medium">{expense.category}</div>
                                  <div className="text-xs text-gray-500">{((expense.amount / Math.max(1, creditExpenses)) * 100).toFixed(1)}% da fatura</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div>R$ {expense.amount.toFixed(2)}</div>
                                <Button variant="outline" onClick={() => removeExpense(expense.id)}><Trash2 /></Button>
                              </div>
                            </div>
                          );
                        })}
                        {expenses.filter((e) => e.paymentMethod === 'credit').length === 0 && (
                          <div className="text-center py-6 text-gray-500">Nenhum gasto no cartão</div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="rounded-xl">
                <CardHeader>
                  <CardTitle>Evolução dos Últimos Meses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div style={{ height: 200 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="gastos" stroke="#EF4444" />
                        <Line type="monotone" dataKey="receitas" stroke="#10B981" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-xl">
                <CardHeader>
                  <CardTitle>Distribuição de Investimentos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div style={{ height: 200 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={investmentData} dataKey="value" innerRadius={30} outerRadius={60} label>
                          {investmentData.map((entry, idx) => (
                            <Cell key={idx} fill={['#4F46E5', '#22C55E', '#F59E0B', '#EF4444'][idx % 4]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* investment selection list */}
            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle>Opções de Investimento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {investments.map((inv) => {
                    const Icon = inv.icon ?? TrendingUp;
                    const affordable = remainingSalary >= inv.minInvestment;
                    return (
                      <div key={inv.id} className={`p-3 rounded-lg border bg-white ${affordable ? 'hover:border-blue-300' : 'opacity-60'}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg" style={{ backgroundColor: `${inv.color ?? '#eee'}20` }}>
                              <Icon className="w-5 h-5" style={{ color: inv.color ?? '#333' }} />
                            </div>
                            <div>
                              <div className="font-medium">{inv.name}</div>
                              <div className="text-xs text-gray-500">{inv.type}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-green-600">±{inv.expectedReturn}%</div>
                            {!affordable && <div className="text-xs text-red-500">Saldo baixo</div>}
                          </div>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <Button onClick={() => selectInvestment(inv)} variant="outline">Ver</Button>
                          <Button onClick={() => alert('Comprar (demo)')} style={{ backgroundColor: '#046BF4', color: 'white' }} disabled={!affordable}>
                            Investir
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Investment details
  if (currentScreen === 'investment-details') {
    return (
      <div className={`min-h-screen ${themes[theme].background}`}>
        <div className="px-6 py-4 text-center shadow-sm" style={{ backgroundColor: '#046BF4' }}>
          <img src={logoDefinitiva} alt="BudgetPro" className="w-20 h-20 mx-auto object-contain" />
          <h1 className="text-white text-lg">BudgetPro</h1>
        </div>

        <div className="px-4 py-6">
          <Button onClick={() => setCurrentScreen('dashboard')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>

          {selectedInvestment ? (
            <div className="max-w-3xl mx-auto space-y-4">
              <Card className="rounded-xl">
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg" style={{ backgroundColor: `${selectedInvestment.color}20` }}>
                      <selectedInvestment.icon className="w-8 h-8" style={{ color: selectedInvestment.color }} />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">{selectedInvestment.name}</h2>
                      <p className="text-gray-600">{selectedInvestment.type}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-gray-700">{selectedInvestment.description}</p>
                </CardContent>
              </Card>
              <Card className="rounded-xl">
                <CardHeader>
                  <CardTitle>Desempenho</CardTitle>
                </CardHeader>
                <CardContent>
                  <div style={{ height: 220 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={selectedInvestment.historicalData ?? []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="value" stroke={selectedInvestment.color ?? '#046BF4'} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button onClick={() => setCurrentScreen('investment-purchase')} style={{ backgroundColor: '#046BF4', color: 'white' }}>
                  Investir Agora
                </Button>
                <Button variant="outline" onClick={() => setCurrentScreen('dashboard')}>
                  Voltar
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-20">Nenhum investimento selecionado.</div>
          )}
        </div>
      </div>
    );
  }

  // fallback
  return <div className={`min-h-screen ${themes[theme].background}`} />;
}

// small helper to zero temp states (used in header)
function setTempStatesToZero() {
  // placeholder if you want to reset more states globally
  return;
}
