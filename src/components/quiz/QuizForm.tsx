
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createQuiz, updateQuiz } from "@/services/quiz/QuizService";
import { Quiz } from "@/types/quiz";
import { Button } from "@/components/ui/button";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

// Zod schema for quiz validation
const quizSchema = z.object({
  title: z.string().min(1, "O título é obrigatório"),
  description: z.string().optional(),
  category: z.string().min(1, "A categoria é obrigatória"),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  passing_score: z.number().min(0).max(100),
  is_published: z.boolean().default(false),
});

type QuizFormValues = z.infer<typeof quizSchema>;

interface QuizFormProps {
  existingQuiz?: Quiz;
}

const QuizForm: React.FC<QuizFormProps> = ({ existingQuiz }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with existing quiz data or defaults
  const form = useForm<QuizFormValues>({
    resolver: zodResolver(quizSchema),
    defaultValues: {
      title: existingQuiz?.title || "",
      description: existingQuiz?.description || "",
      category: existingQuiz?.category || "",
      difficulty: existingQuiz?.difficulty || "beginner",
      passing_score: existingQuiz?.passing_score || 70,
      is_published: existingQuiz?.is_published || false,
    },
  });

  const createQuizMutation = useMutation({
    mutationFn: createQuiz,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      toast({
        title: "Quiz criado com sucesso!",
        description: "Agora você pode adicionar perguntas ao seu quiz.",
      });
      navigate(`/quizzes/${data.id}/edit`);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar quiz",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateQuizMutation = useMutation({
    mutationFn: (values: QuizFormValues) => 
      updateQuiz(existingQuiz!.id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      queryClient.invalidateQueries({ queryKey: ['quiz', existingQuiz?.id] });
      toast({
        title: "Quiz atualizado com sucesso!",
        description: "As alterações foram salvas.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar quiz",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (values: QuizFormValues) => {
    setIsSubmitting(true);
    try {
      const { data } = await supabase.auth.getSession();
      
      if (!data.session) {
        toast({
          title: "Erro de autenticação",
          description: "Você precisa estar autenticado para criar um quiz.",
          variant: "destructive",
        });
        return;
      }

      if (existingQuiz) {
        await updateQuizMutation.mutateAsync(values);
      } else {
        await createQuizMutation.mutateAsync({
          ...values,
          created_by: data.session.user.id,
        });
      }
    } catch (error) {
      console.error("Error submitting quiz:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{existingQuiz ? "Editar Quiz" : "Criar Novo Quiz"}</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite o título do quiz" {...field} />
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
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Digite uma descrição para o quiz" 
                      {...field} 
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite a categoria do quiz" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="difficulty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dificuldade</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a dificuldade" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="beginner">Iniciante</SelectItem>
                      <SelectItem value="intermediate">Intermediário</SelectItem>
                      <SelectItem value="advanced">Avançado</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="passing_score"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pontuação para aprovação (%)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="0" 
                      max="100" 
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                    />
                  </FormControl>
                  <FormDescription>
                    Porcentagem mínima para o usuário ser aprovado no quiz.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_published"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Publicar Quiz</FormLabel>
                    <FormDescription>
                      Tornar este quiz visível para os usuários.
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
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : existingQuiz ? "Salvar Alterações" : "Criar Quiz"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default QuizForm;
