import { Building, UserMinus, AlertTriangle } from "lucide-react";

export default function AttendanceStats({ data }) {
  if (!data) return null;

  const stats = [
    {
      label: "Late arrivals",
      value: data.lateArrivals,
      trendText: "this month",
      icon: <Building className="w-6 h-6 text-blue-500" />,
      bg: "bg-blue-50",
      borderColor: "border-blue-400"
    },
    {
      label: "Absences",
      value: data.absences,
      trendText: "this month",
      icon: <UserMinus className="w-6 h-6 text-red-500" />,
      bg: "bg-red-50",
      borderColor: "border-red-400"
    },
    {
      label: "Discrepancies",
      value: data.discrepancies,
      trendText: "this month",
      icon: <AlertTriangle className="w-6 h-6 text-orange-500" />,
      bg: "bg-orange-50",
      borderColor: "border-orange-400"
    }
  ];

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4 text-[#1B2559]">Attendance statistics</h2>
      <div className="flex flex-col gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className={`bg-white rounded-xl shadow-sm p-5 border border-gray-100 flex items-center gap-4 relative overflow-hidden`}>
            <div className={`w-1 h-full absolute left-0 top-0 bottom-0 ${stat.borderColor} bg-current border-l-4`}></div>
            <div className={`p-3 rounded-xl ${stat.bg}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-[#1B2559]">{stat.value}</span>
                <span className="text-sm text-gray-400">{stat.trendText}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
