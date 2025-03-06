
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      // Check if the profile_pictures bucket exists
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(bucket => bucket.name === 'profile_pictures');
      
      // Create bucket if it doesn't exist (this will be done via SQL)
      if (!bucketExists) {
        console.log("Bucket 'profile_pictures' not found. Please run the SQL migration to create it.");
        setUploading(false);
        return;
      }

      const filePath = `${userId}/${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from("profile_pictures")
        .upload(filePath, file, { upsert: true });

      if (error) {
        console.error("Erro ao fazer upload da imagem:", error.message);
        setUploading(false);
        return;
      }

      // Obtém a URL pública
      const { data: publicUrlData } = supabase.storage
        .from("profile_pictures")
        .getPublicUrl(filePath);

      if (!publicUrlData?.publicUrl) {
        console.error("Erro ao obter URL pública");
        setUploading(false);
        return;
      }

      // Atualiza no banco de dados
      await supabase.from("profiles").update({ photo: publicUrlData.publicUrl }).eq("id", userId);

      setPreview(publicUrlData.publicUrl);
      onUploadSuccess(publicUrlData.publicUrl);
    } catch (error) {
      console.error("Erro no upload:", error);
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
    </div>
  );
}
