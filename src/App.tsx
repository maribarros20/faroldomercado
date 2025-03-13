
import { useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import AppLayout from "@/components/AppLayout";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import MaterialsPage from "@/pages/MaterialsPage";
import VideosPage from "@/pages/VideosPage";
import DashboardPage from "@/pages/DashboardPage";
import CommunityPage from "@/pages/CommunityPage";
import ProgressPage from "@/pages/ProgressPage";
import ProfilePage from "@/pages/ProfilePage";
import AuthPage from "@/pages/AuthPage";
import PlansPage from "@/pages/PlansPage";
import ProfileSettingsPage from "@/pages/ProfileSettingsPage";
import AdminPage from "@/pages/AdminPage";
import QuizzesPage from "./pages/QuizzesPage";
import QuizDetailPage from "./pages/QuizDetailPage";
import QuizCreatePage from "./pages/QuizCreatePage";
import QuizEditPage from "./pages/QuizEditPage";
import { supabase } from "@/integrations/supabase/client";
import VideoDetail from "@/components/videos/VideoDetail";
import { useToast } from "@/hooks/use-toast";

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session check error:", error);
          if (location.pathname !== '/auth' && location.pathname !== '/' && location.pathname !== '/register') {
            navigate("/auth", { replace: true });
          }
          return;
        }
        
        const publicPaths = ['/', '/auth', '/register'];
        
        if (!data.session && !publicPaths.includes(location.pathname)) {
          if (location.pathname !== '/auth') {
            toast({
              title: "Sessão expirada",
              description: "Por favor, faça login novamente.",
            });
          }
          navigate("/auth", { replace: true });
        } else if (data.session && publicPaths.includes(location.pathname)) {
          navigate("/dashboard", { replace: true });
        }
      } catch (error) {
        console.error("Error checking session:", error);
        navigate("/auth", { replace: true });
      }
    };

    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth event:", event);
        
        if (event === 'SIGNED_OUT') {
          navigate('/auth', { replace: true });
          toast({
            title: "Sessão encerrada",
            description: "Você foi desconectado com sucesso.",
          });
        } else if (event === 'SIGNED_IN' && session) {
          const publicPaths = ['/', '/auth', '/register'];
          if (publicPaths.includes(location.pathname)) {
            navigate('/dashboard', { replace: true });
          }
          
          toast({
            title: "Bem-vindo!",
            description: "Login realizado com sucesso.",
          });
        } else if (event === 'PASSWORD_RECOVERY') {
          navigate('/auth?reset=true', { replace: true });
          toast({
            title: "Recuperação de senha",
            description: "Você pode redefinir sua senha agora.",
          });
        }
      }
    );
    
    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [navigate, location.pathname, toast]);

  return (
    <>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/register" element={<AuthPage isRegister />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/materials" element={<MaterialsPage />} />
          <Route path="/videos" element={<VideosPage />} />
          <Route path="/videos/:id" element={<VideoDetail />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/plans" element={<PlansPage />} />
          <Route path="/profile-settings" element={<ProfileSettingsPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/quizzes" element={<QuizzesPage />} />
          <Route path="/quizzes/:quizId" element={<QuizDetailPage />} />
          <Route path="/quizzes/create" element={<QuizCreatePage />} />
          <Route path="/quizzes/:quizId/edit" element={<QuizEditPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppLayout>
      <Toaster />
    </>
  );
}

export default App;
