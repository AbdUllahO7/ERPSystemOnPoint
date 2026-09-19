import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ChartsSection({ chartsData }) {
  if (!chartsData || !chartsData.averageDelayChart) return null;

  // Ensure data has all months for display or use provided
  const data = chartsData.averageDelayChart;

  return (
    <div className="w-full h-full min-h-[300px] flex flex-col">
      <h2 className="text-lg font-semibold mb-6 text-[#1B2559]">Average delay</h2>
      <div className="flex-1 w-full h-full min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="monthName" axisLine={false} tickLine={false} tick={{fill: '#a0aec0', fontSize: 12}} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{fill: '#a0aec0', fontSize: 12}} dx={-10} />
            <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="3 3" />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
              cursor={{ stroke: '#e2e8f0', strokeWidth: 30, fill: '#f1f5f9' }}
            />
            <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
