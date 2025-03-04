
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter, ChevronDown, BarChart2, FileText, Shield, Brain, Download } from "lucide-react";
import { motion } from "framer-motion";

// Material category type
type MaterialCategory = {
  id: string;
  title: string;
  count: number;
  icon: React.ReactNode;
};

// Material type
type Material = {
  id: string;
  title: string;
  description: string;
  type: "pdf" | "excel" | "doc";
  addedTime: string;
  category: string;
};

// Sample data
const categories: MaterialCategory[] = [
  { 
    id: "1", 
    title: "Análise Técnica", 
    count: 24, 
    icon: <BarChart2 className="text-trade-blue" size={24} /> 
  },
  { 
    id: "2", 
    title: "Análise Fundamental", 
    count: 18, 
    icon: <Search className="text-trade-blue" size={24} /> 
  },
  { 
    id: "3", 
    title: "Gestão de Riscos", 
    count: 12, 
    icon: <Shield className="text-trade-blue" size={24} /> 
  },
  { 
    id: "4", 
    title: "Psicologia de Negociação", 
    count: 15, 
    icon: <Brain className="text-trade-blue" size={24} /> 
  },
];

const materials: Material[] = [
  {
    id: "1",
    title: "Introdução à Análise Técnica",
    description: "Aprenda os fundamentos da análise técnica e padrões gráficos",
    type: "pdf",
    addedTime: "2 dias",
    category: "Análise Técnica"
  },
  {
    id: "2",
    title: "Modelo de Calculadora de Risco",
    description: "Calcular tamanhos de posição e parâmetros de gerenciamento de risco",
    type: "excel",
    addedTime: "1 semana",
    category: "Gestão de Riscos"
  },
  {
    id: "3",
    title: "Modelo de diário de negociação",
    description: "Acompanhe suas negociações e analise seu desempenho",
    type: "doc",
    addedTime: "2 semanas",
    category: "Psicologia de Negociação"
  },
  {
    id: "4",
    title: "Guia de Análise Fundamental",
    description: "Guia completo para análise de demonstrações financeiras",
    type: "pdf",
    addedTime: "3 semanas",
    category: "Análise Fundamental"
  },
  {
    id: "5",
    title: "Fundamentos da psicologia de negociação",
    description: "Domine os aspectos mentais da negociação",
    type: "pdf",
    addedTime: "1 mês",
    category: "Psicologia de Negociação"
  },
  {
    id: "6",
    title: "Rastreador de Portfólio",
    description: "Acompanhe e analise seu portfólio de investimentos",
    type: "excel",
    addedTime: "1 mês",
    category: "Gestão de Riscos"
  },
];

const getTypeIcon = (type: string) => {
  switch (type) {
    case "pdf":
      return (
        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
          <FileText size={20} className="text-red-500" />
        </div>
      );
    case "excel":
      return (
        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
          <FileText size={20} className="text-green-500" />
        </div>
      );
    default:
      return (
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <FileText size={20} className="text-blue-500" />
        </div>
      );
  }
};

// Staggered animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function MaterialsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredMaterials = materials.filter(material => 
    material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    material.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Materiais</h1>
          <p className="text-gray-500 mt-1">Aprenda com conteúdos exclusivos</p>
        </div>
        <Button className="bg-trade-blue hover:bg-trade-blue/90">
          <Plus size={18} className="mr-2" /> 
          Novo material
        </Button>
      </header>
      
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {categories.map((category) => (
          <motion.div 
            key={category.id}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md hover:-translate-y-1 cursor-pointer"
            variants={itemVariants}
          >
            <div className="w-12 h-12 bg-trade-light-blue rounded-lg flex items-center justify-center mb-4">
              {category.icon}
            </div>
            <h3 className="font-medium text-lg text-gray-900 mb-1">{category.title}</h3>
            <p className="text-gray-500 text-sm">{category.count} materiais</p>
          </motion.div>
        ))}
      </motion.div>
      
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <div className="relative w-full md:w-auto md:flex-1 max-w-2xl">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input 
            className="pl-10 py-6 bg-white border-gray-200 rounded-xl" 
            placeholder="Pesquisar materiais..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Button variant="outline" className="gap-2 border-gray-200 text-gray-700">
            <Filter size={18} />
            Filtro
          </Button>
          <Button variant="outline" className="gap-2 border-gray-200 text-gray-700">
            Organizar
            <ChevronDown size={18} />
          </Button>
        </div>
      </div>
      
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {filteredMaterials.map((material) => (
          <motion.div
            key={material.id}
            className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
            variants={itemVariants}
          >
            <div className="p-6">
              <div className="flex items-start gap-4">
                {getTypeIcon(material.type)}
                <div className="flex-1">
                  <h3 className="font-medium text-lg text-gray-900 mb-1">{material.title}</h3>
                  <p className="text-gray-500 text-sm">{material.description}</p>
                </div>
              </div>
              <div className="flex justify-between items-center mt-6">
                <span className="text-xs text-gray-500">Adicionado há {material.addedTime}</span>
                <Button size="sm" variant="ghost" className="rounded-full h-8 w-8 p-0">
                  <Download size={16} />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
