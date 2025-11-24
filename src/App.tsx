import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { themes } from "./theme";
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
  ArrowLeft, CheckCircle, XCircle, Building2, Zap, Coins, Rocket
} from 'lucide-react';
import { 
  PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip 
} from 'recharts';

const logoDefinitiva = "/logo.png";

type Screen = 'splash' | 'login' | 'signup' | 'forgot-password' | 'reset-password' | 
  'dashboard' | 'investment-details' | 'investment-purchase' | 'investment-result';

type IconType = 'coffee' | 'car' | 'home' | 'shopping' | 'smartphone';
type RiskLevel = 'low' | 'medium' | 'high';
type PaymentMethod = 'salary' | 'credit';
type InvestmentStatus = 'available' | 'purchased' | 'completed';

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
}

const iconMap: Record<IconType, any> = {
  coffee: Coffee,
  car: Car,
  home: Home,
  shopping: ShoppingCart,
  smartphone: Smartphone,
};

const MOCK_INVESTMENTS: Investment[] = [
  { id: "tech-nova", name: "TechNova", type: "Ações", description: "Empresa de tecnologia em crescimento", riskLevel: "medium", expectedReturn: 18, minInvestment: 100, maxInvestment: 5000, icon: Zap, color: "#8B5CF6", historicalData: [{month:"Jan",value:100},{month:"Fev",value:105},{month:"Mar",value:108},{month:"Abr",value:112},{month:"Mai",value:110},{month:"Jun",value:115}], status: "available" },
  { id: "coin-x", name: "CoinX", type: "Criptomoeda", description: "Moeda digital emergente", riskLevel: "high", expectedReturn: 50, minInvestment: 50, maxInvestment: 3000, icon: Coins, color: "#F59E0B", historicalData: [{month:"Jan",value:100},{month:"Fev",value:120},{month:"Mar",value:95},{month:"Abr",value:140},{month:"Mai",value:125},{month:"Jun",value:135}], status: "available" },
  { id: "fii-alpha", name: "FII Alpha", type: "Fundo Imobiliário", description: "Fundo de investimento imobiliário", riskLevel: "low", expectedReturn: 8, minInvestment: 200, maxInvestment: 10000, icon: Building2, color: "#10B981", historicalData: [{month:"Jan",value:100},{month:"Fev",value:101},{month:"Mar",value:103},{month:"Abr",value:104},{month:"Mai",value:105},{month:"Jun",value:106}], status: "available" },
  { id: "neo-future", name: "NeoFuture", type: "Startup", description: "Startup de energia renovável", riskLevel: "high", expectedReturn: 50, minInvestment: 500, maxInvestment: 15000, icon: Rocket, color: "#3B82F6", historicalData: [{month:"Jan",value:100},{month:"Fev",value:90},{month:"Mar",value:130},{month:"Abr",value:110},{month:"Mai",value:160},{month:"Jun",value:145}], status: "available" }
];

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [name, setName] = useState(''); const [salary, setSalary] = useState(8000);
  const [creditLimit, setCreditLimit] = useState(12000);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [creditBillAmount, setCreditBillAmount] = useState(0);
  const [newCategory, setNewCategory] = useState(''); const [newAmount, setNewAmount] = useState('');
  const [billPaymentAmount, setBillPaymentAmount] = useState('');
  const [investments, setInvestments] = useState(MOCK_INVESTMENTS);
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [purchaseConfirmed, setPurchaseConfirmed] = useState(false);
  const [showInvestmentResult, setShowInvestmentResult] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    if (currentScreen === 'splash') {
      const t = setTimeout(() => setCurrentScreen('login'), 10000);
      return () => clearTimeout(t);
    }
  }, [currentScreen]);

  const salaryExpenses = useMemo(() => expenses.filter(e => e.paymentMethod === 'salary').reduce((s, e) => s + e.amount, 0), [expenses]);
  const creditExpenses = useMemo(() => expenses.filter(e => e.paymentMethod === 'credit').reduce((s, e) => s + e.amount, 0), [expenses]);

  const currentSalaryUsed = salaryExpenses + creditBillAmount;
  const remainingSalary = salary - currentSalaryUsed;
  const availableCredit = creditLimit - creditExpenses;
  const currentDebt = Math.max(0, creditExpenses - creditLimit);
  const isLowMoney = remainingSalary < salary * 0.2 || creditExpenses > creditLimit * 0.8;

  const salaryPieData = [
    { name: 'Usado', value: currentSalaryUsed, color: '#EF4444' },
    { name: 'Livre', value: Math.max(0, remainingSalary), color: '#10B981' }
  ];
  const creditPieData = [
    { name: 'Usado', value: creditExpenses, color: '#F59E0B' },
    { name: 'Livre', value: Math.max(0, availableCredit), color: '#3B82F6' }
  ];

  const addExpense = (method: PaymentMethod) => {
    if (!newCategory || !newAmount) return;
    const amount = parseFloat(newAmount);
    if (isNaN(amount) || amount <= 0) return;
    const icons: IconType[] = ['coffee','car','home','shopping','smartphone'];
    setExpenses(prev => [...prev, { id: Date.now().toString(), category: newCategory, amount, iconType: icons[Math.floor(Math.random()*5)], paymentMethod: method }]);
    setNewCategory(''); setNewAmount('');
  };

  const deleteExpense = (id: string) => setExpenses(prev => prev.filter(e => e.id !== id));

  const payBillWithSalary = () => {
    const amt = parseFloat(billPaymentAmount);
    if (isNaN(amt) || amt <= 0 || amt > creditExpenses || amt > remainingSalary) return;
    setCreditBillAmount(prev => prev + amt);
    setBillPaymentAmount('');
  };

  const confirmInvestment = () => {
    if (!selectedInvestment || !investmentAmount) return;
    const amt = parseFloat(investmentAmount);
    if (amt < selectedInvestment.minInvestment || amt > selectedInvestment.maxInvestment || amt > remainingSalary) return;
    setInvestments(prev => prev.map(i => i.id === selectedInvestment.id ? { ...i, status: 'purchased' as const, purchaseAmount: amt, purchaseDate: new Date() } : i));
    setPurchaseConfirmed(true);
    setTimeout(() => setShowInvestmentResult(true), 2500);
  };

  /* ==================== SPLASH ==================== */
  if (currentScreen === 'splash') {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 1.5 }} className="text-center">
          <img src={logoDefinitiva} alt="BudgetPro" className="w-40 h-40 mx-auto mb-6 rounded-3xl shadow-2xl" />
          <h1 className="text-6xl font-bold text-white">BudgetPro</h1>
          <p className="text-xl text-white/80 mt-4">Seu dinheiro, seu controle.</p>
        </motion.div>
      </div>
    );
  }

  /* ==================== LOGIN ==================== */
  if (currentScreen === 'login') {
    return (
      <div className={`min-h-screen ${themes[theme].background} flex items-center justify-center p-6`}>
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="text-center"><img src={logoDefinitiva} className="w-20 h-20 mx-auto mb-4" /><CardTitle className="text-3xl">Bem-vindo</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <Input type="email" placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} />
            <Input type="password" placeholder="senha" value={password} onChange={e=>setPassword(e.target.value)} />
            <Button className="w-full h-12 bg-[#046BF4]" onClick={()=>setCurrentScreen('dashboard')}>Entrar</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ==================== DASHBOARD ==================== */
  if (currentScreen === 'dashboard') {
    return (
      <div className={`min-h-screen ${themes[theme].background}`}>
        <div className="bg-[#046BF4] text-white p-6 pb-10">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4"><img src={logoDefinitiva} className="w-14 h-14" /><h1 className="text-3xl font-bold">BudgetPro</h1></div>
            <button onClick={()=>setTheme(t=>t==="light"?"dark":"light")} className="bg-white/20 px-5 py-3 rounded-xl">Dark Mode</button>
          </div>
        </div>

        {currentDebt > 0 && <Alert className="mx-4 mt-4 border-red-600 bg-red-50"><AlertTriangle className="text-red-600" /><AlertDescription className="text-red-800 font-bold">DÍVIDA: R$ {currentDebt.toFixed(2)}</AlertDescription></Alert>}
        {isLowMoney && currentDebt === 0 && <Alert className="mx-4 mt-4 border-orange-500 bg-orange-50"><Brain className="text-orange-600" /><AlertDescription className="text-orange-800">Cuidado com os gastos!</AlertDescription></Alert>}

        <div className="px-4 -mt-6">
          <Tabs defaultValue="overview">
            <TabsList className="grid grid-cols-4 w-full h-14 text-lg font-semibold bg-white/90 backdrop-blur shadow-lg">
              <TabsTrigger value="overview">Visão</TabsTrigger>
              <TabsTrigger value="boards">Pranchetas</TabsTrigger>
              <TabsTrigger value="payment">Pagar</TabsTrigger>
              <TabsTrigger value="investments">Investir</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <Card className="shadow-xl"><CardHeader><CardTitle className="text-xl">Salário Restante</CardTitle></CardHeader><CardContent><p className="text-4xl font-bold text-green-600">R$ {remainingSalary.toFixed(2)}</p><Progress value={(remainingSalary/salary)*100||0} className="mt-4 h-4"/></CardContent></Card>
                <Card className="shadow-xl"><CardHeader><CardTitle className="text-xl">Fatura Cartão</CardTitle></CardHeader><CardContent><p className="text-4xl font-bold text-red-600">R$ {creditExpenses.toFixed(2)}</p><Progress value={(creditExpenses/creditLimit)*100||0} className="mt-4 h-4"/></CardContent></Card>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <Card className="shadow-xl"><CardContent className="pt-8"><p className="text-center font-bold mb-4">Salário</p><ResponsiveContainer width="100%" height={220}><RechartsPieChart><Pie data={salaryPieData} innerRadius={60} outerRadius={90} dataKey="value">{salaryPieData.map((e,i)=><Cell key={i} fill={e.color}/>)}</Pie><Tooltip formatter={(v:number)=>`R$ ${v.toFixed(2)}`}/></RechartsPieChart></ResponsiveContainer></CardContent></Card>
                <Card className="shadow-xl"><CardContent className="pt-8"><p className="text-center font-bold mb-4">Crédito</p><ResponsiveContainer width="100%" height={220}><RechartsPieChart><Pie data={creditPieData} innerRadius={60} outerRadius={90} dataKey="value">{creditPieData.map((e,i)=><Cell key={i} fill={e.color}/>)}</Pie><Tooltip formatter={(v:number)=>`R$ ${v.toFixed(2)}`}/></RechartsPieChart></ResponsiveContainer></CardContent></Card>
              </div>
            </TabsContent>

            <TabsContent value="boards" className="mt-6">
              <div className="grid grid-cols-2 gap-4">
                {expenses.map(exp => {
                  const Icon = iconMap[exp.iconType];
                  return (
                    <Card key={exp.id} className="relative shadow-lg">
                      <button onClick={()=>deleteExpense(exp.id)} className="absolute top-2 right-2 text-red-500 bg-white rounded-full p-1"><Trash2 className="w-5 h-5"/></button>
                      <CardContent className="pt-10 text-center">
                        <div className="p-4 bg-blue-100 rounded-full w-20 h-20 mx-auto mb-4"><Icon className="w-12 h-12 text-blue-600 mx-auto"/></div>
                        <p className="font-bold text-lg">{exp.category}</p>
                        <p className="text-2xl font-bold">R$ {exp.amount.toFixed(2)}</p>
                        <p className="text-sm text-gray-500">{exp.paymentMethod === 'salary' ? 'Salário' : 'Cartão'}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              <Card className="mt-8 shadow-xl">
                <CardHeader><CardTitle>Nova Despesa</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  <Input placeholder="Categoria" value={newCategory} onChange={e=>setNewCategory(e.target.value)}/>
                  <Input placeholder="Valor" value={newAmount} onChange={e=>setNewAmount(e.target.value)}/>
                  <div className="grid grid-cols-2 gap-4">
                    <Button onClick={()=>addExpense('salary')} className="h-14 bg-green-600">Salário</Button>
                    <Button onClick={()=>addExpense('credit')} className="h-14 bg-orange-600">Cartão</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payment" className="mt-6">
              <Card className="shadow-2xl">
                <CardHeader className="text-center"><CardTitle className="text-4xl">Pagar Fatura</CardTitle><p className="text-5xl font-bold text-red-600 mt-4">R$ {creditExpenses.toFixed(2)}</p></CardHeader>
                <CardContent className="space-y-6">
                  <Input className="text-2xl text-center h-16" placeholder="Quanto pagar?" value={billPaymentAmount} onChange={e=>setBillPaymentAmount(e.target.value)}/>
                  <p className="text-center text-lg">Salário disponível: <strong>R$ {remainingSalary.toFixed(2)}</strong></p>
                  <Button onClick={payBillWithSalary} className="w-full h-16 text-2xl bg-[#046BF4]">Pagar com Salário</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="investments" className="mt-6 space-y-6">
              {investments.filter(i=>i.status==="available").map(inv => (
                <Card key={inv.id} className="shadow-xl cursor-pointer hover:shadow-2xl transition" onClick={()=>{setSelectedInvestment(inv); setCurrentScreen('investment-details');}}>
                  <CardContent className="p-6 flex justify-between items-center">
                    <div className="flex items-center gap-5">
                      <div className="p-4 rounded-full" style={{backgroundColor:inv.color+'20'}}><inv.icon className="w-12 h-12" style={{color:inv.color}}/></div>
                      <div>
                        <h3 className="text-2xl font-bold">{inv.name}</h3>
                        <p className="text-lg text-gray-600">{inv.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-green-600">{inv.expectedReturn}%</p>
                      <p className="text-sm">a.a.</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }

  /* ==================== DETALHE INVESTIMENTO ==================== */
  if (currentScreen === 'investment-details' && selectedInvestment) {
    return (
      <div className={`min-h-screen ${themes[theme].background} p-6`}>
        <button onClick={()=>setCurrentScreen('dashboard')} className="mb-6"><ArrowLeft className="w-10 h-10"/></button>
        <Card className="shadow-2xl">
          <CardContent className="pt-10 text-center">
            <div className="inline-block p-8 rounded-full mb-6" style={{backgroundColor:selectedInvestment.color+'20'}}><selectedInvestment.icon className="w-24 h-24" style={{color:selectedInvestment.color}}/></div>
            <h1 className="text-4xl font-bold mb-4">{selectedInvestment.name}</h1>
            <p className="text-xl text-gray-600 mb-8">{selectedInvestment.description}</p>
            <div className="grid grid-cols-2 gap-8 mb-10">
              <div><p className="text-gray-500">Retorno</p><p className="text-5xl font-bold text-green-600">{selectedInvestment.expectedReturn}% a.a.</p></div>
              <div><p className="text-gray-500">Risco</p><p className="text-5xl font-bold">{selectedInvestment.riskLevel === 'high' ? 'Alto' : selectedInvestment.riskLevel === 'medium' ? 'Médio' : 'Baixo'}</p></div>
            </div>
            <h3 className="text-2xl font-bold mb-6">Histórico</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={selectedInvestment.historicalData}>
                <CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="month"/><YAxis/><Tooltip/>
                <Line type="monotone" dataKey="value" stroke={selectedInvestment.color} strokeWidth={4}/>
              </LineChart>
            </ResponsiveContainer>
            <Button onClick={()=>setCurrentScreen('investment-purchase')} className="w-full mt-10 h-16 text-2xl bg-[#046BF4]">Investir Agora</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ==================== COMPRA INVESTIMENTO ==================== */
  if (currentScreen === 'investment-purchase' && selectedInvestment) {
    return (
      <div className={`min-h-screen ${themes[theme].background} p-6 flex items-center justify-center`}>
        <Card className="w-full max-w-lg shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Investir em {selectedInvestment.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {!purchaseConfirmed ? (
              <>
                <div className="text-center">
                  <p className="text-5xl font-bold text-green-600">R$ {parseFloat(investmentAmount || '0').toFixed(2)}</p>
                </div>
                <Input className="text-4xl text-center h-20" placeholder="0,00" value={investmentAmount} onChange={e=>setInvestmentAmount(e.target.value.replace(/\D/g,''))}/>
                <div className="text-center text-sm text-gray-600">
                  Mínimo: R$ {selectedInvestment.minInvestment} | Máximo: R$ {selectedInvestment.maxInvestment}<br/>
                  Disponível no salário: R$ {remainingSalary.toFixed(2)}
                </div>
                <Button onClick={confirmInvestment} className="w-full h-16 text-2xl bg-[#046BF4]" disabled={!investmentAmount || parseFloat(investmentAmount) < selectedInvestment.minInvestment || parseFloat(investmentAmount) > remainingSalary}>
                  Confirmar Investimento
                </Button>
              </>
            ) : (
              <div className="text-center py-10">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.8 }}>
                  <CheckCircle className="w-32 h-32 text-green-600 mx-auto mb-6"/>
                </motion.div>
                <h2 className="text-3xl font-bold mb-4">Investimento Confirmado!</h2>
                <p className="text-xl">R$ {parseFloat(investmentAmount).toFixed(2)} aplicados em {selectedInvestment.name}</p>
                <Button onClick={()=>setCurrentScreen('dashboard')} className="mt-10">Voltar ao Dashboard</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
