
import { useEffect, useState } from "react";
import ProfilePictureUploader from "@/components/ProfilePictureUploader";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchUser() {
      try {
        setLoading(true);
        const { data: userData } = await supabase.auth.getUser();
        
        if (userData?.user) {
          const { data: profile, error } = await supabase
            .from("profiles")
            .select("id, first_name, last_name, phone, email, photo")
            .eq("id", userData.user.id)
            .single();
            
          if (error) {
            console.error("Erro ao carregar perfil:", error);
            toast({
              title: "Erro",
              description: "Não foi possível carregar seu perfil.",
              variant: "destructive",
            });
          } else {
            setUser({
              ...profile,
              username: `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
            });
          }
        }
      } catch (error) {
        console.error("Erro:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchUser();
  }, [toast]);

  const handleUploadSuccess = (newPhotoUrl: string) => {
    setUser((prevUser: any) => ({ ...prevUser, photo: newPhotoUrl }));
    toast({
      title: "Sucesso",
      description: "Foto de perfil atualizada com sucesso!",
      variant: "default",
    });
  };

  if (loading) {
    return (
      <div className="p-8 max-w-lg mx-auto flex justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">Perfil</h1>
      {user ? (
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <ProfilePictureUploader
              userId={user.id}
              currentPhoto={user.photo}
              onUploadSuccess={handleUploadSuccess}
            />
            
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">{user.username}</h2>
              {user.email && <p className="text-muted-foreground">{user.email}</p>}
              {user.phone && <p className="text-muted-foreground">{user.phone}</p>}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p>Você precisa estar logado para ver esta página.</p>
        </div>
      )}
    </div>
  );
}
