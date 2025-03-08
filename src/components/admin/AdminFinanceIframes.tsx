
import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Plus, AlertCircle, RefreshCw } from "lucide-react";
import { useFinanceIframes } from "@/hooks/useFinanceIframes";
import FinanceIframeForm from "./finance/FinanceIframeForm";
import FinanceIframeList from "./finance/FinanceIframeList";
import EmptyState from "./finance/EmptyState";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";

const AdminFinanceIframes = () => {
  const {
    iframes,
    isLoading,
    isError,
    plans,
    mentors,
    isDialogOpen,
    setIsDialogOpen,
    selectedIframe,
    isSubmitting,
    handleCreate,
    handleEdit,
    handleDelete,
    handleSubmit,
    handleCancel,
    handlePreview,
    refetch
  } = useFinanceIframes();

  const { toast } = useToast();

  // Verificar sessão quando o componente é montado
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await fetch('/auth/session').then(res => res.json());
        if (!data || !data.session) {
          toast({
            title: "Sessão expirada",
            description: "Sua sessão expirou. Por favor, faça login novamente.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Erro ao verificar sessão:", error);
      }
    };

    checkSession();
  }, [toast]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <h3 className="text-lg font-medium">Erro ao carregar iframes financeiros</h3>
          <p className="text-muted-foreground">
            Ocorreu um erro ao carregar as planilhas financeiras. Isso pode ser devido a um problema de permissão.
          </p>
          <Button onClick={() => refetch()} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Tentar novamente
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Planilhas Financeiras</h2>
          <p className="text-muted-foreground">
            Gerencie as planilhas financeiras que serão exibidas para os usuários de acordo com seu plano
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleCreate} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Adicionar Planilha
          </Button>
          <Button 
            onClick={() => refetch()} 
            variant="outline" 
            className="flex items-center gap-2 hover:bg-[#e6f0ff] hover:text-[#0066FF]"
          >
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
        </div>
      </div>

      {iframes && iframes.length > 0 ? (
        <FinanceIframeList 
          iframes={iframes} 
          onEdit={handleEdit} 
          onDelete={handleDelete}
          onPreview={handlePreview}
        />
      ) : (
        <EmptyState onCreateClick={handleCreate} />
      )}

      {/* Modal de criação/edição */}
      <Dialog 
        open={isDialogOpen} 
        onOpenChange={(open) => {
          if (!open) {
            handleCancel();
          }
          setIsDialogOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>
              {selectedIframe ? "Editar Planilha Financeira" : "Nova Planilha Financeira"}
            </DialogTitle>
            <DialogDescription>
              {selectedIframe
                ? "Atualize os detalhes da planilha financeira abaixo."
                : "Preencha os detalhes da nova planilha financeira."}
            </DialogDescription>
          </DialogHeader>

          <FinanceIframeForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            selectedIframe={selectedIframe}
            plans={plans}
            mentors={mentors}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminFinanceIframes;
