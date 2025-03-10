
import React, { useRef } from "react";
import { StockData } from "@/services/stockService";
import StockCard from "./StockCard";
import { ChevronRight, ChevronLeft } from "lucide-react";

interface StockCardCarouselProps {
  stocks: StockData[];
  title: string;
  isLoading: boolean;
}

const StockCardCarousel: React.FC<StockCardCarouselProps> = ({ 
  stocks, 
  title,
  isLoading 
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };
  
  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="flex gap-2">
          <button 
            onClick={scrollLeft}
            className="p-1 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors"
            aria-label="Scroll Left"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          <button 
            onClick={scrollRight}
            className="p-1 rounded-md bg-[#0066FF] hover:bg-[#004FC4] transition-colors"
            aria-label="Scroll Right"
          >
            <ChevronRight className="h-5 w-5 text-white" />
          </button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex gap-4 overflow-x-auto pb-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-100 rounded-xl min-w-[200px] h-[120px]"></div>
          ))}
        </div>
      ) : (
        <div 
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto pb-2 no-scrollbar scroll-smooth"
          style={{ scrollbarWidth: 'none' }}
        >
          {stocks.map((stock) => (
            <StockCard 
              key={stock.ticker} 
              stock={stock} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default StockCardCarousel;
