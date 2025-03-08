
import { useEffect, useState } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import VideoDetail from "@/components/videos/VideoDetail";
import { useToast } from "@/hooks/use-toast";

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is authenticated on initial load and set up auth listener
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsCheckingAuth(true);
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session check error:", error);
          setIsAuthenticated(false);
          setIsCheckingAuth(false);
          return;
        }
        
        const publicPaths = ['/', '/auth', '/register'];
        const isPublicPath = publicPaths.includes(location.pathname);
        
        if (!data.session) {
          setIsAuthenticated(false);
          // Only redirect if not already on a public page
          if (!isPublicPath && !isCheckingAuth) {
            toast({
              title: "Sessão expirada",
              description: "Por favor, faça login novamente.",
            });
            navigate("/auth");
          }
        } else {
          setIsAuthenticated(true);
          // If authenticated and on a public page, redirect to dashboard
          if (isPublicPath && !isCheckingAuth) {
            navigate("/dashboard");
          }
        }
      } catch (error) {
        console.error("Error checking session:", error);
        setIsAuthenticated(false);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();

    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth event:", event);
        
        if (event === 'SIGNED_OUT') {
          setIsAuthenticated(false);
          // Always redirect to auth page on sign out
          if (location.pathname !== '/auth') {
            navigate('/auth');
            toast({
              title: "Sessão encerrada",
              description: "Você foi desconectado com sucesso.",
            });
          }
        } else if (event === 'SIGNED_IN' && session) {
          setIsAuthenticated(true);
          // Redirect to dashboard on sign in if on a public page
          const publicPaths = ['/', '/auth', '/register'];
          if (publicPaths.includes(location.pathname)) {
            navigate('/dashboard');
            // Display welcome toast on successful sign in
            toast({
              title: "Bem-vindo!",
              description: "Login realizado com sucesso.",
            });
          }
        }
      }
    );
    
    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [navigate, location.pathname, toast, isCheckingAuth]);

  // Show loading indicator while checking authentication state
  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppLayout>
      <Toaster />
    </>
  );
}

export default App;
