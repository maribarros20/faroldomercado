
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useQuizzes } from "@/hooks/use-quizzes";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteQuiz } from "@/services/quiz/QuizService";
import { toast } from "@/components/ui/use-toast";

const AdminQuizzes: React.FC = () => {
  const navigate = useNavigate();
  const { data: quizzes, isLoading } = useQuizzes();
  const [quizToDelete, setQuizToDelete] = useState<string | null>(null);
  const queryClient = useQueryClient();
  
  const deleteMutation = useMutation({
    mutationFn: deleteQuiz,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      toast({
        title: "Quiz excluído",
        description: "O quiz foi excluído com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir quiz",
        description: error.message || "Ocorreu um erro ao excluir o quiz",
        variant: "destructive",
      });
    },
  });

  const handleDeleteQuiz = async () => {
    if (quizToDelete) {
      await deleteMutation.mutateAsync(quizToDelete);
      setQuizToDelete(null);
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Iniciante</Badge>;
      case 'intermediate':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Intermediário</Badge>;
      case 'advanced':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Avançado</Badge>;
      default:
        return <Badge>{difficulty}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between">
          <h2 className="text-xl font-bold">Quizzes</h2>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-2">
          {Array(5).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Quizzes</h2>
        <Button onClick={() => navigate('/quizzes/create')} className="bg-blue-600 hover:bg-blue-700">
          <PlusCircle className="mr-2 h-4 w-4" />
          Criar Novo Quiz
        </Button>
      </div>

      {quizzes?.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-lg text-gray-500">Nenhum quiz encontrado</p>
          <Button 
            onClick={() => navigate('/quizzes/create')} 
            variant="outline" 
            className="mt-4"
          >
            Criar primeiro quiz
          </Button>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Título</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Dificuldade</TableHead>
                <TableHead>Pontuação Aprovação</TableHead>
                <TableHead>Publicado</TableHead>
                <TableHead>Data de Criação</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quizzes?.map((quiz) => (
                <TableRow key={quiz.id}>
                  <TableCell className="font-medium">{quiz.title}</TableCell>
                  <TableCell>{quiz.category}</TableCell>
                  <TableCell>{getDifficultyBadge(quiz.difficulty)}</TableCell>
                  <TableCell>{quiz.passing_score}%</TableCell>
                  <TableCell>
                    <Badge variant={quiz.is_published ? "default" : "outline"}>
                      {quiz.is_published ? "Sim" : "Não"}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(new Date(quiz.created_at), 'dd/MM/yyyy')}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => navigate(`/quizzes/${quiz.id}/edit`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="text-red-500 hover:text-red-700"
                        onClick={() => setQuizToDelete(quiz.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog open={!!quizToDelete} onOpenChange={(open) => !open && setQuizToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este quiz? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDeleteQuiz}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminQuizzes;
