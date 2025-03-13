
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, PlusCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import QuizForm from "@/components/quiz/QuizForm";
import { useQuiz, useQuizQuestions } from "@/hooks/use-quizzes";
import { useUserProfile } from "@/hooks/use-user-profile";
import { toast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { addQuizQuestion } from "@/services/quiz/QuizService";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

const QuizEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { quizId } = useParams<{ quizId: string }>();
  const { data: quiz, isLoading: quizLoading, error } = useQuiz(quizId);
  const { data: questions, isLoading: questionsLoading } = useQuizQuestions(quizId);
  const { userRole, isLoading: profileLoading } = useUserProfile();
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);

  useEffect(() => {
    if (!profileLoading && userRole !== 'admin') {
      toast({
        title: "Acesso negado",
        description: "Você não tem permissão para editar quizzes.",
        variant: "destructive",
      });
      navigate('/quizzes');
    }
  }, [userRole, profileLoading, navigate]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Erro ao carregar quiz",
        description: "Não foi possível carregar as informações do quiz.",
        variant: "destructive",
      });
      navigate('/quizzes');
    }
  }, [error, navigate]);

  const handleAddQuestion = async () => {
    if (!quizId) return;
    
    try {
      const newQuestion = {
        quiz_id: quizId,
        question: "Nova pergunta",
        question_type: "multiple_choice",
        options: ["Opção 1", "Opção 2", "Opção 3", "Opção 4"],
        correct_answer: "Opção 1",
        explanation: "Explicação da resposta correta",
        points: 1,
        question_order: questions?.length || 0
      };
      
      await addQuizQuestion(newQuestion);
      toast({
        title: "Pergunta adicionada",
        description: "Uma nova pergunta foi adicionada ao quiz."
      });
      
      // Refresh questions data
      window.location.reload();
    } catch (error) {
      console.error("Error adding question:", error);
      toast({
        title: "Erro ao adicionar pergunta",
        description: "Não foi possível adicionar a pergunta ao quiz.",
        variant: "destructive",
      });
    }
  };

  if (profileLoading || quizLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center gap-4 mb-8">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-8 w-48" />
          </div>
          <Skeleton className="h-[400px] w-full rounded-md" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/quizzes')}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Editar Quiz</h1>
        </div>
        
        <div className="space-y-8">
          {quiz && <QuizForm existingQuiz={quiz} />}
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Perguntas</CardTitle>
              <Button 
                onClick={handleAddQuestion}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar Pergunta
              </Button>
            </CardHeader>
            <CardContent>
              {questionsLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : questions && questions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Pergunta</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="w-24 text-right">Pontos</TableHead>
                      <TableHead className="w-24 text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {questions.map((question, idx) => (
                      <TableRow key={question.id}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>{question.question}</TableCell>
                        <TableCell>
                          {question.question_type === 'multiple_choice' 
                            ? 'Múltipla escolha' 
                            : 'Verdadeiro/Falso'}
                        </TableCell>
                        <TableCell className="text-right">{question.points}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/quizzes/${quizId}/questions/${question.id}/edit`)}
                          >
                            Editar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">Nenhuma pergunta cadastrada</p>
                  <Button 
                    onClick={handleAddQuestion}
                    variant="outline"
                  >
                    Adicionar primeira pergunta
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default QuizEditPage;
