import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { DollarSign, Award, MinusCircle, PlusCircle, Loader2 } from "lucide-react";
import EmployeeSalaryBreakdown from "./employee-salary-breakdown";
import EmployeeSalaryBonuses from "./employee-salary-bonuses";
import EmployeeSalaryDeductions from "./employee-salary-deductions";
import EmployeeSalaryArchive from "./employee-salary-archive";
import {
  getEmployeeById,
  getContractsByEmployeeId,
  getRewards,
  getDiscounts,
  getSalaries,
} from "../../../../lib/api";

export default function EmployeeSalaryTab() {
  const { id } = useParams();
  const [currentTab, setCurrentTab] = useState("salary");

  const tabs = [
    { id: "salary", label: "Salary" },
    { id: "bonuses", label: "Bonuses" },
    { id: "deductions", label: "Deductions" },
    { id: "archive", label: "Payroll Archive" },
  ];

  // 1. Fetch Employee Profile
  const { data: employeeRes, isLoading: isEmpLoading } = useQuery({
    queryKey: ["getEmployeeById", id],
    queryFn: () => getEmployeeById(id),
    enabled: !!id,
  });

  // 2. Fetch Employee Contracts for base salary
  const { data: contractsRes, isLoading: isContractsLoading } = useQuery({
    queryKey: ["getContractsByEmployeeId", id],
    queryFn: () => getContractsByEmployeeId(id, { PageSize: 50 }),
    enabled: !!id,
  });

  // 3. Fetch Employee Rewards/Bonuses
  const { data: rewardsRes, isLoading: isRewardsLoading } = useQuery({
    queryKey: ["getRewards", { EmployeeId: id, PageSize: 100 }],
    queryFn: () => getRewards({ EmployeeId: id, PageSize: 100 }),
    enabled: !!id,
  });

  // 4. Fetch Employee Discounts/Deductions
  const { data: discountsRes, isLoading: isDiscountsLoading } = useQuery({
    queryKey: ["getDiscounts", { EmployeeId: id, PageSize: 100 }],
    queryFn: () => getDiscounts({ EmployeeId: id, PageSize: 100 }),
    enabled: !!id,
  });

  // 5. Fetch Salary / Payroll History
  const { data: salariesRes, isLoading: isSalariesLoading } = useQuery({
    queryKey: ["getSalaries", { EmployeeId: id, PageSize: 10 }],
    queryFn: () => getSalaries({ EmployeeId: id, PageSize: 10 }),
    enabled: !!id,
  });

  const isLoading = isEmpLoading || isContractsLoading || isRewardsLoading || isDiscountsLoading;

  // Calculate salary components from API
  const { basicSalary, totalBonuses, totalDeductions, netSalary } = useMemo(() => {
    const contracts = contractsRes?.data?.items || [];
    const activeContract = contracts.find((c) => c.status === "Active") || contracts[0];

    const contractSalary = Number(activeContract?.salary) || 0;
    const profileSalary = Number(employeeRes?.data?.salary || employeeRes?.data?.baseSalary) || 0;
    const latestPayrollBase = Number(salariesRes?.data?.items?.[0]?.baseSalary) || 0;
    const base = contractSalary || profileSalary || latestPayrollBase || 0;

    const rewards = rewardsRes?.data?.items || [];
    const bonuses = rewards.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

    const discounts = discountsRes?.data?.items || [];
    const deductions = discounts.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);

    const latestPayrollNet = salariesRes?.data?.items?.[0]?.netSalary;
    const calculatedNet = Math.max(0, base + bonuses - deductions);
    const net = latestPayrollNet !== undefined ? Number(latestPayrollNet) : calculatedNet;

    return {
      basicSalary: base,
      totalBonuses: bonuses,
      totalDeductions: deductions,
      netSalary: net,
    };
  }, [contractsRes, employeeRes, salariesRes, rewardsRes, discountsRes]);

  const stats = [
    {
      title: "Net Salary",
      value: `$${netSalary.toLocaleString()}`,
      icon: DollarSign,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      borderColor: "border-b-blue-500",
    },
    {
      title: "Basic Salary",
      value: `$${basicSalary.toLocaleString()}`,
      icon: Award,
      color: "text-orange-500",
      bgColor: "bg-orange-50",
      borderColor: "border-b-orange-500",
    },
    {
      title: "Total Bonuses",
      value: `+$${totalBonuses.toLocaleString()}`,
      icon: PlusCircle,
      color: "text-green-500",
      bgColor: "bg-green-50",
      borderColor: "border-b-green-500",
    },
    {
      title: "Total Deductions",
      value: `-$${totalDeductions.toLocaleString()}`,
      icon: MinusCircle,
      color: "text-red-500",
      bgColor: "bg-red-50",
      borderColor: "border-b-red-500",
    },
  ];

  return (
    <div className="mt-4 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div
            key={i}
            className={`bg-card text-card-foreground p-4 rounded-xl border border-b-4 ${stat.borderColor} flex items-center gap-4 shadow-sm`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.bgColor} ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
              <div className="flex items-center gap-2 mt-1">
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                ) : (
                  <span className="text-sm font-bold text-foreground">{stat.value}</span>
                )}
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
        {currentTab === "salary" && (
          <EmployeeSalaryBreakdown
            basicSalary={basicSalary}
            totalBonuses={totalBonuses}
            totalDeductions={totalDeductions}
            netSalary={netSalary}
            isLoading={isLoading}
          />
        )}
        {currentTab === "bonuses" && <EmployeeSalaryBonuses />}
        {currentTab === "deductions" && <EmployeeSalaryDeductions />}
        {currentTab === "archive" && <EmployeeSalaryArchive />}
      </div>
    </div>
  );
}
