
import React, { useState, useEffect } from "react";
import VideosView from "@/components/videos/VideosView";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

const VideosPage = () => {
  const [hasError, setHasError] = useState(false);
  const { toast } = useToast();

  // Error boundary to catch rendering errors
  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error("Caught runtime error:", error);
      setHasError(true);
      toast({
        title: "Erro na aplicação",
        description: "Ocorreu um erro ao carregar os vídeos. Por favor, tente novamente mais tarde.",
        variant: "destructive"
      });
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, [toast]);

  if (hasError) {
    return (
      <div className="container mx-auto py-8">
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Erro ao carregar</h2>
          <p className="mb-4">Não foi possível carregar a página de vídeos. Por favor, tente novamente mais tarde.</p>
          <button 
            className="bg-primary text-white px-4 py-2 rounded"
            onClick={() => window.location.reload()}
          >
            Tentar novamente
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto animate-fade-in">
      <VideosView />
    </div>
  );
};

export default VideosPage;
