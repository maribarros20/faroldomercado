
import React from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { BookOpen, Video, CheckCircle, Clock } from "lucide-react";

interface Stats {
  materials_read?: number;
  videos_watched?: number;
  quizzes_completed?: number;
  total_watch_time_seconds?: number;
}

interface LearningStatsProps {
  stats: Stats;
}

const LearningStats: React.FC<LearningStatsProps> = ({ stats }) => {
  // Format watch time in hours and minutes
  const formatWatchTime = (seconds: number = 0) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Calculate completion percentage (this would ideally come from backend)
  const totalItems = 100; // Example total
  const completedItems = (stats.materials_read || 0) + (stats.videos_watched || 0);
  const completionPercentage = Math.min(Math.round((completedItems / totalItems) * 100), 100);

  return (
    <div className="space-y-6">
      {/* Completion circle */}
      <div className="flex flex-col items-center">
        <div className="w-24 h-24 mb-2">
          <CircularProgressbar
            value={completionPercentage}
            text={`${completionPercentage}%`}
            styles={buildStyles({
              textSize: '22px',
              pathColor: '#2563eb',
              textColor: '#1e293b',
              trailColor: '#e2e8f0'
            })}
          />
        </div>
        <p className="text-sm text-gray-500">Progresso no curso</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard 
          icon={<BookOpen className="h-5 w-5 text-blue-500" />}
          value={stats.materials_read || 0}
          label="Materiais lidos"
        />
        
        <StatCard 
          icon={<Video className="h-5 w-5 text-purple-500" />}
          value={stats.videos_watched || 0}
          label="Vídeos assistidos"
        />
        
        <StatCard 
          icon={<CheckCircle className="h-5 w-5 text-green-500" />}
          value={stats.quizzes_completed || 0}
          label="Quizzes completos"
        />
        
        <StatCard 
          icon={<Clock className="h-5 w-5 text-amber-500" />}
          value={formatWatchTime(stats.total_watch_time_seconds)}
          label="Tempo assistindo"
          isText
        />
      </div>
    </div>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  value: number | string;
  label: string;
  isText?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, label, isText = false }) => (
  <div className="bg-gray-50 rounded-lg p-3 flex flex-col items-center">
    <div className="mb-2">{icon}</div>
    <div className={`font-semibold text-lg ${isText ? '' : 'text-gray-900'}`}>{value}</div>
    <div className="text-xs text-gray-500 text-center">{label}</div>
  </div>
);

export default LearningStats;
