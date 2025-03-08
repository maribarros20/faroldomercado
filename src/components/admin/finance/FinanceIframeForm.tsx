
import React, { useEffect, useState } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

// Modified schema to accept Google Sheets iframe URLs (including those with &amp; in them)
const formSchema = z.object({
  title: z.string().min(3, "O título deve ter pelo menos 3 caracteres"),
  description: z.string().optional(),
  iframe_url: z.string().min(5, "URL inválida"),
  plan_id: z.string().optional(),
  mentor_id: z.string().optional(),
  account_type: z.enum(["trader", "aluno"]).default("trader"),
  is_active: z.boolean().default(true)
});

type FormValues = z.infer<typeof formSchema>;

type FinanceIframeFormProps = {
  onSubmit: (values: FormValues) => void;
  onCancel: () => void;
  selectedIframe: FinanceIframe | null;
  plans: { id: string; name: string; is_mentor_plan?: boolean }[];
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
  const [selectedAccountType, setSelectedAccountType] = useState<string>("trader");
  const [filteredPlans, setFilteredPlans] = useState<{ id: string; name: string }[]>([]);
  const [selectedMentorId, setSelectedMentorId] = useState<string | undefined>(undefined);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: selectedIframe?.title || "",
      description: selectedIframe?.description || "",
      iframe_url: selectedIframe?.iframe_url || "",
      plan_id: selectedIframe?.plan_id || undefined,
      mentor_id: selectedIframe?.mentor_id || undefined,
      account_type: "trader",
      is_active: selectedIframe?.is_active !== false
    }
  });

  useEffect(() => {
    const accountType = selectedIframe?.mentor_id ? "aluno" : "trader";
    setSelectedAccountType(accountType);
    setSelectedMentorId(selectedIframe?.mentor_id);
    
    form.reset({
      title: selectedIframe?.title || "",
      description: selectedIframe?.description || "",
      iframe_url: selectedIframe?.iframe_url || "",
      plan_id: selectedIframe?.plan_id || undefined,
      mentor_id: selectedIframe?.mentor_id || undefined,
      account_type: accountType,
      is_active: selectedIframe?.is_active !== false
    });
  }, [selectedIframe, form]);

  const handleAccountTypeChange = (type: string) => {
    setSelectedAccountType(type);
    form.setValue("account_type", type as "trader" | "aluno");
    form.setValue("mentor_id", undefined);
    form.setValue("plan_id", undefined);
  };

  const handleMentorChange = async (mentorId: string) => {
    setSelectedMentorId(mentorId);
    form.setValue("mentor_id", mentorId);
    form.setValue("plan_id", undefined);
    
    if (mentorId && mentorId !== "null") {
      try {
        const { data, error } = await supabase
          .from('plans')
          .select('id, name')
          .eq('mentor_id', mentorId)
          .eq('is_active', true);
          
        if (error) throw error;
        setFilteredPlans(data || []);
      } catch (error) {
        console.error('Erro ao buscar planos do mentor:', error);
        setFilteredPlans([]);
      }
    } else {
      setFilteredPlans([]);
    }
  };

  const onValidSubmit = (values: FormValues) => {
    if (values.account_type === "aluno" && !values.mentor_id) {
      form.setError("mentor_id", {
        type: "manual",
        message: "Para planilhas de aluno, é necessário selecionar um mentor."
      });
      return;
    }
    
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onValidSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="account_type"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>Tipo de Conta</FormLabel>
              <RadioGroup
                onValueChange={(value) => handleAccountTypeChange(value)}
                defaultValue={field.value}
                value={field.value}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="trader" id="trader-account" />
                  <Label htmlFor="trader-account">Trader</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="aluno" id="student-account" />
                  <Label htmlFor="student-account">Aluno</Label>
                </div>
              </RadioGroup>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedAccountType === "aluno" && (
          <FormField
            control={form.control}
            name="mentor_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mentor</FormLabel>
                <Select
                  onValueChange={(value) => handleMentorChange(value)}
                  value={field.value || ""}
                  required={selectedAccountType === "aluno"}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um mentor" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {mentors.map((mentor) => (
                      <SelectItem key={mentor.id} value={mentor.id}>
                        {mentor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Para planilhas de aluno, é necessário selecionar um mentor
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

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

        <FormField
          control={form.control}
          name="plan_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Plano (opcional)</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value || ""}
                disabled={selectedAccountType === "aluno" && !selectedMentorId}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um plano" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="null">Todos os planos</SelectItem>
                  {selectedAccountType === "aluno" && selectedMentorId
                    ? filteredPlans.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.name}
                        </SelectItem>
                      ))
                    : plans
                        .filter(plan => !plan.is_mentor_plan)
                        .map((plan) => (
                          <SelectItem key={plan.id} value={plan.id}>
                            {plan.name}
                          </SelectItem>
                        ))
                  }
                </SelectContent>
              </Select>
              <FormDescription>
                {selectedAccountType === "aluno"
                  ? "Selecione um plano específico do mentor ou deixe em branco para todos os planos"
                  : "Se não selecionar, estará disponível para todos os planos de trader"}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

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
