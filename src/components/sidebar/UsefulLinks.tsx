
import React from "react";
import { Globe, BookMarked, Sparkles, HelpCircle } from "lucide-react";

interface UsefulLinksProps {
  expanded: boolean;
}

const UsefulLinks = ({ expanded }: UsefulLinksProps) => {
  if (!expanded) return null;
  
  return (
    <div className="bg-primary rounded-lg px-3 py-3">
      <a 
        href="https://www.faroldomercado.com" 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center py-2 text-sm text-white hover:text-white/80 transition-colors"
      >
        <Globe className="w-5 h-5 mr-3" />
        Site Farol
      </a>

      <a 
        href="https://painel.faroldomercado.com/farolito-blog" 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center py-2 text-sm text-white hover:text-white/80 transition-colors"
      >
        <BookMarked className="w-5 h-5 mr-3" />
        Blog Farolito
      </a>

      <a 
        href="https://share.chatling.ai/s/PnKmMgATCQPf4tr" 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center py-2 text-sm text-white hover:text-white/80 transition-colors"
      >
        <Sparkles className="w-5 h-5 mr-3" />
        Luma IA
      </a>

      <a 
        href="https://api.whatsapp.com/send/?phone=5585996282222&text&type=phone_number&app_absent=0" 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center py-2 text-sm text-white hover:text-white/80 transition-colors"
      >
        <HelpCircle className="w-5 h-5 mr-3" />
        Ajuda
      </a>
    </div>
  );
};

export default UsefulLinks;
