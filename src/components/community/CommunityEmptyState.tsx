
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const CommunityEmptyState: React.FC = () => {
  return (
    <Card>
      <CardContent className="p-6 text-center">
        <p>Nenhum canal disponível no momento.</p>
      </CardContent>
    </Card>
  );
};

export default CommunityEmptyState;
