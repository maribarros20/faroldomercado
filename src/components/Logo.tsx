
import { useNavigate } from "react-router-dom";

const Logo = () => {
  const navigate = useNavigate();

  return (
    <div 
      className="flex items-center cursor-pointer py-8" // Increased top padding for more space
      onClick={() => navigate("/")}
    >
      <img 
        src="/lovable-uploads/3928ce87-7087-4ebf-ae30-745ce03df4bf.png" 
        alt="Farol do Mercado" 
        className="h-24 object-contain" // Maintaining the larger size
      />
    </div>
  );
};

export default Logo;
