import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ForgotPassword from "@/components/ForgotPassword";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";
import LeftPanel from "@/components/auth/LeftPanel";
interface AuthPageProps {
  isRegister?: boolean;
}
const AuthPage = ({
  isRegister = false
}: AuthPageProps) => {
  const [isLogin, setIsLogin] = useState(!isRegister);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  useEffect(() => {
    // Check URL for password reset parameters
    const url = new URL(window.location.href);
    const reset = url.searchParams.get("reset");
    const type = url.searchParams.get("type");
    if (reset === "true" || type === "recovery") {
      setShowForgotPassword(true);
    }
  }, []);
  useEffect(() => {
    const checkSession = async () => {
      try {
        setCheckingSession(true);
        console.log("Checking session...");
        const {
          data,
          error
        } = await supabase.auth.getSession();
        if (error) {
          console.error("Session check error:", error);
          setCheckingSession(false);
          return;
        }
        console.log("Session check result:", data);
        if (data.session) {
          console.log("User is logged in, redirecting to dashboard");
          navigate("/dashboard");
        } else {
          console.log("No active session found");
          setCheckingSession(false);
        }
      } catch (error) {
        console.error("Error checking session:", error);
        setCheckingSession(false);
      }
    };
    checkSession();
  }, [navigate]);
  useEffect(() => {
    const clearStaleSession = async () => {
      try {
        const {
          data
        } = await supabase.auth.getSession();
        if (!data.session && localStorage.getItem('supabase.auth.token')) {
          console.log("Found stale session token, clearing it");
          await supabase.auth.signOut();
        }
      } catch (error) {
        console.error("Error clearing stale session:", error);
      }
    };
    clearStaleSession();
  }, []);
  useEffect(() => {
    // Listen for auth changes from reset password flow
    const {
      data
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth event:", event);
      if (event === 'PASSWORD_RECOVERY') {
        setShowForgotPassword(true);
        toast({
          title: "Recuperação de senha",
          description: "Você pode redefinir sua senha agora."
        });
      }
    });
    return () => {
      data.subscription.unsubscribe();
    };
  }, [toast]);
  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setShowForgotPassword(false);
  };
  if (checkingSession) {
    return <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Verificando sessão...</p>
        </div>
      </div>;
  }
  if (showForgotPassword) {
    return <div className="min-h-screen flex flex-col md:flex-row">
        <LeftPanel />
        <div className="w-full md:w-3/5 lg:w-2/3 p-4 md:p-8 lg:p-12 flex items-center justify-center">
          <ForgotPassword onBack={() => setShowForgotPassword(false)} onReset={() => {
          setShowForgotPassword(false);
          setIsLogin(true);
        }} />
        </div>
      </div>;
  }
  return <div className="min-h-screen flex flex-col md:flex-row">
      <LeftPanel />
      
      <div className="w-full md:w-3/5 lg:w-2/3 p-4 md:p-8 lg:p-12 flex items-center justify-center">
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.5
      }} className="w-full max-w-md">
          <div className="flex justify-between items-center mb-8">
            <button onClick={() => navigate("/")} className="text-primary flex items-center gap-2">
              <ArrowLeft size={20} />
              <span>Voltar</span>
            </button>
            <div className="text-gray-700">
              {isLogin ? <span>
                  Não tem conta? <button onClick={toggleAuthMode} className="text-[#0066ff] text-base font-medium hover: text-[#0066ff] hover:scale-105 transition-transform duration-200\n">Cadastrar</button>
                </span> : <span>
                  Já tem conta? <button onClick={toggleAuthMode} className="text-primary font-medium">Entrar</button>
                </span>}
            </div>
          </div>
          
          <h1 className="text-3xl font-bold mb-8">
            {isLogin ? "Acessar" : "Cadastrar"} <span className="text-primary">conta</span>
          </h1>
          
          {isLogin ? <LoginForm setShowForgotPassword={setShowForgotPassword} loading={loading} setLoading={setLoading} /> : <RegisterForm setIsLogin={setIsLogin} loading={loading} setLoading={setLoading} />}
        </motion.div>
      </div>
    </div>;
};
export default AuthPage;