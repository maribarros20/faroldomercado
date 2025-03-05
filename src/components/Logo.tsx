
import { useNavigate } from "react-router-dom";

const Logo = () => {
  const navigate = useNavigate();

  return (
    <div 
      className="flex items-center cursor-pointer" 
      onClick={() => navigate("/")}
    >
      <span className="text-2xl font-bold">
        <span className="text-primary">Farol</span>
        <span className="text-gray-800">do Mercado</span>
      </span>
    </div>
  );
};

export default Logo;
