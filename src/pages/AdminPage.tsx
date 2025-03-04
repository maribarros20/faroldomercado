
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminMaterials from "@/components/admin/AdminMaterials";
import AdminVideos from "@/components/admin/AdminVideos";
import AdminSubscribers from "@/components/admin/AdminSubscribers";
import AdminPlans from "@/components/admin/AdminPlans";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("materials");
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate(-1)}
                className="rounded-full"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center">
                <Shield className="h-6 w-6 text-trade-blue mr-2" />
                <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
              </div>
            </div>
          </div>

          <motion.div 
            className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="border-b border-gray-200">
                <TabsList className="flex h-14 bg-white px-4">
                  <TabsTrigger 
                    value="materials" 
                    className="data-[state=active]:border-b-2 data-[state=active]:border-trade-blue data-[state=active]:text-trade-blue px-4 py-3 font-medium"
                  >
                    Materiais
                  </TabsTrigger>
                  <TabsTrigger 
                    value="videos" 
                    className="data-[state=active]:border-b-2 data-[state=active]:border-trade-blue data-[state=active]:text-trade-blue px-4 py-3 font-medium"
                  >
                    Vídeos
                  </TabsTrigger>
                  <TabsTrigger 
                    value="subscribers" 
                    className="data-[state=active]:border-b-2 data-[state=active]:border-trade-blue data-[state=active]:text-trade-blue px-4 py-3 font-medium"
                  >
                    Assinantes
                  </TabsTrigger>
                  <TabsTrigger 
                    value="plans" 
                    className="data-[state=active]:border-b-2 data-[state=active]:border-trade-blue data-[state=active]:text-trade-blue px-4 py-3 font-medium"
                  >
                    Planos
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="materials" className="p-6">
                <AdminMaterials />
              </TabsContent>
              
              <TabsContent value="videos" className="p-6">
                <AdminVideos />
              </TabsContent>
              
              <TabsContent value="subscribers" className="p-6">
                <AdminSubscribers />
              </TabsContent>
              
              <TabsContent value="plans" className="p-6">
                <AdminPlans />
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
