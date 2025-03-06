
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Props {
  userId: string;
  currentPhoto?: string;
  onUploadSuccess: (photoUrl: string) => void;
}

export default function ProfilePictureUploader({
  userId,
  currentPhoto,
  onUploadSuccess,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentPhoto || "/placeholder.svg");
  const { toast } = useToast();
  
  // Maximum file size: 2MB
  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB in bytes

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "Arquivo muito grande",
        description: "O tamanho máximo permitido é de 2MB.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Check if the profile_pictures bucket exists
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(bucket => bucket.name === 'profile_pictures');
      
      if (!bucketExists) {
        // Create the bucket if it doesn't exist
        const { data: newBucket, error: bucketError } = await supabase.storage.createBucket('profile_pictures', {
          public: true,
          fileSizeLimit: MAX_FILE_SIZE
        });
        
        if (bucketError) {
          toast({
            title: "Erro",
            description: "Não foi possível criar o bucket para armazenamento de imagens.",
            variant: "destructive",
          });
          setUploading(false);
          return;
        }
      }

      const filePath = `${userId}/${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from("profile_pictures")
        .upload(filePath, file, { upsert: true });

      if (error) {
        console.error("Erro ao fazer upload da imagem:", error.message);
        toast({
          title: "Erro no upload",
          description: error.message,
          variant: "destructive",
        });
        setUploading(false);
        return;
      }

      // Obtém a URL pública
      const { data: publicUrlData } = supabase.storage
        .from("profile_pictures")
        .getPublicUrl(filePath);

      if (!publicUrlData?.publicUrl) {
        toast({
          title: "Erro",
          description: "Não foi possível obter a URL da imagem.",
          variant: "destructive",
        });
        setUploading(false);
        return;
      }

      // Atualiza no banco de dados
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ photo: publicUrlData.publicUrl })
        .eq("id", userId);
        
      if (updateError) {
        console.error("Erro ao atualizar foto de perfil:", updateError);
        toast({
          title: "Erro",
          description: "Não foi possível atualizar a foto no banco de dados.",
          variant: "destructive",
        });
        setUploading(false);
        return;
      }

      setPreview(publicUrlData.publicUrl);
      onUploadSuccess(publicUrlData.publicUrl);
      toast({
        title: "Sucesso",
        description: "Foto de perfil atualizada com sucesso!",
      });
    } catch (error) {
      console.error("Erro no upload:", error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao fazer o upload da imagem.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <img
        src={preview}
        alt="Foto do perfil"
        className="w-32 h-32 rounded-full border border-gray-300 object-cover"
      />

      <label className="cursor-pointer bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
        {uploading ? "Enviando..." : "Alterar Foto"}
        <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
      </label>
      <p className="text-xs text-muted-foreground">Tamanho máximo: 2MB</p>
    </div>
  );
}
