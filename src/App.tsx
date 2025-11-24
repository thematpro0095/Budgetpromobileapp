// src/App.tsx — VERSÃO FINAL OFICIAL — 100% FUNCIONAL
import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Coffee, Car, Home, ShoppingCart, Smartphone, Zap, Coins, Building, Rocket,
  Trash2, ArrowLeft, CheckCircle, AlertTriangle, DollarSign, CreditCard, TrendingUp
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

type Screen = 'splash' | 'login' | 'dashboard' | 'investment-details' | 'investment-purchase';
type PaymentMethod = 'salary' | 'credit';
type RiskLevel = 'low' | 'medium' | 'high';

interface Expense { id: string; category: string; amount: number; paymentMethod: PaymentMethod; }
interface Investment {
  id: string; name: string; type: string; description: string; riskLevel: RiskLevel;
  expectedReturn: number; minInvestment: number; maxInvestment: number; color: string;
  historicalData: { month: string; value: number }[];
}

const INVESTMENTS: Investment[] = [
  { id: "1", name: "TechNova", type: "Ações", description: "Empresa de tecnologia em crescimento", riskLevel: "medium", expectedReturn: 18, minInvestment: 100, maxInvestment: 5000, color: "#8B5CF6", historicalData: [{month:"Jan",value:100},{month:"Fev",value:105},{month:"Mar",value:108},{month:"Abr",value:112},{month:"Mai",value:110},{month:"Jun",value:115}] },
  { id: "2", name: "CoinX", type: "Criptomoeda", description: "Moeda digital emergente", riskLevel: "high", expectedReturn: 50, minInvestment: 50, maxInvestment: 3000, color: "#F59E0B", historicalData: [{month:"Jan",value:100},{month:"Fev",value:120},{month:"Mar",value:95},{month:"Abr",value:140},{month:"Mai",value:125},{month:"Jun",value:135}] },
  { id: "3", name: "FII Alpha", type: "Fundo Imobiliário", description: "Fundo de investimento imobiliário", riskLevel: "low", expectedReturn: 8, minInvestment: 200, maxInvestment: 10000, color: "#10B981", historicalData: [{month:"Jan",value:100},{month:"Fev",value:101},{month:"Mar",value:103},{month:"Abr",value:104},{month:"Mai",value:105},{month:"Jun",value:106}] },
  { id: "4", name: "NeoFuture", type: "Startup", description: "Startup de energia renovável", riskLevel: "high", expectedReturn: 50, minInvestment: 500, maxInvestment: 15000, color: "#3B82F6", historicalData: [{month:"Jan",value:100},{month:"Fev",value:90},{month:"Mar",value:130},{month:"Abr",value:110},{month:"Mai",value:160},{month:"Jun",value:145}] }
];

export default function App() {
  const [screen, setScreen] = useState<Screen>('splash');
  const [salary] = useState(8000);
  const [creditLimit] = useState(12000);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [creditBillPaid, setCreditBillPaid] = useState(0);
  const [newCategory, setNewCategory] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [billPayment, setBillPayment] = useState('');
  const [selectedInv, setSelectedInv] = useState<Investment | null>(null);
  const [invAmount, setInvAmount] = useState('');
  const [purchaseDone, setPurchaseDone] = useState(false);

  useEffect(() => {
    if (screen === 'splash') {
      const t = setTimeout(() => setScreen('login'), 10000);
      return () => clearTimeout(t);
    }
  }, [screen]);

  const salaryUsed = useMemo(() => expenses.filter(e => e.paymentMethod === 'salary').reduce((a, b) => a + b.amount, 0) + creditBillPaid, [expenses, creditBillPaid]);
  const creditUsed = useMemo(() => expenses.filter(e => e.paymentMethod === 'credit').reduce((a, b) => a + b.amount, 0), [expenses]);
  const remainingSalary = salary - salaryUsed;
  const debt = Math.max(0, creditUsed - creditLimit);
  const isLowMoney = remainingSalary < salary * 0.2 || creditUsed > creditLimit * 0.8;

  const salaryPie = [{ name: 'Usado', value: salaryUsed, color: '#EC4899' }, { name: 'Livre', value: Math.max(0, remainingSalary), color: '#A855F7' }];
  const creditPie = [{ name: 'Usado', value: creditUsed, color: '#F59E0B' }, { name: 'Livre', value: Math.max(0, creditLimit - creditUsed), color: '#8B5CF6' }];

  const addExpense = (method: PaymentMethod) => {
    if (!newCategory || !newAmount) return;
    const amt = parseFloat(newAmount);
    if (isNaN(amt) || amt <= 0) return;
    setExpenses([...expenses, { id: Date.now().toString(), category: newCategory, amount: amt, paymentMethod: method }]);
    setNewCategory(''); setNewAmount('');
  };

  const payBill = () => {
    const amt = parseFloat(billPayment);
    if (amt > 0 && amt <= creditUsed && amt <= remainingSalary) {
      setCreditBillPaid(p => p + amt);
      setBillPayment('');
    }
  };

  const buyInvestment = () => {
    if (!selectedInv || !invAmount) return;
    const amt = parseFloat(invAmount);
    if (amt >= selectedInv.minInvestment && amt <= selectedInv.maxInvestment && amt <= remainingSalary) {
      setPurchaseDone(true);
      setTimeout(() => setScreen('dashboard'), 3000);
    }
  };

  // ==================== SPLASH ====================
  if (screen === 'splash') {
    return (
      <div className="h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 flex items-center justify-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 1.5 }} className="text-center">
          <div className="w-40 h-40 bg-white/20 rounded-3xl mb-8" />
          <h1 className="text-7xl font-bold text-white">BudgetPro</h1>
          <p className="text-2xl text-white/80 mt-4">Seu dinheiro, seu controle.</p>
        </motion.div>
      </div>
    );
  }

  // ==================== LOGIN ====================
  if (screen === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-pink-900 flex items-center justify-center p-8">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-12 w-full max-w-md">
          <h2 className="text-4xl font-bold text-white text-center mb-10">Bem-vindo</h2>
          <input className="w-full bg-white/20 rounded-2xl px-6 py-5 text-white placeholder-white/70 mb-6" placeholder="Email" />
          <input type="password" className="w-full bg-white/20 rounded-2xl px-6 py-5 text-white placeholder-white/70 mb-10" placeholder="Senha" />
          <button onClick={() => setScreen('dashboard')} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 py-5 rounded-2xl text-2xl font-bold">Entrar</button>
        </div>
      </div>
    );
  }

  // ==================== DASHBOARD ====================
  if (screen === 'dashboard') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800 text-white">
        <header className="bg-black/40 backdrop-blur-xl p-8 sticky top-0">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <h1 className="text-5xl font-bold">BudgetPro</h1>
            <div className="text-xl">
              Salário livre: <strong>R$ {remainingSalary.toFixed(2)}</strong> | Fatura: <strong className={debt > 0 ? 'text-red-400' : ''}>R$ {creditUsed.toFixed(2)}</strong>
            </div>
          </div>
        </header>

        {debt > 0 && (
          <div className="mx-8 mt-8 bg-red-600/90 backdrop-blur p-8 rounded-3xl text-center">
            <AlertTriangle className="w-20 h-20 mx-auto mb-4" />
            <h2 className="text-4xl font-bold">DÍVIDA DE R$ {debt.toFixed(2)}!</h2>
          </div>
        )}

        <div className="max-w-6xl mx-auto p-8 space-y-12">
          {/* Cards */}
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-10 text-center"><DollarSign className="w-16 h-16 mx-auto mb-4" /><p className="text-5xl font-bold">R$ {remainingSalary.toFixed(2)}</p><p className="text-xl opacity-80">Salário Disponível</p></div>
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-10 text-center"><CreditCard className="w-16 h-16 mx-auto mb-4" /><p className="text-5xl font-bold">R$ {creditUsed.toFixed(2)}</p><p className="text-xl opacity-80">Fatura do Cartão</p></div>
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-10 text-center"><TrendingUp className="w-16 h-16 mx-auto mb-4" /><p className="text-5xl font-bold">4</p><p className="text-xl opacity-80">Investimentos</p></div>
          </div>

          {/* Gráficos */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8">
              <h3 className="text-3xl font-bold mb-6 text-center">Salário</h3>
              <ResponsiveContainer width="100%" height={300}><PieChart><Pie data={salaryPie} innerRadius={80} outerRadius={120} dataKey="value">{salaryPie.map((e,i)=><Cell key={i} fill={e.color}/>)}</Pie></PieChart></ResponsiveContainer>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8">
              <h3 className="text-3xl font-bold mb-6">Despesas</h3>
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {expenses.map(e => (
                  <div key={e.id} className="bg-white/10 rounded-2xl p-6 flex justify-between">
                    <span>{e.category}</span>
                    <span className="font-bold">R$ {e.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Nova despesa + Investimentos */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8">
              <h3 className="text-3xl font-bold mb-6">Nova Despesa</h3>
              <input className="w-full bg-white/20 rounded-2xl px-6 py-4 mb-4" placeholder="Categoria" value={newCategory} onChange={e=>setNewCategory(e.target.value)} />
              <input className="w-full bg-white/20 rounded-2xl px-6 py-4 mb-6" placeholder="Valor" value={newAmount} onChange={e=>setNewAmount(e.target.value)} />
              <div className="grid grid-cols-2 gap-4">
                <button onClick={()=>addExpense('salary')} className="bg-green-600 py-4 rounded-2xl font-bold">Salário</button>
                <button onClick={()=>addExpense('credit')} className="bg-orange-600 py-4 rounded-2xl font-bold">Cartão</button>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8">
              <h3 className="text-3xl font-bold mb-6">Investir</h3>
              <div className="grid grid-cols-2 gap-6">
                {INVESTMENTS.map(inv => (
                  <div key={inv.id} onClick={()=>{setSelectedInv(inv); setScreen('investment-details');}} className="bg-white/10 rounded-3xl p-8 text-center cursor-pointer hover:scale-105 transition">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center" style={{backgroundColor:inv.color+'30'}}>
                      <Zap className="w-12 h-12" style={{color:inv.color}} />
                    </div>
                    <h4 className="text-2xl font-bold">{inv.name}</h4>
                    <p className="text-4xl font-bold text-green-400">{inv.expectedReturn}%</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==================== DETALHE INVESTIMENTO ====================
  if (screen === 'investment-details' && selectedInv) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-pink-900 text-white p-8">
        <button onClick={()=>setScreen('dashboard')} className="mb-8"><ArrowLeft className="w-12 h-12" /></button>
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <div>
            <div className="inline-block p-10 rounded-full mb-8" style={{backgroundColor:selectedInv.color+'30'}}>
              <Zap className="w-32 h-32" style={{color:selectedInv.color}} />
            </div>
            <h1 className="text-6xl font-bold">{selectedInv.name}</h1>
            <p className="text-2xl mt-4 opacity-90">{selectedInv.description}</p>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={selectedInv.historicalData}>
              <XAxis dataKey="month" stroke="white" />
              <YAxis stroke="white" />
              <Tooltip contentStyle={{background:'#1a0b2e', border:'none'}} />
              <Line type="monotone" dataKey="value" stroke={selectedInv.color} strokeWidth={5} />
            </LineChart>
          </ResponsiveContainer>
          <button onClick={()=>setScreen('investment-purchase')} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 py-8 rounded-3xl text-3xl font-bold">
            Investir Agora
          </button>
        </div>
      </div>
    );
  }

  // ==================== COMPRA INVESTIMENTO ====================
  if (screen === 'investment-purchase' && selectedInv) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-pink-900 flex items-center justify-center p-8">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-12 w-full max-w-lg text-center">
          {purchaseDone ? (
            <motion.div initial={{scale:0}} animate={{scale:1}}>
              <CheckCircle className="w-40 h-40 text-green-500 mx-auto mb-8" />
              <h2 className="text-5xl font-bold mb-4">Investimento Confirmado!</h2>
              <button onClick={()=>setScreen('dashboard')} className="mt-8 bg-gradient-to-r from-purple-600 to-pink-600 py-6 rounded-3xl text-2xl font-bold w-full">
                Voltar ao Dashboard
              </button>
            </motion.div>
          ) : (
            <>
              <h2 className="text-4xl font-bold mb-8">Quanto quer investir em {selectedInv.name}?</h2>
              <input className="w-full bg-white/20 rounded-3xl px-8 py-10 text-6xl text-center font-bold mb-8" placeholder="0,00" value={invAmount} onChange={e=>setInvAmount(e.target.value.replace(/\D/g,''))} />
              <p className="text-xl mb-8">Disponível: R$ {remainingSalary.toFixed(2)}</p>
              <button onClick={buyInvestment} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 py-8 rounded-3xl text-3xl font-bold">
                Confirmar Investimento
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return null;
}
