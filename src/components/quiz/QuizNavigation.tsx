
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { QuizQuestion } from "@/types/quiz";
import { motion } from "framer-motion";
import { useQuizContext } from "./QuizContext";

interface QuizNavigationProps {
  questions: QuizQuestion[];
}

const QuizNavigation: React.FC<QuizNavigationProps> = ({ questions }) => {
  const { currentQuestion, setCurrentQuestion, answers } = useQuizContext();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <div className={`h-3 w-3 rounded-full ${answers.length === questions.length ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                <span className="text-sm text-gray-600">
                  {answers.length} de {questions.length} respondidas
                </span>
              </div>
            </div>
            
            <div className="flex gap-2">
              {Array.from({ length: questions.length }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestion(index)}
                  className={`h-7 w-7 rounded-full text-xs flex items-center justify-center
                    ${currentQuestion === index 
                      ? 'bg-blue-600 text-white' 
                      : answers.some(a => a.question_id === questions[index].id)
                        ? 'bg-green-100 text-green-700 border border-green-300' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default QuizNavigation;
