
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, AlertTriangle, Bell, TrendingUp } from "lucide-react";

// Definição dos tipos de alerta
type AlertType = "warning" | "price" | "dividend" | "technical";

type MarketAlert = {
  id: string;
  type: AlertType;
  title: string;
  message: string;
  time: string;
};

// Função para obter o ícone adequado para cada tipo de alerta
const getAlertIcon = (type: AlertType) => {
  switch (type) {
    case "warning":
      return <AlertTriangle className="h-5 w-5 text-amber-500" />;
    case "price":
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    case "dividend":
      return <Bell className="h-5 w-5 text-blue-500" />;
    case "technical":
      return <TrendingUp className="h-5 w-5 text-green-500" />;
    default:
      return <Bell className="h-5 w-5 text-gray-500" />;
  }
};

// Cor de fundo para cada tipo de alerta
const getAlertBgColor = (type: AlertType) => {
  switch (type) {
    case "warning":
      return "bg-amber-50 border-amber-100";
    case "price":
      return "bg-red-50 border-red-100";
    case "dividend":
      return "bg-blue-50 border-blue-100";
    case "technical":
      return "bg-green-50 border-green-100";
    default:
      return "bg-gray-50 border-gray-100";
  }
};

// Dados simulados de alertas
const mockAlerts: MarketAlert[] = [
  {
    id: "1",
    type: "warning",
    title: "Alta Volatilidade",
    message: "PETR4 apresentando variação acima de 5% nas últimas horas",
    time: "14:35"
  },
  {
    id: "2",
    type: "price",
    title: "Preço Limite Atingido",
    message: "VALE3 atingiu seu preço de stop configurado em R$ 63,40",
    time: "11:15"
  },
  {
    id: "3",
    type: "dividend",
    title: "Anúncio de Dividendos",
    message: "BBAS3 anunciou dividendos de R$ 0,45 por ação. Data de pagamento em 05/06",
    time: "09:45"
  },
  {
    id: "4",
    type: "technical",
    title: "Oportunidade Técnica",
    message: "WEGE3 formou padrão de bandeira de alta. Possível rompimento iminente",
    time: "09:30"
  }
];

const MarketAlerts = () => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">Alertas</CardTitle>
        <p className="text-sm text-muted-foreground">
          Notificações importantes sobre o mercado
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {mockAlerts.map((alert) => (
            <div 
              key={alert.id} 
              className={`p-3 border rounded-md flex gap-3 ${getAlertBgColor(alert.type)}`}
            >
              <div className="mt-1">
                {getAlertIcon(alert.type)}
              </div>
              <div className="flex-1">
                <div className="font-medium">{alert.title}</div>
                <p className="text-sm text-muted-foreground">
                  {alert.message}
                </p>
                <div className="text-xs text-muted-foreground mt-1">
                  {alert.time}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketAlerts;
