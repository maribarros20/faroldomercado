
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { FinanceIframe, FinanceIframeInput } from "@/services/FinanceIframeService";

const formSchema = z.object({
  title: z.string().min(3, "O título deve ter pelo menos 3 caracteres"),
  description: z.string().optional(),
  iframe_url: z.string().url("URL inválida"),
  plan_id: z.string().optional(),
  mentor_id: z.string().optional(),
  is_active: z.boolean().default(true)
});

type FormValues = z.infer<typeof formSchema>;

type FinanceIframeFormProps = {
  onSubmit: (values: FormValues) => void;
  onCancel: () => void;
  selectedIframe: FinanceIframe | null;
  plans: { id: string; name: string }[];
  mentors: { id: string; name: string }[];
  isSubmitting: boolean;
};

const FinanceIframeForm: React.FC<FinanceIframeFormProps> = ({
  onSubmit,
  onCancel,
  selectedIframe,
  plans,
  mentors,
  isSubmitting
}) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: selectedIframe?.title || "",
      description: selectedIframe?.description || "",
      iframe_url: selectedIframe?.iframe_url || "",
      plan_id: selectedIframe?.plan_id || undefined,
      mentor_id: selectedIframe?.mentor_id || undefined,
      is_active: selectedIframe?.is_active !== false
    }
  });

  // Reset form when selectedIframe changes
  useEffect(() => {
    form.reset({
      title: selectedIframe?.title || "",
      description: selectedIframe?.description || "",
      iframe_url: selectedIframe?.iframe_url || "",
      plan_id: selectedIframe?.plan_id || undefined,
      mentor_id: selectedIframe?.mentor_id || undefined,
      is_active: selectedIframe?.is_active !== false
    });
  }, [selectedIframe, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input placeholder="Digite o título da planilha" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição (opcional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Descreva brevemente esta planilha" 
                  {...field} 
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="iframe_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL do iframe</FormLabel>
              <FormControl>
                <Input placeholder="https://..." {...field} />
              </FormControl>
              <FormDescription>
                URL completa do iframe que será incorporado (ex: Google Sheets, Notion, etc).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="plan_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Plano (opcional)</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || ""}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um plano" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="null">Todos os planos</SelectItem>
                    {plans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Se não selecionar, estará disponível para todos os planos
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="mentor_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mentor (opcional)</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || ""}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um mentor" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="null">Todos os mentores</SelectItem>
                    {mentors.map((mentor) => (
                      <SelectItem key={mentor.id} value={mentor.id}>
                        {mentor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Se não selecionar, estará disponível para todos os mentores
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Ativo</FormLabel>
                <FormDescription>
                  Determina se esta planilha está disponível para os usuários
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
          >
            Cancelar
          </Button>
          <Button 
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting && <Spinner className="mr-2" />}
            {selectedIframe ? "Atualizar" : "Criar"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default FinanceIframeForm;
