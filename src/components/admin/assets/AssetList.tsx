
import React from "react";
import AssetItem from "./AssetItem";
import { Asset } from "@/utils/assetUtils";

interface AssetListProps {
  assets: Asset[];
  onRemoveAsset: (symbol: string) => void;
}

const AssetList = ({ assets, onRemoveAsset }: AssetListProps) => {
  if (assets.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        Nenhum ativo selecionado. Adicione ativos para acompanhar.
      </div>
    );
  }

  return (
    <div className="space-y-3 mt-4">
      {assets.map((asset) => (
        <AssetItem 
          key={asset.symbol}
          asset={asset}
          onRemove={onRemoveAsset}
        />
      ))}
    </div>
  );
};

export default AssetList;
