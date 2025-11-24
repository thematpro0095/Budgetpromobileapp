import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard, DollarSign, TrendingUp, AlertTriangle, ArrowLeft, 
  Coffee, Car, Home, ShoppingCart, Smartphone, Zap, Coins, Building, Rocket,
  Trash2, Plus
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

const COLORS = ['#820AD1', '#A855F7', '#D946EF', '#EC4899'];

export default function App() {
  const [screen, setScreen] = useState<'splash' | 'login' | 'dashboard' | 'investment'>('splash');
  const [salary, setSalary] = useState(8000);
  const [creditLimit] = useState(12000);
  const [expenses, setExpenses] = useState([
    { id: 1, name: "Netflix", value: 59.90, type: "salary", icon: "tv" },
    { id: 2, name: "Uber", value: 87.50, type: "credit", icon: "car" },
    { id: 3, name: "iFood", value: 156.30, type: "credit", icon: "coffee" },
    { id: 4, name: "Aluguel", value: 2200, type: "salary", icon: "home" },
  ]);
  const [paidBill, setPaidBill] = useState(0);
  const [newExpenseName, setNewExpenseName] = useState('');
  const [newExpenseValue, setNewExpenseValue] = useState('');
  const [newExpenseType, setNewExpenseType] = useState<'salary' | 'credit'>('credit');

  useEffect(() => {
    if (screen === 'splash') {
      const t = setTimeout(() => setScreen('dashboard'), 3000);
      return () => clearTimeout(t);
    }
  }, [screen]);

  const salaryUsed = expenses.filter(e => e.type === 'salary').reduce((a, b) => a + b.value, 0) + paidBill;
  const creditUsed = expenses.filter(e => e.type === 'credit').reduce((a, b) => a + b.value, 0);
  const remainingSalary = salary - salaryUsed;
  const debt = Math.max(0, creditUsed - creditLimit);

  const pieData = [
    { name: 'Usado', value: salaryUsed, color: '#A855F7' },
    { name: 'Livre', value: Math.max(0, remainingSalary), color: '#E879F9' },
  ];

  const addExpense = () => {
    if (!newExpenseName || !newExpenseValue) return;
    const value = parseFloat(newExpenseValue.replace(',', '.'));
    if (isNaN(value)) return;

    setExpenses([...expenses, {
      id: Date.now(),
      name: newExpenseName,
      value,
      type: newExpenseType,
      icon: newExpenseType === 'credit' ? 'credit' : 'salary'
    }]);
    setNewExpenseName('');
    setNewExpenseValue('');
  };

  if (screen === 'splash') {
    return (
      <div className="h-screen bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 1 }}>
          <div className="text-white text-center">
            <div className="w-32 h-32 bg-white/20 rounded-3xl mx-auto mb-8" />
            <h1 className="text-6xl font-bold">BudgetPro</h1>
            <p className="text-2xl mt-4 opacity-90">Seu dinheiro, sem drama.</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800 text-white">
        {/* Header Nubank Style */}
        <div className="bg-black/30 backdrop-blur-lg p-6 sticky top-0 z-10">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <h1 className="text-3xl font-bold">BudgetPro</h1>
            <div className="flex gap-4">
              <div className="bg-white/10 px-6 py-3 rounded-full">
                Salário: R$ {remainingSalary.toFixed(2)}
              </div>
              <div className="bg-white/10 px-6 py-3 rounded-full">
                Fatura: R$ {creditUsed.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Alerta de dívida */}
        {debt > 0 && (
          <div className="mx-6 mt-6 bg-red-600/90 backdrop-blur p-6 rounded-3xl text-center">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
            <h2 className="text-2xl font-bold">VOCÊ TÁ DEVENDO R$ {debt.toFixed(2)} PRO BANCO!</h2>
          </div>
        )}

        <div className="max-w-6xl mx-auto p-6 space-y-8">
          {/* Cards principais */}
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div whileHover={{ scale: 1.05 }} className="bg-white/10 backdrop-blur-lg rounded-3xl p-8">
              <DollarSign className="w-12 h-12 mb-4" />
              <h3 className="text-xl opacity-90">Salário Disponível</h3>
              <p className="text-5xl font-bold mt-4">R$ {remainingSalary.toFixed(2)}</p>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} className="bg-white/10 backdrop-blur-lg rounded-3xl p-8">
              <CreditCard className="w-12 h-12 mb-4" />
              <h3 className="text-xl opacity-90">Fatura do Cartão</h3>
              <p className="text-5xl font-bold mt-4 text-pink-300">R$ {creditUsed.toFixed(2)}</p>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} className="bg-white/10 backdrop-blur-lg rounded-3xl p-8">
              <TrendingUp className="w-12 h-12 mb-4" />
              <h3 className="text-xl opacity-90">Investimentos</h3>
              <p className="text-5xl font-bold mt-4 text-emerald-400">4 opções</p>
            </motion.div>
          </div>

          {/* Gráfico Pizza */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8">
              <h3 className="text-2xl font-bold mb-6">Uso do Salário</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={pieData} innerRadius={80} outerRadius={120} dataKey="value">
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => `R$ ${v.toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8">
              <h3 className="text-2xl font-bold mb-6">Últimas Despesas</h3>
              <div className="space-y-4">
                {expenses.slice(0, 5).map(exp => (
                  <div key={exp.id} className="flex justify-between items-center bg-white/10 rounded-2xl p-4">
                    <div className="flex items-center gap-4">
                      {exp.icon === 'car' && <Car className="w-8 h-8" />}
                      {exp.icon === 'coffee' && <Coffee className="w-8 h-8" />}
                      {exp.icon === 'home' && <Home className="w-8 h-8" />}
                      <div>
                        <p className="font-semibold">{exp.name}</p>
                        <p className="text-sm opacity-70">{exp.type === 'credit' ? 'Cartão' : 'Salário'}</p>
                      </div>
                    </div>
                    <p className="text-xl font-bold">R$ {exp.value.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Adicionar despesa */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8">
            <h3 className="text-2xl font-bold mb-6">Adicionar Despesa</h3>
            <div className="grid md:grid-cols-4 gap-4">
              <input 
                className="bg-white/20 rounded-2xl px-6 py-4 text-white placeholder-white/70"
                placeholder="Nome (ex: Uber)"
                value={newExpenseName}
                onChange={e => setNewExpenseName(e.target.value)}
              />
              <input 
                className="bg-white/20 rounded-2xl px-6 py-4 text-white placeholder-white/70"
                placeholder="Valor"
                value={newExpenseValue}
                onChange={e => setNewExpenseValue(e.target.value)}
              />
              <select 
                className="bg-white/20 rounded-2xl px-6 py-4"
                value={newExpenseType}
                onChange={e => setNewExpenseType(e.target.value as any)}
              >
                <option value="credit">Cartão</option>
                <option value="salary">Salário</option>
              </select>
              <button 
                onClick={addExpense}
                className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl px-8 py-4 font-bold flex items-center justify-center gap-2 hover:scale-105 transition"
              >
                <Plus className="w-6 h-6" /> Adicionar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
