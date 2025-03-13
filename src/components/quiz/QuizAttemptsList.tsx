import React from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { QuizAttempt } from "@/types/quiz";
import { Clock } from "lucide-react";

interface QuizAttemptsListProps {
  attempts: QuizAttempt[];
}

const QuizAttemptsList: React.FC<QuizAttemptsListProps> = ({ attempts }) => {

  if (!attempts || attempts.length === 0) {
    return <div className="text-center py-4">Nenhuma tentativa encontrada.</div>;
  }

  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableCaption>Suas últimas tentativas de quiz.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Quiz</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Tempo Total</TableHead>
            <TableHead>Data de Conclusão</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {attempts.map((attempt) => {
            const variantClass = attempt.passed ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200";
            const badgeVariant = attempt.passed ? "default" : "destructive";
            const badgeClass = attempt.passed ? "bg-green-100 text-green-800 hover:bg-green-100" : "";

            return (
              <TableRow key={attempt.id}>
                <TableCell className="font-medium">Quiz ID: {attempt.quiz_id}</TableCell>
                <TableCell>{attempt.score}%</TableCell>
                <TableCell>
                  <Badge variant={badgeVariant} className={badgeClass}>
                    {attempt.passed ? "Aprovado" : "Reprovado"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {attempt.total_time_seconds ? `${Math.floor(attempt.total_time_seconds / 60)}m ${attempt.total_time_seconds % 60}s` : "N/A"}
                </TableCell>
                <TableCell className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 opacity-70" />
                  <span>{new Date(attempt.completed_at).toLocaleDateString()}</span>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default QuizAttemptsList;
