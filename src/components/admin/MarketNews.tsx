
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  RefreshCw, Loader2, Plus, Pencil, Trash2, 
  Calendar, User, Tag, FileImage, Search 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  NewsItem,
  NEWS_CATEGORIES,
  fetchManualNews,
  createNews,
  updateNews,
  deleteNews,
  getNewsById
} from "@/services/NewsService";

// Schema de validação para o formulário de notícias
const newsFormSchema = z.object({
  title: z.string().min(3, { message: "O título deve ter pelo menos 3 caracteres" }),
  subtitle: z.string().optional(),
  content: z.string().min(10, { message: "O conteúdo deve ter pelo menos 10 caracteres" }),
  publication_date: z.string().optional(),
  author: z.string().optional(),
  category: z.string().optional(),
  image_url: z.string().url({ message: "URL da imagem inválida" }).optional().or(z.literal('')),
});

type NewsFormValues = z.infer<typeof newsFormSchema>;

const MarketNews = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newsToDelete, setNewsToDelete] = useState<NewsItem | null>(null);
  
  const { toast } = useToast();
  
  const form = useForm<NewsFormValues>({
    resolver: zodResolver(newsFormSchema),
    defaultValues: {
      title: "",
      subtitle: "",
      content: "",
      publication_date: new Date().toISOString().slice(0, 16),
      author: "",
      category: "",
      image_url: "",
    }
  });

  // Função para buscar as notícias
  const fetchNews = async () => {
    setIsLoading(true);
    try {
      const newsData = await fetchManualNews();
      setNews(newsData);
      toast({
        title: "Notícias atualizadas",
        description: "As notícias foram carregadas com sucesso",
      });
    } catch (error) {
      console.error("Erro ao buscar notícias:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as notícias",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar notícias quando o componente montar
  useEffect(() => {
    fetchNews();
  }, []);

  // Abrir diálogo para criar nova notícia
  const handleCreate = () => {
    form.reset({
      title: "",
      subtitle: "",
      content: "",
      publication_date: new Date().toISOString().slice(0, 16),
      author: "",
      category: "",
      image_url: "",
    });
    setEditingNewsId(null);
    setIsDialogOpen(true);
  };

  // Abrir diálogo para editar notícia existente
  const handleEdit = async (newsId: string) => {
    try {
      setIsLoading(true);
      const newsItem = await getNewsById(newsId);
      
      if (newsItem) {
        form.reset({
          title: newsItem.title,
          subtitle: newsItem.subtitle || "",
          content: newsItem.content,
          publication_date: newsItem.publication_date ? 
            new Date(newsItem.publication_date).toISOString().slice(0, 16) : 
            new Date().toISOString().slice(0, 16),
          author: newsItem.author || "",
          category: newsItem.category || "",
          image_url: newsItem.image_url || "",
        });
        setEditingNewsId(newsId);
        setIsDialogOpen(true);
      }
    } catch (error) {
      console.error("Erro ao carregar notícia para edição:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a notícia para edição",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Confirmar exclusão de uma notícia
  const handleDeleteConfirm = async () => {
    if (!newsToDelete?.id) return;
    
    try {
      setIsSubmitting(true);
      await deleteNews(newsToDelete.id);
      
      // Atualizar a lista de notícias
      setNews(news.filter(item => item.id !== newsToDelete.id));
      
      toast({
        title: "Notícia excluída",
        description: "A notícia foi excluída com sucesso",
      });
      
      setIsDeleteDialogOpen(false);
      setNewsToDelete(null);
    } catch (error) {
      console.error("Erro ao excluir notícia:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a notícia",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mostrar diálogo de confirmação de exclusão
  const handleDelete = (newsItem: NewsItem) => {
    setNewsToDelete(newsItem);
    setIsDeleteDialogOpen(true);
  };

  // Enviar formulário (criar ou atualizar notícia)
  const onSubmit = async (values: NewsFormValues) => {
    try {
      setIsSubmitting(true);
      
      if (editingNewsId) {
        // Atualizar notícia existente
        await updateNews(editingNewsId, {
          ...values,
          publication_date: values.publication_date ? new Date(values.publication_date).toISOString() : undefined
        });
        
        toast({
          title: "Notícia atualizada",
          description: "A notícia foi atualizada com sucesso",
        });
      } else {
        // Criar nova notícia
        const newNews = await createNews({
          ...values,
          publication_date: values.publication_date ? new Date(values.publication_date).toISOString() : undefined
        });
        
        // Adicionar à lista
        setNews([newNews, ...news]);
        
        toast({
          title: "Notícia criada",
          description: "A notícia foi criada com sucesso",
        });
      }
      
      setIsDialogOpen(false);
      form.reset();
      
      // Recarregar a lista para garantir dados atualizados
      fetchNews();
    } catch (error) {
      console.error("Erro ao salvar notícia:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a notícia",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtrar notícias com base no termo de busca
  const filteredNews = news.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (item.content && item.content.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.author && item.author.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Formatar data relativa
  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return "Data não disponível";
    
    const date = new Date(dateString);
    const now = new Date();
    
    // Verificar se a data é válida
    if (isNaN(date.getTime())) {
      return "Data inválida";
    }
    
    // Formatação básica de data
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Gerenciamento de Notícias</h2>
          <p className="text-muted-foreground">
            Adicione e gerencie notícias do mercado financeiro
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={fetchNews} 
            variant="outline" 
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Atualizando...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Atualizar
              </>
            )}
          </Button>
          <Button 
            onClick={handleCreate}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nova Notícia
          </Button>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Pesquisar notícias..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>
      
      <div className="grid gap-6">
        {filteredNews.length > 0 ? (
          filteredNews.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="grid md:grid-cols-[1fr_auto] gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm">
                      {item.category && (
                        <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">
                          {item.category}
                        </span>
                      )}
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground">
                        {formatDate(item.publication_date || item.created_at)}
                      </span>
                      {item.author && (
                        <>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-muted-foreground">{item.author}</span>
                        </>
                      )}
                    </div>
                    
                    <h3 className="text-xl font-bold leading-tight">{item.title}</h3>
                    {item.subtitle && (
                      <p className="text-muted-foreground font-medium">{item.subtitle}</p>
                    )}
                    
                    <div className="line-clamp-3 text-muted-foreground">
                      {item.content}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEdit(item.id!)}
                        className="flex items-center gap-2"
                      >
                        <Pencil className="h-4 w-4" />
                        Editar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDelete(item)}
                        className="flex items-center gap-2 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        Excluir
                      </Button>
                    </div>
                  </div>
                  
                  {item.image_url && (
                    <div className="relative w-full md:w-48 h-32 rounded-lg overflow-hidden">
                      <img 
                        src={item.image_url} 
                        alt={item.title} 
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : isLoading ? (
          <div className="text-center py-10">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
            <p className="mt-4 text-muted-foreground">Carregando notícias...</p>
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-muted-foreground">
              {searchTerm ? `Nenhuma notícia encontrada com o termo "${searchTerm}"` : "Nenhuma notícia cadastrada"}
            </p>
          </div>
        )}
      </div>
      
      {/* Diálogo para criar/editar notícia */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingNewsId ? "Editar Notícia" : "Nova Notícia"}
            </DialogTitle>
            <DialogDescription>
              Preencha os detalhes da notícia que será exibida no dashboard.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                      <Input placeholder="Título da notícia" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="subtitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subtítulo</FormLabel>
                    <FormControl>
                      <Input placeholder="Subtítulo ou descrição breve" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="publication_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Data de Publicação
                      </FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="author"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Autor
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do autor" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Tag className="h-4 w-4" />
                        Categoria
                      </FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {NEWS_CATEGORIES.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="image_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <FileImage className="h-4 w-4" />
                        URL da Imagem
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://exemplo.com/imagem.jpg" 
                          {...field} 
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conteúdo</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Conteúdo da notícia" 
                        className="min-h-[200px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editingNewsId ? "Atualizar" : "Publicar"} Notícia
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo de confirmação de exclusão */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir a notícia "{newsToDelete?.title}"? 
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="mt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              type="button" 
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MarketNews;
