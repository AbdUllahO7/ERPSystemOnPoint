import { Loader2 } from "lucide-react";

export default function EmployeeSalaryBreakdown({
  basicSalary = 0,
  totalBonuses = 0,
  totalDeductions = 0,
  netSalary = 0,
  isLoading = false,
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-foreground">Salary Breakdown</h3>
      
      <div className="space-y-4 max-w-3xl">
        <div className="flex justify-between items-center text-sm">
          <span className="text-foreground font-medium">Basic Salary</span>
          <span className="text-muted-foreground font-semibold">${Number(basicSalary).toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-foreground font-medium">Total monthly bonuses</span>
          <span className="text-green-500 font-semibold">+${Number(totalBonuses).toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center text-sm pb-4 border-b border-border">
          <span className="text-foreground font-medium">Total monthly discounts</span>
          <span className="text-red-500 font-semibold">-${Number(totalDeductions).toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-semibold text-foreground">Net Salary</span>
          <span className="text-lg font-bold text-primary">${Number(netSalary).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
