
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart4, Clock, TrendingDown, TrendingUp } from "lucide-react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface MarketIndicesPanelProps {
  indices: {
    [key: string]: {
      name: string;
      time: string;
      value: string;
      change: string;
      parameter?: string;
      chart?: string[];
    };
  };
}

const MarketIndicesPanel: React.FC<MarketIndicesPanelProps> = ({ indices }) => {
  const formatTime = (time: string) => {
    return time || "Sem horário";
  };

  const isNegative = (change: string) => {
    if (!change) return false;
    return change.includes('-');
  };

  // Parse chart data
  const parseChartData = (chartData: string[] | undefined) => {
    if (!chartData || !Array.isArray(chartData) || chartData.length === 0) return [];
    
    return chartData.map((value, index) => ({
      time: index,
      value: parseFloat(value.replace(',', '.')) || 0
    }));
  };

  // Filter indices for display - only US, European and international futures
  const displayIndices = ['SP500', 'DOW', 'NASDAQ', 'EURO_STOXX', 'FTSE100', 'CHINA_A50']
    .filter(key => indices[key])
    .map(key => indices[key]);

  // Create array of charts to show: IBOV, VALE3, PETR4, EWZ, BIT_FUT
  const chartIndices = ['IBOV', 'VALE3', 'PETR4', 'EWZ', 'BIT_FUT']
    .filter(key => indices[key])
    .map(key => ({
      ...indices[key],
      key,
      chartData: parseChartData(indices[key].chart)
    }));

  return (
    <div className="space-y-6">
      <Card className="shadow-lg bg-white">
        <CardHeader className="pb-2 border-b">
          <CardTitle className="text-xl text-[#0066FF] flex items-center">
            <BarChart4 className="h-6 w-6 mr-2" />
            Índices Futuros
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold">Índice</TableHead>
                <TableHead className="text-right font-semibold">Valor</TableHead>
                <TableHead className="text-right font-semibold">Variação</TableHead>
                <TableHead className="text-right font-semibold">Hora</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayIndices.map((index, idx) => (
                <TableRow key={idx} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{index.name}</TableCell>
                  <TableCell className="text-right">{index.value}</TableCell>
                  <TableCell 
                    className={`text-right font-medium ${isNegative(index.change) ? 'text-red-600' : 'text-green-600'}`}
                  >
                    {index.change}
                  </TableCell>
                  <TableCell className="text-right text-gray-500 text-sm">{formatTime(index.time)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Charts for IBOV, VALE3, PETR4, EWZ, BIT_FUT */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {chartIndices.map((index, idx) => (
          <Card key={idx} className="shadow-sm">
            <CardHeader className="py-2 px-4 border-b">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base font-medium">{index.name}</CardTitle>
                <div className="text-xs text-gray-500 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatTime(index.time)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-lg font-bold">{index.value}</span>
                <span className={`text-sm font-medium ${isNegative(index.change) ? 'text-red-600' : 'text-green-600'}`}>
                  {isNegative(index.change) ? (
                    <TrendingDown className="h-4 w-4 inline mr-1" />
                  ) : (
                    <TrendingUp className="h-4 w-4 inline mr-1" />
                  )}
                  {index.change}
                </span>
              </div>
              
              <div className="h-36">
                {index.chartData && index.chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={index.chartData}>
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke={isNegative(index.change) ? '#ef4444' : '#22c55e'}
                        strokeWidth={1.5}
                        dot={false}
                      />
                      <XAxis dataKey="time" hide={true} />
                      <YAxis domain={['auto', 'auto']} hide={true} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'white', borderRadius: '0.375rem', border: '1px solid #e2e8f0' }}
                        formatter={(value) => [`${value}`, index.name]}
                        labelFormatter={() => ''}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                    Sem dados do gráfico
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MarketIndicesPanel;
