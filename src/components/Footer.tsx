
import React from "react";
import { Instagram, MessageCircle, ChevronUp } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";

interface FooterProps {
  className?: string;
}

const Footer = ({ className = "" }: FooterProps) => {
  const currentYear = new Date().getFullYear();
  const { expanded } = useSidebar();
  
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  return (
    <footer className={`bg-[#0066FF] text-white border-t border-[#0066FF] py-3 ${className} w-full right-0 transition-all duration-300 z-10 mt-auto rounded-t-2xl rounded-b-none ${
      expanded ? "ml-64" : "ml-20"
    }`}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Company Info */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-white">Farol do Mercado</h3>
            <p className="text-white/80 text-xs">
              CNPJ: 40.085.415/0001-20
            </p>
            <div className="flex space-x-3">
              <a 
                href="https://instagram.com/faroldomercado" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-white text-[#0066FF] p-2 rounded-full hover:bg-white/90 transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={16} />
              </a>
              <a 
                href="https://api.whatsapp.com/send/?phone=5585996282222" 
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-[#0066FF] p-2 rounded-full hover:bg-white/90 transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle size={16} />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-white">Links Rápidos</h3>
            <ul className="space-y-1">
              <li>
                <Link to="/dashboard" className="text-white/80 hover:text-white transition-colors text-xs">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/materials" className="text-white/80 hover:text-white transition-colors text-xs">
                  Materiais
                </Link>
              </li>
              <li>
                <Link to="/videos" className="text-white/80 hover:text-white transition-colors text-xs">
                  Vídeos
                </Link>
              </li>
              <li>
                <Link to="/community" className="text-white/80 hover:text-white transition-colors text-xs">
                  Comunidade
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact/Support */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-white">Suporte</h3>
            <p className="text-white/80 text-xs">
              Precisa de ajuda? Entre em contato!
            </p>
            <a 
              href="https://api.whatsapp.com/send/?phone=5585996282222&text&type=phone_number&app_absent=0" 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-xs bg-white text-[#0066FF] px-3 py-1 rounded-md hover:bg-white/90 transition-colors"
            >
              Falar com Suporte
            </a>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-center mt-2 pt-1 border-t border-white/20">
          <p className="text-xs text-white/80">
            © {currentYear} Farol do Mercado. Todos os direitos reservados.
          </p>
          
          <Button 
            onClick={scrollToTop} 
            size="sm" 
            className="mt-1 sm:mt-0 bg-white hover:bg-white/90 text-[#0066FF] rounded-full p-1 h-7 w-7"
            aria-label="Voltar ao topo"
          >
            <ChevronUp className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
