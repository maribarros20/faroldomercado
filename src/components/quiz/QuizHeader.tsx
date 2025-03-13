
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, ChevronLeft, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Quiz, QuizQuestion } from "@/types/quiz";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuizContext } from "./QuizContext";
import { formatTime, getDifficultyColor, getDifficultyLabel } from "./QuizUtils";

interface QuizHeaderProps {
  quiz: Quiz;
  questions: QuizQuestion[];
}

const QuizHeader: React.FC<QuizHeaderProps> = ({ quiz, questions }) => {
  const navigate = useNavigate();
  const { currentQuestion, elapsedTime } = useQuizContext();
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <Button variant="outline" size="sm" onClick={() => navigate('/quizzes')}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Voltar aos Quizzes
        </Button>
        
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium bg-gray-100 px-2 py-1 rounded-md text-gray-700">
            {formatTime(elapsedTime)}
          </span>
        </div>
      </div>

      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge 
                className={`${getDifficultyColor(quiz.difficulty)} hover:${getDifficultyColor(quiz.difficulty)}`}
                variant="default"
              >
                {getDifficultyLabel(quiz.difficulty)}
              </Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {quiz.category}
              </Badge>
            </div>
            <CardTitle className="text-xl">{quiz.title}</CardTitle>
            <CardDescription>{quiz.description}</CardDescription>
          </div>
          <div className="flex flex-col items-end">
            <Badge variant="outline" className="mb-2 font-semibold bg-blue-50 text-blue-700 border-blue-200">
              Pergunta {currentQuestion + 1} de {questions.length}
            </Badge>
            <div className="flex items-center text-sm text-gray-500">
              <Zap className="h-4 w-4 mr-1 text-amber-500" />
              Pontuação mínima: {quiz.passing_score}%
            </div>
          </div>
        </div>
        <Progress value={progress} className="h-2 mt-2 bg-gray-100" />
      </CardHeader>
    </>
  );
};

export default QuizHeader;
