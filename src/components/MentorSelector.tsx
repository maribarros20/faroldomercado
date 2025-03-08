
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import MentorPictureUploader from "./MentorPictureUploader";
import { Button } from "./ui/button";

interface MentorSelectorProps {
  userId?: string;
  currentMentorId?: string;
}

interface Mentor {
  id: string;
  name: string;
  email: string;
  phone: string;
  cnpj: string;
  photo?: string | null;
}

const MentorSelector = ({ userId, currentMentorId }: MentorSelectorProps) => {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("mentors")
          .select("*")
          .order("name");

        if (error) {
          console.error("Error fetching mentors:", error);
          toast({
            title: "Erro ao carregar mentores",
            description: "Não foi possível carregar a lista de mentores.",
            variant: "destructive",
          });
          return;
        }

        setMentors(data as Mentor[]);

        // If currentMentorId is provided, set the selected mentor
        if (currentMentorId) {
          const currentMentor = data.find((mentor: Mentor) => mentor.id === currentMentorId);
          if (currentMentor) {
            setSelectedMentor(currentMentor);
          }
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMentors();
  }, [currentMentorId, toast]);

  const handleMentorChange = async (mentorId: string) => {
    if (!userId) return;
    
    const mentor = mentors.find((m) => m.id === mentorId);
    if (mentor) {
      setSelectedMentor(mentor);
      
      try {
        // Update both mentor_id (for compatibility) and mentor_link_id (new field)
        const { error } = await supabase
          .from("profiles")
          .update({ 
            mentor_id: mentor.id,
            mentor_link_id: mentor.id,
            tipo_de_conta: "aluno" // Update to set as student
          })
          .eq("id", userId);
          
        if (error) {
          console.error("Error updating mentor:", error);
          toast({
            title: "Erro ao atualizar mentor",
            description: "Não foi possível associar o mentor ao seu perfil.",
            variant: "destructive",
          });
          return;
        }
        
        toast({
          title: "Mentor atualizado",
          description: `${mentor.name} foi associado ao seu perfil.`,
        });
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  const handlePhotoUpload = (photoUrl: string) => {
    if (selectedMentor) {
      setSelectedMentor({
        ...selectedMentor,
        photo: photoUrl
      });
      
      toast({
        title: "Foto atualizada",
        description: "A foto do mentor foi atualizada com sucesso.",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-6">
          <p className="text-center text-muted-foreground">Carregando mentores...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="py-6 space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-2">Selecione seu Mentor</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Escolha um mentor para lhe acompanhar em sua jornada de investimentos.
          </p>

          <Select
            value={selectedMentor?.id || ""}
            onValueChange={handleMentorChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione um mentor" />
            </SelectTrigger>
            <SelectContent>
              {mentors.map((mentor) => (
                <SelectItem key={mentor.id} value={mentor.id}>
                  {mentor.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedMentor && (
          <div className="mt-6 pt-6 border-t">
            <h3 className="text-lg font-medium mb-4">Informações do Mentor</h3>
            
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-shrink-0">
                {userId && (
                  <MentorPictureUploader
                    mentorId={selectedMentor.id}
                    currentPhoto={selectedMentor.photo}
                    onUploadSuccess={handlePhotoUpload}
                  />
                )}
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nome</p>
                  <p className="text-base">{selectedMentor.name}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-base">{selectedMentor.email}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Telefone</p>
                  <p className="text-base">{selectedMentor.phone}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">CNPJ</p>
                  <p className="text-base">{selectedMentor.cnpj}</p>
                </div>
                
                <div className="pt-4">
                  <Button variant="outline" size="sm" className="w-full">
                    Enviar mensagem
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MentorSelector;
