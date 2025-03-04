
import { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, User, Shield, Bell, Settings, Save } from "lucide-react";

export default function ProfilePage() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  return (
    <div className="animate-fade-in">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configurações de perfil</h1>
          <p className="text-gray-500 mt-1">Gerencie as configurações e preferências da sua conta</p>
        </div>
        <Button className="bg-trade-blue hover:bg-trade-blue/90">
          <Save size={18} className="mr-2" /> 
          Salvar alterações
        </Button>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <Tabs defaultValue="personal" orientation="vertical" className="bg-white rounded-xl shadow-sm border border-gray-100 h-full">
            <TabsList className="flex flex-col w-full items-start gap-1 p-2">
              <TabsTrigger value="personal" className="justify-start w-full px-4 py-3">
                <User size={18} className="mr-3" />
                Informações pessoais
              </TabsTrigger>
              <TabsTrigger value="security" className="justify-start w-full px-4 py-3">
                <Shield size={18} className="mr-3" />
                Segurança
              </TabsTrigger>
              <TabsTrigger value="notifications" className="justify-start w-full px-4 py-3">
                <Bell size={18} className="mr-3" />
                Notificações
              </TabsTrigger>
              <TabsTrigger value="preferences" className="justify-start w-full px-4 py-3">
                <Settings size={18} className="mr-3" />
                Preferências
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div className="lg:col-span-3">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-8"
          >
            <h2 className="text-2xl font-semibold mb-6">Informações do perfil</h2>
            <p className="text-gray-500 mb-8">Atualize suas informações de perfil e foto</p>
            
            <div className="mb-8 flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gray-100 rounded-full overflow-hidden">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                      <User size={40} />
                    </div>
                  )}
                </div>
                <label 
                  htmlFor="profile-image" 
                  className="absolute -bottom-2 -right-2 bg-trade-blue text-white p-2 rounded-full cursor-pointer shadow-md hover:bg-trade-blue/90 transition-colors"
                >
                  <Upload size={16} />
                </label>
                <input 
                  type="file" 
                  id="profile-image" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Carregar nova foto</h3>
                <p className="text-sm text-gray-500">JPG, GIF ou PNG. Tamanho máximo de 800K</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input id="name" placeholder="Digite seu nome completo" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Nome de usuário</Label>
                <Input id="username" placeholder="Digite seu nome de usuário" />
              </div>
            </div>
            
            <div className="space-y-2 mb-6">
              <Label htmlFor="bio">Biografia</Label>
              <Textarea 
                id="bio" 
                placeholder="Escreva uma breve descrição sobre você" 
                className="min-h-[120px]"
              />
            </div>
            
            <h3 className="text-xl font-semibold mt-10 mb-4">Informações de contato</h3>
            <p className="text-gray-500 mb-6">Atualize seus dados de contato</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <Label htmlFor="email">Endereço de e-mail</Label>
                <Input id="email" type="email" placeholder="Insira seu endereço de e-mail" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Número de telefone</Label>
                <Input id="phone" placeholder="Insira seu número de telefone" />
              </div>
            </div>
            
            <h3 className="text-xl font-semibold mt-10 mb-4">Informações de endereço</h3>
            <p className="text-gray-500 mb-6">Atualize seus dados de endereço</p>
            
            <div className="space-y-2 mb-6">
              <Label htmlFor="address">Endereço de Rua</Label>
              <Input id="address" placeholder="Insira seu endereço" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input id="city" placeholder="Insira sua cidade" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">Estado</Label>
                <Input id="state" placeholder="Digite seu estado" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip">CEP</Label>
                <Input id="zip" placeholder="Insira seu código postal" />
              </div>
            </div>
            
            <div className="flex justify-end mt-10">
              <Button variant="outline" className="mr-3">Cancelar</Button>
              <Button className="bg-trade-blue hover:bg-trade-blue/90">
                <Save size={18} className="mr-2" />
                Salvar alterações
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
