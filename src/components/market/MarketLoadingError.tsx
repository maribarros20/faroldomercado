
import React from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface MarketLoadingErrorProps {
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

const MarketLoadingError: React.FC<MarketLoadingErrorProps> = ({ 
  isLoading, 
  error, 
  onRetry 
}) => {
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-16 bg-gray-100 rounded-md"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="h-32 bg-gray-100 rounded-md"></div>
          <div className="h-32 bg-gray-100 rounded-md"></div>
          <div className="h-32 bg-gray-100 rounded-md"></div>
          <div className="h-32 bg-gray-100 rounded-md"></div>
        </div>
        <div className="h-64 bg-gray-100 rounded-md"></div>
        <div className="h-32 bg-gray-100 rounded-md"></div>
        <div className="h-96 bg-gray-100 rounded-md"></div>
        <div className="h-96 bg-gray-100 rounded-md"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-sm">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-600">Erro</h3>
            <div className="text-sm text-red-500">{error}</div>
            <Button 
              onClick={onRetry} 
              variant="outline" 
              size="sm"
              className="mt-2"
            >
              Tentar novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default MarketLoadingError;
