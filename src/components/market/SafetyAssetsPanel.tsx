
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, ShieldCheck } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface SafetyAssetsPanelProps {
  assets: {
    [key: string]: {
      name: string;
      time: string;
      value: string;
      change: string;
      parameter?: string;
    };
  };
}

const SafetyAssetsPanel: React.FC<SafetyAssetsPanelProps> = ({ assets }) => {
  const formatTime = (time: string) => {
    return time || "Sem horário";
  };

  const isNegative = (change: string) => {
    if (!change) return false;
    return change.includes('-');
  };

  const assetOrder = ['GOLD', 'DOLLAR', 'TREA_2Y', 'TREA_5Y', 'TREA_10Y', 'TREA_30Y'];
  const sortedAssets = assetOrder
    .filter(key => assets[key])
    .map(key => assets[key]);

  return (
    <Card className="shadow-lg bg-white">
      <CardHeader className="pb-2 border-b">
        <CardTitle className="text-xl text-[#0066FF] flex items-center">
          <ShieldCheck className="h-6 w-6 mr-2" />
          Ativos de Segurança
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold">Ativo</TableHead>
              <TableHead className="text-right font-semibold">Valor</TableHead>
              <TableHead className="text-right font-semibold">Variação</TableHead>
              <TableHead className="text-right font-semibold">Hora</TableHead>
              {/* Add parameter column if needed */}
              <TableHead className="text-right font-semibold">Observação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedAssets.map((asset, idx) => (
              <TableRow key={idx} className="hover:bg-gray-50">
                <TableCell className="font-medium">{asset.name}</TableCell>
                <TableCell className="text-right">{asset.value}</TableCell>
                <TableCell 
                  className={`text-right font-medium ${isNegative(asset.change) ? 'text-red-600' : 'text-green-600'}`}
                >
                  {asset.change}
                </TableCell>
                <TableCell className="text-right text-gray-500 text-sm">{formatTime(asset.time)}</TableCell>
                <TableCell className="text-right text-gray-600 text-xs">{asset.parameter || ""}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default SafetyAssetsPanel;
