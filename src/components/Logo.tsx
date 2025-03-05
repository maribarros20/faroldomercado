
import { useNavigate } from "react-router-dom";

const Logo = () => {
  const navigate = useNavigate();

  return (
    <div 
      className="flex items-center cursor-pointer" 
      onClick={() => navigate("/")}
    >
      <img 
        src="/lovable-uploads/18a3a903-1ddc-4916-a178-85f9fad0a63a.png" 
        alt="Farol do Mercado" 
        className="h-10 object-contain" 
      />
    </div>
  );
};

export default Logo;
