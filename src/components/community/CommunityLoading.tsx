
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

const CommunityLoading: React.FC = () => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-center">
          <Spinner size="lg" />
        </div>
      </CardContent>
    </Card>
  );
};

export default CommunityLoading;
