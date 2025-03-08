
import { useNavigate } from "react-router-dom";

const Logo = () => {
  const navigate = useNavigate();

  return (
    <div 
      className="flex items-center cursor-pointer" 
      onClick={() => navigate("/")}
    >
      <img 
        src="/lovable-uploads/3928ce87-7087-4ebf-ae30-745ce03df4bf.png" 
        alt="Farol do Mercado" 
        className="h-14 object-contain" // Increased from h-10 to h-14
      />
    </div>
  );
};

export default Logo;
