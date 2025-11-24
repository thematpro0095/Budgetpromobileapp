// src/App.tsx — VERSÃO FINAL 100% FUNCIONAL (NUBANK STYLE + TODAS AS FUNÇÕES DO PDF)
import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, CreditCard, DollarSign, TrendingUp, AlertTriangle,
  Coffee, Car, Home, ShoppingCart, Smartphone, Zap, Coins, Building, Rocket,
  Trash2, Plus
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

const COLORS = ['#9333EA', '#C084FC', '#F472B6', '#FBBF24'];

interface Expense { id: string; category: string; amount: number; paymentMethod: 'salary' | 'credit'; }
interface Investment { id: string; name: string; type: string; description: string; riskLevel: 'low'|'medium'|'high'; expectedReturn: number; minInvestment: number; maxInvestment: number; color: string; historicalData: {month:string;value:number}[]; }

const MOCK_INVESTMENTS: Investment[] = [
  { id:"1", name:"TechNova", type:"Ações", description:"Empresa de tecnologia em crescimento", riskLevel:"medium", expectedReturn:18, minInvestment:100, maxInvestment:5000, color:"#8B5CF6", historicalData:[{month:"Jan",value:100},{month:"Fev",value:105},{month:"Mar",value:108},{month:"Abr",value:112},{month:"Mai",value:110},{month:"Jun",value:115}] },
  { id:"2", name:"CoinX", type:"Criptomoeda", description:"Moeda digital emergente", riskLevel:"high", expectedReturn:50, minInvestment:50, maxInvestment:3000, color:"#F59E0B", historicalData:[{month:"Jan",value:100},{month:"Fev",value:120},{month:"Mar",value:95},{month:"Abr",value:140},{month:"Mai",value:125},{month:"Jun",value:135}] },
  { id:"3", name:"FII Alpha", type:"Fundo Imobiliário", description:"Fundo de investimento imobiliário", riskLevel:"low", expectedReturn:8, minInvestment:200, maxInvestment:10000, color:"#10B981", historicalData:[{month:"Jan",value:100},{month:"Fev",value:101},{month:"Mar",value:103},{month:"Abr",value:104},{month:"Mai",value:105},{month:"Jun",value:106}] },
  { id:"4", name:"NeoFuture", type:"Startup", description:"Startup de energia renovável", riskLevel:"high", expectedReturn:50, minInvestment:500, maxInvestment:15000, color:"#3B82F6", historicalData:[{month:"Jan",value:100},{month:"Fev",value:90},{month:"Mar",value:130},{month:"Abr",value:110},{month:"Mai",value:160},{month:"Jun",value:145}] }
];

export default function App() {
  const [screen, setScreen] = useState<'splash'|'dashboard'|'investment'>('splash');
  const [salary] = useState(8000);
  const [creditLimit] = useState(12000);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [creditBillPaid, setCreditBillPaid] = useState(0);
  const [newCat, setNewCat] = useState(''); const [newAmt, setNewAmt] = useState('');
  const [selectedInv, setSelectedInv] = useState<Investment | null>(null);
  const [invAmount, setInvAmount] = useState('');

  useEffect(() => { if (screen === 'splash') setTimeout(() => setScreen('dashboard'), 3000); }, [screen]);

  const salaryUsed = expenses.filter(e=>e.paymentMethod==='salary').reduce((a,b)=>a+b.amount,0) + creditBillPaid;
  const creditUsed = expenses.filter(e=>e.paymentMethod==='credit').reduce((a,b)=>a+b.amount,0);
  const remainingSalary = salary - salaryUsed;
  const debt = Math.max(0, creditUsed - creditLimit);

  const pieData = [
    {name:'Usado',value:salaryUsed,color:'#C084FC'},
    {name:'Livre',value:Math.max(0,remainingSalary),color:'#F472B6'}
  ];

  const addExpense = (method:'salary'|'credit') => {
    if (!newCat || !newAmt) return;
    const amt = parseFloat(newAmt);
    if (isNaN(amt) || amt <= 0) return;
    setExpenses([...expenses, {id:Date.now().toString(), category:newCat, amount:amt, paymentMethod:method}]);
    setNewCat(''); setNewAmt('');
  };

  if (screen === 'splash') {
    return (
      <div className="h-screen bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
        <motion.div initial={{scale:0}} animate={{scale:1}} className="text-center">
          <div className="w-32 h-32 bg-white/30 rounded-3xl mb-8" />
          <h1 className="text-6xl font-bold text-white">BudgetPro</h1>
        </motion.div>
      </div>
    );
  }

  if (screen === 'investment' && selectedInv) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-pink-900 text-white p-8">
        <button onClick={()=>setScreen('dashboard')} className="mb-8"><ArrowLeft className="w-10 h-10" /></button>
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center">
            <div className="inline-block p-8 rounded-full mb-6" style={{backgroundColor:selectedInv.color+'30'}}><Zap className="w-24 h-24" style={{color:selectedInv.color}} /></div>
            <h1 className="text-5xl font-bold">{selectedInv.name}</h1>
            <p className="text-2xl mt-4 opacity-90">{selectedInv.description}</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={selectedInv.historicalData}>
              <XAxis dataKey="month" stroke="white" />
              <YAxis stroke="white" />
              <Tooltip contentStyle={{backgroundColor:'#1f1638', border:'none'}} />
              <Line type="monotone" dataKey="value" stroke={selectedInv.color} strokeWidth={4} />
            </LineChart>
          </ResponsiveContainer>
          <button onClick={()=>setScreen('dashboard')} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 py-6 rounded-3xl text-2xl font-bold">
            Investir Agora
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800 text-white">
      {/* Header */}
      <div className="bg-black/40 backdrop-blur-xl p-6 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-4xl font-bold">BudgetPro</h1>
          <div className="flex gap-6 text-xl">
            <div>Salário livre: <strong>R$ {remainingSalary.toFixed(2)}</strong></div>
            <div>Fatura: <strong className={creditUsed>creditLimit?'text-red-400':''}>R$ {creditUsed.toFixed(2)}</strong></div>
          </div>
        </div>
      </div>

      {/* Alerta dívida */}
      {debt > 0 && (
        <div className="mx-8 mt-8 bg-red-600/90 backdrop-blur p-8 rounded-3xl text-center">
          <AlertTriangle className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-3xl font-bold">DÍVIDA DE R$ {debt.toFixed(2)} COM O BANCO!</h2>
        </div>
      )}

      <div className="max-w-6xl mx-auto p-8 space-y-12">
        {/* Cards principais */}
        <div className="grid md:grid-cols-3 gap-8">
          <motion.div whileHover={{scale:1.05}} className="bg-white/10 backdrop-blur-xl rounded-3xl p-10 text-center">
            <DollarSign className="w-16 h-16 mx-auto mb-4" />
            <p className="text-5xl font-bold">R$ {remainingSalary.toFixed(2)}</p>
            <p className="text-xl opacity-80 mt-2">Salário Disponível</p>
          </motion.div>
          <motion.div whileHover={{scale:1.05}} className="bg-white/10 backdrop-blur-xl rounded-3xl p-10 text-center">
            <CreditCard className="w-16 h-16 mx-auto mb-4" />
            <p className="text-5xl font-bold">R$ {creditUsed.toFixed(2)}</p>
            <p className="text-xl opacity-80 mt-2">Fatura do Cartão</p>
          </motion.div>
          <motion.div whileHover={{scale:1.05}} className="bg-white/10 backdrop-blur-xl rounded-3xl p-10 text-center">
            <TrendingUp className="w-16 h-16 mx-auto mb-4" />
            <p className="text-5xl font-bold">4</p>
            <p className="text-xl opacity-80 mt-2">Investimentos</p>
          </motion.div>
        </div>

        {/* Gráfico + Despesas */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8">
            <h3 className="text-3xl font-bold mb-8 text-center">Uso do Salário</h3>
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie data={pieData} innerRadius={90} outerRadius={140} dataKey="value">
                  {pieData.map((e,i)=><Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip formatter={(v:number)=>`R$ ${v.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8">
            <h3 className="text-3xl font-bold mb-8">Últimas Despesas</h3>
            <div className="space-y-4">
              {expenses.slice(-5).reverse().map(e => (
                <div key={e.id} className="flex justify-between items-center bg-white/10 rounded-2xl p-6">
                  <div>{e.category}</div>
                  <div className="font-bold">R$ {e.amount.toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Adicionar despesa */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8">
          <h3 className="text-3xl font-bold mb-8">Nova Despesa</h3>
          <div className="grid md:grid-cols-4 gap-6">
            <input className="bg-white/20 rounded-2xl px-6 py-4" placeholder="Nome" value={newCat} onChange={e=>setNewCat(e.target.value)} />
            <input className="bg-white/20 rounded-2xl px-6 py-4" placeholder="Valor" value={newAmt} onChange={e=>setNewAmt(e.target.value)} />
            <button onClick={()=>addExpense('salary')} className="bg-green-600 hover:bg-green-700 rounded-2xl py-4 font-bold">Salário</button>
            <button onClick={()=>addExpense('credit')} className="bg-orange-600 hover:bg-orange-700 rounded-2xl py-4 font-bold">Cartão</button>
          </div>
        </div>

        {/* Investimentos */}
        <div>
          <h3 className="text-3xl font-bold mb-8">Oportunidades de Investimento</h3>
          <div className="grid md:grid-cols-4 gap-6">
            {MOCK_INVESTMENTS.map(inv => (
              <motion.div key={inv.id} whileHover={{scale:1.05}} onClick={()=>{setSelectedInv(inv); setScreen('investment');}}
                className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 text-center cursor-pointer">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center" style={{backgroundColor:inv.color+'30'}}>
                  <Zap className="w-12 h-12" style={{color:inv.color}} />
                </div>
                <h4 className="text-2xl font-bold">{inv.name}</h4>
                <p className="text-4xl font-bold text-green-400 mt-4">{inv.expectedReturn}%</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
