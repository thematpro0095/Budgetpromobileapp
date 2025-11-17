// src/App.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";

/**
 * Single-file App.tsx - Vite + React + TypeScript
 * - LocalStorage-based "backend" (auth, settings, expenses)
 * - 3 tabs: Overview, Expenses, Charts
 * - Modal to edit salary & credit limit
 * - Dark/Light theme
 *
 * Tailwind classes used; assumes Tailwind is configured.
 */

/* ---------- Types ---------- */
type Screen = "splash" | "login" | "dashboard";
type PaymentMethod = "salary" | "credit";
type Expense = {
  id: string;
  category: string;
  amount: number;
  paymentMethod: PaymentMethod;
  dateISO: string;
};
type Investment = {
  id: string;
  name: string;
  value: number;
};

/* ---------- Theme config (you already had theme.ts) ---------- */
const themes = {
  light: {
    background: "bg-gray-50",
    text: "text-gray-900",
    card: "bg-white",
    border: "border-gray-200",
  },
  dark: {
    background: "bg-gray-900",
    text: "text-gray-100",
    card: "bg-gray-800",
    border: "border-gray-700",
  },
};

const logoPath = "/Logo.png"; // put your Logo.png in public/

/* ---------- Helpers ---------- */
const uid = (prefix = "") => prefix + Math.random().toString(36).slice(2, 9);

const monthName = (d: Date) =>
  d.toLocaleString("pt-BR", { month: "short", timeZone: "UTC" });

/* ---------- Local Storage Keys ---------- */
const LS_KEYS = {
  auth: "bp_auth_v1",
  settings: "bp_settings_v1",
  expenses: "bp_expenses_v1",
};

/* ---------- Component ---------- */
export default function App(): JSX.Element {
  /* ---------- Routing / Auth ---------- */
  const [screen, setScreen] = useState<Screen>("splash");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loggedEmail, setLoggedEmail] = useState<string | null>(null);

  /* ---------- App Data ---------- */
  const [salary, setSalary] = useState<number>(0);
  const [creditLimit, setCreditLimit] = useState<number>(0);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  /* ---------- UI state ---------- */
  const [activeTab, setActiveTab] = useState<"overview" | "expenses" | "charts">(
    "overview"
  );
  const [showEditModal, setShowEditModal] = useState(false);
  const [tmpSalary, setTmpSalary] = useState("");
  const [tmpCredit, setTmpCredit] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newPaymentMethod, setNewPaymentMethod] = useState<PaymentMethod>(
    "salary"
  );
  const [loginError, setLoginError] = useState<string | null>(null);

  /* ---------- Mock investments (kept simple) ---------- */
  const [investments, setInvestments] = useState<Investment[]>([
    { id: "inv-1", name: "TechNova", value: 0 },
    { id: "inv-2", name: "CoinX", value: 0 },
    { id: "inv-3", name: "FII Alpha", value: 0 },
  ]);

  /* ---------- Persist & Load from localStorage ---------- */
  useEffect(() => {
    // Splash -> login
    const t = setTimeout(() => {
      // try autologin
      const a = localStorage.getItem(LS_KEYS.auth);
      if (a) {
        try {
          const parsed = JSON.parse(a) as { email: string; password: string };
          if (parsed?.email) {
            setLoggedEmail(parsed.email);
            setScreen("dashboard");
          } else {
            setScreen("login");
          }
        } catch {
          setScreen("login");
        }
      } else {
        setScreen("login");
      }
    }, 800);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    // load settings: salary, credit, theme
    const settings = localStorage.getItem(LS_KEYS.settings);
    if (settings) {
      try {
        const s = JSON.parse(settings) as {
          salary?: number;
          creditLimit?: number;
          theme?: "light" | "dark";
        };
        if (typeof s.salary === "number") setSalary(s.salary);
        if (typeof s.creditLimit === "number") setCreditLimit(s.creditLimit);
        if (s.theme) setTheme(s.theme);
      } catch {
        // ignore
      }
    }
    // load expenses
    const ex = localStorage.getItem(LS_KEYS.expenses);
    if (ex) {
      try {
        const parsed = JSON.parse(ex) as Expense[];
        setExpenses(parsed || []);
      } catch {
        setExpenses([]);
      }
    }
  }, []);

  useEffect(() => {
    // persist settings and expenses on change
    const s = { salary, creditLimit, theme };
    localStorage.setItem(LS_KEYS.settings, JSON.stringify(s));
  }, [salary, creditLimit, theme]);

  useEffect(() => {
    localStorage.setItem(LS_KEYS.expenses, JSON.stringify(expenses));
  }, [expenses]);

  /* ---------- Auth funcs ---------- */
  function validateEmailFormat(v: string) {
    // require common providers - but allow any with '@' and domain
    const simple = /^[^\s@]+@[^\s@]+\.(com|net|org|br|edu|io|dev|com.br|gmail|hotmail|yahoo|outlook|live)$/i;
    // fallback: require '@' and a dot
    const fallback = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return simple.test(v) || fallback.test(v);
  }

  function handleSignupOrLogin() {
    setLoginError(null);
    if (!validateEmailFormat(email)) {
      setLoginError("Email inválido — use um formato tipo nome@gmail.com");
      return;
    }
    if (password.length < 4) {
      setLoginError("Senha muito curta — use ao menos 4 caracteres");
      return;
    }
    // simple store (not secure): in a real app, use backend + hashing
    const auth = { email, password };
    localStorage.setItem(LS_KEYS.auth, JSON.stringify(auth));
    setLoggedEmail(email);
    setScreen("dashboard");
  }

  function handleLogout() {
    setLoggedEmail(null);
    // keep auth saved but navigate to login
    setScreen("login");
  }

  /* ---------- Expense funcs ---------- */
  function addExpense() {
    setNewCategory((c) => c.trim());
    const amountNum = Number(newAmount);
    if (!newCategory || isNaN(amountNum) || amountNum <= 0) return;
    const e: Expense = {
      id: uid("e"),
      category: newCategory,
      amount: amountNum,
      paymentMethod: newPaymentMethod,
      dateISO: new Date().toISOString(),
    };
    setExpenses((s) => [e, ...s]);
    setNewCategory("");
    setNewAmount("");
    // If user adds credit expense, increase credit usage (we compute from expenses)
    // No explicit state needed - computed values below will reflect change.
  }

  function removeExpense(id: string) {
    setExpenses((s) => s.filter((x) => x.id !== id));
  }

  /* ---------- Derived/calculated values ---------- */
  const salaryExpenses = useMemo(
    () =>
      expenses
        .filter((e) => e.paymentMethod === "salary")
        .reduce((acc, cur) => acc + cur.amount, 0),
    [expenses]
  );
  const creditExpenses = useMemo(
    () =>
      expenses
        .filter((e) => e.paymentMethod === "credit")
        .reduce((acc, cur) => acc + cur.amount, 0),
    [expenses]
  );
  const remainingSalary = Math.max(0, salary - salaryExpenses);
  const availableCredit = Math.max(0, creditLimit - creditExpenses);
  const expensePercentage = salary > 0 ? (salaryExpenses / salary) * 100 : 0;
  const creditPercentage = creditLimit > 0 ? (creditExpenses / creditLimit) * 100 : 0;

  /* ---------- Monthly aggregation for charts ---------- */
  const monthlyData = useMemo(() => {
    // Build a map for the current month only by default
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Filter expenses for the current month
    const monthExpenses = expenses.filter((e) => {
      const d = new Date(e.dateISO);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const gastos = monthExpenses.reduce((acc, cur) => acc + cur.amount, 0);
    // For receitas (income) use salary for current month if salary > 0
    const receitas = salary;
    // investments: sum of investments array values
    const investimentos = investmentsSum(investments);

    return [
      {
        month: monthName(now),
        receitas,
        gastos,
        investimentos,
      },
    ];
  }, [expenses, salary, investments]);

  function investmentsSum(arr: Investment[]) {
    return arr.reduce((a, b) => a + (b.value || 0), 0);
  }

  /* ---------- Charts data for Pie (salary categories) ---------- */
  const salaryPieChartData = useMemo(() => {
    const byCat: Record<string, number> = {};
    expenses
      .filter((e) => e.paymentMethod === "salary")
      .forEach((e) => {
        byCat[e.category] = (byCat[e.category] || 0) + e.amount;
      });
    return Object.entries(byCat).map(([name, value], i) => ({
      name,
      value,
      color: ["#4F46E5", "#22C55E", "#F59E0B", "#EF4444", "#06B6D4"][i % 5],
    }));
  }, [expenses]);

  const investmentPieData = useMemo(() => {
    // if investments have zero values, show placeholder zeros
    return investments.map((inv, idx) => ({
      name: inv.name,
      value: Math.max(0, inv.value),
      color: ["#4F46E5", "#22C55E", "#F59E0B", "#EF4444", "#06B6D4"][idx % 5],
    }));
  }, [investments]);

  /* ---------- UI helpers ---------- */
  function openEditModal() {
    setTmpSalary(String(salary || ""));
    setTmpCredit(String(creditLimit || ""));
    setShowEditModal(true);
  }
  function saveEditModal() {
    const s = Number(tmpSalary) || 0;
    const c = Number(tmpCredit) || 0;
    setSalary(s);
    setCreditLimit(c);
    setShowEditModal(false);
  }

  /* ---------- Theme apply class on body (for background) ---------- */
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    }
  }, [theme]);

  /* ---------- Small utilities for formatting ---------- */
  const money = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  /* ---------- Render screens ---------- */
  if (screen === "splash") {
    return (
      <div className={`min-h-screen flex items-center justify-center ${themes[theme].background}`}>
        <div className="text-center">
          <img src={logoPath} className="w-28 h-28 mx-auto mb-4" alt="Logo" />
          <h1 className="text-2xl font-bold">BudgetPro</h1>
          <p className="mt-2 text-sm text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  if (screen === "login") {
    return (
      <div className={`min-h-screen flex items-center justify-center ${themes[theme].background}`}>
        <div className="max-w-md w-full p-6 rounded-2xl shadow-lg" style={{ background: theme === "dark" ? "#0b1220" : "#ffffff" }}>
          <div className="text-center mb-4">
            <img src={logoPath} className="w-20 h-20 mx-auto" alt="Logo" />
            <h2 className="text-xl mt-2 font-semibold">Entrar no BudgetPro</h2>
          </div>

          <label className="text-xs block mb-1">Email</label>
          <input
            className="w-full p-3 rounded-lg mb-3 border"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nome@gmail.com"
            type="email"
          />
          <label className="text-xs block mb-1">Senha</label>
          <input
            className="w-full p-3 rounded-lg mb-3 border"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="senha"
            type="password"
          />

          {loginError && <div className="text-red-500 text-sm mb-2">{loginError}</div>}

          <div className="flex gap-2">
            <button
              onClick={handleSignupOrLogin}
              className="flex-1 bg-blue-500 text-white p-3 rounded-lg"
            >
              Entrar / Criar conta
            </button>
            <button
              onClick={() => { setEmail("demo@gmail.com"); setPassword("1234"); }}
              className="px-3 rounded-lg border"
            >
              Demo
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main dashboard
  return (
    <div className={`${themes[theme].background} min-h-screen ${themes[theme].text} transition-colors`}>
      {/* Header */}
      <header className="px-4 py-3 shadow-sm flex items-center justify-between" style={{ backgroundColor: '#046BF4' }}>
        <div className="flex items-center gap-3">
          <img src={logoPath} alt="logo" className="w-12 h-12 object-contain" />
          <div>
            <div className="text-white font-semibold">BudgetPro</div>
            <div className="text-white/90 text-xs">Controle financeiro simples</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-white text-sm hidden sm:block">{loggedEmail}</div>

          <button
            onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
            className="px-3 py-2 rounded-lg bg-white/20 text-white"
            title="Alternar tema"
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>

          <button
            onClick={handleLogout}
            className="px-3 py-2 rounded-lg border border-white/30 text-white"
          >
            Sair
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="p-4 max-w-5xl mx-auto">

        {/* Tabs */}
        <nav className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 rounded-xl ${activeTab === "overview" ? "bg-blue-500 text-white" : "bg-white/90"}`}
          >
            Visão Geral
          </button>
          <button
            onClick={() => setActiveTab("expenses")}
            className={`px-4 py-2 rounded-xl ${activeTab === "expenses" ? "bg-blue-500 text-white" : "bg-white/90"}`}
          >
            Gastos
          </button>
          <button
            onClick={() => setActiveTab("charts")}
            className={`px-4 py-2 rounded-xl ${activeTab === "charts" ? "bg-blue-500 text-white" : "bg-white/90"}`}
          >
            Gráficos
          </button>
        </nav>

        {/* === OVERVIEW TAB === */}
        {activeTab === "overview" && (
          <section className="space-y-4">

            {/* Salary & Credit Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`${themes[theme].card} p-4 rounded-2xl shadow`}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-sm text-gray-500">Salário Mensal</div>
                    <div className="text-xl font-semibold">{money(salary)}</div>
                  </div>
                  <button onClick={openEditModal} className="text-sm px-3 py-1 rounded-md border">
                    Modificar
                  </button>
                </div>
                <div className="mt-3 text-xs text-gray-500">Gastos pagos com salário: {money(salaryExpenses)}</div>
                <div className="mt-2 font-semibold text-blue-600">Disponível: {money(remainingSalary)}</div>
              </div>

              <div className={`${themes[theme].card} p-4 rounded-2xl shadow`}>
                <div className="text-sm text-gray-500">Limite do Cartão</div>
                <div className="text-xl font-semibold">{money(creditLimit)}</div>
                <div className="mt-2 text-xs text-gray-500">Gasto no cartão: {money(creditExpenses)}</div>
                <div className="mt-2 font-semibold text-purple-600">Limite livre: {money(availableCredit)}</div>
              </div>

              <div className={`${themes[theme].card} p-4 rounded-2xl shadow`}>
                <div className="text-sm text-gray-500">Resumo Rápido</div>
                <div className="mt-2">
                  <div className="text-xs">Percentual do salário usado: {expensePercentage.toFixed(1)}%</div>
                  <div className="text-xs mt-1">Percentual do cartão usado: {creditPercentage.toFixed(1)}%</div>
                </div>
                <div className="mt-3">
                  <button onClick={() => setActiveTab("expenses")} className="px-3 py-2 bg-blue-500 text-white rounded-lg">
                    Ir para Prancheta de Gastos
                  </button>
                </div>
              </div>
            </div>

            {/* Salary categories quick pie */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`${themes[theme].card} p-4 rounded-2xl shadow`}>
                <div className="text-sm font-medium mb-2">Por Categoria (Salário)</div>
                {salaryPieChartData.length > 0 ? (
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={salaryPieChartData} dataKey="value" nameKey="name" innerRadius={30} outerRadius={60}>
                          {salaryPieChartData.map((d, i) => (
                            <Cell key={i} fill={d.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v: number) => money(v)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">Sem dados</div>
                )}
              </div>

              <div className={`${themes[theme].card} p-4 rounded-2xl shadow`}>
                <div className="text-sm font-medium mb-2">Investimentos (Resumo)</div>
                <div className="text-lg font-semibold">{money(investmentsSum(investments))}</div>
                <div className="mt-2 text-xs text-gray-500">Investimentos simulados (0 até valores)</div>
              </div>
            </div>
          </section>
        )}

        {/* === EXPENSES TAB === */}
        {activeTab === "expenses" && (
          <section>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`${themes[theme].card} p-4 rounded-2xl shadow md:col-span-1`}>
                <div className="text-sm font-medium">Adicionar gasto</div>
                <input
                  className="w-full p-2 rounded-lg mt-2 border"
                  placeholder="Categoria (ex: Alimentação)"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                />
                <input
                  className="w-full p-2 rounded-lg mt-2 border"
                  placeholder="Valor (R$)"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  type="number"
                />
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => setNewPaymentMethod("salary")}
                    className={`flex-1 p-2 rounded-lg ${newPaymentMethod === "salary" ? "bg-green-400 text-white" : "bg-white/90"}`}
                  >
                    Pago com salário
                  </button>
                  <button
                    onClick={() => setNewPaymentMethod("credit")}
                    className={`flex-1 p-2 rounded-lg ${newPaymentMethod === "credit" ? "bg-purple-400 text-white" : "bg-white/90"}`}
                  >
                    No cartão
                  </button>
                </div>
                <button onClick={addExpense} className="w-full mt-3 bg-blue-500 text-white p-2 rounded-lg">
                  Adicionar gasto
                </button>
              </div>

              <div className={`${themes[theme].card} p-4 rounded-2xl shadow md:col-span-2`}>
                <div className="text-sm font-medium mb-3">Lista de Gastos</div>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {expenses.length === 0 && <div className="text-gray-500">Nenhum gasto</div>}
                  {expenses.map((e) => (
                    <div key={e.id} className="flex items-center justify-between p-2 border rounded-lg">
                      <div>
                        <div className="font-medium">{e.category}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(e.dateISO).toLocaleString("pt-BR")} • {e.paymentMethod}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="font-semibold">{money(e.amount)}</div>
                        <button onClick={() => removeExpense(e.id)} className="text-red-500 text-sm px-2">Remover</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* === CHARTS TAB === */}
        {activeTab === "charts" && (
          <section className="space-y-4">
            <div className={`${themes[theme].card} p-4 rounded-2xl shadow`}>
              <div className="text-sm font-medium mb-2">Evolução do mês atual</div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(v: number) => money(v)} />
                    <Legend />
                    <Line type="monotone" dataKey="receitas" stroke="#10B981" />
                    <Line type="monotone" dataKey="gastos" stroke="#EF4444" />
                    <Line type="monotone" dataKey="investimentos" stroke="#046BF4" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`${themes[theme].card} p-4 rounded-2xl shadow`}>
                <div className="text-sm font-medium mb-2">Distribuição por categoria (salário)</div>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={salaryPieChartData} dataKey="value" nameKey="name" innerRadius={30} outerRadius={80} label>
                        {salaryPieChartData.map((d, i) => <Cell key={i} fill={d.color} />)}
                      </Pie>
                      <Tooltip formatter={(v: number) => money(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className={`${themes[theme].card} p-4 rounded-2xl shadow`}>
                <div className="text-sm font-medium mb-2">Distribuição de Investimentos</div>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={investmentPieData} dataKey="value" nameKey="name" innerRadius={30} outerRadius={80} label>
                        {investmentPieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                      </Pie>
                      <Tooltip formatter={(v: number) => money(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="font-semibold mb-3">Editar Salário e Limite</h3>
            <label className="text-xs">Salário mensal</label>
            <input className="w-full p-2 border rounded-lg mb-3" value={tmpSalary} onChange={(e) => setTmpSalary(e.target.value)} />
            <label className="text-xs">Limite do cartão</label>
            <input className="w-full p-2 border rounded-lg mb-4" value={tmpCredit} onChange={(e) => setTmpCredit(e.target.value)} />
            <div className="flex gap-2">
              <button onClick={saveEditModal} className="flex-1 bg-blue-500 text-white p-2 rounded-lg">Salvar</button>
              <button onClick={() => setShowEditModal(false)} className="flex-1 border rounded-lg p-2">Cancelar</button>
            </div>
            <p className="text-xs text-gray-500 mt-2">Alterações salvam imediatamente e atualizam o dashboard.</p>
          </div>
        </div>
      )}
    </div>
  );
}
