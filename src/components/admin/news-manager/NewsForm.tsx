
import React from "react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { PlusCircle, Save, X } from "lucide-react";
import { NEWS_CATEGORIES } from "@/services/NewsService";
import type { NewsItem } from "@/services/NewsService";

interface NewsFormProps {
  formData: NewsItem;
  isEditing: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleCategoryChange: (value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  resetForm: () => void;
  isPending: boolean;
}

export const NewsForm: React.FC<NewsFormProps> = ({
  formData,
  isEditing,
  handleChange,
  handleCategoryChange,
  handleSubmit,
  resetForm,
  isPending
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Editar Notícia" : "Nova Notícia"}</CardTitle>
        <CardDescription>
          {isEditing 
            ? "Atualize as informações da notícia selecionada" 
            : "Preencha o formulário para criar uma nova notícia"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título*</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Título da notícia"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subtitle">Subtítulo</Label>
            <Input
              id="subtitle"
              name="subtitle"
              value={formData.subtitle}
              onChange={handleChange}
              placeholder="Subtítulo ou descrição breve"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Categoria*</Label>
              <Select 
                value={formData.category} 
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {NEWS_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="author">Autor</Label>
              <Input
                id="author"
                name="author"
                value={formData.author}
                onChange={handleChange}
                placeholder="Nome do autor"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">URL da Imagem</Label>
            <Input
              id="image_url"
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
              placeholder="https://exemplo.com/imagem.jpg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="source_url">URL da Fonte Original</Label>
            <Input
              id="source_url"
              name="source_url"
              value={formData.source_url}
              onChange={handleChange}
              placeholder="https://exemplo.com/noticia-original"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Conteúdo*</Label>
            <Textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Conteúdo completo da notícia"
              rows={10}
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            {isEditing && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={resetForm}
                className="flex items-center gap-1"
              >
                <X size={16} />
                Cancelar
              </Button>
            )}
            <Button 
              type="submit" 
              className="flex items-center gap-1"
              disabled={isPending}
            >
              {isEditing ? (
                <>
                  <Save size={16} />
                  Salvar Alterações
                </>
              ) : (
                <>
                  <PlusCircle size={16} />
                  Publicar Notícia
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
