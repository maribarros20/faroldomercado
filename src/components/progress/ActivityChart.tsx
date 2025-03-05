
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Sample data - in a real app, this would come from the database
const data = [
  { day: "1", minutes: 25 },
  { day: "2", minutes: 15 },
  { day: "3", minutes: 45 },
  { day: "4", minutes: 30 },
  { day: "5", minutes: 60 },
  { day: "6", minutes: 20 },
  { day: "7", minutes: 0 },
  { day: "8", minutes: 35 },
  { day: "9", minutes: 40 },
  { day: "10", minutes: 50 },
  { day: "11", minutes: 30 },
  { day: "12", minutes: 25 },
  { day: "13", minutes: 15 },
  { day: "14", minutes: 45 },
  { day: "15", minutes: 55 },
  { day: "16", minutes: 10 },
  { day: "17", minutes: 20 },
  { day: "18", minutes: 30 },
  { day: "19", minutes: 40 },
  { day: "20", minutes: 45 },
  { day: "21", minutes: 50 },
  { day: "22", minutes: 30 },
  { day: "23", minutes: 15 },
  { day: "24", minutes: 40 },
  { day: "25", minutes: 35 },
  { day: "26", minutes: 20 },
  { day: "27", minutes: 30 },
  { day: "28", minutes: 35 },
  { day: "29", minutes: 40 },
  { day: "30", minutes: 45 },
];

const ActivityChart = () => {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 20,
            left: 0,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0066FF" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#0066FF" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
          <XAxis 
            dataKey="day" 
            tick={{ fontSize: 12 }}
            tickCount={10}
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `${value}m`}
          />
          <Tooltip 
            formatter={(value) => [`${value} min`, "Tempo de estudo"]}
            contentStyle={{
              background: 'rgba(255, 255, 255, 0.9)',
              border: 'none',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
            }}
            labelFormatter={(day) => `Dia ${day}`}
          />
          <Area
            type="monotone"
            dataKey="minutes"
            stroke="#0066FF"
            fillOpacity={1}
            fill="url(#colorMinutes)"
            activeDot={{ r: 6 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ActivityChart;
