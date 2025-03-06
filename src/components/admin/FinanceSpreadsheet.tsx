
import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { getFinanceIframesByPlanId } from "@/services/FinanceIframeService";
import { Spinner } from "@/components/ui/spinner";

type FinanceSpreadsheetProps = {
  spreadsheetUrl?: string;
  planId?: string;
};

const FinanceSpreadsheet = ({ spreadsheetUrl, planId }: FinanceSpreadsheetProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const refreshIntervalRef = useRef<number | null>(null);
  const [iframeUrl, setIframeUrl] = useState<string | undefined>(spreadsheetUrl);
  const { toast } = useToast();

  const defaultUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS6m3cCvBxXqCkVjpWyg73Q426GFTHnmVq7tEZ-G4X4XBe6rg-5_eU8Z-574HOEo1qqyhS0dwWJVVIR/pubhtml?gid=2095335592&amp;single=true&amp;widget=true&amp;headers=false";

  // Buscar iframe configurado para o plano do usuário, se houver planId
  const { data: planIframes, isLoading } = useQuery({
    queryKey: ['finance-iframes', planId],
    queryFn: () => planId ? getFinanceIframesByPlanId(planId) : Promise.resolve([]),
    enabled: !!planId,
  });

  // Definir URL do iframe com base no plano ou URL padrão
  useEffect(() => {
    if (planIframes && planIframes.length > 0) {
      setIframeUrl(planIframes[0].iframe_url);
    } else if (spreadsheetUrl) {
      setIframeUrl(spreadsheetUrl);
    } else {
      setIframeUrl(defaultUrl);
    }
  }, [planIframes, spreadsheetUrl]);

  // Função para atualizar o iframe
  const refreshIframe = () => {
    if (iframeRef.current && iframeUrl) {
      // Adicionar timestamp para evitar cache
      const timestamp = new Date().getTime();
      
      // Atualizar src do iframe
      if (iframeRef.current.src.includes('?')) {
        const baseUrl = iframeRef.current.src.split('?')[0];
        iframeRef.current.src = `${baseUrl}?timestamp=${timestamp}`;
      } else {
        iframeRef.current.src = `${iframeRef.current.src}?timestamp=${timestamp}`;
      }
      
      toast({
        title: "Planilha atualizada",
        description: "A planilha financeira foi atualizada com sucesso",
      });
    }
  };

  // Configurar atualização automática a cada 5 minutos
  useEffect(() => {
    // Atualizar imediatamente quando o componente é montado
    if (iframeUrl) {
      const timer = setTimeout(() => {
        refreshIframe();
      }, 500); // Pequeno atraso para garantir que o iframe já está no DOM
      
      // Configurar intervalo para atualizar a cada 5 minutos
      refreshIntervalRef.current = window.setInterval(() => {
        refreshIframe();
      }, 5 * 60 * 1000); // 5 minutos em milissegundos
      
      return () => {
        clearTimeout(timer);
        if (refreshIntervalRef.current !== null) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    }
  }, [iframeUrl]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

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
            {iframeUrl && (
              <iframe 
                ref={iframeRef}
                src={iframeUrl}
                width="100%" 
                height="1300"
                frameBorder="0"
                title="Planilha Financeira"
                className="min-w-full"
              ></iframe>
            )}
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
