import React from "react";
const LeftPanel = () => {
  return <div className="w-full md:w-2/5 lg:w-1/3 p-8 flex flex-col bg-[#0066ff]">
      <div className="mb-6">
        
      </div>
      
      <nav className="flex gap-8 mb-16">
        <a href="/" className="text-white font-medium hover:text-gray-100 hover:scale-105 transition-transform duration-200\n">Site</a>
        <a href="/" className="text-white font-medium hover:text-gray-100 hover:scale-105 transition-transform duration-200\n">Blog</a>
        <a href="/" className="text-white font-medium hover:text-gray-100 hover:scale-105 transition-transform duration-200\n">Falar com Luma</a>
      </nav>
      
      <div className="flex-grow flex flex-col justify-center">
        <h2 className="text-2xl font-semibold mb-6 text-white">Para acessar o Farol do Mercado</h2>
        <p className="text-white">
          você deve realizar o cadastro dos seus dados e do mentor. Após o registro, 
          acompanhe em seu e-mail as etapas para usar todas as funcionalidades e 
          iniciar uma gestão inteligente em saúde corporativa.
        </p>
      </div>
    </div>;
};
export default LeftPanel;