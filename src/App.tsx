// src/App.tsx
import React, { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Label } from "./components/ui/label";
import { Alert, AlertDescription } from "./components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Progress } from "./components/ui/progress";
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
  ArrowLeft,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart as PieIcon,
  Zap,
  Coins,
  Rocket,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import logoDefinitiva from "./assets/logo.png";
import { themes } from "./theme";

type Screen =
  | "splash"
  | "login"
  | "signup"
  | "forgot-password"
  | "dashboard"
  | "investment-details"
  | "investment-purchase"
  | "investment-result";

type IconType = "coffee" | "car" | "home" | "shopping" | "smartphone";
type RiskLevel = "low" | "medium" | "high";
type InvestmentStatus = "available" | "purchased" | "completed";
type PaymentMethod = "salary" | "credit";

interface Expense {
  id: string;
  category: string;
  amount: number;
  iconType: IconType;
  paymentMethod: PaymentMethod;
  date: string; // ISO date string
}

interface Investment {
  id: string;
  name: string;
  type: string;
  description?: string;
  riskLevel: RiskLevel;
  expectedReturn: number;
  minInvestment: number;
  maxInvestment: number;
  icon?: any;
  color?: string;
  historicalData?: { month: string; value: number }[];
  status?: InvestmentStatus;
  purchaseAmount?: number;
  profitLoss?: number;
}

interface UserRecord {
  email: string;
  password: string;
  salary: number;
  creditLimit: number;
  expenses: Expense[];
  investments?: Investment[];
  createdAt: string;
}

const iconMap: Record<IconType, any> = {
  coffee: Coffee,
  car: Car,
  home: Home,
  shopping: ShoppingCart,
  smartphone: Smartphone,
};

// small helpers
const uid = (prefix = "") =>
  prefix + Math.random().toString(36).slice(2, 9);

const isValidEmail = (e: string) => {
  // very basic but checks presence of @ and known domain bits
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(e);
};

// localStorage keys
const LS_USERS = "budgetpro_users_v1";
const LS_SESSION = "budgetpro_session_v1";
const LS_THEME = "budgetpro_theme_v1";

const defaultInvestments: Investment[] = [
  {
    id: "tech-nova",
    name: "TechNova",
    type: "Ações",
    riskLevel: "medium",
    expectedReturn: 10,
    minInvestment: 100,
    maxInvestment: 5000,
    color: "#3B82F6",
    historicalData: [],
    status: "available",
  },
  {
    id: "coin-x",
    name: "CoinX",
    type: "Cripto",
    riskLevel: "high",
    expectedReturn: 30,
    minInvestment: 50,
    maxInvestment: 3000,
    color: "#F59E0B",
    historicalData: [],
    status: "available",
  },
];

// read/write users
const readUsers = (): Record<string, UserRecord> => {
  try {
    const raw = localStorage.getItem(LS_USERS);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
};

const writeUsers = (obj: Record<string, UserRecord>) => {
  localStorage.setItem(LS_USERS, JSON.stringify(obj));
};

export default function App(): JSX.Element {
  // navigation
  const [currentScreen, setCurrentScreen] = useState<Screen>("splash");

  // auth
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);

  // signup
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // finances
  const [salary, setSalary] = useState<number>(0);
  const [creditLimit, setCreditLimit] = useState<number>(0);

  // editable popup states
  const [showEditTop, setShowEditTop] = useState(false);
  const [editSalaryInput, setEditSalaryInput] = useState("");
  const [editCreditInput, setEditCreditInput] = useState("");

  // expenses & investments (from current user session)
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [investments, setInvestments] = useState<Investment[]>(defaultInvestments);

  // generic UI
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [message, setMessage] = useState<string | null>(null);

  // new expense inputs
  const [newCategory, setNewCategory] = useState("");
  const [newAmount, setNewAmount] = useState<string>("");

  // initialize from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem(LS_THEME) as "light" | "dark" | null;
    if (savedTheme) setTheme(savedTheme);
    // session
    const sess = localStorage.getItem(LS_SESSION);
    if (sess) {
      try {
        const sEmail = JSON.parse(sess) as string;
        if (sEmail) {
          setSessionEmail(sEmail);
          loadUserData(sEmail);
          setCurrentScreen("dashboard");
        }
      } catch {
        // ignore
      }
    } else {
      // splash -> login
      setTimeout(() => setCurrentScreen("login"), 1200);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LS_THEME, theme);
  }, [theme]);

  // load user data when sessionEmail changes
  const loadUserData = (userEmail: string) => {
    const users = readUsers();
    const u = users[userEmail];
    if (!u) {
      // nothing
      setSalary(0);
      setCreditLimit(0);
      setExpenses([]);
      setInvestments(defaultInvestments);
      return;
    }
    setSalary(u.salary || 0);
    setCreditLimit(u.creditLimit || 0);
    setExpenses(u.expenses || []);
    setInvestments(u.investments && u.investments.length ? u.investments : defaultInvestments);
  };

  // persist current user
  const persistUser = (emailKey: string, patch?: Partial<UserRecord>) => {
    const users = readUsers();
    const existing = users[emailKey] || {
      email: emailKey,
      password: "",
      salary: 0,
      creditLimit: 0,
      expenses: [],
      investments: defaultInvestments,
      createdAt: new Date().toISOString(),
    };
    const merged: UserRecord = { ...existing, ...patch } as UserRecord;
    users[emailKey] = merged;
    writeUsers(users);
  };

  // Auth flows
  const handleSignup = () => {
    if (!isValidEmail(email)) {
      setMessage("Email inválido. Use um formato tipo usuario@gmail.com");
      return;
    }
    if (password.length < 6) {
      setMessage("Senha muito curta. Min 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setMessage("Senha e confirmação não conferem.");
      return;
    }
    const users = readUsers();
    if (users[email]) {
      setMessage("Já existe usuário com esse email. Faça login.");
      return;
    }
    const newUser: UserRecord = {
      email,
      password,
      salary: 0,
      creditLimit: 0,
      expenses: [],
      investments: defaultInvestments,
      createdAt: new Date().toISOString(),
    };
    users[email] = newUser;
    writeUsers(users);
    localStorage.setItem(LS_SESSION, JSON.stringify(email));
    setSessionEmail(email);
    loadUserData(email);
    setCurrentScreen("dashboard");
    setMessage("Conta criada!");
  };

  const handleLogin = () => {
    if (!isValidEmail(email)) {
      setMessage("Email inválido.");
      return;
    }
    const users = readUsers();
    const u = users[email];
    if (!u) {
      setMessage("Usuário não encontrado. Cadastre-se.");
      return;
    }
    if (u.password !== password) {
      setMessage("Senha incorreta.");
      return;
    }
    localStorage.setItem(LS_SESSION, JSON.stringify(email));
    setSessionEmail(email);
    loadUserData(email);
    setCurrentScreen("dashboard");
    setMessage(null);
  };

  const handleLogout = () => {
    localStorage.removeItem(LS_SESSION);
    setSessionEmail(null);
    setCurrentScreen("login");
    setEmail("");
    setPassword("");
  };

  // expense operations
  const addExpense = (method: PaymentMethod) => {
    const amt = parseFloat(newAmount || "0");
    if (!newCategory || isNaN(amt) || amt <= 0) {
      setMessage("Categoria e valor válidos são necessários.");
      return;
    }
    const newExp: Expense = {
      id: uid("exp_"),
      category: newCategory,
      amount: Math.round(amt * 100) / 100,
      iconType: "shopping",
      paymentMethod: method,
      date: new Date().toISOString(),
    };
    const next = [...expenses, newExp];
    setExpenses(next);
    if (sessionEmail) persistUser(sessionEmail, { expenses: next });
    setNewAmount("");
    setNewCategory("");
    setMessage(null);
  };

  const removeExpense = (id: string) => {
    const next = expenses.filter((e) => e.id !== id);
    setExpenses(next);
    if (sessionEmail) persistUser(sessionEmail, { expenses: next });
  };

  // top popup edit actions
  const openEditTop = () => {
    setEditSalaryInput(String(salary));
    setEditCreditInput(String(creditLimit));
    setShowEditTop(true);
  };

  const saveTopEdits = () => {
    const s = parseFloat(editSalaryInput || "0") || 0;
    const c = parseFloat(editCreditInput || "0") || 0;
    setSalary(s);
    setCreditLimit(c);
    if (sessionEmail) {
      persistUser(sessionEmail, { salary: s, creditLimit: c });
    }
    setShowEditTop(false);
  };

  // computed summaries
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

  const remainingSalary = Math.round((salary - salaryExpenses) * 100) / 100;
  const availableCredit = Math.round((creditLimit - creditExpenses) * 100) / 100;

  // pie chart data for salary categories
  const salaryPieChartData = useMemo(() => {
    const map: Record<string, number> = {};
    expenses
      .filter((e) => e.paymentMethod === "salary")
      .forEach((e) => {
        map[e.category] = (map[e.category] || 0) + e.amount;
      });
    return Object.entries(map).map(([name, value], idx) => ({
      name,
      value,
      color: ["#4F46E5", "#22C55E", "#F59E0B", "#EF4444", "#06B6D4"][idx % 5],
    }));
  }, [expenses]);

  // monthly line chart: for simplicity, show current month breakdown (receitas = salary, gastos = sum of expenses of month)
  const monthlyData = useMemo(() => {
    // build months from past 6 months for display
    const months: { month: string; receitas: number; gastos: number; investimentos: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = d.toLocaleString("pt-BR", { month: "short" });
      const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const monthExpenses = expenses
        .filter((ex) => ex.date.startsWith(monthStr))
        .reduce((acc, cur) => acc + cur.amount, 0);
      // receitas: use salary as monthly income if salary>0 else 0
      months.push({
        month: monthName,
        receitas: salary || 0,
        gastos: monthExpenses,
        investimentos: 0, // unless you track investments purchases separately
      });
    }
    return months;
  }, [expenses, salary]);

  // pie for investments distribution (only show real purchased investments)
  const investmentData = useMemo(() => {
    // if user purchased investments we would map them
    const purchased = investments.filter((i) => i.status === "purchased" && i.purchaseAmount && i.purchaseAmount > 0);
    if (!purchased.length) return [];
    return purchased.map((p) => ({ name: p.name, value: p.purchaseAmount || 0 }));
  }, [investments]);

  // small UI helpers
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 4500);
    return () => clearTimeout(t);
  }, [message]);

  // click handlers for theme
  const toggleTheme = () => {
    setTheme((t) => {
      const next = t === "light" ? "dark" : "light";
      localStorage.setItem(LS_THEME, next);
      return next;
    });
  };

  // ---------- Renders ----------
  // Splash
  if (currentScreen === "splash") {
    return (
      <motion.div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#046BF4" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-center">
          <img src={logoDefinitiva} alt="Logo" className="w-28 h-28 mx-auto mb-4 object-contain" />
          <div className="text-white font-bold text-2xl">BudgetPro</div>
        </div>
      </motion.div>
    );
  }

  // LOGIN
  if (currentScreen === "login") {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${themes[theme].background}`}>
        <div className="max-w-md w-full">
          <Card className="rounded-2xl shadow-lg">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-2">Entrar</h2>
              <p className="text-sm mb-4 text-gray-600">Use seu email e senha</p>

              <div className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="Digite seu email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-11 h-12 rounded-xl"
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    type="password"
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-11 h-12 rounded-xl"
                  />
                </div>

                <Button onClick={handleLogin} className="w-full h-12 rounded-xl" style={{ backgroundColor: "#046BF4", color: "white" }}>
                  Entrar
                </Button>

                <div className="flex justify-between text-sm mt-2">
                  <button onClick={() => setCurrentScreen("signup")} className="underline text-sm text-gray-600">
                    Criar conta
                  </button>
                  <button onClick={() => setCurrentScreen("forgot-password")} className="underline text-sm text-gray-600">
                    Esqueceu a senha?
                  </button>
                </div>

                {message && <div className="text-sm text-red-600 pt-2">{message}</div>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // SIGNUP
  if (currentScreen === "signup") {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${themes[theme].background}`}>
        <div className="max-w-md w-full">
          <Card className="rounded-2xl shadow-lg">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-2">Criar Conta</h2>
              <div className="space-y-3">
                <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12" />
                <Input placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="h-12" />
                <Input placeholder="Confirme a senha" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type="password" className="h-12" />
                <Button onClick={handleSignup} className="w-full h-12 rounded-xl" style={{ backgroundColor: "#046BF4", color: "white" }}>
                  Criar conta
                </Button>
                <div className="text-sm text-gray-500">
                  Já tem conta?{" "}
                  <button onClick={() => setCurrentScreen("login")} className="underline text-blue-600">
                    Entrar
                  </button>
                </div>
                {message && <div className="text-sm text-red-600 pt-2">{message}</div>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // DASHBOARD
  if (currentScreen === "dashboard") {
    return (
      <div className={`min-h-screen ${themes[theme].background} text-${theme === "dark" ? "white" : "black"}`}>
        {/* Top header with popup control */}
        <div className="px-4 py-4 shadow-sm flex items-center justify-between" style={{ backgroundColor: "#046BF4" }}>
          <div className="flex items-center gap-3">
            <img src={logoDefinitiva} alt="BudgetPro" className="w-12 h-12 object-contain" />
            <div>
              <h1 className="text-white font-semibold">BudgetPro</h1>
              <p className="text-white/80 text-xs">Suas finanças</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-white text-sm text-right mr-2">
              <div>Salário: R$ {salary.toFixed(2)}</div>
              <div>Limite cartão: R$ {creditLimit.toFixed(2)}</div>
            </div>

            <div className="flex gap-2">
              <Button onClick={openEditTop} className="px-3 py-2 rounded-xl" variant="outline" style={{ borderColor: "white", color: "white" }}>
                Editar
              </Button>
              <Button onClick={toggleTheme} className="px-3 py-2 rounded-xl" variant="outline" style={{ borderColor: "white", color: "white" }}>
                {theme === "light" ? "🌙" : "☀️"}
              </Button>
              <Button onClick={handleLogout} className="px-3 py-2 rounded-xl" variant="ghost" style={{ color: "white" }}>
                Sair
              </Button>
            </div>
          </div>
        </div>

        {/* Edit top modal */}
        {showEditTop && (
          <div className="fixed inset-0 z-40 flex items-start justify-center pt-24">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowEditTop(false)} />
            <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="z-50 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 w-[92%] max-w-lg">
              <h3 className="font-semibold mb-2">Editar Salário e Limite</h3>
              <div className="grid grid-cols-1 gap-3">
                <Label>Salário mensal (R$)</Label>
                <Input value={editSalaryInput} onChange={(e) => setEditSalaryInput(e.target.value)} type="number" className="h-12" />
                <Label>Limite do cartão (R$)</Label>
                <Input value={editCreditInput} onChange={(e) => setEditCreditInput(e.target.value)} type="number" className="h-12" />
                <div className="flex gap-2">
                  <Button onClick={saveTopEdits} className="flex-1 h-12" style={{ backgroundColor: "#046BF4", color: "white" }}>
                    Salvar
                  </Button>
                  <Button onClick={() => setShowEditTop(false)} className="flex-1 h-12" variant="outline">
                    Cancelar
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        <div className="px-4 py-6 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Salary card */}
            <Card className="rounded-xl">
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500">Salário Mensal</div>
                    <div className="text-xl font-semibold">R$ {salary.toFixed(2)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Gastos</div>
                    <div className="text-lg font-semibold text-red-600">R$ {salaryExpenses.toFixed(2)}</div>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-xs">Saldo restante</div>
                  <div className="text-lg font-bold" style={{ color: "#046BF4" }}>
                    R$ {remainingSalary.toFixed(2)}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Credit card */}
            <Card className="rounded-xl">
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500">Limite do Cartão</div>
                    <div className="text-xl font-semibold">R$ {creditLimit.toFixed(2)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Fatura</div>
                    <div className="text-lg font-semibold text-red-600">R$ {creditExpenses.toFixed(2)}</div>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-xs">Limite livre</div>
                  <div className="text-lg font-bold" style={{ color: "#8B5CF6" }}>
                    R$ {availableCredit.toFixed(2)}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick actions */}
            <Card className="rounded-xl">
              <CardContent>
                <div className="flex flex-col gap-3">
                  <Button onClick={() => setCurrentScreen("investment-details")} className="w-full h-10" style={{ backgroundColor: "#046BF4", color: "white" }}>
                    Ver Investimentos
                  </Button>
                  <Button onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })} className="w-full h-10" variant="outline">
                    Ir para gastos
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle>Distribuição do Mês (atual)</CardTitle>
              </CardHeader>
              <CardContent>
                {salaryPieChartData.length > 0 ? (
                  <div style={{ width: "100%", height: 240 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={salaryPieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={30} label>
                          {salaryPieChartData.map((entry, index) => (
                            <Cell key={entry.name} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(val: any) => `R$ ${val}`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">Nenhum gasto registrado para exibir.</div>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle>Evolução últimos meses</CardTitle>
              </CardHeader>
              <CardContent>
                <div style={{ width: "100%", height: 240 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="receitas" stroke="#10B981" name="Receitas" />
                      <Line type="monotone" dataKey="gastos" stroke="#EF4444" name="Gastos" />
                      <Line type="monotone" dataKey="investimentos" stroke="#046BF4" name="Investimentos" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Expenses area */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Adicionar gasto (Salário)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Input placeholder="Categoria" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} />
                  <Input placeholder="Valor (R$)" type="number" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} />
                  <div className="flex gap-2">
                    <Button onClick={() => addExpense("salary")} className="flex-1 h-10" style={{ backgroundColor: "#046BF4", color: "white" }}>
                      <PlusCircle className="w-4 h-4 mr-2 inline" />
                      Adicionar (Salário)
                    </Button>
                    <Button onClick={() => addExpense("credit")} className="flex-1 h-10" variant="outline">
                      <PlusCircle className="w-4 h-4 mr-2 inline" />
                      Adicionar (Cartão)
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Gastos recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {expenses.length === 0 && <div className="text-gray-500 text-sm text-center py-8">Nenhum gasto registrado</div>}
                  {expenses.map((exp) => {
                    const IconComp = iconMap[exp.iconType] || ShoppingCart;
                    return (
                      <div key={exp.id} className="flex items-center justify-between p-3 rounded-lg border bg-white shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded bg-gray-100">
                            <IconComp className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-medium">{exp.category}</div>
                            <div className="text-xs text-gray-500">{new Date(exp.date).toLocaleString()}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-sm font-semibold">R$ {exp.amount.toFixed(2)}</div>
                          <Button onClick={() => removeExpense(exp.id)} variant="outline" size="sm" className="p-2">
                            <Trash2 className="w-4 h-4 text-red-600" />
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

        {/* message toast */}
        {message && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
            <div className="bg-black/80 text-white px-4 py-2 rounded-md">{message}</div>
          </div>
        )}
      </div>
    );
  }

  // Investment details (simple)
  if (currentScreen === "investment-details") {
    return (
      <div className={`min-h-screen ${themes[theme].background}`}>
        <div className="px-6 py-4 text-center" style={{ backgroundColor: "#046BF4" }}>
          <img src={logoDefinitiva} alt="BudgetPro" className="w-20 h-20 mx-auto object-contain" />
          <h1 className="text-white text-lg">BudgetPro</h1>
        </div>

        <div className="p-4 max-w-4xl mx-auto">
          <Button onClick={() => setCurrentScreen("dashboard")} variant="outline" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2 inline" />
            Voltar
          </Button>

          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Investimentos Disponíveis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {investments.map((inv) => (
                  <div key={inv.id} className="p-3 rounded-lg border bg-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{inv.name}</div>
                        <div className="text-xs text-gray-500">{inv.type}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-green-600">±{inv.expectedReturn}%</div>
                        <div className="text-xs text-gray-500">Min: R$ {inv.minInvestment}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return null;
}
