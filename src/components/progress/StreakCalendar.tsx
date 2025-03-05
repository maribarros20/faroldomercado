
import { Calendar } from "lucide-react";

interface StreakCalendarProps {
  streak: number;
}

const StreakCalendar = ({ streak }: StreakCalendarProps) => {
  // Generate calendar data for the current month
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  
  // Create an array of day objects for the current month
  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const date = new Date(currentYear, currentMonth, day);
    const isToday = day === now.getDate();
    const isPast = date < now;
    
    // In a real app, this would check against actual activity data
    // Here we're simulating random activity and ensuring the streak
    const hasActivity = (isToday && streak > 0) || 
      (isPast && (Math.random() > 0.3 || (isToday && day > now.getDate() - streak)));
    
    return { day, isToday, isPast, hasActivity };
  });
  
  // Create weeks array (for calendar grid)
  const weeks = [];
  let week = Array(7).fill(null);
  
  // Fill in leading empty days
  for (let i = 0; i < firstDayOfMonth; i++) {
    week[i] = null;
  }
  
  // Fill in the days
  days.forEach((day, index) => {
    const dayOfWeek = (firstDayOfMonth + index) % 7;
    week[dayOfWeek] = day;
    
    if (dayOfWeek === 6 || index === days.length - 1) {
      weeks.push([...week]);
      week = Array(7).fill(null);
    }
  });
  
  // Get month name
  const monthName = new Date(currentYear, currentMonth).toLocaleString('pt-BR', { month: 'long' });
  
  return (
    <div className="w-full">
      <div className="flex items-center mb-4 text-sm font-medium text-gray-700">
        <Calendar className="mr-2 h-4 w-4" />
        <span className="capitalize">{monthName} {currentYear}</span>
      </div>
      
      <div className="grid grid-cols-7 text-center text-xs font-medium text-gray-500 mb-1">
        <div>D</div>
        <div>S</div>
        <div>T</div>
        <div>Q</div>
        <div>Q</div>
        <div>S</div>
        <div>S</div>
      </div>
      
      <div className="space-y-1">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 gap-1">
            {week.map((day, dayIndex) => {
              if (!day) {
                return <div key={`empty-${dayIndex}`} className="h-8 w-full" />;
              }
              
              return (
                <div
                  key={`day-${day.day}`}
                  className={`
                    flex items-center justify-center h-8 w-full rounded-md 
                    ${day.isToday ? 'ring-2 ring-trade-blue' : ''}
                    ${!day.isPast ? 'text-gray-300' : ''}
                    ${day.hasActivity ? 'bg-trade-light-blue text-trade-blue font-semibold' : ''}
                  `}
                >
                  {day.day}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      
      <div className="mt-4 flex items-center text-xs text-gray-500">
        <div className="w-3 h-3 bg-trade-light-blue rounded-sm mr-1"></div>
        <span>Dias ativos</span>
        
        <div className="w-3 h-3 border border-gray-300 rounded-sm ml-4 mr-1"></div>
        <span>Dias inativos</span>
      </div>
    </div>
  );
};

export default StreakCalendar;
