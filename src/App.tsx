import React, { useState, useEffect } from 'react';
import { themes } from "./theme";
import { motion } from 'motion/react';
import { Input } from './components/ui/input';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Alert, AlertDescription } from './components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Progress } from './components/ui/progress';
import {
  PlusCircle,
  Trash2,
  ShoppingCart,
  Mail,
  Lock,
  FileText,
  CreditCard,
  TrendingUp,
  Brain,
  AlertTriangle,
  ArrowLeft,
  Building,
  Zap,
  Coins
} from 'lucide-react';
import { Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, Pie } from 'recharts';

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

const iconMap: Record<IconType, React.ComponentType<any>> = {
  coffee: Zap,
  car: Building,
  home: Building,
  shopping: ShoppingCart,
  smartphone: Zap,
};

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
    ],
    status: 'available',
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
    ],
    status: 'available',
  },
];

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [salary, setSalary] = useState(0);
  const [creditLimit, setCreditLimit] = useState(0);

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [newAmount, setNewAmount] = useState('');

  const [investments] = useState<Investment[]>(MOCK_INVESTMENTS);
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);

  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  useEffect(() => {
    if (currentScreen === 'splash') {
      const timer = setTimeout(() => setCurrentScreen('login'), 2000);
      return () => clearTimeout(timer);
    }
  }, [currentScreen]);

  const salaryExpenses = React.useMemo(
    () => expenses.filter((e) => e.paymentMethod === 'salary').reduce((s, e) => s + e.amount, 0),
    [expenses]
  );
  const creditExpenses = React.useMemo(
    () => expenses.filter((e) => e.paymentMethod === 'credit').reduce((s, e) => s + e.amount, 0),
    [expenses]
  );

  const remainingSalary = salary - salaryExpenses;
  const availableCredit = creditLimit - creditExpenses;

  const expensePercentage = salary > 0 ? Math.min((salaryExpenses / salary) * 100, 100) : 0;
  const creditPercentage = creditLimit > 0 ? Math.min((creditExpenses / creditLimit) * 100, 100) : 0;

  const addExpense = (paymentMethod: PaymentMethod) => {
    if (!newCategory || !newAmount) return;
    const iconTypes: IconType[] = ['shopping', 'smartphone', 'coffee'];
    const randomIcon = iconTypes[Math.floor(Math.random() * iconTypes.length)];
    setExpenses((p) => [
      ...p,
      { id: Date.now().toString(), category: newCategory, amount: parseFloat(newAmount), iconType: randomIcon, paymentMethod },
    ]);
    setNewCategory('');
    setNewAmount('');
  };

  const removeExpense = (id: string) => setExpenses((p) => p.filter((e) => e.id !== id));

  const ProgressRing = ({ percentage, size = 80, strokeWidth = 6, color = '#046BF4' }: { percentage: number; size?: number; strokeWidth?: number; color?: string }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = `${circumference} ${circumference}`;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
    return (
      <div className="relative inline-flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} stroke="#e5e7eb" strokeWidth={strokeWidth} fill="transparent" />
          <circle cx={size / 2} cy={size / 2} r={radius} stroke={color} strokeWidth={strokeWidth} fill="transparent" strokeDasharray={strokeDasharray} strokeDashoffset={strokeDashoffset} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span style={{ color }} className="text-sm font-semibold">{Math.round(percentage)}%</span>
        </div>
      </div>
    );
  };

  // --- Screens (simplified but valid JSX) ---
  if (currentScreen === 'splash') {
    return (
      <motion.div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#046BF4' }}>
        <img src={logoDefinitiva} alt="BudgetPro" className="w-28 h-28" />
      </motion.div>
    );
  }

  if (currentScreen === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-500 to-white p-4">
        <div className="max-w-sm mx-auto">
          <Card>
            <CardContent>
              <div className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha" type="password" />
                </div>
                <Button onClick={() => setCurrentScreen('dashboard')} className="w-full" style={{ backgroundColor: '#046BF4', color: 'white' }}>
                  Entrar
                </Button>
                <div className="flex justify-between text-xs mt-2">
                  <button onClick={() => setCurrentScreen('forgot-password')}>Esqueceu?</button>
                  <button onClick={() => setCurrentScreen('signup')}>Criar conta</button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (currentScreen === 'signup') {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-sm mx-auto">
          <Card>
            <CardContent>
              <Input placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} />
              <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <Input placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} type="password" />
              <Button onClick={() => setCurrentScreen('login')} className="w-full mt-3">Criar</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (currentScreen === 'dashboard') {
    return (
      <div className={`min-h-screen ${themes[theme]?.background || ''}`}>
        <div className="px-4 py-4 shadow-sm" style={{ backgroundColor: '#046BF4' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img src={logoDefinitiva} alt="BudgetPro" className="w-12 h-12 object-contain" />
              <div className="ml-3">
                <h1 className="text-white text-lg font-semibold">BudgetPro</h1>
                <p className="text-white/80 text-xs">Suas finanças</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right text-white mr-4">
                <p className="text-xs text-white/80">Disponível</p>
                <p className="text-sm font-semibold">R$ {(remainingSalary + Math.max(0, availableCredit)).toFixed(2)}</p>
              </div>
              <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="bg-white/20 px-3 py-2 rounded-xl text-white text-sm">
                {theme === 'light' ? '🌙' : '☀️'}
              </button>
            </div>
          </div>
        </div>

        <div className="px-4 py-4">
          {remainingSalary < salary * 0.2 && (
            <Alert className="mb-4">
              <AlertDescription>⚠️ Saldo baixo: R$ {remainingSalary.toFixed(2)}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-2 rounded-xl p-1">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="boards">Prancheta</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid grid-cols-2 gap-3 mb-4">
                <Card>
                  <CardContent>
                    <div className="text-sm">Receitas</div>
                    <div className="font-semibold">R$ {salary.toFixed(2)}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent>
                    <div className="text-sm">Gastos Salário</div>
                    <div className="font-semibold">R$ {salaryExpenses.toFixed(2)}</div>
                  </CardContent>
                </Card>
              </div>

              <Card className="mb-4">
                <CardHeader>
                  <CardTitle>Resumo do Mês</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm">Você gastou {Math.round(expensePercentage)}% da sua renda</span>
                      <span className="text-sm font-semibold">{Math.round(expensePercentage)}%</span>
                    </div>
                    <Progress value={expensePercentage} className="h-3 rounded-full" />
                    <div className="flex justify-center mt-4"><ProgressRing percentage={expensePercentage} /></div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="boards">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <Card className="mb-3">
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span>Salário Total</span>
                        <span className="font-semibold">R$ {salary.toFixed(2)}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Gastos do Salário</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Input placeholder="Categoria" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} />
                      <div className="flex gap-2 mt-2">
                        <Input type="number" placeholder="Valor" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} />
                        <Button onClick={() => addExpense('salary')}><PlusCircle /></Button>
                      </div>

                      <div className="mt-3 space-y-2">
                        {expenses.filter((e) => e.paymentMethod === 'salary').map((exp) => {
                          const Icon = iconMap[exp.iconType] || ShoppingCart;
                          return (
                            <div key={exp.id} className="flex items-center justify-between p-2 border rounded">
                              <div className="flex items-center gap-2"><Icon className="w-4 h-4" /><div>{exp.category}</div></div>
                              <div className="flex items-center gap-2">R$ {exp.amount.toFixed(2)} <Button onClick={() => removeExpense(exp.id)} variant="outline"><Trash2 /></Button></div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <Card className="mb-3">
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span>Limite Total</span>
                        <span className="font-semibold">R$ {creditLimit.toFixed(2)}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Gastos do Cartão</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Input placeholder="Categoria" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} />
                      <div className="flex gap-2 mt-2">
                        <Input type="number" placeholder="Valor" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} />
                        <Button onClick={() => addExpense('credit')} className="bg-purple-600 text-white"><PlusCircle /></Button>
                      </div>

                      <div className="mt-3 space-y-2">
                        {expenses.filter((e) => e.paymentMethod === 'credit').map((exp) => {
                          const Icon = iconMap[exp.iconType] || ShoppingCart;
                          return (
                            <div key={exp.id} className="flex items-center justify-between p-2 border rounded">
                              <div className="flex items-center gap-2"><Icon className="w-4 h-4" /><div>{exp.category}</div></div>
                              <div className="flex items-center gap-2">R$ {exp.amount.toFixed(2)} <Button onClick={() => removeExpense(exp.id)} variant="outline"><Trash2 /></Button></div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }

  if (currentScreen === 'investment-details') {
    return (
      <div className={`min-h-screen ${themes[theme]?.background || ''}`}>
        <div className="px-6 py-4 text-center shadow-sm" style={{ backgroundColor: theme === 'light' ? '#046BF4' : '#0F172A' }}>
          <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="absolute top-4 right-4 p-2 rounded-full bg-white">{theme === 'light' ? '🌙' : '☀️'}</button>
          <img src={logoDefinitiva} alt="BudgetPro" className="w-20 h-20 mx-auto" />
          <h1 className="text-white">BudgetPro</h1>
        </div>

        <div className="px-4 py-6">
          <Button onClick={() => setCurrentScreen('dashboard')} variant="outline"><ArrowLeft /> Voltar</Button>

          {selectedInvestment ? (
            <div className="space-y-4">
              <Card>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div style={{ backgroundColor: `${selectedInvestment.color}20` }} className="p-3 rounded-xl">
                      <selectedInvestment.icon className="w-8 h-8" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">{selectedInvestment.name}</h2>
                      <p className="text-gray-600">{selectedInvestment.type}</p>
                    </div>
                  </div>
                  <p className="mt-3">{selectedInvestment.description}</p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="py-6 text-center">Selecione um investimento.</div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
