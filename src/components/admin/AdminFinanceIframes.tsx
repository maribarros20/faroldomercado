
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Plus } from "lucide-react";
import { useFinanceIframes } from "@/hooks/useFinanceIframes";
import FinanceIframeForm from "./finance/FinanceIframeForm";
import FinanceIframeList from "./finance/FinanceIframeList";
import EmptyState from "./finance/EmptyState";
import { useToast } from "@/hooks/use-toast";

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
  } = useFinanceIframes();

  const { toast } = useToast();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 bg-red-50 text-red-500 rounded-md">
        Erro ao carregar iframes financeiros. Por favor, tente novamente.
      </div>
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
        <Button onClick={handleCreate} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Adicionar Planilha
        </Button>
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
