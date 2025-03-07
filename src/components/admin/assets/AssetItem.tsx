
import React from "react";
import { Button } from "@/components/ui/button";
import { Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { Asset } from "@/utils/assetUtils";

interface AssetItemProps {
  asset: Asset;
  onRemove: (symbol: string) => void;
}

const AssetItem = ({ asset, onRemove }: AssetItemProps) => {
  return (
    <div className="flex items-center justify-between p-3 border rounded-md">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 flex items-center justify-center bg-gray-100 rounded-md">
          {asset.symbol.substring(0, 1)}
        </div>
        <div>
          <div className="font-medium">{asset.name}</div>
          <div className="text-xs text-muted-foreground">Último preço</div>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="font-bold">{asset.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          <div className="flex items-center justify-end">
            {asset.change > 0 ? (
              <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
            ) : (
              <ArrowDown className="h-3 w-3 text-red-500 mr-1" />
            )}
            <span className={`text-xs ${asset.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {asset.change > 0 ? '+' : ''}{asset.change.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ({asset.change > 0 ? '+' : ''}{asset.changePercent.toFixed(2)}%)
            </span>
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => onRemove(asset.symbol)}
          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default AssetItem;
