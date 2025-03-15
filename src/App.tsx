
import { useEffect, lazy, Suspense } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import AppLayout from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";

// Lazy loaded components
const Index = lazy(() => import("@/pages/Index"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const MaterialsPage = lazy(() => import("@/pages/MaterialsPage"));
const VideosPage = lazy(() => import("@/pages/VideosPage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const CommunityPage = lazy(() => import("@/pages/CommunityPage"));
const ProgressPage = lazy(() => import("@/pages/ProgressPage"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));
const AuthPage = lazy(() => import("@/pages/AuthPage"));
const PlansPage = lazy(() => import("@/pages/PlansPage"));
const ProfileSettingsPage = lazy(() => import("@/pages/ProfileSettingsPage"));
const AdminPage = lazy(() => import("@/pages/AdminPage"));
const VideoDetail = lazy(() => import("@/components/videos/VideoDetail"));

// Loading component for suspense fallback
const PageLoader = () => (
  <div className="flex justify-center items-center h-screen">
    <Spinner size="lg" />
    <span className="ml-3">Carregando...</span>
  </div>
);

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Check if user is authenticated on initial load and set up auth listener
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
          // Display toast only if not already on a public page
          if (location.pathname !== '/auth') {
            toast({
              title: "Sessão expirada",
              description: "Por favor, faça login novamente.",
            });
          }
          navigate("/auth", { replace: true });
        } else if (data.session && publicPaths.includes(location.pathname)) {
          // If authenticated and on a public page, redirect to dashboard
          navigate("/dashboard", { replace: true });
        }
      } catch (error) {
        console.error("Error checking session:", error);
        navigate("/auth", { replace: true });
      }
    };

    checkAuth();

    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          // Always redirect to auth page on sign out and show toast
          navigate('/auth', { replace: true });
          toast({
            title: "Sessão encerrada",
            description: "Você foi desconectado com sucesso.",
          });
        } else if (event === 'SIGNED_IN' && session) {
          // Redirect to dashboard on sign in if on a public page
          const publicPaths = ['/', '/auth', '/register'];
          if (publicPaths.includes(location.pathname)) {
            navigate('/dashboard', { replace: true });
          }
          
          // Display welcome toast on successful sign in
          toast({
            title: "Bem-vindo!",
            description: "Login realizado com sucesso.",
          });
        } else if (event === 'PASSWORD_RECOVERY') {
          // Handle password recovery event
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
        <Suspense fallback={<PageLoader />}>
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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </AppLayout>
      <Toaster />
    </>
  );
}

export default App;
