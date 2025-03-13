
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Newspaper } from "lucide-react";

interface NewsSourceBadgesProps {
  sources: string[];
  newsCounts: Record<string, number>;
  selectedSource: string;
  onSourceSelect: (source: string) => void;
}

export const NewsSourceBadges: React.FC<NewsSourceBadgesProps> = ({
  sources,
  newsCounts,
  selectedSource,
  onSourceSelect,
}) => {
  if (sources.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {sources.map((source) => (
        <Badge
          key={source}
          variant={selectedSource === source ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => onSourceSelect(source === selectedSource ? "all" : source)}
        >
          <Newspaper className="h-3 w-3 mr-1" /> {source}: {newsCounts[source] || 0}
        </Badge>
      ))}
    </div>
  );
};
