
import React from "react";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Video, Award, MessageSquare, Clock, CheckCircle, Trophy, Brain } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Achievement {
  id: string;
  achievement_type: string;
  description: string;
  points: number;
  badge_icon?: string;
  unlocked_at: string;
}

interface AchievementsListProps {
  achievements: Achievement[];
}

const AchievementsList: React.FC<AchievementsListProps> = ({ achievements }) => {
  // If no achievements, show placeholder state
  if (achievements.length === 0) {
    return (
      <div className="text-center py-10">
        <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">Sem conquistas ainda</h3>
        <p className="text-gray-500 max-w-md mx-auto">
          Continue aprendendo para ganhar conquistas e subir de nível. As conquistas são desbloqueadas à medida que você progride.
        </p>
      </div>
    );
  }

  // Helper function to get icon for achievement type
  const getAchievementIcon = (type: string) => {
    switch (type) {
      case 'material_read':
        return <BookOpen className="h-5 w-5" />;
      case 'video_watched':
        return <Video className="h-5 w-5" />;
      case 'streak':
        return <Clock className="h-5 w-5" />;
      case 'comment':
        return <MessageSquare className="h-5 w-5" />;
      case 'quiz':
        return <CheckCircle className="h-5 w-5" />;
      case 'knowledge':
        return <Brain className="h-5 w-5" />;
      default:
        return <Award className="h-5 w-5" />;
    }
  };

  // Helper function to get color for achievement type
  const getAchievementColor = (type: string) => {
    switch (type) {
      case 'material_read':
        return "bg-blue-100 text-blue-700";
      case 'video_watched':
        return "bg-purple-100 text-purple-700";
      case 'streak':
        return "bg-yellow-100 text-yellow-700";
      case 'comment':
        return "bg-green-100 text-green-700";
      case 'quiz':
        return "bg-pink-100 text-pink-700";
      case 'knowledge':
        return "bg-indigo-100 text-indigo-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // If no real achievements yet, show some placeholder achievements
  const displayAchievements = achievements.length > 0 
    ? achievements 
    : [
        {
          id: "placeholder1",
          achievement_type: "material_read",
          description: "Leitor Dedicado: Leu 10 materiais",
          points: 50,
          unlocked_at: new Date().toISOString()
        },
        {
          id: "placeholder2",
          achievement_type: "video_watched",
          description: "Espectador Entusiasmado: Assistiu 5 vídeos",
          points: 30,
          unlocked_at: new Date().toISOString()
        },
        {
          id: "placeholder3",
          achievement_type: "streak",
          description: "Consistência: 7 dias de estudo consecutivos",
          points: 100,
          unlocked_at: new Date().toISOString()
        }
      ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {displayAchievements.map((achievement) => (
        <div key={achievement.id} className="border rounded-lg p-4 flex flex-col">
          <div className="flex items-start justify-between mb-3">
            <div className={`p-2 rounded-lg ${getAchievementColor(achievement.achievement_type)}`}>
              {getAchievementIcon(achievement.achievement_type)}
            </div>
            <Badge variant="outline" className="font-medium">
              +{achievement.points} XP
            </Badge>
          </div>
          <h3 className="font-medium text-gray-900 mb-1">{achievement.description}</h3>
          <p className="text-sm text-gray-500 mt-auto pt-2">
            Desbloqueado em {format(new Date(achievement.unlocked_at), "dd 'de' MMMM", { locale: ptBR })}
          </p>
        </div>
      ))}
    </div>
  );
};

export default AchievementsList;
