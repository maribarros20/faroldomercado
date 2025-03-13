
import React, { createContext, useContext, useState } from "react";
import { QuizAnswer } from "@/types/quiz";

interface QuizContextType {
  currentQuestion: number;
  setCurrentQuestion: (index: number) => void;
  answers: QuizAnswer[];
  setAnswers: (answers: QuizAnswer[]) => void;
  startTime: string;
  elapsedTime: number;
  setElapsedTime: (time: number) => void;
  showHint: boolean;
  setShowHint: (show: boolean) => void;
  handleAnswerChange: (questionId: string, answer: string) => void;
  getCurrentAnswer: (questionId: string) => string | undefined;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export const QuizProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [startTime] = useState<string>(new Date().toISOString());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const handleAnswerChange = (questionId: string, answer: string) => {
    const existingAnswerIndex = answers.findIndex(a => a.question_id === questionId);
    
    if (existingAnswerIndex >= 0) {
      const newAnswers = [...answers];
      newAnswers[existingAnswerIndex] = { question_id: questionId, answer };
      setAnswers(newAnswers);
    } else {
      setAnswers([...answers, { question_id: questionId, answer }]);
    }
    
    setShowHint(false);
  };
  
  const getCurrentAnswer = (questionId: string): string | undefined => {
    return answers.find(a => a.question_id === questionId)?.answer;
  };

  return (
    <QuizContext.Provider
      value={{
        currentQuestion,
        setCurrentQuestion,
        answers,
        setAnswers,
        startTime,
        elapsedTime,
        setElapsedTime,
        showHint,
        setShowHint,
        handleAnswerChange,
        getCurrentAnswer
      }}
    >
      {children}
    </QuizContext.Provider>
  );
};

export const useQuizContext = () => {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error("useQuizContext must be used within a QuizProvider");
  }
  return context;
};
