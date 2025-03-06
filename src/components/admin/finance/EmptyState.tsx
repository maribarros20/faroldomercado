
import React from "react";
import { FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";

type EmptyStateProps = {
  onCreateClick: () => void;
};

const EmptyState: React.FC<EmptyStateProps> = ({ onCreateClick }) => {
  return (
    <div className="text-center p-10 border rounded-md">
      <FileSpreadsheet className="h-10 w-10 text-gray-400 mx-auto" />
      <h3 className="mt-4 text-lg font-medium">Nenhuma planilha encontrada</h3>
      <p className="mt-1 text-muted-foreground">
        Comece adicionando uma nova planilha financeira.
      </p>
      <Button onClick={onCreateClick} className="mt-4">
        Adicionar Planilha
      </Button>
    </div>
  );
};

export default EmptyState;
