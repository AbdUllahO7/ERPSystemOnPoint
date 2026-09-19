import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

export default function EmployeePerformanceStats({ data }) {
  if (!data) return null;

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'NA';
  };

  const pieData = [
    { name: 'Positive', value: data.overallPerformanceChart?.positivePercentage || 0, color: '#3b82f6' },
    { name: 'Negative', value: data.overallPerformanceChart?.negativePercentage || 0, color: '#ef4444' }
  ];

  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold mb-4 text-[#1B2559]">Employee performance statistics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Top Performers */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-md font-medium mb-4 text-[#1B2559]">Top Performers</h3>
          <div className="space-y-4">
            {data.topPerformers.map((emp, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-medium text-sm">
                    {getInitials(emp.employeeName)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1B2559]">{emp.employeeName}</p>
                    <p className="text-xs text-gray-400">{emp.positionName}</p>
                  </div>
                </div>
                <ArrowUpRight className="w-5 h-5 text-green-500" />
              </div>
            ))}
          </div>
        </div>

        {/* Lowest Performance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-md font-medium mb-4 text-[#1B2559]">Lowest Performance</h3>
          <div className="space-y-4">
            {data.lowestPerformers.map((emp, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-medium text-sm">
                    {getInitials(emp.employeeName)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1B2559]">{emp.employeeName}</p>
                    <p className="text-xs text-gray-400">{emp.positionName}</p>
                  </div>
                </div>
                <ArrowDownRight className="w-5 h-5 text-red-500" />
              </div>
            ))}
          </div>
        </div>

        {/* Overall Performance Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-md font-medium text-[#1B2559]">Employee Performance</h3>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-xs text-blue-500 font-medium">Positive</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-xs text-red-500 font-medium">Negative</span>
              </div>
            </div>
          </div>
          
          <div className="h-[200px] w-full relative flex justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={0}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-sm font-semibold text-[#1B2559]">Performance</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
