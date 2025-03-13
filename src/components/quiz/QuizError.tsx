
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface QuizErrorProps {
  title: string;
  message: string;
  error?: unknown;
}

const QuizError: React.FC<QuizErrorProps> = ({ title, message, error }) => {
  const navigate = useNavigate();
  
  return (
    <div className="text-center py-12">
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <p className="text-gray-500 mb-6">
        {message}
        {error && <span className="block text-red-500 mt-2">{String(error)}</span>}
      </p>
      <Button onClick={() => navigate('/quizzes')}>Voltar para Quizzes</Button>
    </div>
  );
};

export default QuizError;
