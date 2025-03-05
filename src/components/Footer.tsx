
import { Instagram, MessageCircle } from "lucide-react";
import Logo from "./Logo";

const Footer = () => {
  return (
    <footer className="bg-gray-100 py-8 border-t">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold">Farol do Mercado</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">CNPJ: 40.085.415/0001-20</p>
          </div>
          
          <div className="flex gap-4">
            <a 
              href="https://www.instagram.com/faroldomercado" 
              target="_blank"
              rel="noopener noreferrer"
              className="bg-primary text-white p-2 rounded-full hover:bg-primary/90 transition-colors"
              aria-label="Instagram"
            >
              <Instagram size={20} />
            </a>
            <a 
              href="https://api.whatsapp.com/send/?phone=5585996282222" 
              target="_blank"
              rel="noopener noreferrer"
              className="bg-primary text-white p-2 rounded-full hover:bg-primary/90 transition-colors"
              aria-label="WhatsApp"
            >
              <MessageCircle size={20} />
            </a>
          </div>
        </div>
        
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Farol do Mercado. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
