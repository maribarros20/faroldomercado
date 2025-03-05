
import React, { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { format, subDays, parseISO, startOfDay, isWithinInterval } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Activity {
  id: string;
  activity_type: string;
  created_at: string;
  [key: string]: any;
}

interface ActivityChartProps {
  activities: Activity[];
}

const ActivityChart: React.FC<ActivityChartProps> = ({ activities }) => {
  const chartData = useMemo(() => {
    // Create an array of the last 14 days
    const today = new Date();
    const dates = Array.from({ length: 14 }, (_, i) => {
      const date = subDays(today, 13 - i);
      return {
        date,
        day: format(date, "dd/MM", { locale: ptBR }),
        materials: 0,
        videos: 0,
        quizzes: 0,
        comments: 0,
      };
    });

    // Count activities for each day
    activities.forEach(activity => {
      const activityDate = parseISO(activity.created_at);
      
      // Find the corresponding day in our dates array
      const dateEntry = dates.find(d => 
        isWithinInterval(activityDate, {
          start: startOfDay(d.date),
          end: new Date(d.date.getFullYear(), d.date.getMonth(), d.date.getDate(), 23, 59, 59)
        })
      );
      
      if (dateEntry) {
        switch (activity.activity_type) {
          case 'material_read':
            dateEntry.materials += 1;
            break;
          case 'video_watched':
            dateEntry.videos += 1;
            break;
          case 'quiz_completed':
            dateEntry.quizzes += 1;
            break;
          case 'comment':
            dateEntry.comments += 1;
            break;
          default:
            break;
        }
      }
    });

    return dates;
  }, [activities]);

  const colors = {
    materials: "#2563eb",
    videos: "#8b5cf6",
    quizzes: "#ec4899",
    comments: "#10b981"
  };

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorMaterials" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors.materials} stopOpacity={0.8} />
              <stop offset="95%" stopColor={colors.materials} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorVideos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors.videos} stopOpacity={0.8} />
              <stop offset="95%" stopColor={colors.videos} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorQuizzes" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors.quizzes} stopOpacity={0.8} />
              <stop offset="95%" stopColor={colors.quizzes} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorComments" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors.comments} stopOpacity={0.8} />
              <stop offset="95%" stopColor={colors.comments} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis 
            dataKey="day" 
            style={{ fontSize: '12px' }}
            tickMargin={10}
          />
          <YAxis 
            style={{ fontSize: '12px' }}
            tickCount={5}
            tickMargin={10}
          />
          <Tooltip 
            formatter={(value: number, name: string) => {
              const labels = {
                materials: "Materiais",
                videos: "Vídeos",
                quizzes: "Quizzes",
                comments: "Comentários"
              };
              return [value, labels[name as keyof typeof labels]];
            }}
          />
          <Legend 
            formatter={(value) => {
              const labels = {
                materials: "Materiais",
                videos: "Vídeos",
                quizzes: "Quizzes",
                comments: "Comentários"
              };
              return labels[value as keyof typeof labels];
            }}
          />
          <Area 
            type="monotone" 
            dataKey="materials" 
            stroke={colors.materials} 
            fillOpacity={1} 
            fill="url(#colorMaterials)" 
          />
          <Area 
            type="monotone" 
            dataKey="videos" 
            stroke={colors.videos} 
            fillOpacity={1} 
            fill="url(#colorVideos)" 
          />
          <Area 
            type="monotone" 
            dataKey="quizzes" 
            stroke={colors.quizzes} 
            fillOpacity={1} 
            fill="url(#colorQuizzes)" 
          />
          <Area 
            type="monotone" 
            dataKey="comments" 
            stroke={colors.comments} 
            fillOpacity={1} 
            fill="url(#colorComments)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ActivityChart;
