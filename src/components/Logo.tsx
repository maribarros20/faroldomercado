import { useNavigate } from "react-router-dom";
const Logo = () => {
  const navigate = useNavigate();
  return <div
  // Increased padding from py-12 to py-16
  onClick={() => navigate("/")} className="flex items-center cursor-pointer py-4\n">
      <img src="/lovable-uploads/3928ce87-7087-4ebf-ae30-745ce03df4bf.png" alt="Farol do Mercado" className="h-24 object-contain mt-2" />
    </div>;
};
export default Logo;