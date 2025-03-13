
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, PlusCircle, Edit, Trash2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import QuizForm from "@/components/quiz/QuizForm";
import { useQuiz, useQuizQuestions } from "@/hooks/use-quizzes";
import { useUserProfile } from "@/hooks/use-user-profile";
import { toast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { addQuizQuestion, updateQuizQuestion, deleteQuizQuestion } from "@/services/quiz/QuizService";
import { QuizQuestion } from "@/types/quiz";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import QuestionForm from "@/components/quiz/QuestionForm";

const QuizEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { quizId } = useParams<{ quizId: string }>();
  const { data: quiz, isLoading: quizLoading, error } = useQuiz(quizId);
  const { data: questions, isLoading: questionsLoading, refetch: refetchQuestions } = useQuizQuestions(quizId);
  const { userRole, isLoading: profileLoading } = useUserProfile();
  
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null);

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

  const handleAddQuestion = async (questionData: Omit<QuizQuestion, 'id' | 'created_at' | 'updated_at'>) => {
    if (!quizId) return;
    
    try {
      // Set question order to be the last one
      questionData.question_order = questions?.length || 0;
      
      await addQuizQuestion({
        ...questionData,
        quiz_id: quizId,
        question_type: questionData.question_type as "multiple_choice" | "true_false"
      });
      
      toast({
        title: "Pergunta adicionada",
        description: "Uma nova pergunta foi adicionada ao quiz."
      });
      
      setIsAddingQuestion(false);
      refetchQuestions();
    } catch (error) {
      console.error("Error adding question:", error);
      toast({
        title: "Erro ao adicionar pergunta",
        description: "Não foi possível adicionar a pergunta ao quiz.",
        variant: "destructive",
      });
    }
  };

  const handleEditQuestion = async (questionData: Omit<QuizQuestion, 'id' | 'created_at' | 'updated_at'>) => {
    if (!editingQuestion?.id) return;
    
    try {
      await updateQuizQuestion(editingQuestion.id, {
        ...questionData,
        question_type: questionData.question_type as "multiple_choice" | "true_false"
      });
      
      toast({
        title: "Pergunta atualizada",
        description: "A pergunta foi atualizada com sucesso."
      });
      
      setEditingQuestion(null);
      refetchQuestions();
    } catch (error) {
      console.error("Error updating question:", error);
      toast({
        title: "Erro ao atualizar pergunta",
        description: "Não foi possível atualizar a pergunta.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteQuestion = async () => {
    if (!questionToDelete) return;
    
    try {
      await deleteQuizQuestion(questionToDelete);
      
      toast({
        title: "Pergunta excluída",
        description: "A pergunta foi excluída com sucesso."
      });
      
      setQuestionToDelete(null);
      refetchQuestions();
    } catch (error) {
      console.error("Error deleting question:", error);
      toast({
        title: "Erro ao excluir pergunta",
        description: "Não foi possível excluir a pergunta.",
        variant: "destructive",
      });
    }
  };

  const cancelQuestionEditing = () => {
    setIsAddingQuestion(false);
    setEditingQuestion(null);
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
              {!isAddingQuestion && !editingQuestion && (
                <Button 
                  onClick={() => setIsAddingQuestion(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Adicionar Pergunta
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {isAddingQuestion && (
                <div className="mb-8">
                  <QuestionForm 
                    quizId={quizId!} 
                    onSave={handleAddQuestion}
                    onCancel={cancelQuestionEditing}
                  />
                </div>
              )}
              
              {editingQuestion && (
                <div className="mb-8">
                  <QuestionForm 
                    quizId={quizId!} 
                    question={editingQuestion}
                    onSave={handleEditQuestion}
                    onCancel={cancelQuestionEditing}
                  />
                </div>
              )}
              
              {!isAddingQuestion && !editingQuestion && (
                <>
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
                          <TableHead className="w-32 text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {questions.map((question, idx) => (
                          <TableRow key={question.id}>
                            <TableCell>{idx + 1}</TableCell>
                            <TableCell>
                              <div className="font-medium truncate max-w-[300px]">
                                {question.question}
                              </div>
                            </TableCell>
                            <TableCell>
                              {question.question_type === 'multiple_choice' 
                                ? 'Múltipla escolha' 
                                : 'Verdadeiro/Falso'}
                            </TableCell>
                            <TableCell className="text-right">{question.points}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setEditingQuestion(question)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="text-red-500 hover:text-red-700"
                                  onClick={() => setQuestionToDelete(question.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-500 mb-4">Nenhuma pergunta cadastrada</p>
                      <Button 
                        onClick={() => setIsAddingQuestion(true)}
                        variant="outline"
                      >
                        Adicionar primeira pergunta
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={!!questionToDelete} onOpenChange={(open) => !open && setQuestionToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta pergunta? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDeleteQuestion}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default QuizEditPage;
