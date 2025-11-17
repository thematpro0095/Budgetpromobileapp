// src/App.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

/**
 * NOTE:
 * - Put your logo at /public/assets/logo.png (lowercase) or import it if placed in src.
 * - If you want real backend (Firebase/Supabase) uncomment and configure the init code below.
 */

/* =========================
   Optional Firebase placeholder
   =========================
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "REPLACE_ME",
  authDomain: "REPLACE_ME",
  projectId: "REPLACE_ME",
  storageBucket: "REPLACE_ME",
  messagingSenderId: "REPLACE_ME",
  appId: "REPLACE_ME",
};

let db: ReturnType<typeof getFirestore> | null = null;
try {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (e) {
  console.warn("Firebase not initialized (placeholder).");
}
*/

type Screen = "splash" | "login" | "signup" | "dashboard" | "charts";
type PaymentMethod = "salary" | "credit";

type Expense = {
  id: string;
  category: string;
  amount: number;
  paymentMethod: PaymentMethod;
  dateISO: string; // for monthly grouping
};

const DEFAULT_LOGO_PATH = "/assets/logo.png";

const PROVIDERS = ["gmail.com", "hotmail.com", "yahoo.com", "outlook.com", "uol.com.br", "icloud.com"];

/* themes */
export const themes = {
  light: {
    background: "bg-gradient-to-b from-white via-sky-50 to-white", // light blue fade
    text: "text-gray-900",
    card: "bg-white",
  },
  dark: {
    background: "bg-gradient-to-b from-black via-sky-900 to-black", // dark fade
    text: "text-gray-100",
    card: "bg-gray-800",
  },
};

/* small utilities */
const uid = () => Math.random().toString(36).slice(2, 9);

function formatMoney(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/* stronger email validator (checks format + allowlist providers or domain pattern) */
function validateEmail(email: string) {
  if (!email) return false;
  const basic = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!basic.test(email)) return false;
  const domain = email.split("@")[1].toLowerCase();
  // accept if domain in PROVIDERS OR domain has at least one dot and reasonable length
  if (PROVIDERS.includes(domain)) return true;
  if (/^[a-z0-9.-]+\.[a-z]{2,}$/.test(domain)) return true;
  return false;
}

/* password validator */
function validatePassword(p: string) {
  return p.length >= 6;
}

/* Save / load helpers (local fallback) */
const STORAGE_KEY = "budgetpro_v1";
function saveStateToLocal(payload: any) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (e) {
    console.warn("Could not save to localStorage", e);
  }
}
function loadStateFromLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

/* monthly helper */
function monthKeyFromDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; // YYYY-MM
}

/* Progress ring simple component */
const ProgressRing: React.FC<{ percentage: number; size?: number }> = ({ percentage, size = 80 }) => {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * radius;
  const dash = (percentage / 100) * circ;
  const dashOffset = circ - dash;
  return (
    <svg width={size} height={size} className="block">
      <circle cx={size / 2} cy={size / 2} r={radius} stroke="#e5e7eb" strokeWidth={strokeWidth} fill="transparent" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="#046BF4"
        strokeWidth={strokeWidth}
        fill="transparent"
        strokeDasharray={`${circ}`}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize={12} fill="#0f172a">
        {Math.round(percentage)}%
      </text>
    </svg>
  );
};

export default function App(): JSX.Element {
  /* ---- Auth & screens ---- */
  const [currentScreen, setCurrentScreen] = useState<Screen>("splash");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");

  /* ---- Financial states ---- */
  const [salary, setSalary] = useState<number>(0);
  const [creditLimit, setCreditLimit] = useState<number>(0);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  /* UI */
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [activeTab, setActiveTab] = useState<"overview" | "boards" | "charts">("overview");
  const [newCategory, setNewCategory] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newPaymentMethod, setNewPaymentMethod] = useState<PaymentMethod>("salary");

  /* Monthly history storage: { "YYYY-MM": { receitas, gastos, investments? } } */
  const [monthlyHistory, setMonthlyHistory] = useState<Record<string, { receitas: number; gastos: number }>>({});

  /* current user object saved in localStorage (basic) */
  const [loggedUser, setLoggedUser] = useState<{ email: string; name?: string } | null>(null);

  /* load saved state on mount */
  useEffect(() => {
    const saved = loadStateFromLocal();
    if (saved) {
      if (saved.salary) setSalary(saved.salary);
      if (saved.creditLimit) setCreditLimit(saved.creditLimit);
      if (saved.expenses) setExpenses(saved.expenses);
      if (saved.monthlyHistory) setMonthlyHistory(saved.monthlyHistory);
      if (saved.loggedUser) {
        setLoggedUser(saved.loggedUser);
        setEmail(saved.loggedUser.email);
        setCurrentScreen("dashboard");
      }
      if (saved.theme) setTheme(saved.theme);
    }

    // Splash auto nav
    const t = setTimeout(() => {
      if (!saved || !saved.loggedUser) setCurrentScreen("login");
      else setCurrentScreen("dashboard");
    }, 10000);
    return () => clearTimeout(t);
  }, []);

  /* persist any important changes */
  useEffect(() => {
    saveStateToLocal({ salary, creditLimit, expenses, monthlyHistory, loggedUser, theme });
  }, [salary, creditLimit, expenses, monthlyHistory, loggedUser, theme]);

  /* computed */
  const salaryExpenses = useMemo(
    () => expenses.filter((e) => e.paymentMethod === "salary").reduce((s, e) => s + e.amount, 0),
    [expenses]
  );
  const creditExpenses = useMemo(
    () => expenses.filter((e) => e.paymentMethod === "credit").reduce((s, e) => s + e.amount, 0),
    [expenses]
  );
  const remainingSalary = Math.max(0, salary - salaryExpenses);
  const availableCredit = Math.max(0, creditLimit - creditExpenses);
  const expensePercentage = salary > 0 ? Math.min(100, (salaryExpenses / salary) * 100) : 0;
  const creditPercentage = creditLimit > 0 ? Math.min(100, (creditExpenses / creditLimit) * 100) : 0;

  /* monthlyData for line chart (last 6 months) */
  const monthlyData = useMemo(() => {
    const keys = Object.keys(monthlyHistory).sort();
    const arr = keys.map((k) => ({ month: k, receitas: monthlyHistory[k].receitas, gastos: monthlyHistory[k].gastos }));
    // If current month not present, add it as current totals
    const curKey = monthKeyFromDate(new Date());
    if (!monthlyHistory[curKey]) {
      arr.push({ month: curKey, receitas: salary, gastos: salaryExpenses });
    }
    return arr.slice(-12);
  }, [monthlyHistory, salary, salaryExpenses]);

  /* -------------------------
     Auth functions (local fallback)
     ------------------------- */
  function handleSignup() {
    if (!validateEmail(signupEmail)) {
      alert("Email inválido. Use um email com @ e domínio válido (ex: gmail.com).");
      return;
    }
    if (!validatePassword(signupPassword)) {
      alert("Senha muito curta. Use pelo menos 6 caracteres.");
      return;
    }
    if (signupPassword !== signupConfirmPassword) {
      alert("Senhas não coincidem.");
      return;
    }
    // Save user to localStorage or backend (placeholder)
    const user = { email: signupEmail, name };
    setLoggedUser(user);
    saveStateToLocal({ ...(loadStateFromLocal() || {}), loggedUser: user });
    setEmail(signupEmail);
    setCurrentScreen("dashboard");
  }

  function handleLogin() {
    if (!validateEmail(email)) {
      alert("Email inválido.");
      return;
    }
    if (!validatePassword(password)) {
      alert("Senha inválida.");
      return;
    }
    // For now, accept if localStorage has an user or just log in with given email
    const saved = loadStateFromLocal();
    if (saved?.loggedUser?.email && saved.loggedUser.email !== email) {
      alert("Esse e-mail não corresponde ao usuário salvo no dispositivo.");
      return;
    }
    const user = { email, name: saved?.loggedUser?.name || "" };
    setLoggedUser(user);
    setCurrentScreen("dashboard");
  }

  /* -------------------------
     Expenses functions
     ------------------------- */
  function addExpense(paymentMethod: PaymentMethod) {
    const amt = parseFloat(newAmount.replace(",", "."));
    if (!newCategory || !amt || amt <= 0) {
      alert("Preencha categoria e valor válidos.");
      return;
    }
    const e: Expense = {
      id: uid(),
      category: newCategory,
      amount: amt,
      paymentMethod,
      dateISO: new Date().toISOString(),
    };
    setExpenses((p) => [e, ...p]);
    setNewCategory("");
    setNewAmount("");
    // add to current month's summary
    const key = monthKeyFromDate(new Date());
    setMonthlyHistory((mh) => {
      const cur = mh[key] || { receitas: salary, gastos: 0 };
      const next = { ...mh, [key]: { receitas: cur.receitas, gastos: (cur.gastos || 0) + amt } };
      return next;
    });
  }

  function removeExpense(id: string) {
    setExpenses((p) => p.filter((x) => x.id !== id));
    // NOTE: not subtracting monthlyHistory for simplicity — can implement if needed
  }

  /* -------------------------
     Month saving (end-of-month simulation)
     ------------------------- */
  function saveCurrentMonthSnapshot() {
    const key = monthKeyFromDate(new Date());
    setMonthlyHistory((mh) => ({ ...mh, [key]: { receitas: salary, gastos: salaryExpenses } }));
    alert("Gráfico do mês salvo.");
  }

  /* -------------------------
     UI small helpers
     ------------------------- */
  function toggleTheme() {
    setTheme((t) => (t === "light" ? "dark" : "light"));
  }

  /* -------------------------
     Render screens
     ------------------------- */

  // Splash
  if (currentScreen === "splash") {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === "dark" ? "bg-slate-900" : "bg-white"}`}>
        <div className="text-center">
          <img src={DEFAULT_LOGO_PATH} alt="BudgetPro" className="w-36 h-36 mx-auto object-contain mb-4" />
          <div className="relative w-20 h-20 mx-auto">
            {/* 12 dots loading animation */}
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = (i * 360) / 12;
              const rad = (angle * Math.PI) / 180;
              const r = 36;
              const x = Math.cos(rad) * r;
              const y = Math.sin(rad) * r;
              return (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    transform: `translate(${x}px, ${y}px)`,
                    width: 8,
                    height: 8,
                    borderRadius: 999,
                    background: "#fff",
                    opacity: 0.6,
                    animation: `pulse 1.2s ${i * 0.08}s infinite ease-in-out`,
                    boxShadow: "0 0 6px rgba(0,0,0,0.08)",
                  }}
                />
              );
            })}
          </div>
          <p className="text-sm mt-4 text-gray-200">Carregando seu app financeiro...</p>
        </div>

        <style>{`
          @keyframes pulse {
            0% { opacity: 0.2; transform: scale(0.6) translateY(0); }
            50% { opacity: 1; transform: scale(1) translateY(-2px); }
            100% { opacity: 0.2; transform: scale(0.6) translateY(0); }
          }
        `}</style>
      </div>
    );
  }

  // Login
  if (currentScreen === "login") {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${themes[theme].background}`}>
        <div className="max-w-md w-full">
          <div className="text-center mb-4">
            <img src={DEFAULT_LOGO_PATH} alt="BudgetPro" className="w-24 h-24 mx-auto" />
            <h1 className="text-2xl font-bold mt-3">BudgetPro</h1>
            <p className="text-sm text-gray-500 mt-1">Organize suas finanças com simplicidade</p>
          </div>

          <div className={`p-4 rounded-2xl shadow-md ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
            <label className="block text-sm mb-1">Email</label>
            <input
              className="w-full p-3 rounded-lg mb-3 border"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@provedor.com"
            />
            <label className="block text-sm mb-1">Senha</label>
            <input
              className="w-full p-3 rounded-lg mb-3 border"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="••••••"
            />

            <button onClick={handleLogin} className="w-full py-3 rounded-lg text-white" style={{ background: "#046BF4" }}>
              Entrar
            </button>

            <div className="mt-3 text-center">
              <button onClick={() => setCurrentScreen("signup")} className="text-sm text-sky-700 underline">
                Ainda não tem conta? Criar conta
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Signup
  if (currentScreen === "signup") {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${themes[theme].background}`}>
        <div className="max-w-md w-full">
          <div className="text-center mb-4">
            <img src={DEFAULT_LOGO_PATH} alt="BudgetPro" className="w-20 h-20 mx-auto" />
            <h1 className="text-2xl font-bold mt-3">Criar Conta</h1>
          </div>

          <div className={`p-4 rounded-2xl shadow-md ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
            <label className="block text-sm mb-1">Nome (opcional)</label>
            <input className="w-full p-3 rounded-lg mb-3 border" value={name} onChange={(e) => setName(e.target.value)} />

            <label className="block text-sm mb-1">Email</label>
            <input className="w-full p-3 rounded-lg mb-3 border" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} />

            <label className="block text-sm mb-1">Senha</label>
            <input className="w-full p-3 rounded-lg mb-3 border" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} type="password" />

            <label className="block text-sm mb-1">Confirme a senha</label>
            <input className="w-full p-3 rounded-lg mb-3 border" value={signupConfirmPassword} onChange={(e) => setSignupConfirmPassword(e.target.value)} type="password" />

            <button onClick={handleSignup} className="w-full py-3 rounded-lg text-white" style={{ background: "#046BF4" }}>
              Criar Minha Conta
            </button>

            <div className="mt-3 text-center">
              <button onClick={() => setCurrentScreen("login")} className="text-sm text-sky-700 underline">
                Já tem conta? Entrar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard (main)
  if (currentScreen === "dashboard") {
    return (
      <div className={`min-h-screen p-4 ${themes[theme].background} ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
        {/* Header */}
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <img src={DEFAULT_LOGO_PATH} alt="BudgetPro" className="w-12 h-12 object-contain" />
              <div>
                <h2 className="font-bold text-lg">BudgetPro</h2>
                <p className="text-xs opacity-80">Gerencie salário, cartão e gastos</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleTheme()}
                className="px-3 py-2 rounded-lg border"
                title="Alternar tema"
              >
                {theme === "light" ? "🌙" : "☀️"}
              </button>

              <div className="text-right text-sm">
                <div>{loggedUser?.email}</div>
                <button
                  className="text-xs underline"
                  onClick={() => {
                    setLoggedUser(null);
                    // keep data but log out
                    const s = loadStateFromLocal() || {};
                    s.loggedUser = null;
                    saveStateToLocal(s);
                    setCurrentScreen("login");
                  }}
                >
                  Sair
                </button>
              </div>
            </div>
          </div>

          {/* Top editable salary / credit (in place as requested) */}
          <div className={`p-4 rounded-2xl mb-4 ${theme === "dark" ? "bg-gray-800" : "bg-white"} shadow`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-gray-500">Salário Mensal</div>
                    <div className="text-xl font-semibold">{formatMoney(salary)}</div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      value={salary}
                      onChange={(e) => setSalary(parseFloat(e.target.value || "0"))}
                      className="p-2 rounded-lg border w-40"
                    />
                    <button
                      onClick={() => setSalary(0)}
                      className="px-3 py-2 rounded-lg border text-sm"
                      title="Zerar salário"
                    >
                      Zerar
                    </button>
                  </div>
                </div>

                <div className="mt-2 text-xs text-gray-500">Pagos com salário: {formatMoney(salaryExpenses)}</div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-gray-500">Limite do Cartão</div>
                    <div className="text-xl font-semibold">{formatMoney(creditLimit)}</div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      value={creditLimit}
                      onChange={(e) => setCreditLimit(parseFloat(e.target.value || "0"))}
                      className="p-2 rounded-lg border w-40"
                    />
                    <button onClick={() => setCreditLimit(0)} className="px-3 py-2 rounded-lg border text-sm">
                      Zerar
                    </button>
                  </div>
                </div>

                <div className="mt-2 text-xs text-gray-500">Limite livre: {formatMoney(availableCredit)}</div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-4 flex gap-2">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-2 rounded-xl ${activeTab === "overview" ? "bg-blue-600 text-white" : theme === "dark" ? "bg-gray-700 text-white" : "bg-white"}`}
            >
              Visão Geral
            </button>
            <button
              onClick={() => setActiveTab("boards")}
              className={`px-4 py-2 rounded-xl ${activeTab === "boards" ? "bg-blue-600 text-white" : theme === "dark" ? "bg-gray-700 text-white" : "bg-white"}`}
            >
              Prancheta de Gastos
            </button>
            <button
              onClick={() => setActiveTab("charts")}
              className={`px-4 py-2 rounded-xl ${activeTab === "charts" ? "bg-blue-600 text-white" : theme === "dark" ? "bg-gray-700 text-white" : "bg-white"}`}
            >
              Gráficos
            </button>
          </div>

          {/* Tab content container */}
          <div className={`p-4 rounded-2xl ${theme === "dark" ? "bg-gray-800" : "bg-white"} shadow`}>
            {activeTab === "overview" && (
              <>
                {/* Quick summary + mini charts */}
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div className="p-3 rounded-lg border">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-xs text-gray-500">Saldo Restante</div>
                        <div className="font-bold text-lg" style={{ color: "#046BF4" }}>
                          {formatMoney(remainingSalary)}
                        </div>
                      </div>
                      <ProgressRing percentage={expensePercentage} />
                    </div>
                    <div className="mt-2 text-xs text-gray-500">Percentual do salário usado</div>
                  </div>

                  <div className="p-3 rounded-lg border">
                    <div className="text-xs text-gray-500">Limite Restante do Cartão</div>
                    <div className="font-bold text-lg text-purple-600">{formatMoney(availableCredit)}</div>
                    <div className="mt-2 text-xs text-gray-500">Percentual do cartão usado</div>
                    <div className="mt-2">
                      <ProgressRing percentage={creditPercentage} />
                    </div>
                  </div>

                  <div className="p-3 rounded-lg border">
                    <div className="text-xs text-gray-500">Resumo Rápido (Mês Atual)</div>
                    <div className="mt-2">
                      <ResponsiveContainer width="100%" height={60}>
                        <LineChart data={monthlyData}>
                          <Line type="monotone" dataKey="gastos" stroke="#ef4444" strokeWidth={2} dot={false} />
                          <XAxis dataKey="month" hide />
                          <YAxis hide />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">Gastos do mês atual</div>
                  </div>
                </div>

                {/* Small list with top few expenses (salary) */}
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">Últimos gastos (visão rápida)</h3>
                  <div className="space-y-2">
                    {expenses.slice(0, 4).map((ex) => (
                      <div key={ex.id} className="flex justify-between items-center p-2 rounded-lg border">
                        <div>
                          <div className="font-medium">{ex.category}</div>
                          <div className="text-xs text-gray-500">{new Date(ex.dateISO).toLocaleString()}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{formatMoney(ex.amount)}</div>
                          <div className="text-xs text-gray-500">{ex.paymentMethod === "salary" ? "Pago com salário" : "No cartão"}</div>
                        </div>
                      </div>
                    ))}
                    {expenses.length === 0 && <div className="text-sm text-gray-500">Sem gastos registrados</div>}
                  </div>
                </div>
              </>
            )}

            {activeTab === "boards" && (
              <>
                {/* ADD expense area */}
                <div className="mb-4 p-3 rounded-lg border">
                  <div className="flex gap-3 items-center">
                    <input
                      placeholder="Nome da categoria"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="p-2 rounded-lg border flex-1"
                    />
                    <input
                      placeholder="Valor (R$)"
                      value={newAmount}
                      onChange={(e) => setNewAmount(e.target.value)}
                      className="p-2 rounded-lg border w-36"
                    />
                    {/* Payment toggles with blue circle indicator */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setNewPaymentMethod("salary")}
                        className={`px-3 py-2 rounded-lg border flex items-center gap-2 ${newPaymentMethod === "salary" ? "bg-blue-600 text-white" : ""}`}
                      >
                        <span className={`w-3 h-3 rounded-full ${newPaymentMethod === "salary" ? "bg-white" : "bg-blue-200"}`} />
                        Salário
                      </button>
                      <button
                        onClick={() => setNewPaymentMethod("credit")}
                        className={`px-3 py-2 rounded-lg border flex items-center gap-2 ${newPaymentMethod === "credit" ? "bg-blue-600 text-white" : ""}`}
                      >
                        <span className={`w-3 h-3 rounded-full ${newPaymentMethod === "credit" ? "bg-white" : "bg-blue-200"}`} />
                        Cartão
                      </button>
                    </div>

                    <button
                      onClick={() => addExpense(newPaymentMethod)}
                      className="px-4 py-2 rounded-lg text-white"
                      style={{ background: "#046BF4" }}
                    >
                      Adicionar
                    </button>
                  </div>
                </div>

                {/* Expenses lists separated */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Gastos pagos com salário</h4>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {expenses.filter((e) => e.paymentMethod === "salary").map((expense) => (
                        <div key={expense.id} className="flex items-center justify-between p-3 rounded-lg border bg-white">
                          <div>
                            <div className="font-medium">{expense.category}</div>
                            <div className="text-xs text-gray-500">{new Date(expense.dateISO).toLocaleString()}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="font-semibold">{formatMoney(expense.amount)}</div>
                            <button onClick={() => removeExpense(expense.id)} className="text-red-600 text-sm">Remover</button>
                          </div>
                        </div>
                      ))}
                      {expenses.filter((e) => e.paymentMethod === "salary").length === 0 && (
                        <div className="text-sm text-gray-500 p-4">Nenhum gasto com salário</div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Gastos no cartão</h4>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {expenses.filter((e) => e.paymentMethod === "credit").map((expense) => (
                        <div key={expense.id} className="flex items-center justify-between p-3 rounded-lg border bg-white">
                          <div>
                            <div className="font-medium">{expense.category}</div>
                            <div className="text-xs text-gray-500">{new Date(expense.dateISO).toLocaleString()}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="font-semibold">{formatMoney(expense.amount)}</div>
                            <button onClick={() => removeExpense(expense.id)} className="text-red-600 text-sm">Remover</button>
                          </div>
                        </div>
                      ))}
                      {expenses.filter((e) => e.paymentMethod === "credit").length === 0 && (
                        <div className="text-sm text-gray-500 p-4">Nenhum gasto no cartão</div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === "charts" && (
              <>
                <div className="mb-4">
                  <h3 className="font-semibold">Evolução Mensal</h3>
                  <div className="p-4 bg-white rounded-lg mt-2">
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={monthlyData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis tickFormatter={(v) => `R$ ${v}`} />
                          <Tooltip formatter={(v: any) => `R$ ${v}`} />
                          <Line name="Gastos" type="monotone" dataKey="gastos" stroke="#ef4444" />
                          <Line name="Receitas" type="monotone" dataKey="receitas" stroke="#10b981" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="mt-3 flex gap-2 items-center">
                      <button onClick={saveCurrentMonthSnapshot} className="px-3 py-2 rounded-lg text-white" style={{ background: "#046BF4" }}>
                        Salvar mês atual
                      </button>
                      <div className="text-sm text-gray-500">Meses salvos: {Object.keys(monthlyHistory).length}</div>
                    </div>

                    {/* month buttons listed below */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {Object.keys(monthlyHistory)
                        .sort()
                        .map((k) => (
                          <button
                            key={k}
                            onClick={() =>
                              alert(`Visualizando ${k}\nReceitas: ${formatMoney(monthlyHistory[k].receitas)}\nGastos: ${formatMoney(monthlyHistory[k].gastos)}`)
                            }
                            className="px-3 py-1 rounded-lg border text-sm"
                          >
                            {k}
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
