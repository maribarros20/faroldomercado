
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LockIcon, UnlockIcon } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AchievementCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  progress: number;
  target: number;
  unlocked: boolean;
  isPercentage?: boolean;
}

const AchievementCard = ({
  title,
  description,
  icon,
  progress,
  target,
  unlocked,
  isPercentage = false
}: AchievementCardProps) => {
  const progressPercentage = isPercentage 
    ? progress 
    : Math.min(100, (progress / target) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
    >
      <Card className={cn(
        "overflow-hidden transition-all duration-300",
        unlocked 
          ? "bg-gradient-to-br from-white to-amber-50 border-amber-200" 
          : "bg-gray-50"
      )}>
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div className={cn(
              "rounded-full p-3",
              unlocked 
                ? "bg-amber-100" 
                : "bg-gray-200"
            )}>
              {icon}
            </div>
            {unlocked ? (
              <span className="text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full text-xs font-semibold flex items-center">
                <UnlockIcon className="mr-1 h-3 w-3" />
                Desbloqueado
              </span>
            ) : (
              <span className="text-gray-600 bg-gray-200 px-2 py-1 rounded-full text-xs font-semibold flex items-center">
                <LockIcon className="mr-1 h-3 w-3" />
                Bloqueado
              </span>
            )}
          </div>
          
          <h3 className={cn(
            "mt-4 text-lg font-semibold",
            unlocked ? "text-amber-800" : "text-gray-700"
          )}>
            {title}
          </h3>
          
          <p className="text-sm text-gray-600 mt-1">
            {description}
          </p>
          
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium">Progresso</span>
              <span>
                {progress}{isPercentage ? '%' : ''} / {target}{isPercentage ? '%' : ''}
              </span>
            </div>
            <Progress 
              value={progressPercentage} 
              className={cn(
                "h-2",
                unlocked ? "bg-amber-100" : "bg-gray-200"
              )}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AchievementCard;
