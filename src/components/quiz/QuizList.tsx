
import React from "react";
import { useQuizzes, useUserQuizAttempts } from "@/hooks/use-quizzes";
import QuizCard from "./QuizCard";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

const QuizList: React.FC = () => {
  const { data: quizzes, isLoading } = useQuizzes();
  const { data: attempts } = useUserQuizAttempts();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState<string>("");
  const [difficultyFilter, setDifficultyFilter] = React.useState<string>("");

  // Extract unique categories from quizzes
  const categories = quizzes 
    ? Array.from(new Set(quizzes.map(quiz => quiz.category)))
    : [];

  const filteredQuizzes = React.useMemo(() => {
    if (!quizzes) return [];
    
    return quizzes.filter(quiz => {
      const matchesSearch = searchTerm === "" || 
        quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (quiz.description?.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = categoryFilter === "" || quiz.category === categoryFilter;
      const matchesDifficulty = difficultyFilter === "" || quiz.difficulty === difficultyFilter;
      
      return matchesSearch && matchesCategory && matchesDifficulty && quiz.is_published;
    });
  }, [quizzes, searchTerm, categoryFilter, difficultyFilter]);

  const getLatestAttempt = (quizId: string) => {
    if (!attempts) return undefined;
    return attempts.find(attempt => attempt.quiz_id === quizId);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-40 w-full rounded-md" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
        <div className="md:col-span-6">
          <Input
            placeholder="Buscar quiz..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        
        <div className="md:col-span-3">
          <Select
            value={categoryFilter}
            onValueChange={setCategoryFilter}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todas as categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas as categorias</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="md:col-span-3">
          <Select
            value={difficultyFilter}
            onValueChange={setDifficultyFilter}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todas as dificuldades" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas as dificuldades</SelectItem>
              <SelectItem value="beginner">Iniciante</SelectItem>
              <SelectItem value="intermediate">Intermediário</SelectItem>
              <SelectItem value="advanced">Avançado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredQuizzes.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-3xl">📚</div>
          <h3 className="text-lg font-medium mt-2">Nenhum quiz encontrado</h3>
          <p className="text-muted-foreground mt-1">
            Tente ajustar seus filtros ou volte mais tarde.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredQuizzes.map((quiz) => (
            <QuizCard 
              key={quiz.id} 
              quiz={quiz} 
              latestAttempt={getLatestAttempt(quiz.id)} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default QuizList;
