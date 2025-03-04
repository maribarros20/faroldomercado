
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to Your Trading Education Platform</h1>
        <p className="text-xl text-gray-600 mb-8">Start your journey to become a better trader!</p>
        <div className="flex gap-4 justify-center">
          <Button onClick={() => navigate("/dashboard")}>
            Go to Dashboard
          </Button>
          <Button 
            onClick={() => navigate("/materials")} 
            variant="outline"
            className="hover:bg-trade-light-blue hover:text-trade-blue"
          >
            Educational Materials
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
