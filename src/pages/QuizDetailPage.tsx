
import React from "react";
import { useParams } from "react-router-dom";
import Quiz from "@/components/quiz/Quiz";

const QuizDetailPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Quiz />
      </div>
    </div>
  );
};

export default QuizDetailPage;
