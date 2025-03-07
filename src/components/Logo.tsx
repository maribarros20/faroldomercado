
import { useNavigate } from "react-router-dom";

const Logo = () => {
  const navigate = useNavigate();

  return (
    <div 
      className="flex items-center cursor-pointer" 
      onClick={() => navigate("/")}
    >
      <img 
        src="/lovable-uploads/192cf71f-62e8-4e72-b336-37fda7d4683e.png" 
        alt="Farol do Mercado" 
        className="h-8 object-contain" 
      />
    </div>
  );
};

export default Logo;
