import { useState } from "react";
import { DollarSign, Award, MinusCircle, PlusCircle } from "lucide-react";
import EmployeeSalaryBreakdown from "./employee-salary-breakdown";
import EmployeeSalaryBonuses from "./employee-salary-bonuses";
import EmployeeSalaryDeductions from "./employee-salary-deductions";
import EmployeeSalaryArchive from "./employee-salary-archive";

const stats = [
  { title: "Net Salary", value: "18,500 $", icon: DollarSign, color: "text-blue-500", bgColor: "bg-blue-50", borderColor: "border-b-blue-500" },
  { title: "Basic Salary", value: "18,500 $", icon: Award, color: "text-orange-500", bgColor: "bg-orange-50", borderColor: "border-b-orange-500" },
  { title: "Total Bonuses", value: "18,500 $", icon: PlusCircle, color: "text-green-500", bgColor: "bg-green-50", borderColor: "border-b-green-500" },
  { title: "Total Deductions", value: "18,500 $", icon: MinusCircle, color: "text-red-500", bgColor: "bg-red-50", borderColor: "border-b-red-500" },
];

export default function EmployeeSalaryTab() {
  const [currentTab, setCurrentTab] = useState("salary");

  const tabs = [
    { id: "salary", label: "Salary" },
    { id: "bonuses", label: "Bounses" },
    { id: "deductions", label: "Deductions" },
    { id: "archive", label: "Payroll Archive" },
  ];

  return (
    <div className="mt-4 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className={`bg-card text-card-foreground p-4 rounded-xl border border-b-4 ${stat.borderColor} flex items-center gap-4 shadow-sm`}>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.bgColor} ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-bold text-foreground">{stat.value}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sub Tabs */}
      <div className="border-b border-border">
        <nav className="flex space-x-6" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                currentTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="mt-6">
        {currentTab === "salary" && <EmployeeSalaryBreakdown />}
        {currentTab === "bonuses" && <EmployeeSalaryBonuses />}
        {currentTab === "deductions" && <EmployeeSalaryDeductions />}
        {currentTab === "archive" && <EmployeeSalaryArchive />}
      </div>
    </div>
  );
}
