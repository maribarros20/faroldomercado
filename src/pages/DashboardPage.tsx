
import { BarChart2, Wallet, Users, TrendingUp, TrendingDown, ArrowDownRight, ArrowUpRight, DollarSign, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Button } from "@/components/ui/button";

const overviewData = [
  { name: "Jan", value: 2400 },
  { name: "Feb", value: 1398 },
  { name: "Mar", value: 9800 },
  { name: "Apr", value: 3908 },
  { name: "May", value: 4800 },
  { name: "Jun", value: 3800 },
  { name: "Jul", value: 4300 },
];

const marketData = [
  { name: "IBOVESPA", value: 120500, change: "+1.24%" },
  { name: "NASDAQ", value: 15800, change: "-0.87%" },
  { name: "S&P 500", value: 4750, change: "+0.32%" },
  { name: "DOW JONES", value: 38200, change: "+0.11%" },
  { name: "EUR/USD", value: 1.0921, change: "-0.17%" },
  { name: "BTC/USD", value: 62450, change: "+2.5%" },
];

const COLORS = ["#0066FF", "#00C48C", "#FF3B30", "#FFB900"];

const pieData = [
  { name: "Ações", value: 400 },
  { name: "ETFs", value: 300 },
  { name: "Criptomoedas", value: 200 },
  { name: "Renda Fixa", value: 100 },
];

const areaData = [
  {
    name: "10:00",
    IBOV: 115000,
    S&P: 4700,
  },
  {
    name: "11:00",
    IBOV: 117000,
    S&P: 4750,
  },
  {
    name: "12:00",
    IBOV: 116500,
    S&P: 4730,
  },
  {
    name: "13:00",
    IBOV: 118000,
    S&P: 4770,
  },
  {
    name: "14:00",
    IBOV: 119500,
    S&P: 4800,
  },
  {
    name: "15:00",
    IBOV: 120000,
    S&P: 4820,
  },
  {
    name: "16:00",
    IBOV: 120500,
    S&P: 4750,
  },
];

const dataFormatter = (number: number) => {
  return number >= 1000
    ? `${(number / 1000).toFixed(1)}K`
    : number.toString();
};

export default function DashboardPage() {
  return (
    <div className="animate-fade-in">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Painel de Mercado</h1>
          <p className="text-gray-500 mt-1">Acompanhe as principais métricas do mercado em tempo real</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Atualizado: 15:42</span>
          <Button size="sm" variant="outline" className="gap-1">
            <ArrowDownRight size={16} className="text-trade-green" />
            Baixa: 10
          </Button>
          <Button size="sm" variant="outline" className="gap-1">
            <ArrowUpRight size={16} className="text-trade-red" />
            Alta: 24
          </Button>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Ativos Monitorados
            </CardTitle>
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">154</div>
            <p className="text-xs text-muted-foreground">
              +6 desde sua última visita
            </p>
          </CardContent>
        </Card>
        <Card className="animate-fade-up" style={{ animationDelay: "0.2s" }}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Valor do Portfólio
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 123.456</div>
            <p className="text-xs text-muted-foreground">
              +2.1% nas últimas 24h
            </p>
          </CardContent>
        </Card>
        <Card className="animate-fade-up" style={{ animationDelay: "0.3s" }}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Ganhos Mensais
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 12.458</div>
            <p className="text-xs text-muted-foreground">
              +12.2% comparado ao mês anterior
            </p>
          </CardContent>
        </Card>
        <Card className="animate-fade-up" style={{ animationDelay: "0.4s" }}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Comunidade
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,254</div>
            <p className="text-xs text-muted-foreground">
              +32 novos membros esta semana
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-6 mb-6">
        <Card className="col-span-1 md:col-span-5 animate-fade-up" style={{ animationDelay: "0.5s" }}>
          <CardHeader>
            <CardTitle>Visão geral do mercado</CardTitle>
            <CardDescription>
              Acompanhe o desempenho dos principais índices
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={areaData}
                  margin={{
                    top: 10,
                    right: 30,
                    left: 0,
                    bottom: 0,
                  }}
                >
                  <defs>
                    <linearGradient id="colorIBOV" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0066FF" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#0066FF" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorS&P" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00C48C" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#00C48C" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'rgba(255, 255, 255, 0.9)',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="IBOV"
                    stroke="#0066FF"
                    fillOpacity={1}
                    fill="url(#colorIBOV)"
                  />
                  <Area
                    type="monotone"
                    dataKey="S&P"
                    stroke="#00C48C"
                    fillOpacity={1}
                    fill="url(#colorS&P)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-2 animate-fade-up" style={{ animationDelay: "0.6s" }}>
          <CardHeader>
            <CardTitle>Alocação</CardTitle>
            <CardDescription>
              Distribuição atual dos seus ativos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value}`, "Valor"]}
                    contentStyle={{ 
                      background: 'rgba(255, 255, 255, 0.9)',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1 md:col-span-2 animate-fade-up" style={{ animationDelay: "0.7s" }}>
          <CardHeader>
            <CardTitle>Índices e Ativos</CardTitle>
            <CardDescription>
              Valores em tempo real de principais mercados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {marketData.map((item, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-trade-light-blue rounded-lg flex items-center justify-center">
                      {item.name.includes("BTC") ? (
                        <DollarSign size={20} className="text-trade-blue" />
                      ) : (
                        <BarChart2 size={20} className="text-trade-blue" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-gray-500">Último preço</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{item.value.toLocaleString()}</div>
                    <div className={`text-sm ${item.change.startsWith('+') ? 'text-trade-green' : 'text-trade-red'}`}>
                      {item.change}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="animate-fade-up" style={{ animationDelay: "0.8s" }}>
          <CardHeader>
            <CardTitle>Alertas</CardTitle>
            <CardDescription>
              Notificações importantes sobre o mercado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle size={18} className="text-yellow-500" />
                  <h4 className="font-medium text-yellow-700">Alta Volatilidade</h4>
                </div>
                <p className="text-sm text-yellow-600 mt-1">PETR4 apresentando variação acima de 5% nas últimas horas.</p>
                <div className="text-xs text-yellow-500 mt-1">14:30</div>
              </div>
              
              <div className="p-3 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle size={18} className="text-red-500" />
                  <h4 className="font-medium text-red-700">Preço Limite Atingido</h4>
                </div>
                <p className="text-sm text-red-600 mt-1">VALE3 atingiu seu preço de stop configurado em R$ 65,40.</p>
                <div className="text-xs text-red-500 mt-1">11:15</div>
              </div>
              
              <div className="p-3 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle size={18} className="text-blue-500" />
                  <h4 className="font-medium text-blue-700">Anúncio de Dividendos</h4>
                </div>
                <p className="text-sm text-blue-600 mt-1">BBAS3 anunciou dividendos de R$ 0,45 por ação. Data de pagamento em 05/06.</p>
                <div className="text-xs text-blue-500 mt-1">09:40</div>
              </div>
              
              <div className="p-3 bg-green-50 border-l-4 border-green-400 rounded-r-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle size={18} className="text-green-500" />
                  <h4 className="font-medium text-green-700">Oportunidade Técnica</h4>
                </div>
                <p className="text-sm text-green-600 mt-1">WEGE3 formou padrão de bandeira de alta. Possível rompimento iminente.</p>
                <div className="text-xs text-green-500 mt-1">Ontem</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
