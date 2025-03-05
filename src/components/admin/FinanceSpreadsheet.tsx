
import React, { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

const FinanceSpreadsheet = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const refreshIntervalRef = useRef<number | null>(null);

  // Função para atualizar o iframe
  const refreshIframe = () => {
    if (iframeRef.current) {
      // Adicionar timestamp para evitar cache
      const timestamp = new Date().getTime();
      const currentSrc = iframeRef.current.src;
      const baseUrl = currentSrc.split('?')[0];
      
      // Atualizar o src do iframe
      iframeRef.current.src = `${baseUrl}?timestamp=${timestamp}`;
      
      toast({
        title: "Planilha atualizada",
        description: "A planilha financeira foi atualizada com sucesso",
      });
    }
  };

  // Configurar a atualização automática a cada 5 minutos
  useEffect(() => {
    // Atualizar imediatamente ao montar o componente
    refreshIframe();
    
    // Configurar intervalo para atualização a cada 5 minutos
    refreshIntervalRef.current = window.setInterval(() => {
      refreshIframe();
    }, 5 * 60 * 1000); // 5 minutos em milissegundos
    
    // Limpar o intervalo quando o componente for desmontado
    return () => {
      if (refreshIntervalRef.current !== null) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Planilha Financeira</h2>
          <p className="text-muted-foreground">
            Visualize dados financeiros em tempo real
          </p>
        </div>
        <Button 
          onClick={refreshIframe} 
          variant="outline" 
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Atualizar Agora
        </Button>
      </div>
      
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="w-full overflow-auto">
            <iframe 
              ref={iframeRef}
              src="https://docs.google.com/spreadsheets/d/e/2PACX-1vS6m3cCvBxXqCkVjpWyg73Q426GFTHnmVq7tEZ-G4X4XBe6rg-5_eU8Z-574HOEo1qqyhS0dwWJVVIR/pubhtml?gid=2095335592&amp;single=true&amp;widget=true&amp;headers=false"
              width="100%" 
              height="1300"
              frameBorder="0"
              title="Planilha Financeira"
              className="min-w-full"
            ></iframe>
          </div>
        </CardContent>
      </Card>
      
      <div className="text-sm text-muted-foreground text-center">
        A planilha será atualizada automaticamente a cada 5 minutos
      </div>
    </div>
  );
};

export default FinanceSpreadsheet;
