
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MarketSnapshotProps {
  title: string;
  value: string;
  prevClose: number;
  open: number;
  dayLow: number;
  dayHigh: number;
  weekLow: number;
  weekHigh: number;
  time: string;
  date: string;
}

const MarketSnapshot: React.FC<MarketSnapshotProps> = ({
  title,
  value,
  prevClose,
  open,
  dayLow,
  dayHigh,
  weekLow,
  weekHigh,
  time,
  date
}) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Prev Close</div>
              <div className="text-2xl font-bold">{prevClose.toFixed(2)}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Open</div>
              <div className="text-2xl font-bold">{open.toFixed(2)}</div>
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>{dayLow.toFixed(2)}</span>
              <span>{dayHigh.toFixed(2)}</span>
            </div>
            <div className="text-xs text-muted-foreground flex justify-between">
              <span>Day Low</span>
              <span>Day High</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full relative">
              <div 
                className="absolute h-4 w-1 bg-gray-800 rounded-full top-1/2 transform -translate-y-1/2"
                style={{ 
                  left: `${((parseFloat(value) - dayLow) / (dayHigh - dayLow)) * 100}%`
                }}
              ></div>
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>{weekLow.toFixed(2)}</span>
              <span>{weekHigh.toFixed(2)}</span>
            </div>
            <div className="text-xs text-muted-foreground flex justify-between">
              <span>52 Week Low</span>
              <span>52 Week High</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full relative">
              <div 
                className="absolute h-4 w-1 bg-gray-800 rounded-full top-1/2 transform -translate-y-1/2"
                style={{ 
                  left: `${((parseFloat(value) - weekLow) / (weekHigh - weekLow)) * 100}%`
                }}
              ></div>
            </div>
          </div>
          
          <div className="text-center text-xl font-bold">
            {value}
          </div>
          
          <div className="flex justify-between text-sm text-muted-foreground mt-4">
            <div>
              <div>Trade Time</div>
              <div>{time}</div>
            </div>
            <div className="text-right">
              <div>Trade Date</div>
              <div>{date}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketSnapshot;
