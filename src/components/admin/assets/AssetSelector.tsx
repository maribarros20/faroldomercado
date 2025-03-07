
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { availableAssets } from "@/utils/assetUtils";

interface AssetSelectorProps {
  newAsset: string;
  setNewAsset: (asset: string) => void;
  onAddAsset: () => void;
  isLoading: boolean;
}

const AssetSelector = ({ newAsset, setNewAsset, onAddAsset, isLoading }: AssetSelectorProps) => {
  return (
    <div className="flex gap-2 mb-4">
      <Select value={newAsset} onValueChange={setNewAsset}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecione um ativo" />
        </SelectTrigger>
        <SelectContent>
          {availableAssets.map((asset) => (
            <SelectItem key={asset.symbol} value={asset.symbol}>
              {asset.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button onClick={onAddAsset} disabled={!newAsset || isLoading}>
        <PlusCircle className="h-4 w-4 mr-2" />
        Adicionar
      </Button>
    </div>
  );
};

export default AssetSelector;
