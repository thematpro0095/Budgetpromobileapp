import React, { useState, useEffect, useMemo } from 'react';
import { themes } from "./theme";
import { motion } from 'motion/react';
import { Input } from './components/ui/input';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Label } from './components/ui/label';
import { Alert, AlertDescription } from './components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Progress } from './components/ui/progress';
import { 
  PlusCircle, Trash2, DollarSign, ShoppingCart, Car, Coffee, Home, Smartphone,
  Mail, Lock, User, Calendar, FileText, CreditCard, TrendingUp, TrendingDown,
  Brain, AlertTriangle, ArrowUpRight, ArrowDownRight, BarChart3, PieChart as PieChartIcon,
  ArrowLeft, CheckCircle, XCircle, Building, Zap, Coins, Rocket
} from 'lucide-react';
import { 
  PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from 'recharts';

const logoDefinitiva = "/logo.png";

type Screen = 'splash' | 'login' | 'signup' | 'forgot-password' | 'reset-password' | 
  'dashboard' | 'investment-details' | 'investment-purchase' | 'investment-result';

type IconType = 'coffee' | 'car' | 'home' | 'shopping' | 'smartphone';
type RiskLevel = 'low' | 'medium' | 'high';
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
  status: 'available' | 'purchased' | 'completed';
  purchaseAmount?: number;
  purchaseDate?: Date;
  currentValue?: number;
  profitLoss?: number;
}

const iconMap: Record<IconType, any> = {
  coffee: Coffee,
  car: Car,
  home: Home,
  shopping: ShoppingCart,
  smartphone: Smartphone,
};

const MOCK_INVESTMENTS: Investment[] = [
  {
    id: "tech-nova",
    name: "TechNova",
    type: "Ações",
    description: "Empresa de tecnologia em crescimento",
    riskLevel: "medium",
    expectedReturn: 18,
    minInvestment: 100,
    maxInvestment: 5000,
    icon: Zap,
    color: "#8B5CF6",
    historicalData: [
      { month: "Jan", value: 100 },
      { month: "Fev", value: 105 },
      { month: "Mar", value: 108 },
      { month: "Abr", value: 112 },
      { month: "Mai", value: 110 },
      { month: "Jun", value: 115 },
    ],
    status: "available"
  },
  {
    id: "coin-x",
    name: "CoinX",
    type: "Criptomoeda",
    description: "Moeda digital emergente",
    riskLevel: "high",
    expectedReturn: 50,
    minInvestment: 50,
    maxInvestment: 3000,
    icon: Coins,
    color: "#F59E0B",
    historicalData: [
      { month: "Jan", value: 100 },
      { month: "Fev", value: 120 },
      { month: "Mar", value: 95 },
      { month: "Abr", value: 140 },
      { month: "Mai", value: 125 },
      { month: "Jun", value: 135 },
    ],
    status: "available"
  },
  {
    id: "fii-alpha",
    name: "FII Alpha",
    type: "Fundo Imobiliário",
    description: "Fundo de investimento imobiliário",
    riskLevel: "low",
    expectedReturn: 8,
    minInvestment: 200,
    maxInvestment: 10000,
    icon: Building,
    color: "#10B981",
    historicalData: [
      { month: "Jan", value: 100 },
      { month: "Fev", value: 101 },
      { month: "Mar", value: 103 },
      { month: "Abr", value: 104 },
      { month: "Mai", value: 105 },
      { month: "Jun", value: 106 },
    ],
    status: "available"
  },
  {
    id: "neo-future",
    name: "NeoFuture",
    type: "Startup",
    description: "Startup de energia renovável",
    riskLevel: "high",
    expectedReturn: 50,
    minInvestment: 500,
    maxInvestment: 15000,
    icon: Rocket,
    color: "#3B82F6",
    historicalData: [
      { month: "Jan", value: 100 },
      { month: "Fev", value: 90 },
      { month: "Mar", value: 130 },
      { month: "Abr", value: 110 },
      { month: "Mai", value: 160 },
      { month: "Jun", value: 145 },
    ],
    status: "available"
  }
];

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [salary, setSalary] = useState(5000);
  const [creditLimit, setCreditLimit] = useState(8000);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [creditBillAmount, setCreditBillAmount] = useState(0);
  const [newCategory, setNewCategory] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [billPaymentAmount, setBillPaymentAmount] = useState('');
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [investments, setInvestments] = useState(MOCK_INVESTMENTS);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    if (currentScreen === 'splash') {
      const timer = setTimeout(() => setCurrentScreen('login'), 3000);
      return () => clearTimeout(timer);
    }
  }, [currentScreen]);

  const salaryExpenses = useMemo(() => 
    expenses.filter(e => e.paymentMethod === 'salary').reduce((a, b) => a + b.amount, 0), [expenses]
  );

  const creditExpenses = useMemo(() => 
    expenses.filter(e => e.paymentMethod === 'credit').reduce((a, b) => a + b.amount, 0), [expenses]
  );

  const remainingSalary = salary - salaryExpenses - creditBillAmount;
  const availableCredit = creditLimit - creditExpenses;
  const isLowMoney = remainingSalary < salary * 0.2 || creditExpenses > creditLimit * 0.8;

  const pieData = [
    { name: 'Salário Usado', value: salaryExpenses + creditBillAmount, color: '#EF4444' },
    { name: 'Salário Livre', value: Math.max(0, remainingSalary), color: '#10B981' },
  ];

  const creditPieData = [
    { name: 'Crédito Usado', value: creditExpenses, color: '#F59E0B' },
    { name: 'Crédito Livre', value: Math.max(0, availableCredit), color: '#3B82F6' },
  ];

  const addExpense = (method: PaymentMethod) => {
    if (!newCategory || !newAmount) return;
    const amount = parseFloat(newAmount);
    if (isNaN(amount)) return;

    const icons: IconType[] = ['coffee', 'shopping', 'car', 'home', 'smartphone'];
    const randomIcon = icons[Math.floor(Math.random() * icons.length)];

    setExpenses([...expenses, {
      id: Date.now().toString(),
      category: newCategory,
      amount,
      iconType: randomIcon,
      paymentMethod: method
    }]);

    setNewCategory('');
    setNewAmount('');
  };

  const payBillWithSalary = () => {
    const amount = parseFloat(billPaymentAmount);
    if (isNaN(amount) || amount <= 0 || amount > creditExpenses) return;
    setCreditBillAmount(prev => prev + amount);
    setBillPaymentAmount('');
  };

  if (currentScreen === 'splash') {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <img src={logoDefinitiva} alt="BudgetPro" className="w-32 h-32" />
          <h1 className="text-white text-4xl font-bold mt-4 text-center">BudgetPro</h1>
        </motion.div>
      </div>
    );
  }

  if (currentScreen === 'login') {
    return (
      <div className={`min-h-screen ${themes[theme].background} flex items-center justify-center p-4`}>
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Bem-vindo de volta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Senha</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button className="w-full bg-[#046BF4]" onClick={() => setCurrentScreen('dashboard')}>
              Entrar
            </Button>
            <div className="text-center text-sm">
              <button onClick={() => setCurrentScreen('forgot-password')} className="text-blue-600">
                Esqueceu a senha?
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentScreen === 'dashboard') {
    return (
      <div className={`min-h-screen ${themes[theme].background}`}>
        <div className="bg-[#046BF4] p-4 flex justify-between items-center text-white">
          <div className="flex items-center gap-3">
            <img src={logoDefinitiva} alt="Logo" className="w-12 h-12" />
            <h1 className="text-2xl font-bold">BudgetPro</h1>
          </div>
          <button onClick={() => setTheme(t => t === "light" ? "dark" : "light")} className="bg-white/20 px-4 py-2 rounded-lg">
            {theme === "light" ? "Dark Mode" : "Light Mode"}
          </button>
        </div>

        {isLowMoney && (
          <Alert className="m-4 border-red-500 bg-red-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>ATENÇÃO:</strong> Você está com pouco dinheiro no salário ou muito perto do limite do cartão!
            </AlertDescription>
          </Alert>
        )}

        <div className="p-4">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid grid-cols-4 w-full mb-6">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="boards">Pranchetas</TabsTrigger>
              <TabsTrigger value="payment">Pagar Fatura</TabsTrigger>
              <TabsTrigger value="investments">Investimentos</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Salário Restante</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">
                      R$ {remainingSalary.toFixed(2)}
                    </div>
                    <Progress value={(remainingSalary / salary) * 100} className="mt-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Fatura do Cartão</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-red-600">
                      R$ {creditExpenses.toFixed(2)}
                    </div>
                    <Progress value={(creditExpenses / creditLimit) * 100} className="mt-2" />
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <Card>
                  <CardContent className="pt-6">
                    <ResponsiveContainer width="100%" height={200}>
                      <RechartsPieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value">
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                    <p className="text-center mt-2 font-semibold">Uso do Salário</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <ResponsiveContainer width="100%" height={200}>
                      <RechartsPieChart>
                        <Pie data={creditPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value">
                          {creditPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                    <p className="text-center mt-2 font-semibold">Uso do Crédito</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="boards">
              <div className="grid grid-cols-2 gap-4">
                {expenses.map(exp => {
                  const Icon = iconMap[exp.iconType];
                  return (
                    <Card key={exp.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-100 rounded-full">
                              <Icon className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-semibold">{exp.category}</p>
                              <p className="text-sm text-gray-600">
                                {exp.paymentMethod === 'salary' ? 'Salário' : 'Cartão'}
                              </p>
                            </div>
                          </div>
                          <p className="text-xl font-bold">R$ {exp.amount.toFixed(2)}</p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Adicionar Despesa</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input placeholder="Nome da categoria" value={newCategory} onChange={e => setNewCategory(e.target.value)} />
                  <Input placeholder="Valor" value={newAmount} onChange={e => setNewAmount(e.target.value)} />
                  <div className="grid grid-cols-2 gap-3">
                    <Button onClick={() => addExpense('salary')} className="bg-green-600">Pagar com Salário</Button>
                    <Button onClick={() => addExpense('credit')} className="bg-orange-600">Pagar com Cartão</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payment">
              <Card>
                <CardHeader>
                  <CardTitle>Pagar Fatura com Salário</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-red-600">R$ {creditExpenses.toFixed(2)}</p>
                    <p className="text-gray-600">Total da fatura atual</p>
                  </div>
                  <Input 
                    placeholder="Quanto quer pagar?" 
                    value={billPaymentAmount}
                    onChange={e => setBillPaymentAmount(e.target.value)}
                  />
                  <Button onClick={payBillWithSalary} className="w-full bg-[#046BF4]">
                    Pagar com Salário Disponível (R$ {remainingSalary.toFixed(2)})
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="investments">
              <div className="space-y-4">
                {investments.map(inv => (
                  <Card key={inv.id} className="cursor-pointer" onClick={() => {
                    setSelectedInvestment(inv);
                    setCurrentScreen('investment-details');
                  }}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-full" style={{ backgroundColor: inv.color + '20' }}>
                            <inv.icon className="w-8 h-8" style={{ color: inv.color }} />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">{inv.name}</h3>
                            <p className="text-sm text-gray-600">{inv.type} • Retorno esperado: {inv.expectedReturn}% a.a.</p>
                          </div>
                        </div>
                        <ArrowUpRight className="w-6 h-6 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }

  // Tela de detalhes do investimento
  if (currentScreen === 'investment-details' && selectedInvestment) {
    return (
      <div className={`min-h-screen ${themes[theme].background} p-4`}>
        <button onClick={() => setCurrentScreen('dashboard')} className="mb-4">
          <ArrowLeft className="w-8 h-8" />
        </button>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="p-6 rounded-full inline-block mb-4" style={{ backgroundColor: selectedInvestment.color + '20' }}>
                <selectedInvestment.icon className="w-16 h-16" style={{ color: selectedInvestment.color }} />
              </div>
              <h1 className="text-3xl font-bold">{selectedInvestment.name}</h1>
              <p className="text-gray-600 mt-2">{selectedInvestment.description}</p>
              <div className="flex justify-center gap-6 mt-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Retorno Esperado</p>
                  <p className="text-2xl font-bold text-green-600">{selectedInvestment.expectedReturn}% a.a.</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Risco</p>
                  <p className="text-2xl font-bold">{selectedInvestment.riskLevel === 'high' ? 'Alto' : selectedInvestment.riskLevel === 'medium' ? 'Médio' : 'Baixo'}</p>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-bold mb-4">Histórico de Valorização</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={selectedInvestment.historicalData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke={selectedInvestment.color} strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <Button onClick={() => setCurrentScreen('investment-purchase')} className="w-full mt-8 text-lg py-6 bg-[#046BF4]">
              Investir Agora
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <div>Tela não encontrada</div>;
}
