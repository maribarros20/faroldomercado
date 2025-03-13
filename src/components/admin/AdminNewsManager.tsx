
import React, { useState, useEffect } from "react";
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, SelectTrigger, SelectContent, SelectItem, SelectValue 
} from "@/components/ui/select";
import { 
  createNews, updateNews, deleteNews, getNewsById, NEWS_CATEGORIES 
} from "@/services/NewsService";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, RefreshCw, Edit, Trash2, Save, X, Newspaper, BarChart3 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { NewsItem } from "@/services/NewsService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchManualNews } from "@/services/NewsService";
import { supabase } from "@/integrations/supabase/client";

const AdminNewsManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedNewsId, setSelectedNewsId] = useState<string | null>(null);
  const [formData, setFormData] = useState<NewsItem>({
    title: "",
    subtitle: "",
    content: "",
    author: "",
    category: "",
    image_url: "",
    source_url: "",
    publication_date: new Date().toISOString()
  });

  const { 
    data: newsList, 
    isLoading, 
    refetch 
  } = useQuery({
    queryKey: ['admin-news'],
    queryFn: fetchManualNews
  });

  const createNewsMutation = useMutation({
    mutationFn: createNews,
    onSuccess: () => {
      toast({
        title: "Notícia criada com sucesso",
        description: "A notícia foi publicada e já está disponível para os usuários",
      });
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['admin-news'] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar notícia",
        description: `Ocorreu um erro: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const updateNewsMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: NewsItem }) => 
      updateNews(id, data),
    onSuccess: () => {
      toast({
        title: "Notícia atualizada com sucesso",
        description: "As alterações foram salvas e publicadas",
      });
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['admin-news'] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar notícia",
        description: `Ocorreu um erro: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const deleteNewsMutation = useMutation({
    mutationFn: deleteNews,
    onSuccess: () => {
      toast({
        title: "Notícia excluída com sucesso",
        description: "A notícia foi removida permanentemente",
      });
      queryClient.invalidateQueries({ queryKey: ['admin-news'] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir notícia",
        description: `Ocorreu um erro: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const loadNewsForEdit = async (id: string) => {
    try {
      const news = await getNewsById(id);
      if (news) {
        setFormData({
          title: news.title || "",
          subtitle: news.subtitle || "",
          content: news.content || "",
          author: news.author || "",
          category: news.category || "",
          image_url: news.image_url || "",
          source_url: news.source_url || "",
          publication_date: news.publication_date || new Date().toISOString()
        });
        setSelectedNewsId(id);
        setIsEditing(true);
      }
    } catch (error) {
      toast({
        title: "Erro ao carregar notícia",
        description: "Não foi possível carregar os dados da notícia para edição",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      subtitle: "",
      content: "",
      author: "",
      category: "",
      image_url: "",
      source_url: "",
      publication_date: new Date().toISOString()
    });
    setSelectedNewsId(null);
    setIsEditing(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({ ...prev, category: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content || !formData.category) {
      toast({
        title: "Campos obrigatórios",
        description: "Título, conteúdo e categoria são campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    if (isEditing && selectedNewsId) {
      updateNewsMutation.mutate({ id: selectedNewsId, data: formData });
    } else {
      createNewsMutation.mutate(formData);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    try {
      return format(new Date(dateString), "dd 'de' MMMM, yyyy", { locale: ptBR });
    } catch (e) {
      return "";
    }
  };

  const handleCreate = () => {
    resetForm();
    setIsEditing(false);
  };

  const handleGenerateMarketSummary = async () => {
    try {
      toast({
        title: "Gerando resumo do mercado",
        description: "Aguarde enquanto geramos o resumo do mercado para o dia de hoje.",
      });
      
      const { data, error } = await supabase.functions.invoke('daily-market-summary');
      
      if (error) {
        throw new Error('Erro ao gerar resumo: ' + error.message);
      }
      
      queryClient.invalidateQueries({ queryKey: ['admin-news'] });
      
      toast({
        title: data.success ? "Resumo gerado com sucesso" : "Aviso",
        description: data.message,
      });
      
    } catch (error) {
      console.error("Erro ao gerar resumo do mercado:", error);
      toast({
        title: "Erro ao gerar resumo",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado",
        variant: "destructive"
      });
    }
  };

  // Agrupa as notícias por categoria
  const getCategoryNewsCount = () => {
    if (!newsList) return {};
    
    return newsList.reduce((acc: Record<string, number>, news) => {
      const category = news.category || 'Sem categoria';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});
  };

  const categoryNewsCount = getCategoryNewsCount();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gerenciamento de Notícias</h2>
          <p className="text-muted-foreground">
            Crie e gerencie notícias para os usuários da plataforma
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={handleCreate} 
            className="flex items-center gap-2"
          >
            <PlusCircle size={16} />
            Nova Notícia
          </Button>
          <Button 
            onClick={handleGenerateMarketSummary}
            variant="secondary"
            className="flex items-center gap-2"
          >
            <BarChart3 size={16} />
            Gerar Resumo do Mercado
          </Button>
          <Button 
            onClick={() => refetch()} 
            variant="outline" 
            className="flex items-center gap-2 hover:bg-[#e6f0ff] hover:text-[#0066FF]"
          >
            <RefreshCw size={16} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Estatísticas rápidas das notícias */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Notícias</p>
                <h3 className="text-2xl font-bold">{newsList?.length || 0}</h3>
              </div>
              <Newspaper className="h-8 w-8 text-blue-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Resumos de Mercado</p>
                <h3 className="text-2xl font-bold">{categoryNewsCount['Resumo de Mercado'] || 0}</h3>
              </div>
              <BarChart3 className="h-8 w-8 text-green-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        
        {/* Adicione mais cards de estatísticas conforme necessário */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
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
                    disabled={createNewsMutation.isPending || updateNewsMutation.isPending}
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
        </div>

        <div className="md:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Notícias Publicadas</CardTitle>
              <CardDescription>
                {isLoading 
                  ? "Carregando notícias..." 
                  : `${newsList?.length || 0} notícias publicadas`
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="max-h-[600px] overflow-y-auto">
              {isLoading ? (
                <div className="text-center p-4">
                  <RefreshCw className="animate-spin h-8 w-8 mx-auto text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">Carregando notícias...</p>
                </div>
              ) : newsList?.length === 0 ? (
                <div className="text-center p-4 border rounded-md border-dashed">
                  <p className="text-muted-foreground">Nenhuma notícia publicada</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Crie sua primeira notícia usando o formulário ao lado
                  </p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {newsList?.map((news) => (
                    <li 
                      key={news.id} 
                      className={`border rounded-md p-3 hover:bg-muted/50 transition-colors ${
                        news.category === 'Resumo de Mercado' ? 'border-l-4 border-l-green-500' : ''
                      }`}
                    >
                      <div className="flex justify-between">
                        <div className="flex-1 overflow-hidden">
                          <h4 className="font-medium truncate" title={news.title}>
                            {news.title}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(news.publication_date || news.created_at)}
                          </p>
                          {news.category && (
                            <span className="inline-block text-xs bg-secondary text-secondary-foreground rounded-full px-2 py-0.5 mt-1">
                              {news.category}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-1 ml-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => news.id && loadNewsForEdit(news.id)}
                            title="Editar"
                            className="hover:bg-[#e6f0ff] hover:text-[#0066FF]"
                          >
                            <Edit size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => news.id && deleteNewsMutation.mutate(news.id)}
                            title="Excluir"
                            className="text-destructive hover:text-destructive hover:bg-[#e6f0ff]"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
            <CardFooter className="flex justify-center border-t pt-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => refetch()}
                className="text-xs hover:bg-[#e6f0ff] hover:text-[#0066FF]"
              >
                <RefreshCw size={14} className="mr-1" />
                Atualizar Lista
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminNewsManager;
