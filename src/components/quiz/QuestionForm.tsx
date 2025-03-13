
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { QuizQuestion } from "@/types/quiz";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Plus } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

// Zod schema for question validation
const questionSchema = z.object({
  question: z.string().min(1, "A pergunta é obrigatória"),
  question_type: z.enum(["multiple_choice", "true_false"]),
  options: z.array(z.string()).optional(),
  correct_answer: z.string().min(1, "A resposta correta é obrigatória"),
  explanation: z.string().optional(),
  points: z.number().min(1).max(100),
});

type QuestionFormValues = z.infer<typeof questionSchema>;

interface QuestionFormProps {
  quizId: string;
  question?: QuizQuestion;
  onSave: (question: any) => Promise<void>;
  onCancel: () => void;
}

const QuestionForm: React.FC<QuestionFormProps> = ({
  quizId,
  question,
  onSave,
  onCancel,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [options, setOptions] = useState<string[]>(
    question?.options || ["", "", "", ""]
  );

  const getDefaultTrueFalseOptions = () => ["Verdadeiro", "Falso"];

  // Initialize form with existing question data or defaults
  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      question: question?.question || "",
      question_type: question?.question_type || "multiple_choice",
      options: question?.options || ["", "", "", ""],
      correct_answer: question?.correct_answer || "",
      explanation: question?.explanation || "",
      points: question?.points || 1,
    },
  });

  // Watch for question type changes to update options
  const questionType = form.watch("question_type");
  
  useEffect(() => {
    if (questionType === "true_false") {
      const trueFalseOptions = getDefaultTrueFalseOptions();
      setOptions(trueFalseOptions);
      form.setValue("options", trueFalseOptions);
    } else if (questionType === "multiple_choice" && options.length === 2) {
      // If switching from true/false to multiple choice, reset options
      const defaultOptions = ["", "", "", ""];
      setOptions(defaultOptions);
      form.setValue("options", defaultOptions);
    }
  }, [questionType, form]);

  const handleAddOption = () => {
    if (options.length < 10) {
      const newOptions = [...options, ""];
      setOptions(newOptions);
      form.setValue("options", newOptions);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = [...options];
      newOptions.splice(index, 1);
      setOptions(newOptions);
      form.setValue("options", newOptions);
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
    form.setValue("options", newOptions);
  };

  const onSubmit = async (values: QuestionFormValues) => {
    setIsSubmitting(true);
    try {
      const questionData = {
        ...values,
        quiz_id: quizId,
        question_order: question?.question_order || 0,
      };
      
      await onSave(questionData);
      toast({
        title: "Pergunta salva",
        description: "A pergunta foi salva com sucesso.",
      });
    } catch (error) {
      console.error("Error saving question:", error);
      toast({
        title: "Erro ao salvar pergunta",
        description: "Ocorreu um erro ao salvar a pergunta.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>{question ? "Editar Pergunta" : "Nova Pergunta"}</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="question"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pergunta</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Digite a pergunta"
                      {...field}
                      className="min-h-[80px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="question_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Pergunta</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="multiple_choice">Múltipla Escolha</SelectItem>
                      <SelectItem value="true_false">Verdadeiro/Falso</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {questionType === "multiple_choice" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <FormLabel>Opções</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddOption}
                    disabled={options.length >= 10}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Opção
                  </Button>
                </div>
                
                {options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="flex-1">
                      <Input
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        placeholder={`Opção ${index + 1}`}
                      />
                    </div>
                    {options.length > 2 && questionType === "multiple_choice" && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveOption(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}

            <FormField
              control={form.control}
              name="correct_answer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resposta Correta</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a resposta correta" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {options.map((option, index) => (
                        <SelectItem key={index} value={option} disabled={!option.trim()}>
                          {option || `Opção ${index + 1} (vazia)`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="explanation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Explicação (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Explique por que esta é a resposta correta"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormDescription>
                    Uma explicação que será mostrada após o usuário responder.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="points"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pontos</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      max="100"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                    />
                  </FormControl>
                  <FormDescription>
                    Valor desta questão em pontos.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar Pergunta"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default QuestionForm;
