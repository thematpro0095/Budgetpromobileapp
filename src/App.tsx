// App.tsx — Expo / React Native (funciona também no web via expo start --web)
import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, FlatList, Alert, StyleSheet, Platform, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Modal from 'react-native-modal';
import { NavigationContainer, DefaultTheme, DarkTheme, useTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';

type Expense = {
  id: string;
  category: string;
  amount: number;
  paymentMethod: 'salary' | 'credit';
  date: string; // ISO
};

const STORAGE_KEY_USER = '@budgetpro_user';
const STORAGE_KEY_DATA = '@budgetpro_data_v1';

const screenWidth = Dimensions.get('window').width;

function validateEmail(email: string) {
  // simples regex com domínios comuns ok
  const re = /^[^\s@]+@[^\s@]+\.(com|net|org|com.br|br|edu|gov|io|dev|me)$/i;
  return re.test(email);
}

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

/* ---------------------- Auth & Persistence ---------------------- */
async function saveUserToStorage(user: { email: string; password: string }) {
  await AsyncStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
}
async function loadUserFromStorage() {
  const txt = await AsyncStorage.getItem(STORAGE_KEY_USER);
  return txt ? JSON.parse(txt) : null;
}
async function saveAppData(data: any) {
  await AsyncStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(data));
}
async function loadAppData() {
  const txt = await AsyncStorage.getItem(STORAGE_KEY_DATA);
  return txt ? JSON.parse(txt) : null;
}

/* ---------------------- Screens ---------------------- */
function HomeScreen({ route }: any) {
  // recebe props via route.params se necessário
  const theme = useTheme();
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Bem-vindo ao BudgetPro</Text>
      <Text style={{ color: theme.colors.text }}>Use a aba "Configurar" para ajustar seu salário e limite do cartão.</Text>
    </SafeAreaView>
  );
}

function SettingsScreen({ navigation, route }: any) {
  const theme = useTheme();
  // We'll receive app state via route.params (we'll wire from root)
  const { appState, setAppState } = route.params;

  const [modalVisible, setModalVisible] = useState(false);
  const [salaryInput, setSalaryInput] = useState(String(appState.salary || '0'));
  const [creditInput, setCreditInput] = useState(String(appState.creditLimit || '0'));

  useEffect(() => {
    setSalaryInput(String(appState.salary ?? 0));
    setCreditInput(String(appState.creditLimit ?? 0));
  }, [appState]);

  function saveModal() {
    const s = Number(salaryInput) || 0;
    const c = Number(creditInput) || 0;
    const newState = { ...appState, salary: s, creditLimit: c };
    setAppState(newState);
    saveAppData(newState);
    setModalVisible(false);
  }

  // top summary uses appState
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Resumo</Text>

      <View style={[styles.rowCard, { borderColor: theme.colors.border }]}>
        <View>
          <Text style={[styles.label, { color: theme.colors.text }]}>Salário Mensal</Text>
          <Text style={[styles.big, { color: theme.colors.text }]}>R$ {Number(appState.salary || 0).toFixed(2)}</Text>
        </View>
        <View>
          <Text style={[styles.label, { color: theme.colors.text }]}>Limite do Cartão</Text>
          <Text style={[styles.big, { color: theme.colors.text }]}>R$ {Number(appState.creditLimit || 0).toFixed(2)}</Text>
        </View>
      </View>

      <TouchableOpacity style={[styles.btnPrimary]} onPress={() => setModalVisible(true)}>
        <Text style={styles.btnPrimaryText}>Modificar Salário / Limite</Text>
      </TouchableOpacity>

      <Text style={[styles.sectionTitle, { marginTop: 20, color: theme.colors.text }]}>Histórico Rápido</Text>
      <View style={{ height: 220 }}>
        {/* small monthly chart using totals */}
        <LineChart
          data={{
            labels: appState.monthlyLabels || ['Jan', 'Fev', 'Mar', 'Abr'],
            datasets: [{
              data: appState.monthlyGastos || [0,0,0,0],
            }]
          }}
          width={screenWidth - 40}
          height={200}
          chartConfig={{
            backgroundGradientFrom: theme.colors.background as string,
            backgroundGradientTo: theme.colors.background as string,
            color: (opacity = 1) => `rgba(4,107,244, ${opacity})`,
            labelColor: () => theme.colors.text as string,
          }}
          style={{ borderRadius: 12 }}
        />
      </View>

      <Modal isVisible={modalVisible}>
        <View style={[styles.modal, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Editar Salário e Limite</Text>
          <TextInput
            keyboardType="numeric"
            value={salaryInput}
            onChangeText={setSalaryInput}
            placeholder="Salário mensal"
            style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
          />
          <TextInput
            keyboardType="numeric"
            value={creditInput}
            onChangeText={setCreditInput}
            placeholder="Limite do cartão"
            style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
          />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity style={[styles.btnOutline]} onPress={() => setModalVisible(false)}>
              <Text>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btnPrimary]} onPress={saveModal}>
              <Text style={styles.btnPrimaryText}>Salvar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function ExpensesScreen({ route }: any) {
  const theme = useTheme();
  const { appState, setAppState } = route.params;
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');

  function addExpense(method: 'salary' | 'credit') {
    const amt = Number(amount);
    if (!category || !amt || amt <= 0) {
      Alert.alert('Erro', 'Preencha categoria e valor válido.');
      return;
    }
    const newExpense: Expense = {
      id: uid(),
      category,
      amount: amt,
      paymentMethod: method,
      date: new Date().toISOString(),
    };
    const newExpenses = [...(appState.expenses || []), newExpense];
    const newState = { ...appState, expenses: newExpenses };
    setAppState(newState);
    saveAppData(newState);
    setCategory('');
    setAmount('');
  }

  function removeExpense(id: string) {
    const newExpenses = (appState.expenses || []).filter((e: Expense) => e.id !== id);
    const newState = { ...appState, expenses: newExpenses };
    setAppState(newState);
    saveAppData(newState);
  }

  const salaryExpenses = (appState.expenses || []).filter((e: Expense) => e.paymentMethod === 'salary');
  const creditExpenses = (appState.expenses || []).filter((e: Expense) => e.paymentMethod === 'credit');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Adicionar gasto</Text>

      <TextInput
        placeholder="Categoria"
        placeholderTextColor={theme.colors.text as string}
        value={category}
        onChangeText={setCategory}
        style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
      />
      <TextInput
        placeholder="Valor (R$)"
        placeholderTextColor={theme.colors.text as string}
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
        style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
      />

      <View style={{ flexDirection: 'row', gap: 8 }}>
        <TouchableOpacity style={[styles.btnPrimary, { flex: 1 }]} onPress={() => addExpense('salary')}>
          <Text style={styles.btnPrimaryText}>Pagar com Salário</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btnOutline, { flex: 1 }]} onPress={() => addExpense('credit')}>
          <Text>Usar Cartão</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.sectionTitle, { marginTop: 18, color: theme.colors.text }]}>Gastos pag. com Salário</Text>
      <FlatList
        data={salaryExpenses}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View style={[styles.rowCard, { borderColor: theme.colors.border }]}>
            <View>
              <Text style={{ color: theme.colors.text }}>{item.category}</Text>
              <Text style={{ color: theme.colors.text, opacity: 0.7 }}>{new Date(item.date).toLocaleString()}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ color: theme.colors.text }}>R$ {item.amount.toFixed(2)}</Text>
              <TouchableOpacity onPress={() => removeExpense(item.id)}>
                <Text style={{ color: 'red' }}>Remover</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <Text style={[styles.sectionTitle, { marginTop: 12, color: theme.colors.text }]}>Gastos no Cartão</Text>
      <FlatList
        data={creditExpenses}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View style={[styles.rowCard, { borderColor: theme.colors.border }]}>
            <View>
              <Text style={{ color: theme.colors.text }}>{item.category}</Text>
              <Text style={{ color: theme.colors.text, opacity: 0.7 }}>{new Date(item.date).toLocaleString()}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ color: theme.colors.text }}>R$ {item.amount.toFixed(2)}</Text>
              <TouchableOpacity onPress={() => removeExpense(item.id)}>
                <Text style={{ color: 'red' }}>Remover</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

function InvestmentsScreen({ route }: any) {
  const theme = useTheme();
  const { appState } = route.params;

  // Simple pie for distribution of salary vs credit usage
  const salaryTotal = (appState.expenses || []).filter((e: Expense) => e.paymentMethod === 'salary').reduce((s: number, cur: Expense) => s + cur.amount, 0);
  const creditTotal = (appState.expenses || []).filter((e: Expense) => e.paymentMethod === 'credit').reduce((s: number, cur: Expense) => s + cur.amount, 0);

  const pieData = [
    { name: 'Salário', amount: salaryTotal, color: '#046BF4', legendFontColor: theme.colors.text as string, legendFontSize: 12 },
    { name: 'Cartão', amount: creditTotal, color: '#8B5CF6', legendFontColor: theme.colors.text as string, legendFontSize: 12 },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Distribuição Atual</Text>
      <View>
        <PieChart
          data={pieData.map(p => ({ name: p.name, population: p.amount, color: p.color, legendFontColor: p.legendFontColor, legendFontSize: p.legendFontSize }))}
          width={screenWidth - 20}
          height={220}
          chartConfig={{
            backgroundColor: theme.colors.background as string,
            color: () => '#000',
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      </View>
      <Text style={{ color: theme.colors.text, marginTop: 12 }}>Total gasto com salário: R$ {salaryTotal.toFixed(2)}</Text>
      <Text style={{ color: theme.colors.text }}>Total gasto no cartão: R$ {creditTotal.toFixed(2)}</Text>
    </SafeAreaView>
  );
}

/* ---------------------- Root App ---------------------- */
const Tab = createBottomTabNavigator();

export default function App() {
  const [appState, setAppState] = useState<any>({
    salary: 0,
    creditLimit: 0,
    expenses: [],
    monthlyLabels: ['Jan','Fev','Mar','Abr'],
    monthlyGastos: [0,0,0,0],
  });
  const [user, setUser] = useState<{ email: string; password: string } | null>(null);
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');

  // load stored data
  useEffect(() => {
    (async () => {
      const u = await loadUserFromStorage();
      if (u) setUser(u);
      const d = await loadAppData();
      if (d) setAppState(d);
    })();
  }, []);

  // simple auth UI if no user saved (very small)
  if (!user) {
    return <AuthScreen onSignIn={(u) => { setUser(u); saveUserToStorage(u);} } />;
  }

  const navTheme = themeMode === 'light' ? DefaultTheme : DarkTheme;

  return (
    <NavigationContainer theme={navTheme}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: { backgroundColor: navTheme.colors.card },
          tabBarActiveTintColor: '#046BF4',
          tabBarInactiveTintColor: navTheme.colors.text,
          tabBarIcon: ({ color, size }) => {
            if (route.name === 'Home') return <Ionicons name="home-outline" size={size} color={color} />;
            if (route.name === 'Gastos') return <Ionicons name="list-outline" size={size} color={color} />;
            if (route.name === 'Distribuição') return <Ionicons name="pie-chart-outline" size={size} color={color} />;
            if (route.name === 'Configurar') return <Ionicons name="settings-outline" size={size} color={color} />;
            return null;
          }
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} initialParams={{ appState, setAppState }} />
        <Tab.Screen name="Gastos">
          {props => <ExpensesScreen {...props} appState={appState} setAppState={setAppState} route={{...props.route, params: { appState, setAppState }}} />}
        </Tab.Screen>
        <Tab.Screen name="Distribuição">
          {props => <InvestmentsScreen {...props} appState={appState} setAppState={setAppState} route={{...props.route, params: { appState, setAppState }}} />}
        </Tab.Screen>
        <Tab.Screen name="Configurar">
          {props => <SettingsScreen {...props} appState={appState} setAppState={setAppState} route={{...props.route, params: { appState, setAppState }}} />}
        </Tab.Screen>
      </Tab.Navigator>

      {/* floating theme toggle */}
      <TouchableOpacity
        style={[styles.themeToggle]}
        onPress={() => setThemeMode((m) => (m === 'light' ? 'dark' : 'light'))}
      >
        <Text style={{ color: '#fff' }}>{themeMode === 'light' ? '🌙' : '☀️'}</Text>
      </TouchableOpacity>
    </NavigationContainer>
  );
}

/* ---------------------- Tiny Auth screen component ---------------------- */
function AuthScreen({ onSignIn }: { onSignIn: (u: { email: string; password: string }) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleSignup() {
    if (!validateEmail(email)) {
      Alert.alert('Email inválido', 'Use um email válido (ex: seu@provedor.com).');
      return;
    }
    if (password.length < 4) {
      Alert.alert('Senha fraca', 'Senha precisa ter ao menos 4 caracteres.');
      return;
    }
    // save minimal user locally
    await saveUserToStorage({ email, password });
    onSignIn({ email, password });
  }

  return (
    <SafeAreaView style={[styles.container, { justifyContent: 'center', padding: 20 }]}>
      <Text style={styles.title}>BudgetPro — Entrar / Criar conta</Text>
      <TextInput placeholder="Email" autoCapitalize="none" value={email} onChangeText={setEmail} style={styles.input} />
      <TextInput placeholder="Senha" secureTextEntry value={password} onChangeText={setPassword} style={styles.input} />
      <TouchableOpacity style={styles.btnPrimary} onPress={handleSignup}>
        <Text style={styles.btnPrimaryText}>Criar / Entrar</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

/* ---------------------- Styles ---------------------- */
const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 10, marginVertical: 8 },
  btnPrimary: { backgroundColor: '#046BF4', padding: 12, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  btnPrimaryText: { color: '#fff', fontWeight: '700' },
  btnOutline: { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 12, alignItems: 'center', marginTop: 8, flex: 1 },
  rowCard: { borderWidth: 1, borderRadius: 10, padding: 12, marginVertical: 6, flexDirection: 'row', justifyContent: 'space-between' },
  modal: { padding: 16, borderRadius: 12 },
  modalTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  big: { fontSize: 18, fontWeight: '700' },
  label: { fontSize: 12, opacity: 0.8 },
  themeToggle: { position: 'absolute', right: 16, bottom: 18, backgroundColor: '#046BF4', padding: 12, borderRadius: 40, elevation: 4 }
});
