import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { useI18n } from "@/context/translate-api";
import { translateErp } from "@/lib/erp-i18n";

export default function EmployeePerformanceStats({ data }) {
  const { locale } = useI18n();
  const isAr = locale === "ar";

  if (!data) return null;

  const topPerformers = data.topPerformers || [];
  const lowestPerformers = data.lowestPerformers || [];
  const positivePercentage = data.overallPerformanceChart?.positivePercentage || 0;
  const negativePercentage = data.overallPerformanceChart?.negativePercentage || 0;

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : (isAr ? 'م' : 'NA');
  };

  const pieData = [
    { name: isAr ? 'إيجابي' : 'Positive', value: positivePercentage, color: '#3b82f6' },
    { name: isAr ? 'سلبي' : 'Negative', value: negativePercentage, color: '#ef4444' }
  ];

  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold mb-4 text-[#1B2559]">
        {isAr ? "إحصائيات أداء الموظفين" : "Employee performance statistics"}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Top Performers */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-md font-medium mb-4 text-[#1B2559]">
            {isAr ? "أعلى الموظفين أداءً" : "Top Performers"}
          </h3>
          <div className="space-y-4">
            {topPerformers.length > 0 ? (
              topPerformers.map((emp, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-medium text-sm">
                      {getInitials(emp.employeeName)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#1B2559]">{emp.employeeName}</p>
                      <p className="text-xs text-gray-400">{isAr ? translateErp(emp.positionName, locale) : emp.positionName}</p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-green-500" />
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400 py-4 text-center">
                {isAr ? "لا توجد بيانات متاحة" : "No data available"}
              </p>
            )}
          </div>
        </div>

        {/* Lowest Performance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-md font-medium mb-4 text-[#1B2559]">
            {isAr ? "أقل الموظفين أداءً" : "Lowest Performance"}
          </h3>
          <div className="space-y-4">
            {lowestPerformers.length > 0 ? (
              lowestPerformers.map((emp, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-medium text-sm">
                      {getInitials(emp.employeeName)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#1B2559]">{emp.employeeName}</p>
                      <p className="text-xs text-gray-400">{isAr ? translateErp(emp.positionName, locale) : emp.positionName}</p>
                    </div>
                  </div>
                  <ArrowDownRight className="w-5 h-5 text-red-500" />
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400 py-4 text-center">
                {isAr ? "لا توجد بيانات متاحة" : "No data available"}
              </p>
            )}
          </div>
        </div>

        {/* Overall Performance Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-md font-medium text-[#1B2559]">
              {isAr ? "أداء الموظفين" : "Employee Performance"}
            </h3>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-xs text-blue-500 font-medium">
                  {isAr ? "إيجابي" : "Positive"} ({positivePercentage}%)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-xs text-red-500 font-medium">
                  {isAr ? "سلبي" : "Negative"} ({negativePercentage}%)
                </span>
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
                <RechartsTooltip formatter={(val) => [`${val}%`, isAr ? 'النسبة' : 'Percentage']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-sm font-semibold text-[#1B2559]">{isAr ? "الأداء" : "Performance"}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
