import { Users, UserCheck, UserX, Clock, CalendarX, FileText, DollarSign } from "lucide-react";

export default function GeneralStats({ data }) {
  if (!data) return null;

  const stats = [
    {
      label: "Total Employees",
      value: data.totalEmployees,
      icon: <Users className="w-5 h-5 text-blue-500" />,
      bg: "bg-blue-50",
      color: "text-blue-500",
      borderColor: "border-blue-500"
    },
    {
      label: "Active Employees",
      value: data.activeEmployees,
      icon: <UserCheck className="w-5 h-5 text-green-500" />,
      bg: "bg-green-50",
      color: "text-green-500",
      borderColor: "border-green-500"
    },
    {
      label: "On Leave Today",
      value: data.onLeaveEmployees,
      icon: <UserX className="w-5 h-5 text-orange-500" />,
      bg: "bg-orange-50",
      color: "text-orange-500",
      borderColor: "border-orange-500"
    },
    {
      label: "Late Today",
      value: data.onLateToday,
      icon: <Clock className="w-5 h-5 text-red-400" />,
      bg: "bg-red-50",
      color: "text-red-400",
      borderColor: "border-red-400"
    },
    {
      label: "Absent Today",
      value: data.absentToday,
      icon: <CalendarX className="w-5 h-5 text-red-500" />,
      bg: "bg-red-50",
      color: "text-red-500",
      borderColor: "border-red-500"
    },
    {
      label: "Expiring Contracts",
      value: data.expiringContract,
      icon: <FileText className="w-5 h-5 text-green-600" />,
      bg: "bg-green-50",
      color: "text-green-600",
      borderColor: "border-green-600"
    },
    {
      label: "Monthly Payroll",
      value: data.monthlyPayroll.toLocaleString(),
      icon: <DollarSign className="w-5 h-5 text-blue-600" />,
      bg: "bg-blue-50",
      color: "text-blue-600",
      borderColor: "border-blue-600"
    }
  ];

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4 text-[#1B2559]">General statistics</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className={`bg-white rounded-xl shadow-sm p-4 border-b-2 ${stat.borderColor} flex flex-col justify-between`}>
            <div className="flex justify-between items-start mb-2">
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                {stat.icon}
              </div>
              <span className="text-gray-400 text-xs cursor-pointer"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg></span>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
              <h3 className="text-2xl font-bold text-[#1B2559]">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
