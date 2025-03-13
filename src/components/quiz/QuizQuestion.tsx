
import React from "react";
import { motion } from "framer-motion";
import { QuizQuestion as QuizQuestionType } from "@/types/quiz";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, Brain, AlertCircle } from "lucide-react";
import { useQuizContext } from "./QuizContext";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface QuizQuestionProps {
  question: QuizQuestionType;
}

const QuizQuestion: React.FC<QuizQuestionProps> = ({ question }) => {
  const { handleAnswerChange, getCurrentAnswer, showHint, setShowHint } = useQuizContext();

  const handleToggleHint = () => {
    setShowHint(!showHint);
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">{question.question}</h3>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-blue-50 border-blue-200">
            <Brain className="h-3.5 w-3.5 mr-1 text-blue-600" />
            <span className="text-blue-700">{question.points} pontos</span>
          </Badge>
          
          {question.explanation && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="p-1 hover:bg-blue-50"
                    onClick={handleToggleHint}
                  >
                    <HelpCircle className="h-4 w-4 text-blue-600" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Mostrar dica</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
      
      {showHint && question.explanation && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.3 }}
          className="bg-blue-50 border border-blue-200 p-3 rounded-md mb-4"
        >
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-800 mb-1">Dica</h4>
              <p className="text-sm text-blue-700">{question.explanation}</p>
            </div>
          </div>
        </motion.div>
      )}
      
      {question.question_type === 'multiple_choice' && question.options && (
        <RadioGroup
          value={getCurrentAnswer(question.id)}
          onValueChange={(value) => handleAnswerChange(question.id, value)}
          className="space-y-3 mt-6"
        >
          {question.options.map((option, index) => (
            <motion.div 
              key={index} 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className={`flex items-center space-x-2 bg-white border 
                ${getCurrentAnswer(question.id) === option 
                  ? 'border-blue-400 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'} 
                rounded-md p-3 transition-colors`}
            >
              <RadioGroupItem value={option} id={`option-${index}`} />
              <Label htmlFor={`option-${index}`} className="cursor-pointer flex-1">{option}</Label>
            </motion.div>
          ))}
        </RadioGroup>
      )}
      
      {question.question_type === 'true_false' && (
        <RadioGroup
          value={getCurrentAnswer(question.id)}
          onValueChange={(value) => handleAnswerChange(question.id, value)}
          className="space-y-3 mt-6"
        >
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`flex items-center space-x-2 bg-white border
              ${getCurrentAnswer(question.id) === "Verdadeiro" 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'} 
              rounded-md p-3 transition-colors`}
          >
            <RadioGroupItem value="Verdadeiro" id="true" />
            <Label htmlFor="true" className="cursor-pointer flex-1">Verdadeiro</Label>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.05 }}
            className={`flex items-center space-x-2 bg-white border
              ${getCurrentAnswer(question.id) === "Falso" 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'} 
              rounded-md p-3 transition-colors`}
          >
            <RadioGroupItem value="Falso" id="false" />
            <Label htmlFor="false" className="cursor-pointer flex-1">Falso</Label>
          </motion.div>
        </RadioGroup>
      )}
    </div>
  );
};

export default QuizQuestion;
