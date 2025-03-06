
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, ExternalLink } from "lucide-react";
import { FinanceIframe } from "@/services/FinanceIframeService";

type FinanceIframeListProps = {
  iframes: FinanceIframe[];
  onEdit: (iframe: FinanceIframe) => void;
  onDelete: (id: string) => void;
  onPreview: (url: string) => void;
};

const FinanceIframeList: React.FC<FinanceIframeListProps> = ({
  iframes,
  onEdit,
  onDelete,
  onPreview,
}) => {
  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Título</TableHead>
            <TableHead>Plano</TableHead>
            <TableHead>Mentor</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {iframes.map((iframe) => (
            <TableRow key={iframe.id}>
              <TableCell className="font-medium">{iframe.title}</TableCell>
              <TableCell>
                {iframe.plans ? iframe.plans.name : "Todos os planos"}
              </TableCell>
              <TableCell>
                {iframe.mentors ? iframe.mentors.name : "Todos os mentores"}
              </TableCell>
              <TableCell>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  iframe.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {iframe.is_active ? 'Ativo' : 'Inativo'}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPreview(iframe.iframe_url)}
                    title="Visualizar"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(iframe)}
                    title="Editar"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(iframe.id)}
                    title="Excluir"
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default FinanceIframeList;
