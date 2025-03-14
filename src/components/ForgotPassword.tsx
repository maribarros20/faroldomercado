
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useResetToken } from "@/hooks/useResetToken";
import EmailResetForm from "@/components/auth/EmailResetForm";
import PasswordResetForm from "@/components/auth/PasswordResetForm";

interface ForgotPasswordProps {
  onBack: () => void;
  onReset: () => void;
}

const ForgotPassword = ({ onBack, onReset }: ForgotPasswordProps) => {
  const { resetToken } = useResetToken();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md"
    >
      <div className="flex justify-between items-center mb-8">
        <button 
          onClick={onBack} 
          className="text-primary flex items-center gap-2"
          type="button"
        >
          <ArrowLeft size={20} />
          <span>Voltar</span>
        </button>
      </div>

      <h1 className="text-3xl font-bold mb-8">
        Recuperar <span className="text-primary">senha</span>
      </h1>

      {!resetToken ? (
        <EmailResetForm onSuccess={() => {}} />
      ) : (
        <PasswordResetForm onSuccess={onReset} />
      )}
    </motion.div>
  );
};

export default ForgotPassword;
