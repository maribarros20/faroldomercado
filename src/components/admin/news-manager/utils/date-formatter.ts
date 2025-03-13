
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const formatDate = (dateString?: string) => {
  if (!dateString) return "";
  
  try {
    return format(new Date(dateString), "dd 'de' MMMM, yyyy", { locale: ptBR });
  } catch (e) {
    return "";
  }
};
