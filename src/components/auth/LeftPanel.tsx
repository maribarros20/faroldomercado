
import React from "react";

const LeftPanel = () => {
  return (
    <div className="w-full md:w-2/5 lg:w-1/3 bg-blue-400 p-8 flex flex-col">
      <div className="mb-6">
        <h2 className="text-xl font-bold">Farol do Mercado</h2>
      </div>
      
      <nav className="flex gap-8 mb-16">
        <a href="/" className="text-gray-800 hover:text-black font-medium">Site</a>
        <a href="/" className="text-gray-800 hover:text-black font-medium">Blog</a>
        <a href="/" className="text-gray-800 hover:text-black font-medium">Falar com Luma</a>
      </nav>
      
      <div className="flex-grow flex flex-col justify-center">
        <h2 className="text-2xl font-semibold mb-6">
          Para acessar a plataforma do Farol do Mercado
        </h2>
        <p className="text-gray-800">
          você deve realizar o cadastro dos seus dados e do mentor. Após o registro, 
          acompanhe em seu e-mail as etapas para usar todas as funcionalidades e 
          iniciar uma gestão inteligente em saúde corporativa.
        </p>
      </div>
    </div>
  );
};

export default LeftPanel;
