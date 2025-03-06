
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Mentor {
  id: string;
  name: string;
  cnpj: string;
  email: string;
  phone: string;
  photo?: string;
}

interface MentorSelectorProps {
  userId: string | undefined;
  currentMentorId?: string | null;
}

const MentorSelector: React.FC<MentorSelectorProps> = ({ userId, currentMentorId }) => {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch mentors from the database
  useEffect(() => {
    const fetchMentors = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("mentors")
          .select("*")
          .order("name", { ascending: true });

        if (error) {
          console.error("Error fetching mentors:", error);
          toast({
            title: "Erro ao carregar mentores",
            description: "Não foi possível carregar a lista de mentores.",
            variant: "destructive",
          });
          return;
        }

        setMentors(data || []);

        // If user has a current mentor, select it
        if (currentMentorId) {
          const current = data?.find(mentor => mentor.id === currentMentorId) || null;
          setSelectedMentor(current);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMentors();
  }, [currentMentorId, toast]);

  // Handle mentor selection change
  const handleMentorChange = (mentorId: string) => {
    const mentor = mentors.find(m => m.id === mentorId) || null;
    setSelectedMentor(mentor);
  };

  // Save mentor selection
  const handleSave = async () => {
    if (!userId) {
      toast({
        title: "Erro",
        description: "ID do usuário não encontrado.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ mentor_id: selectedMentor?.id || null })
        .eq("id", userId);

      if (error) {
        console.error("Error updating mentor:", error);
        toast({
          title: "Erro ao atualizar mentor",
          description: "Não foi possível salvar a seleção de mentor.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Mentor atualizado",
        description: selectedMentor 
          ? `Mentor ${selectedMentor.name} selecionado com sucesso.` 
          : "Nenhum mentor selecionado.",
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar a seleção de mentor.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="mentorSelect">Selecione um Mentor</Label>
            <Select
              value={selectedMentor?.id || ""}
              onValueChange={handleMentorChange}
              disabled={loading}
            >
              <SelectTrigger id="mentorSelect" className="w-full">
                <SelectValue placeholder="Selecione um mentor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nenhum mentor</SelectItem>
                {mentors.map((mentor) => (
                  <SelectItem key={mentor.id} value={mentor.id}>
                    {mentor.name} - {mentor.cnpj}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedMentor && (
            <div className="space-y-4 mt-4 p-4 bg-muted rounded-md">
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="flex-shrink-0">
                  <img
                    src={selectedMentor.photo || "/placeholder.svg"}
                    alt={`Foto de ${selectedMentor.name}`}
                    className="w-24 h-24 rounded-full object-cover border border-border"
                  />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">{selectedMentor.name}</h3>
                  <p className="text-sm text-muted-foreground">CNPJ: {selectedMentor.cnpj}</p>
                  <p className="text-sm text-muted-foreground">Email: {selectedMentor.email}</p>
                  <p className="text-sm text-muted-foreground">Telefone: {selectedMentor.phone}</p>
                </div>
              </div>
            </div>
          )}

          <Button onClick={handleSave} className="w-full mt-4" disabled={loading}>
            Salvar Seleção de Mentor
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MentorSelector;
