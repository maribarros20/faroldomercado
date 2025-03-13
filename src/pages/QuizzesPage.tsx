
import React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import QuizList from "@/components/quiz/QuizList";
import { supabase } from "@/integrations/supabase/client";
import { useUserProfile } from "@/hooks/use-user-profile";

const QuizzesPage: React.FC = () => {
  const navigate = useNavigate();
  const { userRole, isLoading } = useUserProfile();

  React.useEffect(() => {
    const logActivity = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase.from('user_activities').insert({
          user_id: session.user.id,
          activity_type: 'page_view',
          metadata: { page: 'quizzes' }
        });
      }
    };
    
    logActivity();
  }, []);

  const isAdmin = userRole === 'admin';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/dashboard')}
              className="rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Quizzes</h1>
          </div>
          
          {isAdmin && (
            <Button onClick={() => navigate('/quizzes/create')} className="bg-blue-600 hover:bg-blue-700">
              <PlusCircle className="h-4 w-4 mr-2" />
              Criar Quiz
            </Button>
          )}
        </div>
        
        <QuizList />
      </div>
    </div>
  );
};

export default QuizzesPage;
