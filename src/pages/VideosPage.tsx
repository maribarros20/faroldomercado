import React, { useState, useEffect } from "react";
import VideosView from "@/components/videos/VideosView";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const VideosPage = () => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Handle back button click
  const handleGoBack = () => {
    // If there's a previous page in history, go back to it
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      // Default fallback to dashboard if no history
      navigate('/dashboard');
    }
  };

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error checking authentication:", error);
          setHasError(true);
          toast({
            title: "Erro na autenticação",
            description: "Não foi possível verificar sua sessão. Por favor, faça login novamente.",
            variant: "destructive"
          });
          return;
        }
        
        if (!data.session) {
          // User is not authenticated, redirect to login
          window.location.href = "/auth";
          return;
        }
        
        // User is authenticated, continue loading
        setIsLoading(false);
      } catch (error) {
        console.error("Error in auth check:", error);
        setHasError(true);
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [toast]);

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

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center">
        <div className="text-center">
          <Spinner size="lg" className="mb-4" />
          <p>Carregando vídeos...</p>
        </div>
      </div>
    );
  }

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
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleGoBack}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Vídeos</h1>
        </div>
        <VideosView />
      </div>
    </div>
  );
};

export default VideosPage;
