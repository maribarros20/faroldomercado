
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, Clock } from "lucide-react";

interface FutureIndicesPanelProps {
  indices: {
    [key: string]: {
      name: string;
      time: string;
      value: string;
      change: string;
    };
  };
  parameter: string;
}

const FutureIndicesPanel: React.FC<FutureIndicesPanelProps> = ({ indices, parameter }) => {
  return (
    <Card className="shadow-lg bg-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex justify-between items-center">
          <span className="text-[#0066FF]">Índices Futuros</span>
          {parameter && (
            <span className="text-sm font-normal bg-red-50 text-red-600 px-2 py-1 rounded">
              {parameter}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.values(indices).map((index) => (
            <div 
              key={index.name} 
              className="border rounded-md p-3 transition-all hover:shadow-md"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{index.name}</h3>
                  <div className="flex items-center text-gray-500 text-xs mt-1">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>{index.time}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold">{index.value}</div>
                  <div className={`flex items-center justify-end ${
                    index.change.startsWith('+') || parseFloat(index.change) > 0 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {index.change.startsWith('+') || parseFloat(index.change) > 0 ? (
                      <ArrowUpRight className="h-4 w-4 mr-1" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 mr-1" />
                    )}
                    <span>{index.change}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default FutureIndicesPanel;
