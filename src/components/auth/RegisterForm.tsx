
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, KeyRound, User, Building, Phone, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface RegisterFormProps {
  setIsLogin: (isLogin: boolean) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const RegisterForm = ({ setIsLogin, loading, setLoading }: RegisterFormProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [company, setCompany] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (!name || !email || !password || !phone || !cpf || !dateOfBirth || !acceptTerms) {
        toast({
          title: "Campos obrigatórios",
          description: "Por favor, preencha todos os campos obrigatórios",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }
      
      if (password.length < 8) {
        toast({
          title: "Senha fraca",
          description: "A senha deve ter pelo menos 8 caracteres",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      const nameParts = name.split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";
      
      console.log("Attempting registration with:", { email, firstName, lastName });

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            cnpj,
            phone,
            cpf,
            date_of_birth: dateOfBirth,
            role: 'user',
            tipo_de_conta: 'trader'
          }
        }
      });
      
      console.log("Registration response:", { data, error });
      
      if (error) {
        toast({
          title: "Erro ao criar conta",
          description: error.message,
          variant: "destructive"
        });
        setLoading(false);
        return;
      }
      
      if (data?.user?.identities && data.user.identities.length === 0) {
        toast({
          title: "E-mail já cadastrado",
          description: "Este e-mail já está cadastrado no sistema. Tente fazer login ou recuperar sua senha.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }
      
      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Verifique seu e-mail para confirmar o cadastro."
      });
      
      if (data.session) {
        console.log("Registration successful with session, redirecting to dashboard");
      } else {
        console.log("Registration successful, email confirmation required");
        setIsLogin(true);
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Erro no cadastro",
        description: "Ocorreu um erro ao criar sua conta. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Primeiro e último nome *</Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Digite seu nome completo" className="pl-10" required />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="dateOfBirth">Data de Nascimento *</Label>
        <div className="relative">
          <Input id="dateOfBirth" type="date" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} className="pl-3" required />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">E-mail *</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Digite seu e-mail" className="pl-10" required />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Senha *</Label>
        <div className="relative">
          <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Digite sua senha" className="pl-10" required />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          A senha deve ter pelo menos 8 caracteres, sendo 1 número, 1 letra maiúscula e 1 caractere especial
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="cpf">CPF *</Label>
        <div className="relative">
          <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input id="cpf" value={cpf} onChange={e => setCpf(e.target.value)} placeholder="Digite seu CPF" className="pl-10" required />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="company">Empresa ou Mentor</Label>
        <div className="relative">
          <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input id="company" value={company} onChange={e => setCompany(e.target.value)} placeholder="Digite o nome da empresa ou mentor" className="pl-10" />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="cnpj">CNPJ da empresa ou do mentor</Label>
        <div className="relative">
          <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input id="cnpj" value={cnpj} onChange={e => setCnpj(e.target.value)} placeholder="Digite o CNPJ da empresa ou do mentor" className="pl-10" />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="phone">Celular *</Label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input id="phone" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Digite seu celular" className="pl-10" required />
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <input 
          type="checkbox" 
          id="terms" 
          className="rounded border-gray-300 text-primary focus:ring-primary" 
          checked={acceptTerms} 
          onChange={e => setAcceptTerms(e.target.checked)} 
          required 
        />
        <label htmlFor="terms" className="text-sm text-gray-700">
          Eu aceito os <a href="#" className="text-primary">Termos e Condições</a>
        </label>
      </div>

      <Button type="submit" disabled={loading} className="w-full text-white py-6 bg-[#0066ff]">
        Cadastrar acesso
        {loading ? <span className="ml-2 animate-spin">◌</span> : null}
      </Button>
    </form>
  );
};

export default RegisterForm;
