
import React from "react";
import { Globe, BookMarked, Sparkles, HelpCircle, LucideIcon } from "lucide-react";

interface LinkItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
}

const LinkItem = ({ href, icon, label }: LinkItemProps) => (
  <a 
    href={href} 
    target="_blank" 
    rel="noopener noreferrer"
    className="flex items-center py-2 text-sm text-white hover:text-white/80 transition-colors"
  >
    {icon}
    <span className="ml-3">{label}</span>
  </a>
);

interface UsefulLinksProps {
  expanded: boolean;
}

type LinkConfig = {
  href: string;
  icon: LucideIcon;
  label: string;
};

const UsefulLinks = ({ expanded }: UsefulLinksProps) => {
  if (!expanded) return null;
  
  const links: LinkConfig[] = [
    {
      href: "https://www.faroldomercado.com",
      icon: Globe,
      label: "Site Farol"
    },
    {
      href: "https://painel.faroldomercado.com/farolito-blog",
      icon: BookMarked,
      label: "Blog Farolito"
    },
    {
      href: "https://share.chatling.ai/s/PnKmMgATCQPf4tr",
      icon: Sparkles,
      label: "Luma IA"
    },
    {
      href: "https://api.whatsapp.com/send/?phone=5585996282222&text&type=phone_number&app_absent=0",
      icon: HelpCircle,
      label: "Ajuda"
    }
  ];
  
  return (
    <div className="bg-[#0066FF] rounded-2xl px-3 py-3 shadow-md mt-auto">
      {links.map((link, index) => (
        <LinkItem 
          key={index}
          href={link.href}
          icon={<link.icon className="w-5 h-5" />}
          label={link.label}
        />
      ))}
    </div>
  );
};

export default UsefulLinks;
